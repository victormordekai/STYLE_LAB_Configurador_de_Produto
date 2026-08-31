/*
 * STYLE LAB MVP V0.6 — Design / Product Interaction Engine
 * ---------------------------------------------------------
 * Responsabilidades deste arquivo:
 *  - estado do projeto e histórico;
 *  - sincronização com o modelo técnico independente;
 *  - construção dinâmica das máscaras/clip paths do produto;
 *  - associação semântica de elementos a superfícies físicas;
 *  - drag, seleção, escala, rotação e teclado;
 *  - camadas, visibilidade, bloqueio, duplicação e exclusão;
 *  - referência visual;
 *  - exportação SVG, PNG e JSON;
 *  - contrato preparado para uma futura LLM de design.
 *
 * O arquivo NÃO contém a geometria industrial da camisa.
 * Essa responsabilidade continua isolada em garment-model/garment-model.js.
 */
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 760;
  const SURFACE_ORDER = ["front", "back"];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const svg = (name, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = () => `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

  const canvas = $("#designCanvas");
  const productLayer = $("#productLayer");
  const artworkLayer = $("#artworkLayer");
  const selectionLayer = $("#selectionLayer");
  const referenceOverlay = $("#referenceOverlay");
  const gridLayer = $("#gridLayer");

  if (!canvas || !productLayer || !artworkLayer || !selectionLayer) {
    console.error("STYLE LAB: estrutura SVG principal não encontrada.");
    return;
  }

  const state = {
    projectId: $("#projectCode")?.textContent?.trim() || "SL-001",
    productId: "CAM-BAS-001",
    version: "V0.6",

    colors: {
      primary: "#0A2D8F",
      secondary: "#E31E3F",
      detail: "#00C3FF"
    },

    construction: {
      collar: "round",
      sleeve: "short",
      fit: "regular",
      shorts: "base"
    },

    surfaces: {
      front: { id: "front", label: "FRENTE", clipId: "frontGarmentClip", artworkClipId: "frontArtworkClip" },
      back: { id: "back", label: "COSTAS", clipId: "backGarmentClip", artworkClipId: "backArtworkClip" }
    },

    elements: [],
    selectedId: null,
    activeSurface: "front",

    history: [],
    future: [],
    historyLimit: 80,

    zoom: 1,
    grid: true,
    reference: null,
    referenceOpacity: 0.2,

    drag: null,
    gestureSnapshot: null,
    colorGestureSnapshot: null,
    referenceGestureSnapshot: null,
    selectedTool: "select"
  };

  // ---------------------------------------------------------------------------
  // PRODUCT MODEL + SURFACES
  // ---------------------------------------------------------------------------

  const PRODUCT_TRANSFORMS = {
    front: { x: 35, y: 42, scale: 1.02 },
    back: { x: 585, y: 42, scale: 1.02 }
  };

  const technicalModels = {};

  function mountTechnicalModels() {
    if (!window.StyleLabGarmentModel) {
      console.warn("STYLE LAB: garment-model.js não foi carregado.");
      return;
    }

    productLayer.innerHTML = "";

    SURFACE_ORDER.forEach((surface) => {
      const t = PRODUCT_TRANSFORMS[surface];
      technicalModels[surface] = window.StyleLabGarmentModel.mount(
        productLayer,
        surface,
        t.x,
        t.y,
        t.scale,
        {
          primary: state.colors.primary,
          secondary: state.colors.secondary,
          detail: state.colors.detail,
          fit: state.construction.fit,
          sleeve: state.construction.sleeve,
          collar: state.construction.collar
        }
      );
    });

    syncClipPathsFromProductModel();
  }

  function syncClipPathsFromProductModel() {
    const defs = $("defs", canvas);
    if (!defs || !window.StyleLabGarmentModel?.GEOMETRY) return;

    ["frontGarmentClip", "backGarmentClip", "frontArtworkClip", "backArtworkClip"].forEach((id) => {
      $(`#${id}`, defs)?.remove();
    });

    SURFACE_ORDER.forEach((surface) => {
      const geometry = window.StyleLabGarmentModel.GEOMETRY[surface];
      const transform = PRODUCT_TRANSFORMS[surface];
      if (!geometry?.silhouette) return;

      const buildClip = (id) => {
        const clip = svg("clipPath", { id, clipPathUnits: "userSpaceOnUse" });
        const path = svg("path", {
          d: geometry.silhouette,
          transform: `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
        });
        clip.appendChild(path);
        defs.appendChild(clip);
      };

      buildClip(`${surface}GarmentClip`);
      buildClip(`${surface}ArtworkClip`);
    });
  }

  function applyTechnicalModelState() {
    Object.values(technicalModels).forEach((model) => {
      if (!model) return;
      model.style.setProperty("--gm-primary", state.colors.primary);
      model.style.setProperty("--gm-secondary", state.colors.secondary);
      model.style.setProperty("--gm-detail", state.colors.detail);
      model.dataset.fit = state.construction.fit;
      model.dataset.sleeve = state.construction.sleeve;
      model.dataset.collar = state.construction.collar;
    });
  }

  // ---------------------------------------------------------------------------
  // HISTORY
  // ---------------------------------------------------------------------------

  function snapshot() {
    return {
      colors: clone(state.colors),
      construction: clone(state.construction),
      elements: clone(state.elements),
      selectedId: state.selectedId,
      activeSurface: state.activeSurface,
      reference: state.reference,
      referenceOpacity: state.referenceOpacity,
      grid: state.grid
    };
  }

  function restore(data) {
    state.colors = clone(data.colors);
    state.construction = clone(data.construction);
    state.elements = clone(data.elements);
    state.selectedId = data.selectedId || null;
    state.activeSurface = data.activeSurface || "front";
    state.reference = data.reference || null;
    state.referenceOpacity = Number.isFinite(data.referenceOpacity) ? data.referenceOpacity : 0.2;
    state.grid = data.grid !== false;

    renderAll();
  }

  function pushHistory(data = snapshot()) {
    state.history.push(clone(data));
    if (state.history.length > state.historyLimit) state.history.shift();
    state.future = [];
    updateUndoRedo();
  }

  function transaction(mutator) {
    const before = snapshot();
    mutator();
    pushHistory(before);
    renderAll();
  }

  function undo() {
    if (!state.history.length) return;
    state.future.push(snapshot());
    restore(state.history.pop());
    updateUndoRedo();
  }

  function redo() {
    if (!state.future.length) return;
    state.history.push(snapshot());
    restore(state.future.pop());
    updateUndoRedo();
  }

  function updateUndoRedo() {
    const undoBtn = $("#undoBtn");
    const redoBtn = $("#redoBtn");
    if (undoBtn) undoBtn.disabled = !state.history.length;
    if (redoBtn) redoBtn.disabled = !state.future.length;
  }

  function beginGesture() {
    if (!state.gestureSnapshot) state.gestureSnapshot = snapshot();
  }

  function commitGesture() {
    if (!state.gestureSnapshot) return;
    pushHistory(state.gestureSnapshot);
    state.gestureSnapshot = null;
  }

  // ---------------------------------------------------------------------------
  // UI / PROJECT STATE
  // ---------------------------------------------------------------------------

  function syncColorUI() {
    const controls = [
      ["primary", "primaryColor", "primaryHex"],
      ["secondary", "secondaryColor", "secondaryHex"],
      ["detail", "detailColor", "detailHex"]
    ];

    controls.forEach(([key, inputId, hexId]) => {
      const input = $(`#${inputId}`);
      const output = $(`#${hexId}`);
      if (input) input.value = state.colors[key];
      if (output) output.textContent = state.colors[key].toUpperCase();
      document.documentElement.style.setProperty(`--${key}`, state.colors[key]);
    });
  }

  function syncConstructionUI() {
    const collar = $("#collarSelect");
    const sleeve = $("#sleeveSelect");
    const fit = $("#fitSelect");
    const shorts = $("#shortSelect");

    if (collar) collar.value = state.construction.collar === "v" ? "V" : "REDONDA";
    if (sleeve) sleeve.value = state.construction.sleeve === "long" ? "LONGA" : "CURTA";
    if (fit) fit.value = state.construction.fit === "slim" ? "SLIM FIT" : state.construction.fit === "relaxed" ? "RELAXED" : "REGULAR";
    if (shorts) shorts.value = state.construction.shorts === "long" ? "LONGO" : state.construction.shorts === "short" ? "CURTO" : "BASE";
  }

  function renderReference() {
    if (!referenceOverlay) return;
    if (!state.reference) {
      referenceOverlay.style.backgroundImage = "none";
      referenceOverlay.style.opacity = "0";
    } else {
      referenceOverlay.style.backgroundImage = `url("${state.reference}")`;
      referenceOverlay.style.opacity = String(state.referenceOpacity);
    }

    const opacity = $("#referenceOpacity");
    const output = $("#opacityValue");
    if (opacity) opacity.value = String(Math.round(state.referenceOpacity * 100));
    if (output) output.textContent = `${Math.round(state.referenceOpacity * 100)}%`;
  }

  function renderGrid() {
    if (gridLayer) gridLayer.style.display = state.grid ? "block" : "none";
    const toggle = $("#gridToggle");
    if (toggle) toggle.checked = state.grid;
  }

  // ---------------------------------------------------------------------------
  // SURFACE ENGINE
  // ---------------------------------------------------------------------------

  function rootPointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    };
  }

  function isPointInsideSurface(surface, rootPoint) {
    const model = technicalModels[surface];
    const silhouette = model?.querySelector?.(".gm-silhouette");
    if (!silhouette || typeof silhouette.isPointInFill !== "function") return false;

    try {
      const ctm = silhouette.getCTM();
      if (!ctm) return false;
      const local = new DOMPoint(rootPoint.x, rootPoint.y).matrixTransform(ctm.inverse());
      return silhouette.isPointInFill(local);
    } catch (_) {
      return false;
    }
  }

  function surfaceAtPoint(rootPoint) {
    return SURFACE_ORDER.find((surface) => isPointInsideSurface(surface, rootPoint)) || null;
  }

  function resolveSurface(data = {}) {
    if (data.target && state.surfaces[data.target]) return data.target;

    const x = Number.isFinite(data.x) ? data.x : 300;
    const y = Number.isFinite(data.y) ? data.y : 240;
    const width = Number.isFinite(data.width) ? data.width : 220;
    const height = Number.isFinite(data.height) ? data.height : 90;
    const center = { x: x + width / 2, y: y + height / 2 };

    return surfaceAtPoint(center) || state.activeSurface || "front";
  }

  function setActiveSurface(surface) {
    if (!state.surfaces[surface]) return;
    state.activeSurface = surface;
    renderSelection();
  }

  // ---------------------------------------------------------------------------
  // ELEMENT MODEL
  // ---------------------------------------------------------------------------

  function normalizeZIndexes() {
    state.elements
      .slice()
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((element, index) => { element.zIndex = index + 1; });
  }

  function createElement(data = {}) {
    const element = {
      id: uid(),
      type: data.type || "pattern",
      name: data.name || "ELEMENTO",
      x: data.x ?? 300,
      y: data.y ?? 220,
      width: data.width ?? 220,
      height: data.height ?? 90,
      rotation: data.rotation ?? 0,
      opacity: data.opacity ?? 1,
      visible: data.visible ?? true,
      locked: data.locked ?? false,
      zIndex: state.elements.length + 1,
      target: resolveSurface(data),
      data: clone(data.data || {})
    };

    transaction(() => {
      state.elements.push(element);
      state.selectedId = element.id;
      state.activeSurface = element.target;
    });

    return element;
  }

  function selected() {
    return state.elements.find((element) => element.id === state.selectedId) || null;
  }

  function mutateElement(id, mutator, options = {}) {
    const element = state.elements.find((item) => item.id === id);
    if (!element || element.locked) return;

    if (options.history !== false) {
      transaction(() => mutator(element));
    } else {
      mutator(element);
      renderAll();
    }
  }

  function deleteElement(id) {
    transaction(() => {
      state.elements = state.elements.filter((element) => element.id !== id);
      if (state.selectedId === id) state.selectedId = null;
      normalizeZIndexes();
    });
  }

  function duplicateElement(id) {
    const source = state.elements.find((element) => element.id === id);
    if (!source) return;

    transaction(() => {
      const copy = clone(source);
      copy.id = uid();
      copy.name = `${source.name} COPY`;
      copy.x += 16;
      copy.y += 16;
      copy.zIndex = Math.max(0, ...state.elements.map((element) => element.zIndex)) + 1;
      state.elements.push(copy);
      state.selectedId = copy.id;
    });
  }

  function toggleElementVisibility(id) {
    mutateElement(id, (element) => { element.visible = !element.visible; });
  }

  function toggleElementLock(id) {
    const element = state.elements.find((item) => item.id === id);
    if (!element) return;
    transaction(() => { element.locked = !element.locked; });
  }

  function moveElementToFront(id) {
    const element = state.elements.find((item) => item.id === id);
    if (!element) return;
    transaction(() => {
      element.zIndex = Math.max(0, ...state.elements.map((item) => item.zIndex)) + 1;
      normalizeZIndexes();
    });
  }

  function moveElementToBack(id) {
    const element = state.elements.find((item) => item.id === id);
    if (!element) return;
    transaction(() => {
      const min = Math.min(0, ...state.elements.map((item) => item.zIndex));
      element.zIndex = min - 1;
      normalizeZIndexes();
    });
  }

  // ---------------------------------------------------------------------------
  // ARTWORK FACTORY
  // ---------------------------------------------------------------------------

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function patternMarkup(kind, width, height) {
    const detail = state.colors.detail;
    const secondary = state.colors.secondary;

    const patterns = {
      "bolt-a": `
        <path d="M0 ${height * .88} L${width * .55} 0 L${width * .32} ${height * .48} L${width} ${height * .1} L${width * .56} ${height * .72} L${width * .76} ${height * .5} L${width * .18} ${height} Z" fill="${detail}"/>
        <path d="M${width * .05} ${height * .75} L${width * .6} ${height * .16} L${width * .36} ${height * .65} L${width * .9} ${height * .28}" fill="none" stroke="${secondary}" stroke-width="${Math.max(4, width * .035)}"/>
      `,
      "bolt-b": `
        <path d="M0 ${height * .92} L${width * .72} 0 L${width * .38} ${height * .65} L${width} ${height * .28} L${width * .58} ${height} L${width * .7} ${height * .56} L${width * .2} ${height} Z" fill="${detail}"/>
        <path d="M0 ${height * .58} L${width * .78} ${height * .08}" stroke="${secondary}" stroke-width="${Math.max(4, width * .04)}"/>
      `,
      slashes: `
        <path d="M0 ${height * .8} L${width * .78} 0 L${width} ${height * .04} L${width * .18} ${height} Z M${width * .2} ${height} L${width} ${height * .2} L${width} ${height * .35} L${width * .38} ${height} Z" fill="${detail}"/>
      `,
      rain: Array.from({ length: 6 }, (_, index) => {
        const x = (index * width) / 7;
        return `<line x1="${x}" y1="${height}" x2="${Math.min(width, x + width * .55)}" y2="0" stroke="${detail}" stroke-width="${Math.max(4, width * .025)}"/>`;
      }).join(""),
      wing: `
        <path d="M0 ${height * .85} L${width} ${height * .1} L${width * .55} ${height * .62} L${width} ${height * .4} L${width * .48} ${height} Z" fill="${detail}"/>
        <path d="M0 ${height * .55} L${width * .68} 0" stroke="${secondary}" stroke-width="${Math.max(4, width * .04)}"/>
      `,
      zig: `
        <polyline points="0,${height * .9} ${width * .25},${height * .05} ${width * .35},${height * .55} ${width * .7},${height * .1} ${width * .55},${height * .9} ${width},${height * .45}" fill="none" stroke="${detail}" stroke-width="${Math.max(6, width * .06)}" stroke-linejoin="bevel"/>
      `
    };

    return patterns[kind] || patterns["bolt-a"];
  }

  function elementMarkup(element) {
    if (element.type === "pattern") {
      return `<svg width="${element.width}" height="${element.height}" viewBox="0 0 ${element.width} ${element.height}" overflow="visible">${patternMarkup(element.data.kind, element.width, element.height)}</svg>`;
    }

    if (["text", "sponsor", "number"].includes(element.type)) {
      const value = escapeHtml(element.data.text || element.name);
      const fontSize = element.data.fontSize || Math.min(element.height * .82, 62);
      const family = element.type === "number" ? "Arial Black,Arial,sans-serif" : "Arial,sans-serif";
      return `<text x="${element.width / 2}" y="${element.height * .72}" text-anchor="middle" font-family="${family}" font-weight="900" font-size="${fontSize}" fill="${element.data.color || "#F2F4F5"}" stroke="${element.data.stroke || "none"}">${value}</text>`;
    }

    if (element.type === "shape") {
      return `<rect x="0" y="0" width="${element.width}" height="${element.height}" rx="${element.data.radius ?? 10}" fill="${element.data.color || state.colors.detail}"/>`;
    }

    if (element.type === "image") {
      return `<image href="${element.data.src}" width="${element.width}" height="${element.height}" preserveAspectRatio="xMidYMid meet"/>`;
    }

    return "";
  }

  function createArtworkNode(element) {
    const group = svg("g", {
      class: `art-element${element.locked ? " locked" : ""}`,
      "data-id": element.id,
      transform: `translate(${element.x} ${element.y}) rotate(${element.rotation} ${element.width / 2} ${element.height / 2})`,
      opacity: element.opacity
    });

    group.innerHTML = elementMarkup(element);
    group.addEventListener("pointerdown", onElementPointerDown);
    return group;
  }

  function renderArtwork() {
    artworkLayer.innerHTML = "";

    // Uma raiz de arte por superfície. O recorte é aplicado à superfície inteira,
    // garantindo que nenhum tipo de elemento consiga escapar visualmente da camisa.
    const roots = {};
    SURFACE_ORDER.forEach((surface) => {
      const root = svg("g", {
        class: `artwork-surface artwork-${surface}`,
        "data-surface": surface,
        "clip-path": `url(#${state.surfaces[surface].artworkClipId})`
      });
      roots[surface] = root;
      artworkLayer.appendChild(root);
    });

    state.elements
      .slice()
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((element) => {
        if (!element.visible) return;
        const surface = state.surfaces[element.target] ? element.target : "front";
        roots[surface].appendChild(createArtworkNode(element));
      });

    renderSelection();
  }

  // ---------------------------------------------------------------------------
  // SELECTION + LAYERS
  // ---------------------------------------------------------------------------

  function renderSelection() {
    selectionLayer.innerHTML = "";
    const element = selected();
    const readout = $("#selectionReadout");

    if (readout) {
      readout.textContent = element
        ? `${element.name.toUpperCase()} · ${element.type.toUpperCase()} · ${state.surfaces[element.target]?.label || element.target} · X:${Math.round(element.x)} Y:${Math.round(element.y)}`
        : `SUPERFÍCIE ATIVA: ${state.surfaces[state.activeSurface]?.label || "FRENTE"}`;
    }

    if (!element || !element.visible) return;

    const group = svg("g", {
      transform: `translate(${element.x} ${element.y}) rotate(${element.rotation} ${element.width / 2} ${element.height / 2})`
    });

    group.innerHTML = `
      <rect class="selection-box" x="-8" y="-8" width="${element.width + 16}" height="${element.height + 16}" rx="3"/>
      <circle class="selection-handle" cx="-8" cy="-8" r="5"/>
      <circle class="selection-handle" cx="${element.width + 8}" cy="-8" r="5"/>
      <circle class="selection-handle" cx="-8" cy="${element.height + 8}" r="5"/>
      <circle class="selection-handle" cx="${element.width + 8}" cy="${element.height + 8}" r="5"/>
    `;

    selectionLayer.appendChild(group);
  }

  function renderLayers() {
    const list = $("#layersList");
    if (!list) return;

    list.innerHTML = "";
    const count = $("#layerCount");
    if (count) count.textContent = String(state.elements.length);

    state.elements
      .slice()
      .sort((a, b) => b.zIndex - a.zIndex)
      .forEach((element) => {
        const item = document.createElement("div");
        item.className = `layer-item${element.id === state.selectedId ? " selected" : ""}`;
        item.dataset.id = element.id;
        item.innerHTML = `
          <span class="drag-dot">⠿</span>
          <button class="layer-name" data-action="select" title="Selecionar camada">
            ${escapeHtml(element.name)}
            <span class="layer-type">${escapeHtml(element.type.toUpperCase())} · ${escapeHtml(state.surfaces[element.target]?.label || element.target)}</span>
          </button>
          <button class="layer-action" data-action="visible" title="Visibilidade">${element.visible ? "◉" : "○"}</button>
          <button class="layer-action" data-action="lock" title="Bloquear">${element.locked ? "▣" : "▢"}</button>
          <button class="layer-action" data-action="delete" title="Excluir">⌫</button>
        `;

        item.addEventListener("click", (event) => {
          const action = event.target.closest("[data-action]")?.dataset.action || "select";
          if (action === "select") {
            state.selectedId = element.id;
            state.activeSurface = element.target;
            renderAll();
          }
          if (action === "visible") toggleElementVisibility(element.id);
          if (action === "lock") toggleElementLock(element.id);
          if (action === "delete") deleteElement(element.id);
        });

        list.appendChild(item);
      });
  }

  // ---------------------------------------------------------------------------
  // POINTER INTERACTION
  // ---------------------------------------------------------------------------

  function onElementPointerDown(event) {
    event.stopPropagation();
    const id = event.currentTarget.dataset.id;
    const element = state.elements.find((item) => item.id === id);
    if (!element || element.locked) return;

    const point = rootPointFromEvent(event);
    state.selectedId = id;
    state.activeSurface = element.target;
    beginGesture();
    state.drag = {
      id,
      pointerId: event.pointerId,
      offsetX: point.x - element.x,
      offsetY: point.y - element.y
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    renderAll();
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.(".art-element")) return;

    const point = rootPointFromEvent(event);
    const surface = surfaceAtPoint(point);

    if (surface) {
      setActiveSurface(surface);
      state.selectedId = null;
      renderAll();
      return;
    }

    if (event.target === canvas || event.target.classList.contains("canvas-bg") || event.target.id === "gridLayer") {
      state.selectedId = null;
      renderAll();
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;

    const element = state.elements.find((item) => item.id === state.drag.id);
    if (!element || element.locked) return;

    const point = rootPointFromEvent(event);
    element.x = Math.max(-element.width, Math.min(CANVAS_WIDTH, point.x - state.drag.offsetX));
    element.y = Math.max(-element.height, Math.min(CANVAS_HEIGHT, point.y - state.drag.offsetY));

    // Transferência semântica entre frente e costas:
    // se o centro do elemento entra em outra superfície, o alvo muda automaticamente.
    const center = { x: element.x + element.width / 2, y: element.y + element.height / 2 };
    const surface = surfaceAtPoint(center);
    if (surface) {
      element.target = surface;
      state.activeSurface = surface;
    }

    renderArtwork();
    renderLayers();
  });

  function endPointerGesture(event) {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    state.drag = null;
    commitGesture();
    renderAll();
  }

  canvas.addEventListener("pointerup", endPointerGesture);
  canvas.addEventListener("pointercancel", endPointerGesture);

  canvas.addEventListener("wheel", (event) => {
    const element = selected();
    if (!element || element.locked) return;

    event.preventDefault();
    const before = snapshot();
    const factor = event.deltaY < 0 ? 1.06 : 0.94;
    const ratio = element.height / Math.max(element.width, 1);
    const nextWidth = Math.max(30, Math.min(620, element.width * factor));

    element.width = nextWidth;
    element.height = Math.max(20, Math.min(360, nextWidth * ratio));
    pushHistory(before);
    renderAll();
  }, { passive: false });

  // ---------------------------------------------------------------------------
  // ELEMENT COMMANDS
  // ---------------------------------------------------------------------------

  function surfacePlacement(surface = state.activeSurface) {
    return surface === "back"
      ? { x: 680, y: 165 }
      : { x: 190, y: 165 };
  }

  function addPattern(kind = "bolt-a") {
    const p = surfacePlacement();
    createElement({
      type: "pattern",
      name: `PADRÃO ${kind.toUpperCase()}`,
      target: state.activeSurface,
      x: p.x,
      y: p.y,
      width: 280,
      height: 125,
      data: { kind }
    });
  }

  function addText() {
    const text = window.prompt("Texto do elemento:", "PLAYER");
    if (text === null) return;
    const p = surfacePlacement();
    createElement({
      type: "text",
      name: text,
      target: state.activeSurface,
      x: p.x,
      y: p.y,
      width: 220,
      height: 70,
      data: { text, color: "#F2F4F5", fontSize: 54 }
    });
  }

  function addNumber() {
    const text = window.prompt("Número:", "10");
    if (text === null) return;
    const p = surfacePlacement("back");
    createElement({
      type: "number",
      name: `NÚMERO ${text}`,
      target: "back",
      x: p.x + 10,
      y: p.y + 70,
      width: 160,
      height: 170,
      data: { text, color: "#F2F4F5", fontSize: 132 }
    });
  }

  function addSponsor() {
    const text = window.prompt("Patrocínio:", "SPONSOR");
    if (text === null) return;
    const p = surfacePlacement("front");
    createElement({
      type: "sponsor",
      name: text,
      target: "front",
      x: p.x + 25,
      y: p.y + 30,
      width: 260,
      height: 65,
      data: { text, color: "#F2F4F5", fontSize: 38 }
    });
  }

  function addShape() {
    const p = surfacePlacement();
    createElement({
      type: "shape",
      name: "FORMA",
      target: state.activeSurface,
      x: p.x + 60,
      y: p.y + 100,
      width: 150,
      height: 75,
      data: { color: state.colors.detail, radius: 12 }
    });
  }

  // ---------------------------------------------------------------------------
  // ZOOM / RENDER
  // ---------------------------------------------------------------------------

  function updateZoom() {
    canvas.style.transform = `scale(${state.zoom})`;
    const output = $("#zoomValue");
    if (output) output.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function zoom(delta) {
    state.zoom = Math.max(0.6, Math.min(1.5, state.zoom + delta));
    updateZoom();
  }

  function renderAll() {
    syncColorUI();
    syncConstructionUI();
    applyTechnicalModelState();
    renderReference();
    renderGrid();
    renderArtwork();
    renderLayers();
    updateZoom();
    updateUndoRedo();
  }

  // ---------------------------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------------------------

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 700);
  }

  function exportSvg() {
    const copy = canvas.cloneNode(true);
    copy.removeAttribute("style");
    copy.setAttribute("xmlns", SVG_NS);
    copy.setAttribute("width", String(CANVAS_WIDTH));
    copy.setAttribute("height", String(CANVAS_HEIGHT));

    const source = new XMLSerializer().serializeToString(copy);
    downloadBlob(
      new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
      "style-lab-config.svg"
    );
  }

  function exportPng() {
    const copy = canvas.cloneNode(true);
    copy.removeAttribute("style");
    copy.setAttribute("xmlns", SVG_NS);
    copy.setAttribute("width", String(CANVAS_WIDTH));
    copy.setAttribute("height", String(CANVAS_HEIGHT));

    const source = new XMLSerializer().serializeToString(copy);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const output = document.createElement("canvas");
      output.width = 2400;
      output.height = 1520;
      const context = output.getContext("2d");
      context.fillStyle = "#eef0f2";
      context.fillRect(0, 0, output.width, output.height);
      context.drawImage(image, 0, 0, output.width, output.height);
      output.toBlob((png) => {
        if (png) downloadBlob(png, "style-lab-config.png");
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  function exportJson() {
    const payload = {
      schema: "style-lab/project@0.6",
      projectId: state.projectId,
      productId: state.productId,
      version: state.version,
      colors: state.colors,
      construction: state.construction,
      activeSurface: state.activeSurface,
      surfaces: Object.values(state.surfaces).map(({ id, label }) => ({ id, label })),
      elements: state.elements,
      referenceOpacity: state.referenceOpacity,
      exportedAt: new Date().toISOString()
    };

    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      "style-lab-config.json"
    );
  }

  // ---------------------------------------------------------------------------
  // FUTURE AI CONTRACT
  // ---------------------------------------------------------------------------
  // A LLM NÃO desenha a camisa diretamente. Ela deve enviar operações validadas.
  // Esta função pode ser chamada por um backend seguro quando a integração existir.

  function applyDesignOperations(operations = []) {
    if (!Array.isArray(operations)) return { applied: 0, errors: ["operations must be an array"] };

    const before = snapshot();
    const errors = [];
    let applied = 0;

    operations.forEach((operation, index) => {
      try {
        if (!operation || typeof operation.type !== "string") throw new Error("Operação inválida");

        if (operation.type === "setColor") {
          if (!Object.prototype.hasOwnProperty.call(state.colors, operation.slot)) throw new Error("Slot de cor inválido");
          if (!/^#[0-9a-f]{6}$/i.test(operation.value || "")) throw new Error("Cor inválida");
          state.colors[operation.slot] = operation.value;
          applied += 1;
          return;
        }

        if (operation.type === "setConstruction") {
          const allowed = ["collar", "sleeve", "fit", "shorts"];
          if (!allowed.includes(operation.key)) throw new Error("Parâmetro de construção inválido");
          state.construction[operation.key] = operation.value;
          applied += 1;
          return;
        }

        if (operation.type === "addElement") {
          const target = operation.element?.target || state.activeSurface;
          if (!state.surfaces[target]) throw new Error("Superfície inválida");
          const element = {
            id: uid(),
            type: operation.element?.type || "pattern",
            name: operation.element?.name || "ELEMENTO IA",
            x: Number(operation.element?.x ?? 250),
            y: Number(operation.element?.y ?? 160),
            width: Math.max(20, Number(operation.element?.width ?? 220)),
            height: Math.max(20, Number(operation.element?.height ?? 90)),
            rotation: Number(operation.element?.rotation ?? 0),
            opacity: Math.max(0, Math.min(1, Number(operation.element?.opacity ?? 1))),
            visible: true,
            locked: false,
            zIndex: state.elements.length + 1,
            target,
            data: clone(operation.element?.data || {})
          };
          state.elements.push(element);
          state.selectedId = element.id;
          state.activeSurface = target;
          applied += 1;
          return;
        }

        if (operation.type === "removeElement") {
          state.elements = state.elements.filter((element) => element.id !== operation.id);
          if (state.selectedId === operation.id) state.selectedId = null;
          applied += 1;
          return;
        }

        throw new Error(`Operação não suportada: ${operation.type}`);
      } catch (error) {
        errors.push({ index, message: error.message });
      }
    });

    if (applied) {
      normalizeZIndexes();
      pushHistory(before);
      renderAll();
    }

    return { applied, errors };
  }

  // API pública mínima para integração futura com backend/LLM.
  window.StyleLabDesignEngine = {
    getState: () => clone({
      projectId: state.projectId,
      productId: state.productId,
      version: state.version,
      colors: state.colors,
      construction: state.construction,
      activeSurface: state.activeSurface,
      elements: state.elements
    }),
    applyDesignOperations,
    exportJson,
    exportSvg,
    exportPng
  };

  // ---------------------------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------------------------

  function bindColorControl(key, inputId) {
    const input = $(`#${inputId}`);
    if (!input) return;

    input.addEventListener("pointerdown", () => {
      if (!state.colorGestureSnapshot) state.colorGestureSnapshot = snapshot();
    });

    input.addEventListener("input", (event) => {
      state.colors[key] = event.target.value;
      syncColorUI();
      applyTechnicalModelState();
      renderArtwork();
    });

    input.addEventListener("change", () => {
      if (state.colorGestureSnapshot) {
        pushHistory(state.colorGestureSnapshot);
        state.colorGestureSnapshot = null;
      }
      renderAll();
    });
  }

  bindColorControl("primary", "primaryColor");
  bindColorControl("secondary", "secondaryColor");
  bindColorControl("detail", "detailColor");

  $("#referenceInput")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => transaction(() => { state.reference = reader.result; });
    reader.readAsDataURL(file);
  });

  $("#referenceOpacity")?.addEventListener("input", (event) => {
    if (!state.referenceGestureSnapshot) state.referenceGestureSnapshot = snapshot();
    state.referenceOpacity = Number(event.target.value) / 100;
    renderReference();
  });

  $("#referenceOpacity")?.addEventListener("change", () => {
    if (state.referenceGestureSnapshot) {
      pushHistory(state.referenceGestureSnapshot);
      state.referenceGestureSnapshot = null;
    }
    renderAll();
  });

  $("#gridToggle")?.addEventListener("change", (event) => {
    transaction(() => { state.grid = event.target.checked; });
  });

  $("#collarSelect")?.addEventListener("change", (event) => {
    transaction(() => { state.construction.collar = event.target.value === "V" ? "v" : "round"; });
  });

  $("#sleeveSelect")?.addEventListener("change", (event) => {
    transaction(() => { state.construction.sleeve = event.target.value === "LONGA" ? "long" : "short"; });
  });

  $("#fitSelect")?.addEventListener("change", (event) => {
    transaction(() => {
      state.construction.fit = event.target.value === "SLIM FIT"
        ? "slim"
        : event.target.value === "RELAXED"
          ? "relaxed"
          : "regular";
    });
  });

  $("#shortSelect")?.addEventListener("change", (event) => {
    transaction(() => {
      state.construction.shorts = event.target.value === "LONGO"
        ? "long"
        : event.target.value === "CURTO"
          ? "short"
          : "base";
    });
  });

  $("#undoBtn")?.addEventListener("click", undo);
  $("#redoBtn")?.addEventListener("click", redo);

  $("#zoomInBtn")?.addEventListener("click", () => zoom(0.1));
  $("#zoomOutBtn")?.addEventListener("click", () => zoom(-0.1));
  $("#zoomPlus")?.addEventListener("click", () => zoom(0.1));
  $("#zoomMinus")?.addEventListener("click", () => zoom(-0.1));

  $("#rotateLeftBtn")?.addEventListener("click", () => {
    const element = selected();
    if (element) mutateElement(element.id, (item) => { item.rotation -= 5; });
  });

  $("#rotateRightBtn")?.addEventListener("click", () => {
    const element = selected();
    if (element) mutateElement(element.id, (item) => { item.rotation += 5; });
  });

  $("#selectTool")?.addEventListener("click", () => { state.selectedTool = "select"; });
  $("#textTool")?.addEventListener("click", addText);
  $("#shapeTool")?.addEventListener("click", addShape);
  $("#imageTool")?.addEventListener("click", () => $("#imageElementInput")?.click());

  $("#imageElementInput")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const p = surfacePlacement();
      createElement({
        type: "image",
        name: file.name,
        target: state.activeSurface,
        x: p.x + 60,
        y: p.y + 70,
        width: 170,
        height: 130,
        data: { src: reader.result }
      });
    };
    reader.readAsDataURL(file);
  });

  $("#loadPatternBtn")?.addEventListener("click", () => {
    const selectedCard = $(".pattern-card.selected");
    addPattern(selectedCard?.dataset.pattern || "bolt-a");
  });

  $$(".pattern-card").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".pattern-card").forEach((card) => card.classList.remove("selected"));
      button.classList.add("selected");
      addPattern(button.dataset.pattern);
    });
  });

  $$(".category").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".category").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const category = button.dataset.category;
      if (category === "numbers") addNumber();
      if (category === "names") addText();
      if (category === "sponsors") addSponsor();
      if (category === "shields") addShape();
    });
  });

  $("#clearCanvasBtn")?.addEventListener("click", () => {
    if (!window.confirm("Remover todos os elementos editáveis?")) return;
    transaction(() => {
      state.elements = [];
      state.selectedId = null;
    });
  });

  $("#saveConfigBtn")?.addEventListener("click", exportJson);
  $("#exportSvgBtn")?.addEventListener("click", exportSvg);
  $("#exportPngBtn")?.addEventListener("click", exportPng);
  $("#exportJsonBtn")?.addEventListener("click", exportJson);

  $("#nextBtn")?.addEventListener("click", () => {
    window.alert("STYLE LAB V0.6: projeto preparado para exportação e para futura integração com o motor de IA de design.");
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }

    const element = selected();
    if (!element) return;

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteElement(element.id);
    }

    if (event.key === "ArrowLeft") { event.preventDefault(); mutateElement(element.id, (item) => { item.x -= 2; }); }
    if (event.key === "ArrowRight") { event.preventDefault(); mutateElement(element.id, (item) => { item.x += 2; }); }
    if (event.key === "ArrowUp") { event.preventDefault(); mutateElement(element.id, (item) => { item.y -= 2; }); }
    if (event.key === "ArrowDown") { event.preventDefault(); mutateElement(element.id, (item) => { item.y += 2; }); }

    if (event.key.toLowerCase() === "r") mutateElement(element.id, (item) => { item.rotation += 5; });

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateElement(element.id);
    }

    if (event.key === "Home") moveElementToFront(element.id);
    if (event.key === "End") moveElementToBack(element.id);
  });

  // ---------------------------------------------------------------------------
  // INITIAL PROJECT
  // ---------------------------------------------------------------------------

  mountTechnicalModels();

  state.elements = [
    {
      id: uid(), type: "pattern", name: "PADRÃO 03",
      x: 150, y: 155, width: 280, height: 125,
      rotation: -8, opacity: .92, visible: true, locked: false, zIndex: 1,
      target: "front", data: { kind: "bolt-a" }
    },
    {
      id: uid(), type: "sponsor", name: "SPONSOR",
      x: 190, y: 160, width: 260, height: 65,
      rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 2,
      target: "front", data: { text: "SPONSOR", color: "#F2F4F5", fontSize: 38 }
    },
    {
      id: uid(), type: "text", name: "PLAYER",
      x: 680, y: 118, width: 190, height: 60,
      rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 3,
      target: "back", data: { text: "PLAYER", color: "#F2F4F5", fontSize: 38 }
    },
    {
      id: uid(), type: "number", name: "NÚMERO 10",
      x: 700, y: 175, width: 160, height: 170,
      rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 4,
      target: "back", data: { text: "10", color: "#F2F4F5", fontSize: 132 }
    }
  ];

  renderAll();
})();
