/* STYLE LAB — Technical Garment Model V3
   Continuous product geometry. UI/editor independent.
   A model is a concrete vector form plus construction lines; artwork always clips to silhouette.
*/
(function(global){
  const NS='http://www.w3.org/2000/svg';
  const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};
  const path=(cls,d,extra={})=>svg('path',{class:cls,d,...extra});
  const BASE={
    silhouette:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 L318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 L118 185 L99 191 L91 232 L8 222 L13 170 C16 148 26 130 44 120 L102 88 Z',
    torso:'M118 185 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 Z',
    leftSleeve:'M102 88 L44 120 C26 130 16 148 13 170 L8 222 L91 232 L99 191 L118 185 Z',
    rightSleeve:'M318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 Z',
    raglanLeft:'M145 58 C128 82 111 120 99 191', raglanRight:'M275 58 C292 82 309 120 321 191',
    shoulderLeft:'M145 58 L102 88 L99 191', shoulderRight:'M275 58 L318 88 L321 191',
    hem:'M111 466 C144 475 177 480 210 480 C243 480 276 475 309 466',
    sleeveHemLeft:'M8 222 L91 232', sleeveHemRight:'M329 232 L412 222',
    collarOuter:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z',
    collarInner:'M158 58 C171 67 188 72 210 72 C232 72 249 67 262 58 C250 49 233 44 210 42 C187 44 170 49 158 58 Z',
    vCollar:'M145 58 L210 94 L275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z',
    poloCollar:'M145 58 L164 89 L196 72 L210 104 L224 72 L256 89 L275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z'
  };
  const SHORTS={silhouette:'M90 90 L330 90 L350 340 C320 365 270 378 210 378 C150 378 100 365 70 340 Z',waist:'M90 90 L330 90',inseam:'M210 145 L210 365',hem:'M70 340 C110 360 155 370 210 370 C265 370 310 360 350 340'};
  const PANTS={silhouette:'M95 75 L325 75 L315 250 L360 500 L245 500 L210 285 L175 500 L60 500 L105 250 Z',waist:'M95 75 L325 75',inseam:'M210 180 L210 285',hemLeft:'M60 500 L175 500',hemRight:'M245 500 L360 500'};
  function geometryFor(options={}){
    const family=options.family||options.productFamily||'shirt-raglan';
    if(family==='shorts') return {...SHORTS,kind:'shorts'};
    if(family==='pants') return {...PANTS,kind:'pants'};
    return {...BASE,kind:'shirt',raglan:family.includes('raglan')};
  }
  const GEOMETRY={front:BASE,back:BASE};
  function createSide(side='front',options={}){
    const q=geometryFor(options);
    const g=svg('g',{class:'garment-model',id:`technical-${side}`});
    g.dataset.fit=options.fit||'regular';g.dataset.sleeve=options.sleeve||'short';g.dataset.collar=options.collar||'round';g.dataset.family=options.family||'shirt-raglan';
    g.style.setProperty('--gm-primary',options.primary||'#173f8f');g.style.setProperty('--gm-secondary',options.secondary||'#e31e3f');g.style.setProperty('--gm-detail',options.detail||'#00c3ff');
    const base=path('gm-silhouette gm-zone',q.silhouette,{'data-zone':`${q.kind}-${side}`});g.append(base);
    if(q.kind==='shirt'){
      g.append(path('gm-panel-fill gm-torso-panel',q.torso),path('gm-panel-fill gm-left-sleeve-panel',q.leftSleeve),path('gm-panel-fill gm-right-sleeve-panel',q.rightSleeve));
      const seams=q.raglan?['raglanLeft','raglanRight']:['shoulderLeft','shoulderRight'];
      seams.concat(['hem','sleeveHemLeft','sleeveHemRight']).forEach(k=>g.append(path(k.includes('hem')||k.includes('Hem')?'gm-seam':'gm-panel',q[k])));
      const round=path('gm-collar-outer gm-collar-round',q.collarOuter),inner=path('gm-collar-inner gm-collar-round',q.collarInner),v=path('gm-collar-outer gm-collar-v',q.vCollar),polo=path('gm-collar-outer gm-collar-polo',q.poloCollar);
      g.append(round,inner,v,polo);
    }else{
      g.append(path('gm-seam',q.waist)); if(q.inseam)g.append(path('gm-seam',q.inseam)); ['hem','hemLeft','hemRight'].forEach(k=>q[k]&&g.append(path('gm-seam',q[k])));
    }
    return g;
  }
  function mount(svgRoot,side,x,y,scale=1,options={}){const model=createSide(side,options);model.setAttribute('transform',`translate(${x} ${y}) scale(${scale})`);svgRoot.appendChild(model);return model}
  function getClipPath(side,x,y,scale=1,options={}){const q=geometryFor(options);return {d:q.silhouette,transform:`translate(${x} ${y}) scale(${scale})`}}
  global.StyleLabGarmentModel={GEOMETRY,geometryFor,createSide,mount,getClipPath};
})(window);
