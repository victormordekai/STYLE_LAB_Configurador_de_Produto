/*
 * STYLE LAB MVP V0.7 — Product / Surface / Artwork Engine
 * -------------------------------------------------------
 * Núcleo independente da biblioteca visual e da biblioteca de modelagem.
 * Princípios:
 *  1. produto = geometria vetorial;
 *  2. elemento = objeto semântico;
 *  3. elemento pertence a uma superfície física;
 *  4. toda arte é recortada pela silhueta da superfície;
 *  5. tamanho é propriedade editável por slider;
 *  6. exportação SVG é AUTOSSUFICIENTE: estilos são embutidos;
 *  7. IA futura envia operações JSON, nunca SVG arbitrário.
 */
(() => {
  "use strict";

  const SVG_NS="http://www.w3.org/2000/svg";
  const W=1200,H=760;
  const SURFACES=["front","back"];
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const svg=(tag,attrs={})=>{const n=document.createElementNS(SVG_NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const uid=()=>`el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  const canvas=$("#designCanvas"), productLayer=$("#productLayer"), artworkLayer=$("#artworkLayer"), selectionLayer=$("#selectionLayer");
  if(!canvas||!productLayer||!artworkLayer||!selectionLayer){console.error("STYLE LAB: canvas não encontrado.");return}

  const state={
    projectId:$("#projectCode")?.textContent?.trim()||"SL-001",
    version:"V0.7",
    productId:"CAM-BAS-001",
    modelId:"shirt-basic",
    colors:{primary:"#0A2D8F",secondary:"#E31E3F",detail:"#00C3FF"},
    construction:{collar:"round",sleeve:"short",fit:"regular",shorts:"base"},
    surfaces:{
      front:{id:"front",label:"FRENTE",x:35,y:42,scale:1.02,clipId:"frontArtworkClip"},
      back:{id:"back",label:"COSTAS",x:585,y:42,scale:1.02,clipId:"backArtworkClip"}
    },
    elements:[],selectedId:null,activeSurface:"front",
    history:[],future:[],historyLimit:100,
    zoom:1,grid:true,reference:null,referenceOpacity:.2,
    drag:null,sizeGesture:null,colorGesture:null,referenceGesture:null
  };

  const technicalModels={};

  function modelDefinition(){return window.StyleLabModeling?.MODELS?.[state.modelId]||window.StyleLabModeling?.MODELS?.["shirt-basic"]}

  function mountModels(){
    productLayer.innerHTML="";
    Object.keys(technicalModels).forEach(k=>delete technicalModels[k]);
    SURFACES.forEach(side=>{
      const s=state.surfaces[side];
      technicalModels[side]=window.StyleLabModeling.mount(productLayer,side,s.x,s.y,s.scale,{
        modelId:state.modelId,primary:state.colors.primary,secondary:state.colors.secondary,detail:state.colors.detail,
        fit:state.construction.fit,sleeve:state.construction.sleeve,collar:state.construction.collar
      });
    });
    syncClipPaths();
    renderMiniProduct();
  }

  function syncClipPaths(){
    const defs=$("defs",canvas); if(!defs||!window.StyleLabModeling)return;
    $$(".stylelab-product-clip",defs).forEach(n=>n.remove());
    SURFACES.forEach(side=>{
      const d=window.StyleLabModeling.getClipPath(side,state.modelId,state.surfaces[side].x,state.surfaces[side].y,state.surfaces[side].scale);
      const cp=svg("clipPath",{id:state.surfaces[side].clipId,class:"stylelab-product-clip",clipPathUnits:"userSpaceOnUse"});
      cp.appendChild(svg("path",{d:d.d,transform:d.transform}));
      defs.appendChild(cp);
    });
  }

  function renderMiniProduct(){
    const host=$("#miniProduct");if(!host||!window.StyleLabModeling)return;
    host.innerHTML="";
    const g=window.StyleLabModeling.createSide("front",{modelId:state.modelId,primary:state.colors.primary,secondary:state.colors.secondary,detail:state.colors.detail,fit:state.construction.fit,collar:state.construction.collar});
    g.setAttribute("transform","translate(16 4) scale(.16)");
    host.appendChild(g);
  }

  function applyModelState(){
    Object.values(technicalModels).forEach(m=>{
      if(!m)return;
      m.style.setProperty("--gm-primary",state.colors.primary);
      m.style.setProperty("--gm-secondary",state.colors.secondary);
      m.style.setProperty("--gm-detail",state.colors.detail);
      m.dataset.fit=state.construction.fit;m.dataset.sleeve=state.construction.sleeve;m.dataset.collar=state.construction.collar;
    });
    renderMiniProduct();
  }

  function snapshot(){return clone({colors:state.colors,construction:state.construction,modelId:state.modelId,elements:state.elements,selectedId:state.selectedId,activeSurface:state.activeSurface,reference:state.reference,referenceOpacity:state.referenceOpacity,grid:state.grid})}
  function restore(s){Object.assign(state,{colors:clone(s.colors),construction:clone(s.construction),modelId:s.modelId||"shirt-basic",elements:clone(s.elements),selectedId:s.selectedId||null,activeSurface:s.activeSurface||"front",reference:s.reference||null,referenceOpacity:Number.isFinite(s.referenceOpacity)?s.referenceOpacity:.2,grid:s.grid!==false});mountModels();renderAll()}
  function pushHistory(before){if(!before)return;state.history.push(clone(before));if(state.history.length>state.historyLimit)state.history.shift();state.future=[];updateHistoryButtons()}
  function transaction(mutator){const before=snapshot();mutator();pushHistory(before);renderAll()}
  function undo(){if(!state.history.length)return;state.future.push(snapshot());restore(state.history.pop());updateHistoryButtons()}
  function redo(){if(!state.future.length)return;state.history.push(snapshot());restore(state.future.pop());updateHistoryButtons()}
  function updateHistoryButtons(){$("#undoBtn")&&($("#undoBtn").disabled=!state.history.length);$("#redoBtn")&&($("#redoBtn").disabled=!state.future.length)}
  function beginSizeGesture(){if(!state.sizeGesture)state.sizeGesture=snapshot()}
  function commitSizeGesture(){if(state.sizeGesture){pushHistory(state.sizeGesture);state.sizeGesture=null}}

  function syncUI(){
    [["primary","primaryColor","primaryHex"],["secondary","secondaryColor","secondaryHex"],["detail","detailColor","detailHex"]].forEach(([k,i,o])=>{
      const input=$("#"+i),out=$("#"+o);if(input)input.value=state.colors[k];if(out)out.textContent=state.colors[k].toUpperCase();
      document.documentElement.style.setProperty("--"+k,state.colors[k]);
    });
    const m=$("#modelSelect");if(m)m.value=state.modelId;
    const c=$("#collarSelect");if(c)c.value=state.construction.collar;
    const s=$("#sleeveSelect");if(s)s.value=state.construction.sleeve;
    const f=$("#fitSelect");if(f)f.value=state.construction.fit;
    const sh=$("#shortSelect");if(sh)sh.value=state.construction.shorts;
    const p=window.StyleLabModeling?.MODELS?.[state.modelId];if(p){$("#productSku")&&( $("#productSku").textContent=p.sku);$("#productModelName")&&($("#productModelName").textContent=p.name)}
    const ro=$("#referenceOpacity"),rv=$("#opacityValue");if(ro)ro.value=Math.round(state.referenceOpacity*100);if(rv)rv.textContent=Math.round(state.referenceOpacity*100)+"%";
    const gt=$("#gridToggle");if(gt)gt.checked=state.grid;
    $("#frontSurfaceBtn")?.classList.toggle("active",state.activeSurface==="front");
    $("#backSurfaceBtn")?.classList.toggle("active",state.activeSurface==="back");
  }

  function renderReference(){
    const overlay=$("#referenceOverlay");if(!overlay)return;
    overlay.style.backgroundImage=state.reference?`url("${state.reference}")`:"none";
    overlay.style.opacity=state.reference?String(state.referenceOpacity):"0";
  }
  function renderGrid(){$("#gridLayer")&&($("#gridLayer").style.display=state.grid?"block":"none")}

  function rootPoint(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width*W,y:(event.clientY-r.top)/r.height*H}}
  function pointInside(side,p){
    const model=technicalModels[side],shape=model?.querySelector(".gm-silhouette");if(!shape)return false;
    try{const ctm=shape.getCTM();if(!ctm||!shape.isPointInFill)return false;return shape.isPointInFill(new DOMPoint(p.x,p.y).matrixTransform(ctm.inverse()))}catch(e){return false}
  }
  function surfaceAt(p){return SURFACES.find(s=>pointInside(s,p))||null}
  function resolveSurface(data={}){if(state.surfaces[data.target])return data.target;const p={x:Number(data.x||300)+Number(data.width||100)/2,y:Number(data.y||200)+Number(data.height||60)/2};return surfaceAt(p)||state.activeSurface}
  function placement(surface=state.activeSurface){return surface==="back"?{x:690,y:150}:{x:190,y:155}}

  function normalizeZ(){state.elements.slice().sort((a,b)=>a.zIndex-b.zIndex).forEach((e,i)=>e.zIndex=i+1)}

  function createElement(data={}){
    const width=Number(data.width??220),height=Number(data.height??80);
    const el={id:uid(),type:data.type||"pattern",name:data.name||"ELEMENTO",x:Number(data.x??300),y:Number(data.y??220),width,height,baseWidth:width,baseHeight:height,rotation:Number(data.rotation??0),opacity:Number(data.opacity??1),visible:data.visible!==false,locked:!!data.locked,zIndex:state.elements.length+1,target:resolveSurface(data),sizePercent:Number(data.sizePercent??100),data:clone(data.data||{})};
    if(["text","number","sponsor","shield"].includes(el.type))el.baseFontSize=Number(el.data.fontSize||50);
    transaction(()=>{state.elements.push(el);state.selectedId=el.id;state.activeSurface=el.target});
    return el
  }
  const selected=()=>state.elements.find(e=>e.id===state.selectedId)||null;

  function mutateElement(id,fn,{history=true}={}){
    const e=state.elements.find(x=>x.id===id);if(!e||e.locked)return;
    if(history)transaction(()=>fn(e));else{fn(e);renderAll()}
  }
  function deleteElement(id){transaction(()=>{state.elements=state.elements.filter(e=>e.id!==id);if(state.selectedId===id)state.selectedId=null;normalizeZ()})}
  function duplicateElement(id){const src=state.elements.find(e=>e.id===id);if(!src)return;transaction(()=>{const e=clone(src);e.id=uid();e.name=src.name+" COPY";e.x+=16;e.y+=16;e.zIndex=Math.max(0,...state.elements.map(x=>x.zIndex))+1;state.elements.push(e);state.selectedId=e.id})}
  function toggleVisible(id){mutateElement(id,e=>e.visible=!e.visible)}
  function toggleLock(id){transaction(()=>{const e=state.elements.find(x=>x.id===id);if(e)e.locked=!e.locked})}
  function front(id){transaction(()=>{const e=state.elements.find(x=>x.id===id);if(e)e.zIndex=Math.max(...state.elements.map(x=>x.zIndex))+1;normalizeZ()})}
  function back(id){transaction(()=>{const e=state.elements.find(x=>x.id===id);if(e)e.zIndex=0;normalizeZ()})}

  function escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function patternMarkup(kind,w,h){
    const a=state.colors.detail,b=state.colors.secondary,sw=Math.max(3,w*.025);
    const patterns={
      "bolt-a":`<path d="M0 ${h*.88}L${w*.55} 0L${w*.32} ${h*.48}L${w} ${h*.1}L${w*.56} ${h*.72}L${w*.76} ${h*.5}L${w*.18} ${h}Z" fill="${a}"/><path d="M${w*.05} ${h*.75}L${w*.6} ${h*.16}L${w*.36} ${h*.65}L${w*.9} ${h*.28}" fill="none" stroke="${b}" stroke-width="${Math.max(4,w*.035)}"/>`,
      "bolt-b":`<path d="M0 ${h*.92}L${w*.72} 0L${w*.38} ${h*.65}L${w} ${h*.28}L${w*.58} ${h}L${w*.7} ${h*.56}L${w*.2} ${h}Z" fill="${a}"/><path d="M0 ${h*.58}L${w*.78} ${h*.08}" stroke="${b}" stroke-width="${Math.max(4,w*.04)}"/>`,
      "slashes":`<path d="M0 ${h*.8}L${w*.78} 0L${w} ${h*.04}L${w*.18} ${h}Z M${w*.2} ${h}L${w} ${h*.2}L${w} ${h*.35}L${w*.38} ${h}Z" fill="${a}"/>`,
      "rain":Array.from({length:7},(_,i)=>`<line x1="${i*w/7}" y1="${h}" x2="${Math.min(w,i*w/7+w*.52)}" y2="0" stroke="${a}" stroke-width="${Math.max(4,w*.025)}"/>`).join(""),
      "wing":`<path d="M0 ${h*.85}L${w} ${h*.1}L${w*.55} ${h*.62}L${w} ${h*.4}L${w*.48} ${h}Z" fill="${a}"/><path d="M0 ${h*.55}L${w*.68} 0" stroke="${b}" stroke-width="${Math.max(4,w*.04)}"/>`,
      "zig":`<polyline points="0,${h*.9} ${w*.25},${h*.05} ${w*.35},${h*.55} ${w*.7},${h*.1} ${w*.55},${h*.9} ${w},${h*.45}" fill="none" stroke="${a}" stroke-width="${Math.max(6,w*.06)}" stroke-linejoin="bevel"/>`,
      "organic":`<path d="M0 ${h*.7}C${w*.14} ${h*.05},${w*.28} ${h*.95},${w*.45} ${h*.36}C${w*.6} ${h*.0},${w*.7} ${h*.8},${w} ${h*.18}L${w} ${h*.48}C${w*.78} ${h*.95},${w*.65} ${h*.35},${w*.48} ${h*.72}C${w*.3} ${h} ,${w*.14} ${h*.55},0 ${h}Z" fill="${a}"/>`,
      "organic2":`<path d="M0 ${h*.2}C${w*.18} 0,${w*.25} ${h*.7},${w*.45} ${h*.52}C${w*.64} ${h*.35},${w*.68} 0,${w} ${h*.25}L${w} ${h*.65}C${w*.78} ${h*.45},${w*.7} ${h},${w*.52} ${h*.73}C${w*.32} ${h*.48},${w*.2} ${h},0 ${h*.75}Z" fill="${a}"/>`,
      "shard":`<path d="M4 ${h*.9}L${w*.2} ${h*.1}L${w*.42} ${h*.45}L${w*.65} 0L${w} ${h*.25}L${w*.72} ${h*.65}L${w} ${h*.9}L${w*.45} ${h*.72}L${w*.22} ${h}Z" fill="${a}"/>`,
      "chevron":`<path d="M0 ${h*.25}L${w*.25} 0L${w*.5} ${h*.22}L${w*.75} 0L${w} ${h*.25}L${w*.92} ${h*.38}L${w*.75} ${h*.2}L${w*.5} ${h*.43}L${w*.25} ${h*.2}L${w*.08} ${h*.38}Z" fill="${a}"/>`,
      "ribbon":`<path d="M0 ${h*.18}L${w*.25} 0L${w*.58} ${h*.25}L${w} ${h*.02}L${w} ${h*.22}L${w*.59} ${h*.46}L${w*.26} ${h*.22}L0 ${h*.4}ZM0 ${h*.55}L${w*.27} ${h*.35}L${w*.6} ${h*.6}L${w} ${h*.38}L${w} ${h*.6}L${w*.6} ${h*.85}L${w*.27} ${h*.62}L0 ${h*.8}Z" fill="${a}"/>`,
      "arcs":`<path d="M0 ${h*.9}C${w*.2} 0,${w*.65} 0,${w} ${h*.1}M${w*.2} ${h}C${w*.42} ${h*.35},${w*.75} ${h*.28},${w} ${h*.42}" fill="none" stroke="${a}" stroke-width="${Math.max(5,w*.04)}" stroke-linecap="round"/>`,
      "dots":Array.from({length:30},(_,i)=>`<circle cx="${(i%6)*w/6+w/12}" cy="${Math.floor(i/6)*h/5+h/10}" r="${2+(i%3)}" fill="${a}"/>`).join(""),
      "halftone":Array.from({length:42},(_,i)=>`<circle cx="${(i%7)*w/7+w/14}" cy="${Math.floor(i/7)*h/6+h/12}" r="${1+(i%4)*.8}" fill="${a}"/>`).join(""),
      "microdots":Array.from({length:70},(_,i)=>`<circle cx="${(i*17)%Math.max(1,w)}" cy="${(i*31)%Math.max(1,h)}" r="1.2" fill="${a}"/>`).join(""),
      "diamond":`<path d="M${w*.1} ${h*.5}L${w*.25} ${h*.12}L${w*.4} ${h*.5}L${w*.25} ${h*.88}ZM${w*.58} ${h*.5}L${w*.73} ${h*.12}L${w*.88} ${h*.5}L${w*.73} ${h*.88}Z" fill="none" stroke="${a}" stroke-width="${sw*1.4}"/>`,
      "hex":`<path d="M${w*.2} ${h*.08}L${w*.36} ${h*.17}V${h*.34}L${w*.2} ${h*.43}L${w*.04} ${h*.34}V${h*.17}ZM${w*.65} ${h*.38}L${w*.81} ${h*.47}V${h*.64}L${w*.65} ${h*.73}L${w*.49} ${h*.64}V${h*.47}Z" fill="none" stroke="${a}" stroke-width="${sw}"/>`,
      "grid":`<path d="M0 0H${w}M0 ${h*.25}H${w}M0 ${h*.5}H${w}M0 ${h*.75}H${w}M0 ${h}H${w}M0 0V${h}M${w*.25} 0V${h}M${w*.5} 0V${h}M${w*.75} 0V${h}M${w} 0V${h}" stroke="${a}" stroke-width="${sw*.6}"/>`,
      "checker":`<path d="M0 0H${w*.5}V${h*.5}H0ZM${w*.5} ${h*.5}H${w}V${h}H${w*.5}Z" fill="${a}"/>`,
      "waves":`<path d="M0 ${h*.25}C${w*.2} 0,${w*.3} ${h*.5},${w*.5} ${h*.25}S${w*.8} 0,${w} ${h*.25}M0 ${h*.7}C${w*.2} ${h*.45},${w*.3} ${h},${w*.5} ${h*.7}S${w*.8} ${h*.45},${w} ${h*.7}" fill="none" stroke="${a}" stroke-width="${Math.max(4,w*.05)}"/>`,
      "contour":`<path d="M0 ${h*.75}C${w*.15} ${h*.1},${w*.4} ${h*.05},${w*.52} ${h*.4}S${w*.82} ${h*.72},${w} 0M${w*.1} ${h}C${w*.28} ${h*.4},${w*.46} ${h*.32},${w*.6} ${h*.55}S${w*.85} ${h*.75},${w} ${h*.3}" fill="none" stroke="${a}" stroke-width="${sw*1.2}"/>`,
      "speckle":Array.from({length:55},(_,i)=>`<circle cx="${(i*37)%Math.max(1,w)}" cy="${(i*53)%Math.max(1,h)}" r="${1+(i%5)*.5}" fill="${i%5===0?b:a}"/>`).join(""),
      "triangles":`<path d="M${w*.04} ${h*.9}L${w*.23} ${h*.08}L${w*.42} ${h*.9}ZM${w*.36} ${h*.9}L${w*.55} ${h*.04}L${w*.74} ${h*.9}ZM${w*.68} ${h*.9}L${w*.84} ${h*.25}L${w} ${h*.9}" fill="none" stroke="${a}" stroke-width="${sw*1.2}"/>`,
      "bars":`<path d="M0 ${h*.12}H${w}V${h*.25}H0ZM0 ${h*.42}H${w}V${h*.55}H0ZM0 ${h*.72}H${w}V${h*.85}H0Z" fill="${a}"/>`
    };
    return patterns[kind]||patterns["bolt-a"];
  }

  function shieldMarkup(id,w,h){
    const c=state.colors.detail;
    const inner=state.colors.secondary;
    const map={
      shield:`<path d="M${w*.5} 3L${w*.84} ${h*.15}V${h*.47}C${w*.84} ${h*.72} ${w*.68} ${h*.9} ${w*.5} ${h}C${w*.32} ${h*.9} ${w*.16} ${h*.72} ${w*.16} ${h*.47}V${h*.15}Z" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.055)}"/><path d="M${w*.32} ${h*.45}H${w*.68}M${w*.5} ${h*.3}V${h*.62}" stroke="${inner}" stroke-width="${Math.max(4,w*.045)}"/>`,
      badge:`<path d="M${w*.5} 3L${w*.82} ${h*.17}L${w*.72} ${h*.72}L${w*.5} ${h}L${w*.28} ${h*.72}L${w*.18} ${h*.17}Z" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.055)}"/><circle cx="${w*.5}" cy="${h*.45}" r="${Math.min(w,h)*.18}" fill="${inner}"/>`,
      fleur:`<path d="M${w*.5} ${h*.92}V${h*.58}M${w*.5} ${h*.58}C${w*.28} ${h*.45},${w*.28} ${h*.2},${w*.5} ${h*.3}C${w*.72} ${h*.2},${w*.72} ${h*.45},${w*.5} ${h*.58}Z" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.05)}"/><path d="M${w*.35} ${h*.7}H${w*.65}" stroke="${inner}" stroke-width="${Math.max(4,w*.04)}"/>`,
      globe:`<circle cx="${w*.5}" cy="${h*.5}" r="${Math.min(w,h)*.36}" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.05)}"/><path d="M${w*.18} ${h*.5}H${w*.82}M${w*.5} ${h*.14}C${w*.34} ${h*.3},${w*.34} ${h*.7},${w*.5} ${h*.86}M${w*.5} ${h*.14}C${w*.66} ${h*.3},${w*.66} ${h*.7},${w*.5} ${h*.86}" fill="none" stroke="${inner}" stroke-width="${Math.max(3,w*.035)}"/>`,
      cross:`<path d="M${w*.5} ${h*.14}V${h*.86}M${w*.22} ${h*.5}H${w*.78}" stroke="${c}" stroke-width="${Math.max(7,w*.075)}" stroke-linecap="round"/>`,
      fort:`<path d="M${w*.25} ${h*.82}V${h*.35}L${w*.34} ${h*.22}L${w*.5} ${h*.35}L${w*.66} ${h*.22}L${w*.75} ${h*.35}V${h*.82}Z" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.055)}"/><path d="M${w*.4} ${h*.82}V${h*.55}H${w*.6}V${h*.82}" fill="none" stroke="${inner}" stroke-width="${Math.max(4,w*.04)}"/>`,
      heart:`<path d="M${w*.5} ${h*.86}L${w*.18} ${h*.5}C${w*.02} ${h*.3},${w*.14} ${h*.12},${w*.3} ${h*.18}L${w*.5} ${h*.35}L${w*.7} ${h*.18}C${w*.86} ${h*.12},${w*.98} ${h*.3},${w*.82} ${h*.5}Z" fill="none" stroke="${c}" stroke-width="${Math.max(5,w*.055)}"/>`
    };
    return map[id]||map.shield;
  }

  function artworkMarkup(e){
    if(e.type==="pattern")return `<svg width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" overflow="visible">${patternMarkup(e.data.kind,e.width,e.height)}</svg>`;
    if(e.type==="shield")return `<svg width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" overflow="visible">${shieldMarkup(e.data.symbol,e.width,e.height)}</svg>`;
    if(["text","number","sponsor"].includes(e.type)){
      const fs=e.data.fontSize||e.baseFontSize||50;
      const family=e.type==="number"?"Arial Black,Arial,sans-serif":"Arial,sans-serif";
      return `<text x="${e.width/2}" y="${e.height*.72}" text-anchor="middle" font-family="${family}" font-weight="900" font-size="${fs}" fill="${e.data.color||"#F2F4F5"}" stroke="${e.data.stroke||"none"}">${escape(e.data.text||e.name)}</text>`;
    }
    if(e.type==="shape")return `<rect x="0" y="0" width="${e.width}" height="${e.height}" rx="${e.data.radius??12}" fill="${e.data.color||state.colors.detail}"/>`;
    if(e.type==="image")return `<image href="${e.data.src}" width="${e.width}" height="${e.height}" preserveAspectRatio="xMidYMid meet"/>`;
    return "";
  }

  function createArtworkNode(e){
    const g=svg("g",{class:`art-element${e.locked?" locked":""}`,"data-id":e.id,transform:`translate(${e.x} ${e.y}) rotate(${e.rotation} ${e.width/2} ${e.height/2})`,opacity:e.opacity});
    g.innerHTML=artworkMarkup(e);g.addEventListener("pointerdown",onElementDown);return g;
  }

  function renderArtwork(){
    artworkLayer.innerHTML="";
    const roots={};
    SURFACES.forEach(s=>{const r=svg("g",{class:`artwork-surface artwork-${s}`,"data-surface":s,"clip-path":`url(#${state.surfaces[s].clipId})`});roots[s]=r;artworkLayer.appendChild(r)});
    state.elements.slice().sort((a,b)=>a.zIndex-b.zIndex).forEach(e=>{if(e.visible&&roots[e.target])roots[e.target].appendChild(createArtworkNode(e))});
    renderSelection();
  }

  function renderSelection(){
    selectionLayer.innerHTML="";
    const e=selected(),read=$("#selectionReadout");
    if(read)read.textContent=e?`${e.name.toUpperCase()} · ${e.type.toUpperCase()} · ${state.surfaces[e.target]?.label||e.target} · ${Math.round(e.sizePercent||100)}%`:`SUPERFÍCIE ATIVA: ${state.surfaces[state.activeSurface]?.label||"FRENTE"}`;
    const inspector=$("#sizeInspector");
    if(!e||!e.visible){inspector?.classList.add("hidden");return}
    inspector?.classList.remove("hidden");
    $("#sizeInspectorTitle")&&( $("#sizeInspectorTitle").textContent="TAMANHO · "+e.name.toUpperCase());
    $("#sizeInspectorType")&&( $("#sizeInspectorType").textContent=`${e.type.toUpperCase()} · ${state.surfaces[e.target]?.label||e.target}` );
    $("#sizeInspectorValue")&&( $("#sizeInspectorValue").textContent=`${Math.round(e.sizePercent||100)}%` );
    const range=$("#elementSizeRange");if(range)range.value=String(clamp(Math.round(e.sizePercent||100),20,240));
    const g=svg("g",{transform:`translate(${e.x} ${e.y}) rotate(${e.rotation} ${e.width/2} ${e.height/2})`});
    g.innerHTML=`<rect class="selection-box" x="-8" y="-8" width="${e.width+16}" height="${e.height+16}" rx="3"/><circle class="selection-handle" cx="-8" cy="-8" r="5"/><circle class="selection-handle" cx="${e.width+8}" cy="-8" r="5"/><circle class="selection-handle" cx="-8" cy="${e.height+8}" r="5"/><circle class="selection-handle" cx="${e.width+8}" cy="${e.height+8}" r="5"/>`;
    selectionLayer.appendChild(g);
  }

  function renderLayers(){
    const list=$("#layersList");if(!list)return;list.innerHTML="";$("#layerCount")&&($("#layerCount").textContent=String(state.elements.length));
    state.elements.slice().sort((a,b)=>b.zIndex-a.zIndex).forEach(e=>{
      const item=document.createElement("div");item.className=`layer-item${e.id===state.selectedId?" selected":""}`;
      item.innerHTML=`<span class="drag-dot">⠿</span><button class="layer-name" data-action="select">${escape(e.name)}<span class="layer-type">${escape(e.type.toUpperCase())} · ${escape(state.surfaces[e.target]?.label||e.target)}</span></button><button class="layer-action" data-action="visible">${e.visible?"◉":"○"}</button><button class="layer-action" data-action="lock">${e.locked?"▣":"▢"}</button><button class="layer-action" data-action="delete">⌫</button>`;
      item.addEventListener("click",ev=>{const a=ev.target.closest("[data-action]")?.dataset.action||"select";if(a==="select"){state.selectedId=e.id;state.activeSurface=e.target;renderAll()}if(a==="visible")toggleVisible(e.id);if(a==="lock")toggleLock(e.id);if(a==="delete")deleteElement(e.id)});
      list.appendChild(item);
    });
  }

  function onElementDown(ev){
    ev.stopPropagation();const e=state.elements.find(x=>x.id===ev.currentTarget.dataset.id);if(!e||e.locked)return;
    state.selectedId=e.id;state.activeSurface=e.target;state._dragSnapshot=snapshot();state.drag={id:e.id,pointerId:ev.pointerId,offset:rootPoint(ev)};
    state.drag.offsetX=state.drag.offset.x-e.x;state.drag.offsetY=state.drag.offset.y-e.y;
    ev.currentTarget.setPointerCapture?.(ev.pointerId);renderAll();
  }

  canvas.addEventListener("pointerdown",ev=>{
    if(ev.target.closest?.(".art-element"))return;
    const p=rootPoint(ev),s=surfaceAt(p);if(s){state.activeSurface=s;state.selectedId=null;renderAll()}else if(ev.target===canvas||ev.target.id==="gridLayer"){state.selectedId=null;renderAll()}
  });
  canvas.addEventListener("pointermove",ev=>{
    if(!state.drag||state.drag.pointerId!==ev.pointerId)return;const e=state.elements.find(x=>x.id===state.drag.id);if(!e)return;
    const p=rootPoint(ev);e.x=clamp(p.x-state.drag.offsetX,-e.width,W);e.y=clamp(p.y-state.drag.offsetY,-e.height,H);
    const s=surfaceAt({x:e.x+e.width/2,y:e.y+e.height/2});if(s){e.target=s;state.activeSurface=s}
    renderArtwork();renderLayers();renderSelection();
  });
  function endDrag(ev){if(!state.drag||state.drag.pointerId!==ev.pointerId)return;state.drag=null;commitDragGesture()}
  function commitDragGesture(){if(state._dragSnapshot){pushHistory(state._dragSnapshot);state._dragSnapshot=null}}
  canvas.addEventListener("pointerup",endDrag);canvas.addEventListener("pointercancel",endDrag);

  // Tamanho: fonte para texto/número/patrocínio; escala geométrica para padrões/escudos.
  function setElementSizePercent(e,percent){
    const p=clamp(Number(percent)||100,20,240),factor=p/100;
    e.sizePercent=p;e.width=e.baseWidth*factor;e.height=e.baseHeight*factor;
    if(["text","number","sponsor","shield"].includes(e.type)&&e.baseFontSize)e.data.fontSize=e.baseFontSize*factor;
  }
  $("#elementSizeRange")?.addEventListener("pointerdown",()=>beginSizeGesture());
  $("#elementSizeRange")?.addEventListener("input",ev=>{const e=selected();if(!e)return;setElementSizePercent(e,ev.target.value);renderArtwork();renderLayers();renderSelection()});
  $("#elementSizeRange")?.addEventListener("change",commitSizeGesture);
  $("#closeInspector")?.addEventListener("click",()=>{$("#sizeInspector")?.classList.add("hidden");state.selectedId=null;renderAll()});

  function addPattern(kind){const p=placement();createElement({type:"pattern",name:"PADRÃO · "+kind.toUpperCase(),target:state.activeSurface,x:p.x,y:p.y,width:270,height:120,data:{kind}})}
  function addShield(item){const p=placement();createElement({type:"shield",name:"ESCUDO · "+item.label,target:state.activeSurface,x:p.x+55,y:p.y+15,width:92,height:110,data:{symbol:item.id,glyph:item.glyph,fontSize:70}})}
  function addLibraryText(kind,text){
    if(!text)return;
    const back=kind==="numbers"||kind==="names",target=back?"back":"front",p=placement(target);
    const type=kind==="numbers"?"number":kind==="sponsors"?"sponsor":"text";
    const fs=kind==="numbers"?132:kind==="sponsors"?38:54;
    createElement({type,name:(kind==="numbers"?"NÚMERO ":kind==="sponsors"?"PATROCÍNIO ":"NOME ")+text,target,x:p.x+(back?0:20),y:p.y+(kind==="numbers"?55:25),width:kind==="numbers"?170:kind==="sponsors"?270:220,height:kind==="numbers"?175:kind==="sponsors"?65:70,data:{text,color:"#F2F4F5",fontSize:fs}});
  }
  function addShape(){const p=placement();createElement({type:"shape",name:"FORMA",target:state.activeSurface,x:p.x+50,y:p.y+100,width:150,height:75,data:{color:state.colors.detail,radius:12}})}

  function renderLibrary(category="patterns"){
    const host=$("#libraryContent");if(!host||!window.StyleLabForms)return;
    window.StyleLabForms.renderCategory(category,host,{addPattern,addShield,addText:(kind,text)=>addLibraryText(kind,text)});
  }

  function bindColors(){
    [["primary","primaryColor"],["secondary","secondaryColor"],["detail","detailColor"]].forEach(([k,id])=>{
      const input=$("#"+id);if(!input)return;
      input.addEventListener("pointerdown",()=>{if(!state.colorGesture)state.colorGesture=snapshot()});
      input.addEventListener("input",e=>{state.colors[k]=e.target.value;syncUI();applyModelState();renderArtwork()});
      input.addEventListener("change",()=>{if(state.colorGesture){pushHistory(state.colorGesture);state.colorGesture=null}renderAll()});
    });
  }

  function populateModels(){
    const select=$("#modelSelect");if(!select||!window.StyleLabModeling)return;
    select.innerHTML=Object.values(window.StyleLabModeling.MODELS).map(m=>`<option value="${m.id}">${m.name}</option>`).join("");
  }

  $("#modelSelect")?.addEventListener("change",ev=>transaction(()=>{state.modelId=ev.target.value;state.productId=window.StyleLabModeling.MODELS[state.modelId].sku;state.elements=[];state.selectedId=null}));
  $("#collarSelect")?.addEventListener("change",ev=>transaction(()=>state.construction.collar=ev.target.value));
  $("#sleeveSelect")?.addEventListener("change",ev=>transaction(()=>state.construction.sleeve=ev.target.value));
  $("#fitSelect")?.addEventListener("change",ev=>transaction(()=>state.construction.fit=ev.target.value));
  $("#shortSelect")?.addEventListener("change",ev=>transaction(()=>state.construction.shorts=ev.target.value));

  $("#frontSurfaceBtn")?.addEventListener("click",()=>{state.activeSurface="front";state.selectedId=null;renderAll()});
  $("#backSurfaceBtn")?.addEventListener("click",()=>{state.activeSurface="back";state.selectedId=null;renderAll()});
  $("#undoBtn")?.addEventListener("click",undo);$("#redoBtn")?.addEventListener("click",redo);
  $("#zoomInBtn")?.addEventListener("click",()=>zoom(.1));$("#zoomOutBtn")?.addEventListener("click",()=>zoom(-.1));$("#zoomPlus")?.addEventListener("click",()=>zoom(.1));$("#zoomMinus")?.addEventListener("click",()=>zoom(-.1));
  $("#rotateLeftBtn")?.addEventListener("click",()=>{const e=selected();if(e)mutateElement(e.id,x=>x.rotation-=5)});
  $("#rotateRightBtn")?.addEventListener("click",()=>{const e=selected();if(e)mutateElement(e.id,x=>x.rotation+=5)});
  $("#gridToggle")?.addEventListener("change",ev=>transaction(()=>state.grid=ev.target.checked));

  function zoom(delta){state.zoom=clamp(state.zoom+delta,.6,1.6);canvas.style.transform=`scale(${state.zoom})`;$("#zoomValue")&&($("#zoomValue").textContent=Math.round(state.zoom*100)+"%")}

  $("#referenceInput")?.addEventListener("change",ev=>{const file=ev.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>transaction(()=>state.reference=r.result);r.readAsDataURL(file)});
  $("#referenceOpacity")?.addEventListener("pointerdown",()=>{if(!state.referenceGesture)state.referenceGesture=snapshot()});
  $("#referenceOpacity")?.addEventListener("input",ev=>{state.referenceOpacity=Number(ev.target.value)/100;renderReference()});
  $("#referenceOpacity")?.addEventListener("change",()=>{if(state.referenceGesture){pushHistory(state.referenceGesture);state.referenceGesture=null}renderAll()});

  $("#imageTool")?.addEventListener("click",()=>$("#imageElementInput")?.click());
  $("#imageElementInput")?.addEventListener("change",ev=>{const file=ev.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{const p=placement();createElement({type:"image",name:file.name,target:state.activeSurface,x:p.x+50,y:p.y+50,width:180,height:130,data:{src:r.result}})};r.readAsDataURL(file)});
  $("#shapeTool")?.addEventListener("click",addShape);
  $("#textTool")?.addEventListener("click",()=>addLibraryText("names","PLAYER"));

  $$(".category").forEach(btn=>btn.addEventListener("click",()=>{$$(".category").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderLibrary(btn.dataset.category)}));
  $("#clearCanvasBtn")?.addEventListener("click",()=>{if(confirm("Remover todos os elementos editáveis?"))transaction(()=>{state.elements=[];state.selectedId=null})});
  $("#saveConfigBtn")?.addEventListener("click",exportJson);$("#exportSvgBtn")?.addEventListener("click",exportSvg);$("#exportPngBtn")?.addEventListener("click",exportPng);$("#exportJsonBtn")?.addEventListener("click",exportJson);
  $("#nextBtn")?.addEventListener("click",()=>alert("STYLE LAB V0.7: configuração pronta para exportação. A camada de IA pode consumir o contrato applyDesignOperations()."));
  $("#changeProductBtn")?.addEventListener("click",()=>{$("#modelSelect")?.focus();$("#modelSelect")?.showPicker?.()});

  function inlineSvgStyles(root){
    const props=["fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","stroke-dasharray","opacity","fill-opacity","stroke-opacity","font-family","font-size","font-weight","text-anchor","display","visibility","overflow"];
    root.querySelectorAll("*").forEach(node=>{
      const cs=getComputedStyle(node);
      props.forEach(p=>{const v=cs.getPropertyValue(p);if(v&&v!=="normal"&&v!=="none"||p==="fill"&&v!=="")node.style.setProperty(p,v)});
    });
    root.querySelectorAll("[style]").forEach(node=>{
      const style=node.getAttribute("style")||"";
      if(style.includes("var(")){
        ["fill","stroke","color"].forEach(p=>{const v=getComputedStyle(node).getPropertyValue(p);if(v)node.style.setProperty(p,v)});
      }
    });
  }

  function prepareSvgExport(){
    const copy=canvas.cloneNode(true);
    copy.removeAttribute("style");copy.setAttribute("xmlns",SVG_NS);copy.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");copy.setAttribute("width",W);copy.setAttribute("height",H);
    // seleção é UI, não faz parte da arte exportada.
    copy.querySelector("#selectionLayer")?.remove();
    copy.querySelector("#gridLayer")?.remove();
    // Fundo permanece explícito para evitar SVG preto em viewers que ignoram CSS externo.
    copy.querySelector(".canvas-bg")?.setAttribute("fill","#eef0f2");
    inlineSvgStyles(copy);
    // Garantia adicional: cores fundamentais são gravadas como atributos explícitos.
    copy.querySelectorAll(".gm-silhouette").forEach(n=>n.setAttribute("fill",state.colors.primary));
    copy.querySelectorAll(".gm-panel-fill").forEach(n=>{if(n.classList.contains("gm-waistband-panel"))n.setAttribute("fill",state.colors.secondary);else n.setAttribute("fill",state.colors.primary)});
    copy.querySelectorAll(".gm-collar-outer").forEach(n=>n.setAttribute("fill","#111923"));
    copy.querySelectorAll(".gm-collar-inner").forEach(n=>n.setAttribute("fill","#dce1e6"));
    return copy;
  }
  function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),800)}
  function exportSvg(){const copy=prepareSvgExport(),source='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(copy);download(new Blob([source],{type:"image/svg+xml;charset=utf-8"}),"style-lab-config.svg")}
  function exportPng(){
    const copy=prepareSvgExport(),source=new XMLSerializer().serializeToString(copy),u=URL.createObjectURL(new Blob([source],{type:"image/svg+xml;charset=utf-8"})),img=new Image();
    img.onload=()=>{const c=document.createElement("canvas");c.width=2400;c.height=1520;const x=c.getContext("2d");x.fillStyle="#eef0f2";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);c.toBlob(b=>{if(b)download(b,"style-lab-config.png");URL.revokeObjectURL(u)},"image/png")};
    img.onerror=()=>URL.revokeObjectURL(u);img.src=u;
  }
  function exportJson(){const payload={schema:"style-lab/project@0.7",projectId:state.projectId,productId:state.productId,modelId:state.modelId,version:state.version,colors:state.colors,construction:state.construction,activeSurface:state.activeSurface,surfaces:state.surfaces,elements:state.elements,referenceOpacity:state.referenceOpacity,exportedAt:new Date().toISOString()};download(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),"style-lab-config.json")}

  function applyDesignOperations(ops=[]){
    if(!Array.isArray(ops))return{applied:0,errors:["operations must be an array"]};
    const before=snapshot(),errors=[];let applied=0;
    ops.forEach((op,i)=>{
      try{
        if(!op?.type)throw Error("Operação inválida");
        if(op.type==="setColor"){if(!["primary","secondary","detail"].includes(op.slot)||!/^#[0-9a-f]{6}$/i.test(op.value||""))throw Error("Cor inválida");state.colors[op.slot]=op.value;applied++;return}
        if(op.type==="setConstruction"){if(!["collar","sleeve","fit","shorts"].includes(op.key))throw Error("Construção inválida");state.construction[op.key]=op.value;applied++;return}
        if(op.type==="setModel"){if(!window.StyleLabModeling?.MODELS?.[op.modelId])throw Error("Modelagem inexistente");state.modelId=op.modelId;applied++;return}
        if(op.type==="addPattern"){addPattern(op.kind||"bolt-a");applied++;return}
        if(op.type==="addShield"){const item=window.StyleLabForms.SHIELDS.find(x=>x.id===op.symbol);if(!item)throw Error("Escudo inexistente");addShield(item);applied++;return}
        if(op.type==="addElement"){
          const d=op.element||{},target=state.surfaces[d.target]?d.target:state.activeSurface;
          const e={id:uid(),type:d.type||"pattern",name:d.name||"ELEMENTO IA",x:Number(d.x??250),y:Number(d.y??160),width:Math.max(20,Number(d.width??220)),height:Math.max(20,Number(d.height??90)),baseWidth:Math.max(20,Number(d.width??220)),baseHeight:Math.max(20,Number(d.height??90)),rotation:Number(d.rotation??0),opacity:clamp(Number(d.opacity??1),0,1),visible:true,locked:false,zIndex:state.elements.length+1,target,sizePercent:Number(d.sizePercent??100),data:clone(d.data||{})};if(["text","number","sponsor","shield"].includes(e.type))e.baseFontSize=Number(e.data.fontSize||50);state.elements.push(e);state.selectedId=e.id;state.activeSurface=target;applied++;return}
        if(op.type==="setElementSize"){const e=state.elements.find(x=>x.id===op.id);if(!e)throw Error("Elemento inexistente");setElementSizePercent(e,op.percent);applied++;return}
        if(op.type==="moveElement"){const e=state.elements.find(x=>x.id===op.id);if(!e)throw Error("Elemento inexistente");e.x=Number(op.x??e.x);e.y=Number(op.y??e.y);if(state.surfaces[op.target])e.target=op.target;applied++;return}
        if(op.type==="removeElement"){state.elements=state.elements.filter(e=>e.id!==op.id);if(state.selectedId===op.id)state.selectedId=null;applied++;return}
        throw Error("Operação não suportada: "+op.type)
      }catch(err){errors.push({index:i,message:err.message})}
    });
    if(applied){normalizeZ();pushHistory(before);mountModels();renderAll()}
    return{applied,errors}
  }

  window.StyleLabDesignEngine={getState:()=>clone({projectId:state.projectId,productId:state.productId,modelId:state.modelId,version:state.version,colors:state.colors,construction:state.construction,activeSurface:state.activeSurface,elements:state.elements}),applyDesignOperations,exportSvg,exportPng,exportJson};

  bindColors();populateModels();mountModels();

  state.elements=[
    {id:uid(),type:"pattern",name:"PADRÃO 03",x:145,y:150,width:280,height:125,baseWidth:280,baseHeight:125,sizePercent:100,rotation:-8,opacity:.92,visible:true,locked:false,zIndex:1,target:"front",data:{kind:"bolt-a"}},
    {id:uid(),type:"sponsor",name:"PATROCÍNIO SPONSOR",x:185,y:175,width:260,height:65,baseWidth:260,baseHeight:65,sizePercent:100,baseFontSize:38,rotation:0,opacity:1,visible:true,locked:false,zIndex:2,target:"front",data:{text:"SPONSOR",color:"#F2F4F5",fontSize:38}},
    {id:uid(),type:"text",name:"NOME PLAYER",x:690,y:125,width:200,height:65,baseWidth:200,baseHeight:65,sizePercent:100,baseFontSize:38,rotation:0,opacity:1,visible:true,locked:false,zIndex:3,target:"back",data:{text:"PLAYER",color:"#F2F4F5",fontSize:38}},
    {id:uid(),type:"number",name:"NÚMERO 10",x:705,y:185,width:165,height:175,baseWidth:165,baseHeight:175,sizePercent:100,baseFontSize:132,rotation:0,opacity:1,visible:true,locked:false,zIndex:4,target:"back",data:{text:"10",color:"#F2F4F5",fontSize:132}}
  ];

  function renderAll(){syncUI();renderReference();renderGrid();renderArtwork();renderLayers();updateHistoryButtons();canvas.style.transform=`scale(${state.zoom})`;$("#zoomValue")&&($("#zoomValue").textContent=Math.round(state.zoom*100)+"%")}
  renderLibrary("patterns");renderAll();

  document.addEventListener("keydown",ev=>{
    if(ev.target instanceof HTMLInputElement||ev.target instanceof HTMLTextAreaElement||ev.target instanceof HTMLSelectElement)return;
    if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="z"){ev.preventDefault();ev.shiftKey?redo():undo();return}
    if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="y"){ev.preventDefault();redo();return}
    const e=selected();if(!e)return;
    if(ev.key==="Delete"||ev.key==="Backspace"){ev.preventDefault();deleteElement(e.id)}
    if(ev.key==="ArrowLeft"){ev.preventDefault();mutateElement(e.id,x=>x.x-=2)}
    if(ev.key==="ArrowRight"){ev.preventDefault();mutateElement(e.id,x=>x.x+=2)}
    if(ev.key==="ArrowUp"){ev.preventDefault();mutateElement(e.id,x=>x.y-=2)}
    if(ev.key==="ArrowDown"){ev.preventDefault();mutateElement(e.id,x=>x.y+=2)}
    if(ev.key.toLowerCase()==="r")mutateElement(e.id,x=>x.rotation+=5);
    if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="d"){ev.preventDefault();duplicateElement(e.id)}
    if(ev.key==="Home")front(e.id);if(ev.key==="End")back(e.id)
  });
})();