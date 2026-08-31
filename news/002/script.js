(() => {
  "use strict";

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  const svgNS = "http://www.w3.org/2000/svg";

  // Technical garment model is isolated from editor logic.
  // Replace/upgrade proportions in garment-model.js without touching layers or UI.
  const productLayer = document.getElementById("productLayer");
  if (window.StyleLabGarmentModel && productLayer) {
    window.frontTechnicalModel = StyleLabGarmentModel.mount(productLayer, "front", 35, 42, 1.02, {
      primary: "#0A2D8F", secondary: "#E31E3F", detail: "#00C3FF",
      fit: "regular", sleeve: "short", collar: "round"
    });
    window.backTechnicalModel = StyleLabGarmentModel.mount(productLayer, "back", 585, 42, 1.02, {
      primary: "#0A2D8F", secondary: "#E31E3F", detail: "#00C3FF",
      fit: "regular", sleeve: "short", collar: "round"
    });
  }
  const canvas = $("#designCanvas");
  const artworkLayer = $("#artworkLayer");
  const selectionLayer = $("#selectionLayer");
  const viewport = $("#canvasViewport");

  const state = {
    projectId: "SL-001",
    productId: "CAM-BAS-001",
    version: "V0.3",
    colors: { primary:"#0A2D8F", secondary:"#E31E3F", detail:"#00C3FF" },
    elements: [],
    selectedId: null,
    history: [],
    future: [],
    zoom: 1,
    grid: true,
    reference: null,
    referenceOpacity: .2,
    drag: null
  };

  function updateTechnicalModelColors() {
    const p = document.getElementById("primaryColor")?.value;
    const sec = document.getElementById("secondaryColor")?.value;
    const d = document.getElementById("detailColor")?.value;
    [window.frontTechnicalModel, window.backTechnicalModel].filter(Boolean).forEach(model => {
      if (p) model.style.setProperty("--gm-primary", p);
      if (sec) model.style.setProperty("--gm-secondary", sec);
      if (d) model.style.setProperty("--gm-detail", d);
    });
  }


  const uid = () => `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  const clone = v => JSON.parse(JSON.stringify(v));

  function snapshot() {
    return {
      colors: clone(state.colors),
      elements: clone(state.elements),
      selectedId: state.selectedId,
      reference: state.reference,
      referenceOpacity: state.referenceOpacity
    };
  }
  function restore(s) {
    state.colors = s.colors;
    state.elements = s.elements;
    state.selectedId = s.selectedId;
    state.reference = s.reference;
    state.referenceOpacity = s.referenceOpacity;
    renderAll();
  }
  function commit() {
    state.history.push(snapshot());
    if (state.history.length > 60) state.history.shift();
    state.future = [];
    updateUndoRedo();
  }
  function withHistory(action) {
    commit();
    action();
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
    $("#undoBtn").disabled = !state.history.length;
    $("#redoBtn").disabled = !state.future.length;
  }

  function setCssColors() {
    document.documentElement.style.setProperty("--primary", state.colors.primary);
    document.documentElement.style.setProperty("--secondary", state.colors.secondary);
    document.documentElement.style.setProperty("--detail", state.colors.detail);
    $("#primaryColor").value = state.colors.primary;
    $("#secondaryColor").value = state.colors.secondary;
    $("#detailColor").value = state.colors.detail;
    $("#primaryHex").textContent = state.colors.primary.toUpperCase();
    $("#secondaryHex").textContent = state.colors.secondary.toUpperCase();
    $("#detailHex").textContent = state.colors.detail.toUpperCase();
  }

  function createElement(data) {
    const el = {
      id: uid(),
      type: data.type || "pattern",
      name: data.name || "Elemento",
      x: data.x ?? 300,
      y: data.y ?? 240,
      width: data.width ?? 220,
      height: data.height ?? 90,
      rotation: data.rotation ?? 0,
      opacity: data.opacity ?? 1,
      visible: data.visible ?? true,
      locked: data.locked ?? false,
      zIndex: state.elements.length + 1,
      data: data.data || {}
    };
    withHistory(() => state.elements.push(el));
    state.selectedId = el.id;
    renderAll();
    return el;
  }

  function patternMarkup(kind, w, h) {
    const color = state.colors.detail;
    const secondary = state.colors.secondary;
    const dark = state.colors.primary;
    const paths = {
      "bolt-a": `<path d="M0 ${h*.88} L${w*.55} 0 L${w*.32} ${h*.48} L${w} ${h*.1} L${w*.56} ${h*.72} L${w*.76} ${h*.5} L${w*.18} ${h} Z" fill="${color}"/><path d="M${w*.05} ${h*.75} L${w*.6} ${h*.16} L${w*.36} ${h*.65} L${w*.9} ${h*.28}" fill="none" stroke="${secondary}" stroke-width="${Math.max(4,w*.035)}"/>`,
      "bolt-b": `<path d="M0 ${h*.92} L${w*.72} 0 L${w*.38} ${h*.65} L${w} ${h*.28} L${w*.58} ${h} L${w*.7} ${h*.56} L${w*.2} ${h} Z" fill="${color}"/><path d="M0 ${h*.58} L${w*.78} ${h*.08}" stroke="${secondary}" stroke-width="${Math.max(4,w*.04)}"/>`,
      "slashes": `<path d="M0 ${h*.8} L${w*.78} 0 L${w} ${h*.04} L${w*.18} ${h} Z M${w*.2} ${h} L${w} ${h*.2} L${w} ${h*.35} L${w*.38} ${h} Z" fill="${color}"/>`,
      "rain": Array.from({length:6},(_,i)=>`<line x1="${i*w/7}" y1="${h}" x2="${Math.min(w,i*w/7+w*.55)}" y2="0" stroke="${color}" stroke-width="${Math.max(4,w*.025)}"/>`).join(""),
      "wing": `<path d="M0 ${h*.85} L${w} ${h*.1} L${w*.55} ${h*.62} L${w} ${h*.4} L${w*.48} ${h} Z" fill="${color}"/><path d="M0 ${h*.55} L${w*.68} 0" stroke="${secondary}" stroke-width="${Math.max(4,w*.04)}"/>`,
      "zig": `<polyline points="0,${h*.9} ${w*.25},${h*.05} ${w*.35},${h*.55} ${w*.7},${h*.1} ${w*.55},${h*.9} ${w},${h*.45}" fill="none" stroke="${color}" stroke-width="${Math.max(6,w*.06)}" stroke-linejoin="bevel"/>`
    };
    return paths[kind] || paths["bolt-a"];
  }

  function renderArtwork() {
    artworkLayer.innerHTML = "";
    state.elements
      .slice()
      .sort((a,b)=>a.zIndex-b.zIndex)
      .forEach(el => {
        if (!el.visible) return;
        const g = document.createElementNS(svgNS, "g");
        g.dataset.id = el.id;
        g.classList.add("art-element");
        if (el.locked) g.classList.add("locked");
        g.setAttribute("transform", `translate(${el.x} ${el.y}) rotate(${el.rotation} ${el.width/2} ${el.height/2})`);
        g.setAttribute("opacity", el.opacity);

        let content = "";
        if (el.type === "pattern") {
          content = `<svg width="${el.width}" height="${el.height}" viewBox="0 0 ${el.width} ${el.height}" overflow="visible">${patternMarkup(el.data.kind, el.width, el.height)}</svg>`;
        } else if (el.type === "text" || el.type === "sponsor" || el.type === "number") {
          const value = escapeHtml(el.data.text || el.name);
          const size = el.data.fontSize || Math.min(el.height*.82, 62);
          const family = el.type === "number" ? "Arial Black,Arial,sans-serif" : "Arial,sans-serif";
          content = `<text x="${el.width/2}" y="${el.height*.72}" text-anchor="middle" font-family="${family}" font-weight="900" font-size="${size}" fill="${el.data.color || "#F2F4F5"}" stroke="${el.data.stroke || "none"}">${value}</text>`;
        } else if (el.type === "shape") {
          content = `<rect x="0" y="0" width="${el.width}" height="${el.height}" rx="${el.data.radius ?? 10}" fill="${el.data.color || state.colors.detail}"/>`;
        } else if (el.type === "image") {
          content = `<image href="${el.data.src}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid meet"/>`;
        }
        g.innerHTML = content;
        g.addEventListener("pointerdown", onElementPointerDown);
        artworkLayer.appendChild(g);
      });
    renderSelection();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function selected() { return state.elements.find(e => e.id === state.selectedId) || null; }

  function renderSelection() {
    selectionLayer.innerHTML = "";
    const el = selected();
    $("#selectionReadout").textContent = el ? `${el.name.toUpperCase()} · ${el.type.toUpperCase()} · X:${Math.round(el.x)} Y:${Math.round(el.y)}` : "NENHUM ELEMENTO SELECIONADO";
    if (!el || !el.visible) return;
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${el.x} ${el.y}) rotate(${el.rotation} ${el.width/2} ${el.height/2})`);
    g.innerHTML = `<rect class="selection-box" x="-8" y="-8" width="${el.width+16}" height="${el.height+16}" rx="3"/>
      <circle class="selection-handle" cx="-8" cy="-8" r="5"/><circle class="selection-handle" cx="${el.width+8}" cy="-8" r="5"/>
      <circle class="selection-handle" cx="-8" cy="${el.height+8}" r="5"/><circle class="selection-handle" cx="${el.width+8}" cy="${el.height+8}" r="5"/>`;
    selectionLayer.appendChild(g);
  }

  function renderLayers() {
    const list = $("#layersList");
    list.innerHTML = "";
    const ordered = state.elements.slice().sort((a,b)=>b.zIndex-a.zIndex);
    $("#layerCount").textContent = state.elements.length;
    ordered.forEach(el => {
      const item = document.createElement("div");
      item.className = "layer-item" + (el.id === state.selectedId ? " selected" : "");
      item.dataset.id = el.id;
      item.innerHTML = `<span class="drag-dot">⋮⋮</span>
        <button class="layer-name layer-select" title="Selecionar"><span>${escapeHtml(el.name)}</span><small class="layer-type">${el.type}</small></button>
        <button class="layer-action layer-visibility" title="Visibilidade">${el.visible ? "◉":"○"}</button>
        <button class="layer-action layer-lock" title="Bloquear">${el.locked ? "▣":"▢"}</button>
        <button class="layer-action layer-menu" title="Mais ações">⋮</button>`;
      item.querySelector(".layer-select").addEventListener("click", () => { state.selectedId = el.id; renderAll(); });
      item.querySelector(".layer-visibility").addEventListener("click", () => mutateElement(el.id, e => e.visible = !e.visible));
      item.querySelector(".layer-lock").addEventListener("click", () => mutateElement(el.id, e => e.locked = !e.locked));
      item.querySelector(".layer-menu").addEventListener("click", () => {
        const choice = prompt("Ação: duplicate | delete | front | back", "duplicate");
        if (choice === "duplicate") duplicateElement(el.id);
        if (choice === "delete") deleteElement(el.id);
        if (choice === "front") mutateElement(el.id, e => e.zIndex = Math.max(...state.elements.map(x=>x.zIndex),0)+1);
        if (choice === "back") mutateElement(el.id, e => e.zIndex = Math.min(...state.elements.map(x=>x.zIndex),0)-1);
      });
      list.appendChild(item);
    });
  }

  function renderReference() {
    const ref = $("#referenceOverlay");
    if (state.reference) {
      ref.style.backgroundImage = `url("${state.reference}")`;
      ref.style.opacity = state.referenceOpacity;
    } else {
      ref.style.backgroundImage = "none";
      ref.style.opacity = 0;
    }
    $("#referenceOpacity").value = Math.round(state.referenceOpacity*100);
    $("#opacityValue").textContent = `${Math.round(state.referenceOpacity*100)}%`;
  }

  function renderAll() {
    setCssColors();
    renderArtwork();
    renderLayers();
    renderReference();
    updateZoom();
    updateUndoRedo();
  }

  function mutateElement(id, fn) {
    withHistory(() => {
      const e = state.elements.find(x => x.id === id);
      if (e) fn(e);
    });
  }
  function duplicateElement(id) {
    const e = state.elements.find(x => x.id === id);
    if (!e) return;
    withHistory(() => {
      const copy = clone(e);
      copy.id = uid(); copy.name = `${e.name} CÓPIA`; copy.x += 24; copy.y += 24;
      copy.zIndex = Math.max(...state.elements.map(x=>x.zIndex),0)+1;
      state.elements.push(copy); state.selectedId = copy.id;
    });
  }
  function deleteElement(id) {
    withHistory(() => {
      state.elements = state.elements.filter(x => x.id !== id);
      if (state.selectedId === id) state.selectedId = null;
    });
  }

  function clientToSvg(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * 1200 / rect.width,
      y: (evt.clientY - rect.top) * 760 / rect.height
    };
  }

  function onElementPointerDown(evt) {
    evt.stopPropagation();
    const id = evt.currentTarget.dataset.id;
    const el = state.elements.find(e=>e.id===id);
    if (!el || el.locked) return;
    commit();
    state.selectedId = id;
    const p = clientToSvg(evt);
    state.drag = { id, offsetX:p.x-el.x, offsetY:p.y-el.y, pointerId:evt.pointerId };
    evt.currentTarget.setPointerCapture(evt.pointerId);
    renderAll();
  }

  canvas.addEventListener("pointerdown", evt => {
    if (evt.target === canvas || evt.target.classList.contains("canvas-bg") || evt.target.id === "gridLayer") {
      state.selectedId = null;
      renderAll();
    }
  });
  canvas.addEventListener("pointermove", evt => {
    if (!state.drag || state.drag.pointerId !== evt.pointerId) return;
    const el = selected();
    if (!el) return;
    const p = clientToSvg(evt);
    el.x = Math.max(0, Math.min(1200-el.width, p.x-state.drag.offsetX));
    el.y = Math.max(0, Math.min(760-el.height, p.y-state.drag.offsetY));
    renderArtwork(); renderLayers();
  });
  canvas.addEventListener("pointerup", evt => {
    if (state.drag && state.drag.pointerId === evt.pointerId) state.drag = null;
  });
  canvas.addEventListener("wheel", evt => {
    const el = selected();
    if (!el) return;
    evt.preventDefault();
    const factor = evt.deltaY < 0 ? 1.05 : .95;
    el.width = Math.max(30, Math.min(600, el.width*factor));
    el.height = Math.max(20, Math.min(300, el.height*factor));
    renderAll();
  }, {passive:false});

  function addPattern(kind="bolt-a") {
    createElement({ type:"pattern", name:`PADRÃO ${kind.toUpperCase()}`, x:260, y:180, width:260, height:120, data:{kind} });
  }
  function addText() {
    const text = prompt("Texto do elemento:", "PLAYER");
    if (text === null) return;
    createElement({type:"text",name:text,x:690,y:130,width:220,height:70,data:{text,color:"#F2F4F5",fontSize:54}});
  }
  function addNumber() {
    const text = prompt("Número:", "10");
    if (text === null) return;
    createElement({type:"number",name:`NÚMERO ${text}`,x:720,y:210,width:150,height:160,data:{text,color:"#F2F4F5",fontSize:130}});
  }
  function addSponsor() {
    const text = prompt("Patrocínio:", "SPONSOR");
    if (text === null) return;
    createElement({type:"sponsor",name:text,x:230,y:170,width:250,height:60,data:{text,color:"#F2F4F5",fontSize:38}});
  }
  function addShape() { createElement({type:"shape",name:"FORMA",x:500,y:320,width:130,height:70,data:{color:state.colors.detail,radius:12}}); }

  function updateZoom() {
    canvas.style.transform = `scale(${state.zoom})`;
    $("#zoomValue").textContent = `${Math.round(state.zoom*100)}%`;
  }
  function zoom(delta) { state.zoom = Math.max(.6,Math.min(1.5,state.zoom+delta)); updateZoom(); }

  function exportSvg() {
    const copy = canvas.cloneNode(true);
    copy.removeAttribute("style");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(copy);
    downloadBlob(new Blob([source], {type:"image/svg+xml;charset=utf-8"}), "style-lab-config.svg");
  }
  function exportPng() {
    const serializer = new XMLSerializer();
    const svg = serializer.serializeToString(canvas);
    const blob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 2400; c.height = 1520;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#eef0f2"; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,c.width,c.height);
      c.toBlob(b => downloadBlob(b,"style-lab-config.png"),"image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
  function exportJson() {
    const data = {
      projectId: state.projectId,
      productId: state.productId,
      version: state.version,
      colors: state.colors,
      elements: state.elements,
      referenceOpacity: state.referenceOpacity,
      exportedAt: new Date().toISOString()
    };
    downloadBlob(new Blob([JSON.stringify(data,null,2)], {type:"application/json"}),"style-lab-config.json");
  }
  function downloadBlob(blob, filename) {
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  $("#primaryColor").addEventListener("input", e => withHistory(()=>state.colors.primary=e.target.value));
  $("#secondaryColor").addEventListener("input", e => withHistory(()=>state.colors.secondary=e.target.value));
  $("#detailColor").addEventListener("input", e => withHistory(()=>state.colors.detail=e.target.value));

  $("#referenceInput").addEventListener("change", e => {
    const f=e.target.files[0]; if(!f)return;
    const reader=new FileReader();
    reader.onload=()=>withHistory(()=>state.reference=reader.result);
    reader.readAsDataURL(f);
  });
  $("#referenceOpacity").addEventListener("input", e => { state.referenceOpacity=e.target.value/100; renderReference(); });

  $("#gridToggle").addEventListener("change", e => {
    state.grid=e.target.checked; $("#gridLayer").style.display=state.grid?"block":"none";
  });

  $("#undoBtn").addEventListener("click", undo);
  $("#redoBtn").addEventListener("click", redo);
  $("#zoomInBtn").addEventListener("click",()=>zoom(.1));
  $("#zoomOutBtn").addEventListener("click",()=>zoom(-.1));
  $("#zoomPlus").addEventListener("click",()=>zoom(.1));
  $("#zoomMinus").addEventListener("click",()=>zoom(-.1));
  $("#rotateLeftBtn").addEventListener("click",()=>{const e=selected();if(e)mutateElement(e.id,x=>x.rotation-=5)});
  $("#rotateRightBtn").addEventListener("click",()=>{const e=selected();if(e)mutateElement(e.id,x=>x.rotation+=5)});
  $("#textTool").addEventListener("click",addText);
  $("#shapeTool").addEventListener("click",addShape);
  $("#imageTool").addEventListener("click",()=>$("#imageElementInput").click());
  $("#imageElementInput").addEventListener("change",e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();r.onload=()=>createElement({type:"image",name:f.name,x:470,y:230,width:160,height:120,data:{src:r.result}});r.readAsDataURL(f);
  });
  $("#loadPatternBtn").addEventListener("click",()=>{
    const b=$(".pattern-card.selected"); addPattern(b?.dataset.pattern||"bolt-a");
  });
  $$(".pattern-card").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".pattern-card").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");
    addPattern(btn.dataset.pattern);
  }));
  $$(".category").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".category").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    const cat=btn.dataset.category;
    if(cat==="numbers") addNumber();
    if(cat==="names") addText();
    if(cat==="sponsors") addSponsor();
    if(cat==="shields") addShape();
  }));

  $("#clearCanvasBtn").addEventListener("click",()=>{
    if(confirm("Remover todos os elementos editáveis?")) withHistory(()=>{state.elements=[];state.selectedId=null});
  });
  $("#saveConfigBtn").addEventListener("click",exportJson);
  $("#exportSvgBtn").addEventListener("click",exportSvg);
  $("#exportPngBtn").addEventListener("click",exportPng);
  $("#exportJsonBtn").addEventListener("click",exportJson);
  $("#nextBtn").addEventListener("click",()=>alert("MVP V0.3 pronto para a etapa de finalização. Exporte SVG, PNG ou JSON."));

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="z") {e.preventDefault(); e.shiftKey?redo():undo();}
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="y") {e.preventDefault(); redo();}
    const el=selected(); if(!el)return;
    if(e.key==="Delete" || e.key==="Backspace"){e.preventDefault();deleteElement(el.id)}
    if(e.key==="ArrowLeft"){e.preventDefault();mutateElement(el.id,x=>x.x-=2)}
    if(e.key==="ArrowRight"){e.preventDefault();mutateElement(el.id,x=>x.x+=2)}
    if(e.key==="ArrowUp"){e.preventDefault();mutateElement(el.id,x=>x.y-=2)}
    if(e.key==="ArrowDown"){e.preventDefault();mutateElement(el.id,x=>x.y+=2)}
    if(e.key.toLowerCase()==="r"){mutateElement(el.id,x=>x.rotation+=5)}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="d"){e.preventDefault();duplicateElement(el.id)}
  
});

  ["primaryColor","secondaryColor","detailColor"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", updateTechnicalModelColors);
  });
  updateTechnicalModelColors();

  function updateTechnicalConstruction() {
    const collar = document.getElementById("collarSelect")?.value?.toLowerCase();
    const sleeve = document.getElementById("sleeveSelect")?.value?.toLowerCase();
    const fitRaw = document.getElementById("fitSelect")?.value?.toLowerCase();
    const fit = fitRaw === "slim fit" ? "slim" : fitRaw === "relaxed" ? "relaxed" : "regular";
    [window.frontTechnicalModel, window.backTechnicalModel].filter(Boolean).forEach(model => {
      if (collar) model.dataset.collar = collar === "v" ? "v" : "round";
      if (sleeve) model.dataset.sleeve = sleeve === "longa" ? "long" : "short";
      model.dataset.fit = fit;
    });
  }
  ["collarSelect","sleeveSelect","fitSelect"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", updateTechnicalConstruction);
  });
  updateTechnicalConstruction();

  // Seed layers matching the reference.
  state.elements = [
    {id:uid(),type:"sponsor",name:"SPONSOR",x:235,y:190,width:220,height:55,rotation:0,opacity:1,visible:true,locked:false,zIndex:3,data:{text:"SPONSOR",color:"#F2F4F5",fontSize:36}},
    {id:uid(),type:"text",name:"PLAYER",x:685,y:110,width:180,height:50,rotation:0,opacity:1,visible:true,locked:false,zIndex:4,data:{text:"PLAYER",color:"#F2F4F5",fontSize:34}},
    {id:uid(),type:"number",name:"NÚMERO 10",x:700,y:155,width:150,height:150,rotation:0,opacity:1,visible:true,locked:false,zIndex:5,data:{text:"10",color:"#F2F4F5",fontSize:130}},
    {id:uid(),type:"pattern",name:"PADRÃO 03",x:255,y:115,width:260,height:110,rotation:-8,opacity:.92,visible:true,locked:false,zIndex:2,data:{kind:"bolt-a"}}
  ];
  renderAll();
})();