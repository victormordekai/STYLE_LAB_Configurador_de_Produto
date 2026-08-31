/* STYLE LAB — Technical Garment Model V1
   Geometry module: owns garment proportions and construction variants.
   No UI, no layer state, no export state belongs here. */
(function(global){
  const NS='http://www.w3.org/2000/svg';
  const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag); for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); return n};

  // Industrial silhouette proportions are defined in a local 420 x 520 coordinate system.
  // Key rule: the torso is shorter and wider than the legacy MVP path.
  const GEOMETRY={
    front:{
      body:'M108 82 C122 70 138 58 154 47 C170 36 183 31 196 29 C206 27 214 27 224 29 C237 31 250 36 266 47 C282 58 298 70 312 82 L337 178 L294 169 C291 226 294 335 300 458 C267 466 233 470 210 470 C187 470 153 466 120 458 C126 335 129 226 126 169 L83 178 Z',
      leftSleeve:'M108 82 C87 89 63 100 43 114 C31 123 24 140 20 160 L15 206 L83 218 L91 173 L126 169 Z',
      rightSleeve:'M312 82 C333 89 357 100 377 114 C389 123 396 140 400 160 L405 206 L337 218 L329 173 L294 169 Z',
      raglanLeft:'M154 47 C138 65 121 92 108 126 C99 150 94 175 91 205',
      raglanRight:'M266 47 C282 65 299 92 312 126 C321 150 326 175 329 205',
      hem:'M120 458 C153 466 187 470 210 470 C233 470 267 466 300 458',
      collarOuter:'M154 47 C168 64 184 72 210 72 C236 72 252 64 266 47 C252 33 236 25 210 24 C184 25 168 33 154 47 Z',
      collarInner:'M165 46 C177 57 191 63 210 63 C229 63 243 57 255 46 C244 38 231 33 210 32 C189 33 176 38 165 46 Z',
      vCollar:'M154 47 L210 82 L266 47 C252 33 236 25 210 24 C184 25 168 33 154 47 Z'
    },
    back:{
      body:'M108 82 C122 70 138 58 154 47 C170 36 183 31 196 29 C206 27 214 27 224 29 C237 31 250 36 266 47 C282 58 298 70 312 82 L337 178 L294 169 C291 226 294 335 300 458 C267 466 233 470 210 470 C187 470 153 466 120 458 C126 335 129 226 126 169 L83 178 Z',
      leftSleeve:'M108 82 C87 89 63 100 43 114 C31 123 24 140 20 160 L15 206 L83 218 L91 173 L126 169 Z',
      rightSleeve:'M312 82 C333 89 357 100 377 114 C389 123 396 140 400 160 L405 206 L337 218 L329 173 L294 169 Z',
      raglanLeft:'M154 47 C138 65 121 92 108 126 C99 150 94 175 91 205',
      raglanRight:'M266 47 C282 65 299 92 312 126 C321 150 326 175 329 205',
      hem:'M120 458 C153 466 187 470 210 470 C233 470 267 466 300 458',
      collarOuter:'M154 47 C168 64 184 72 210 72 C236 72 252 64 266 47 C252 33 236 25 210 24 C184 25 168 33 154 47 Z',
      collarInner:'M165 46 C177 57 191 63 210 63 C229 63 243 57 255 46 C244 38 231 33 210 32 C189 33 176 38 165 46 Z',
      vCollar:'M154 47 L210 82 L266 47 C252 33 236 25 210 24 C184 25 168 33 154 47 Z'
    }
  };

  function path(cls,d,extra={}){return svg('path',{class:cls,d,...extra})}
  function createSide(side='front', options={}){
    const g=svg('g',{class:'garment-model',id:`technical-${side}`});
    g.dataset.fit=options.fit||'regular'; g.dataset.sleeve=options.sleeve||'short'; g.dataset.collar=options.collar||'round';
    g.style.setProperty('--gm-primary',options.primary||'#173f8f');
    g.style.setProperty('--gm-secondary',options.secondary||'#e31e3f');
    g.style.setProperty('--gm-detail',options.detail||'#00c3ff');
    const q=GEOMETRY[side];
    const bodyWrap=svg('g',{class:'gm-body-scale'});
    const sleeveL=path('gm-base gm-zone gm-short-sleeve',q.leftSleeve,{'data-zone':`${side}-left-sleeve`});
    const sleeveR=path('gm-base gm-zone gm-short-sleeve',q.rightSleeve,{'data-zone':`${side}-right-sleeve`});
    const body=path('gm-base gm-zone',q.body,{'data-zone':`shirt-${side}`});
    bodyWrap.append(sleeveL,sleeveR,body);
    // construction lines: raglan + hem + sleeve hems
    bodyWrap.append(path('gm-panel',q.raglanLeft),path('gm-panel',q.raglanRight),path('gm-seam',q.hem));
    bodyWrap.append(path('gm-seam','M16 206 L83 218'),path('gm-seam','M337 218 L404 206'));
    g.append(bodyWrap);
    const collarRound=path('gm-collar-outer gm-collar-round',q.collarOuter);
    const collarInner=path('gm-collar-inner gm-collar-round',q.collarInner);
    const collarV=path('gm-collar-outer gm-collar-v',q.vCollar);
    g.append(collarRound,collarInner,collarV);
    return g;
  }
  function mount(svgRoot, side, x, y, scale=1, options={}){
    const model=createSide(side,options); model.setAttribute('transform',`translate(${x} ${y}) scale(${scale})`); svgRoot.appendChild(model); return model;
  }
  global.StyleLabGarmentModel={GEOMETRY,createSide,mount};
})(window);
