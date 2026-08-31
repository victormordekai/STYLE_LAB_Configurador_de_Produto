/* STYLE LAB — Library Modeling V0.7
   Catálogo paramétrico de modelagens básicas. Geometria em coordenadas locais SVG.
   Regra: uma silhueta externa contínua + linhas internas de construção.
*/
(function(global){
  "use strict";
  const NS="http://www.w3.org/2000/svg";
  const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};
  const path=(cls,d,extra={})=>svg("path",{class:cls,d,...extra});

  const SHIRT_BASE={
    viewBox:"0 0 420 520",
    silhouette:"M145 58 C159 70 181 78 210 78 C239 78 261 70 275 58 L319 87 L374 119 C394 131 404 149 407 171 L412 222 L330 232 L322 192 L303 185 L309 454 C281 463 248 468 210 468 C172 468 139 463 111 454 L117 185 L98 192 L90 232 L8 222 L13 171 C16 149 26 131 46 119 L101 87 Z",
    torso:"M117 185 L303 185 L309 454 C281 463 248 468 210 468 C172 468 139 463 111 454 Z",
    leftSleeve:"M101 87 L46 119 C26 131 16 149 13 171 L8 222 L90 232 L98 192 L117 185 Z",
    rightSleeve:"M319 87 L374 119 C394 131 404 149 407 171 L412 222 L330 232 L322 192 L303 185 Z",
    raglanLeft:"M145 58 C128 83 110 123 98 192",
    raglanRight:"M275 58 C292 83 310 123 322 192",
    hem:"M111 454 C139 463 172 468 210 468 C248 468 281 463 309 454",
    sleeveHemLeft:"M8 222 L90 232",
    sleeveHemRight:"M330 232 L412 222",
    underarmLeft:"M98 192 C94 220 95 243 102 262",
    underarmRight:"M322 192 C326 220 325 243 318 262",
    collarRoundOuter:"M145 58 C159 70 181 78 210 78 C239 78 261 70 275 58 C261 42 239 32 210 30 C181 32 159 42 145 58 Z",
    collarRoundInner:"M158 58 C171 67 188 72 210 72 C232 72 249 67 262 58 C250 49 232 44 210 42 C188 44 170 49 158 58 Z",
    collarV:"M145 58 L210 94 L275 58 C262 43 240 33 210 30 C180 33 158 43 145 58 Z",
    collarPolo:"M145 58 C159 70 181 78 210 78 C239 78 261 70 275 58 C261 42 239 32 210 30 C181 32 159 42 145 58 Z M195 70 L210 91 L225 70",
    centerLine:"M210 94 L210 452"
  };

  const RAGLAN={...SHIRT_BASE,
    silhouette:"M150 56 C164 68 183 76 210 76 C237 76 256 68 270 56 L325 94 L378 125 C395 136 404 152 407 172 L412 222 L331 232 L321 193 L306 187 L311 454 C282 463 248 468 210 468 C172 468 138 463 109 454 L114 187 L99 193 L89 232 L8 222 L13 172 C16 152 25 136 42 125 L95 94 Z",
    torso:"M114 187 L306 187 L311 454 C282 463 248 468 210 468 C172 468 138 463 109 454 Z",
    leftSleeve:"M95 94 L42 125 C25 136 16 152 13 172 L8 222 L89 232 L99 193 L114 187 Z",
    rightSleeve:"M325 94 L378 125 C395 136 404 152 407 172 L412 222 L331 232 L321 193 L306 187 Z",
    raglanLeft:"M150 56 C130 84 112 130 99 193",
    raglanRight:"M270 56 C290 84 308 130 321 193",
    collarRoundOuter:"M150 56 C164 68 183 76 210 76 C237 76 256 68 270 56 C256 41 237 32 210 30 C183 32 164 41 150 56 Z",
    collarRoundInner:"M161 56 C174 65 190 70 210 70 C230 70 246 65 259 56 C247 48 231 44 210 42 C189 44 173 48 161 56 Z",
    collarV:"M150 56 L210 92 L270 56 C257 41 237 32 210 30 C183 32 163 41 150 56 Z",
    collarPolo:"M150 56 C164 68 183 76 210 76 C237 76 256 68 270 56 C256 41 237 32 210 30 C183 32 164 41 150 56 Z M195 68 L210 90 L225 68"
  };

  const TEE={...SHIRT_BASE,
    silhouette:"M144 58 C160 69 183 77 210 77 C237 77 260 69 276 58 L321 92 L378 124 C395 135 404 151 407 171 L412 222 L329 232 L321 193 L302 187 L307 451 C278 461 246 466 210 466 C174 466 142 461 113 451 L119 187 L100 193 L92 232 L8 222 L13 171 C16 151 25 135 42 124 L99 92 Z",
    torso:"M119 187 L302 187 L307 451 C278 461 246 466 210 466 C174 466 142 461 113 451 Z",
    leftSleeve:"M99 92 L42 124 C25 135 16 151 13 171 L8 222 L92 232 L100 193 L119 187 Z",
    rightSleeve:"M321 92 L378 124 C395 135 404 151 407 171 L412 222 L329 232 L321 193 L302 187 Z",
    raglanLeft:"M144 58 C129 82 113 126 100 193",
    raglanRight:"M276 58 C291 82 307 126 321 193",
    collarRoundOuter:"M144 58 C160 69 183 77 210 77 C237 77 260 69 276 58 C261 41 239 31 210 29 C181 31 159 41 144 58 Z",
    collarRoundInner:"M158 58 C172 66 189 71 210 71 C231 71 248 66 262 58 C250 49 232 44 210 42 C188 44 170 49 158 58 Z"
  };

  const SHORTS={
    viewBox:"0 0 420 520",
    silhouette:"M82 88 C119 78 162 74 210 74 C258 74 301 78 338 88 L325 238 L263 236 L256 460 L214 460 L210 306 L206 460 L164 460 L157 236 L95 238 Z",
    leftLeg:"M95 238 L157 236 L164 460 L82 454 Z",
    rightLeg:"M263 236 L325 238 L338 454 L256 460 Z",
    waistband:"M82 88 C119 78 162 74 210 74 C258 74 301 78 338 88 L333 120 C297 110 257 105 210 105 C163 105 123 110 87 120 Z",
    centerLine:"M210 106 L210 306",
    sideLeft:"M87 120 L82 454",
    sideRight:"M333 120 L338 454"
  };

  const PANTS={
    viewBox:"0 0 420 520",
    silhouette:"M82 72 C123 62 165 58 210 58 C255 58 297 62 338 72 L329 190 L309 455 L225 455 L210 280 L195 455 L111 455 L91 190 Z",
    leftLeg:"M91 190 L195 190 L195 455 L111 455 Z",
    rightLeg:"M225 190 L329 190 L309 455 L225 455 Z",
    waistband:"M82 72 C123 62 165 58 210 58 C255 58 297 62 338 72 L334 104 C296 94 255 90 210 90 C165 90 124 94 86 104 Z",
    centerLine:"M210 91 L210 280",
    sideLeft:"M86 104 L91 190",
    sideRight:"M334 104 L329 190"
  };

  const MODELS={
    "shirt-basic":{id:"shirt-basic",sku:"CAM-BAS-001",name:"CAMISA BÁSICA 001",kind:"shirt",geometry:SHIRT_BASE},
    "shirt-raglan":{id:"shirt-raglan",sku:"CAM-RAG-001",name:"CAMISA RAGGLAN 001",kind:"shirt",geometry:RAGLAN},
    "tee":{id:"tee",sku:"TEE-BAS-001",name:"CAMISETA BÁSICA 001",kind:"shirt",geometry:TEE},
    "shorts":{id:"shorts",sku:"CAL-BAS-001",name:"CALÇÃO BASE 001",kind:"bottom",geometry:SHORTS},
    "pants":{id:"pants",sku:"CALC-BAS-001",name:"CALÇA BASE 001",kind:"bottom",geometry:PANTS}
  };

  function styleModel(g,options){
    g.style.setProperty("--gm-primary",options.primary||"#0A2D8F");
    g.style.setProperty("--gm-secondary",options.secondary||"#E31E3F");
    g.style.setProperty("--gm-detail",options.detail||"#00C3FF");
    g.dataset.fit=options.fit||"regular";g.dataset.sleeve=options.sleeve||"short";g.dataset.collar=options.collar||"round";
  }

  function createShirtSide(side,options,geometry){
    const q=geometry,g=svg("g",{class:"garment-model",id:`technical-${side}`});
    styleModel(g,options);
    g.append(path("gm-silhouette gm-zone",q.silhouette,{"data-zone":`${side}-silhouette`}));
    g.append(path("gm-panel-fill gm-torso-panel",q.torso),path("gm-panel-fill gm-left-sleeve-panel",q.leftSleeve),path("gm-panel-fill gm-right-sleeve-panel",q.rightSleeve));
    [["gm-panel",q.raglanLeft],["gm-panel",q.raglanRight],["gm-seam",q.underarmLeft],["gm-seam",q.underarmRight],["gm-seam",q.hem],["gm-seam",q.sleeveHemLeft],["gm-seam",q.sleeveHemRight]].forEach(([cls,d])=>{if(d)g.append(path(cls,d))});
    const roundOuter=path("gm-collar-outer gm-collar-round",q.collarRoundOuter||"");
    const roundInner=path("gm-collar-inner gm-collar-round",q.collarRoundInner||"");
    const v=path("gm-collar-outer gm-collar-v",q.collarV||"");
    const polo=path("gm-collar-outer gm-collar-polo",q.collarPolo||"");
    [roundOuter,roundInner,v,polo].forEach(n=>{if(n.getAttribute("d"))g.append(n)});
    if(q.centerLine)g.append(path("gm-panel",q.centerLine));
    return g;
  }

  function createBottomSide(side,options,geometry){
    const q=geometry,g=svg("g",{class:"garment-model bottom-model",id:`technical-${side}`});
    styleModel(g,options);
    g.append(path("gm-silhouette gm-zone",q.silhouette,{"data-zone":`${side}-silhouette`}));
    if(q.leftLeg)g.append(path("gm-panel-fill gm-left-leg-panel",q.leftLeg));
    if(q.rightLeg)g.append(path("gm-panel-fill gm-right-leg-panel",q.rightLeg));
    if(q.waistband)g.append(path("gm-panel-fill gm-waistband-panel",q.waistband));
    ["centerLine","sideLeft","sideRight"].forEach(k=>{if(q[k])g.append(path("gm-panel",q[k]))});
    return g;
  }

  function createSide(side,options={}){
    const model=MODELS[options.modelId||"shirt-basic"]||MODELS["shirt-basic"];
    return model.kind==="bottom"
      ? createBottomSide(side,options,model.geometry)
      : createShirtSide(side,options,model.geometry);
  }

  function mount(svgRoot,side,x,y,scale=1,options={}){
    const model=createSide(side,options);
    model.setAttribute("transform",`translate(${x} ${y}) scale(${scale})`);
    svgRoot.appendChild(model);
    return model;
  }

  function getClipPath(side,modelId="shirt-basic",x=0,y=0,scale=1){
    const model=MODELS[modelId]||MODELS["shirt-basic"];
    return {d:model.geometry.silhouette,transform:`translate(${x} ${y}) scale(${scale})`};
  }

  global.StyleLabModeling={MODELS,createSide,mount,getClipPath};
})(window);