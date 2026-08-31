/* STYLE LAB — Library Forms V0.7
   Biblioteca visual de formas, escudos e padrões. Sem dependências externas.
*/
(function(global){
  "use strict";
  const NS="http://www.w3.org/2000/svg";
  const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};

  const SHIELDS=[
    {id:"shield",glyph:"🛡️",label:"Escudo"},
    {id:"badge",glyph:"🔰",label:"Distintivo"},
    {id:"fleur",glyph:"⚜️",label:"Flor-de-lis"},
    {id:"globe",glyph:"🌐",label:"Globo"},
    {id:"cross",glyph:"⛉",label:"Cruz"},
    {id:"fort",glyph:"⛨",label:"Heráldico"},
    {id:"heart",glyph:"❤︎",label:"Coração"}
  ];

  const PATTERNS=[
    ["bolt-a","RAJADO ANGULAR"],["bolt-b","RAJADO AGRESSIVO"],["slashes","FAIXAS"],["rain","LINHAS"],["wing","ASA"],["zig","ZIGUE-ZAGUE"],
    ["organic","ORGÂNICO"],["organic2","ORGÂNICO FLUIDO"],["shard","FRAGMENTOS"],["chevron","CHEVRON"],["ribbon","FITAS"],["arcs","ARCOS"],
    ["dots","PONTILHADO"],["halftone","HALFTONE"],["microdots","MICRO PONTOS"],["diamond","LOSANGOS"],["hex","HEXAGONAL"],["grid","GRADE"],
    ["checker","XADREZ"],["waves","ONDAS"],["contour","CONTORNO"],["speckle","SPECKLE"],["triangles","TRIÂNGULOS"],["bars","BARRAS"]
  ].map(([id,label])=>({id,label}));

  function patternPreview(kind){
    const c1="currentColor", c2="var(--detail)";
    const p={};
    p["bolt-a"]=`<path d="M4 58L42 6L30 36L94 12L54 47L72 37L22 66Z" fill="${c1}"/>`;
    p["bolt-b"]=`<path d="M4 61L68 4L39 43L97 18L55 61L72 42L17 68Z" fill="${c1}"/><path d="M0 48L77 9" stroke="${c2}" stroke-width="5"/>`;
    p["slashes"]=`<path d="M0 57L77 6L89 10L18 66Z M25 67L95 18L98 25L39 68Z" fill="${c1}"/>`;
    p["rain"]=Array.from({length:6},(_,i)=>`<line x1="${i*17}" y1="68" x2="${i*17+43}" y2="3" stroke="${c1}" stroke-width="5"/>`).join("");
    p["wing"]=`<path d="M3 58L94 11L53 44L98 33L48 68Z" fill="${c1}"/>`;
    p["zig"]=`<polyline points="5,62 28,8 36,46 67,10 56,62 96,40" fill="none" stroke="${c1}" stroke-width="7" stroke-linejoin="bevel"/>`;
    p["organic"]=`<path d="M0 50C16 20 30 64 45 31C58 3 72 51 100 16L100 34C78 67 64 28 49 57C31 84 18 43 0 72Z" fill="${c1}"/>`;
    p["organic2"]=`<path d="M0 18C19 5 26 47 44 40C63 32 64 2 82 10C93 15 94 28 100 31L100 55C84 48 79 69 61 61C43 53 32 73 16 57C8 49 6 35 0 33Z" fill="${c1}"/>`;
    p["shard"]=`<path d="M5 62L25 8L45 28L64 4L95 15L72 45L96 62L49 53L30 70Z" fill="${c1}"/>`;
    p["chevron"]=`<path d="M3 22L28 5L50 22L72 5L97 22L91 30L72 18L50 35L28 18L9 30Z" fill="${c1}"/>`;
    p["ribbon"]=`<path d="M0 18L25 5L58 25L100 7L100 22L59 40L26 20L0 33Z M0 49L27 35L58 55L100 36L100 51L59 69L27 50L0 63Z" fill="${c1}"/>`;
    p["arcs"]=`<path d="M5 65C25 12 65 12 95 3M25 70C43 27 70 25 99 18" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>`;
    p["dots"]=Array.from({length:25},(_,i)=>{const x=(i%5)*22+8,y=Math.floor(i/5)*15+8,r=(i%3)+2;return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c1}"/>`}).join("");
    p["halftone"]=Array.from({length:35},(_,i)=>{const x=(i%7)*15+5,y=Math.floor(i/7)*13+7,r=1+(i%4)*.9;return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c1}"/>`}).join("");
    p["microdots"]=Array.from({length:60},(_,i)=>`<circle cx="${(i*17)%100}" cy="${(i*31)%70}" r="1.2" fill="${c1}"/>`).join("");
    p["diamond"]=`<path d="M10 35L25 15L40 35L25 55ZM50 35L65 15L80 35L65 55Z" fill="none" stroke="${c1}" stroke-width="4"/><path d="M90 35L98 25L98 45Z" fill="${c1}"/>`;
    p["hex"]=`<path d="M20 8L35 16V32L20 40L5 32V16ZM60 28L75 36V52L60 60L45 52V36Z M82 2L97 10V26L82 34L67 26V10Z" fill="none" stroke="${c1}" stroke-width="3"/>`;
    p["grid"]=`<path d="M0 0H100M0 18H100M0 36H100M0 54H100M0 70H100M0 0V70M20 0V70M40 0V70M60 0V70M80 0V70M100 0V70" stroke="${c1}" stroke-width="2"/>`;
    p["checker"]=`<path d="M0 0H50V35H0ZM50 35H100V70H50Z" fill="${c1}"/>`;
    p["waves"]=`<path d="M0 20C20 2 30 38 50 20S80 2 100 20M0 45C20 27 30 63 50 45S80 27 100 45" fill="none" stroke="${c1}" stroke-width="6"/>`;
    p["contour"]=`<path d="M5 55C15 15 40 10 52 31C64 51 84 43 95 8M16 65C26 34 43 28 54 39C67 53 78 51 88 28" fill="none" stroke="${c1}" stroke-width="4"/>`;
    p["speckle"]=Array.from({length:42},(_,i)=>`<circle cx="${(i*37)%100}" cy="${(i*53)%70}" r="${1+(i%5)*.45}" fill="${i%4===0?c2:c1}"/>`).join("");
    p["triangles"]=`<path d="M5 62L24 12L43 62ZM38 62L57 6L76 62ZM68 62L85 22L99 62Z" fill="none" stroke="${c1}" stroke-width="4"/>`;
    p["bars"]=`<path d="M0 12H100V22H0ZM0 32H100V42H0ZM0 52H100V62H0Z" fill="${c1}"/>`;
    return p[kind]||p["bolt-a"];
  }

  function renderCategory(category,container,callbacks){
    container.innerHTML="";
    if(category==="patterns"){
      const grid=document.createElement("div");grid.className="library-grid";
      PATTERNS.forEach(item=>{
        const b=document.createElement("button");b.className="library-card";b.dataset.id=item.id;b.title=item.label;
        b.innerHTML=`<svg viewBox="0 0 100 70">${patternPreview(item.id)}</svg><small>${item.label}</small>`;
        b.onclick=()=>{grid.querySelectorAll(".library-card").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");callbacks.addPattern(item.id)};
        grid.appendChild(b);
      });
      container.appendChild(grid);
      const hint=document.createElement("div");hint.className="form-caption";hint.textContent="Clique no padrão para inserir. Selecione-o no canvas para ajustar tamanho.";
      container.appendChild(hint);
    }
    if(category==="shields"){
      const grid=document.createElement("div");grid.className="shield-grid";
      SHIELDS.forEach(item=>{
        const b=document.createElement("button");b.className="shield-card";b.innerHTML=`<span class="shield-glyph">${item.glyph}</span><span>${item.label}</span>`;
        b.onclick=()=>{grid.querySelectorAll(".shield-card").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");callbacks.addShield(item)};
        grid.appendChild(b);
      });
      container.appendChild(grid);
      const hint=document.createElement("div");hint.className="form-caption";hint.textContent="Os símbolos são representativos; o motor os mantém como elementos vetoriais de texto.";
      container.appendChild(hint);
    }
    if(["numbers","names","sponsors"].includes(category)){
      const caption=document.createElement("div");caption.className="form-caption";caption.textContent=category==="numbers"?"Número do atleta":category==="names"?"Nome do atleta":"Texto do patrocínio";
      const row=document.createElement("div");row.className="text-entry";
      const input=document.createElement("input");input.id="libraryTextInput";input.maxLength=24;input.value=category==="numbers"?"10":category==="names"?"PLAYER":"SPONSOR";
      const button=document.createElement("button");button.textContent="INSERIR";
      button.onclick=()=>callbacks.addText(category,input.value.trim()||input.value);
      input.addEventListener("keydown",e=>{if(e.key==="Enter")button.click()});
      row.append(input,button);container.append(caption,row);
      const hint=document.createElement("div");hint.className="form-caption";hint.textContent="Após inserir, clique no elemento para abrir o controle TAMANHO.";
      container.appendChild(hint);
    }
  }

  global.StyleLabForms={SHIELDS,PATTERNS,renderCategory,patternPreview};
})(window);