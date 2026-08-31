/* STYLE LAB — Technical Garment Model V2
   Product geometry only. The silhouette is intentionally independent from UI/editor code.
   V2 uses one continuous outer silhouette so seams do not create broken shoulders or floating sleeves.
*/
(function(global){
  const NS='http://www.w3.org/2000/svg';
  const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};
  const path=(cls,d,extra={})=>svg('path',{class:cls,d,...extra});

  // Local industrial drawing box: 420 x 520. The shirt is deliberately wider and shorter than V1.
  const GEOMETRY={
    front:{
      silhouette:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 L318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 L118 185 L99 191 L91 232 L8 222 L13 170 C16 148 26 130 44 120 L102 88 Z',
      torso:'M118 185 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 Z',
      leftSleeve:'M102 88 L44 120 C26 130 16 148 13 170 L8 222 L91 232 L99 191 L118 185 Z',
      rightSleeve:'M318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 Z',
      raglanLeft:'M145 58 C128 82 111 120 99 191',
      raglanRight:'M275 58 C292 82 309 120 321 191',
      leftUnderarm:'M99 191 C94 220 96 242 102 258',
      rightUnderarm:'M321 191 C326 220 324 242 318 258',
      hem:'M111 466 C144 475 177 480 210 480 C243 480 276 475 309 466',
      sleeveHemLeft:'M8 222 L91 232',
      sleeveHemRight:'M329 232 L412 222',
      collarOuter:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z',
      collarInner:'M158 58 C171 67 188 72 210 72 C232 72 249 67 262 58 C250 49 233 44 210 42 C187 44 170 49 158 58 Z',
      vCollar:'M145 58 L210 94 L275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z'
    },
    back:{
      silhouette:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 L318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 L118 185 L99 191 L91 232 L8 222 L13 170 C16 148 26 130 44 120 L102 88 Z',
      torso:'M118 185 L302 185 L309 466 C276 475 243 480 210 480 C177 480 144 475 111 466 Z',
      leftSleeve:'M102 88 L44 120 C26 130 16 148 13 170 L8 222 L91 232 L99 191 L118 185 Z',
      rightSleeve:'M318 88 L376 120 C394 130 404 148 407 170 L412 222 L329 232 L321 191 L302 185 Z',
      raglanLeft:'M145 58 C128 82 111 120 99 191',
      raglanRight:'M275 58 C292 82 309 120 321 191',
      leftUnderarm:'M99 191 C94 220 96 242 102 258',
      rightUnderarm:'M321 191 C326 220 324 242 318 258',
      hem:'M111 466 C144 475 177 480 210 480 C243 480 276 475 309 466',
      sleeveHemLeft:'M8 222 L91 232',
      sleeveHemRight:'M329 232 L412 222',
      collarOuter:'M145 58 C158 70 180 79 210 79 C240 79 262 70 275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z',
      collarInner:'M158 58 C171 67 188 72 210 72 C232 72 249 67 262 58 C250 49 233 44 210 42 C187 44 170 49 158 58 Z',
      vCollar:'M145 58 L210 94 L275 58 C261 42 240 32 210 30 C180 32 159 42 145 58 Z'
    }
  };

  function createSide(side='front',options={}){
    const q=GEOMETRY[side];
    const g=svg('g',{class:'garment-model',id:`technical-${side}`});
    g.dataset.fit=options.fit||'regular';g.dataset.sleeve=options.sleeve||'short';g.dataset.collar=options.collar||'round';
    g.style.setProperty('--gm-primary',options.primary||'#173f8f');g.style.setProperty('--gm-secondary',options.secondary||'#e31e3f');g.style.setProperty('--gm-detail',options.detail||'#00c3ff');
    // Single continuous silhouette first: prevents visual gaps at sleeve/body junctions.
    const base=path('gm-silhouette gm-zone',q.silhouette,{'data-zone':`shirt-${side}`});
    g.append(base);
    // Optional tonal panels are not outlines; they remain inside the continuous silhouette.
    g.append(path('gm-panel-fill gm-torso-panel',q.torso),path('gm-panel-fill gm-left-sleeve-panel',q.leftSleeve),path('gm-panel-fill gm-right-sleeve-panel',q.rightSleeve));
    // Construction lines only.
    ['raglanLeft','raglanRight','leftUnderarm','rightUnderarm','hem','sleeveHemLeft','sleeveHemRight'].forEach(k=>g.append(path(k.includes('hem')||k.includes('Hem')?'gm-seam':'gm-panel',q[k])));
    const collarRound=path('gm-collar-outer gm-collar-round',q.collarOuter);
    const collarInner=path('gm-collar-inner gm-collar-round',q.collarInner);
    const collarV=path('gm-collar-outer gm-collar-v',q.vCollar);
    g.append(collarRound,collarInner,collarV);
    return g;
  }
  function mount(svgRoot,side,x,y,scale=1,options={}){const model=createSide(side,options);model.setAttribute('transform',`translate(${x} ${y}) scale(${scale})`);svgRoot.appendChild(model);return model}
  function getClipPath(side,x,y,scale=1){const d=GEOMETRY[side].silhouette;return {d,transform:`translate(${x} ${y}) scale(${scale})`}}
  global.StyleLabGarmentModel={GEOMETRY,createSide,mount,getClipPath};
})(window);
