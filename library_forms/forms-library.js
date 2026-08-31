/* STYLE LAB — Library Forms V1
   Biblioteca independente de padrões e símbolos representativos.
   Não depende do editor; expõe dados e funções SVG reutilizáveis.
*/
(function(global){
  const esc = (v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const PATTERNS = [
    {id:'bolt-a',name:'RAIO A',group:'angular'},
    {id:'bolt-b',name:'RAIO B',group:'angular'},
    {id:'slashes',name:'CORTES',group:'angular'},
    {id:'rain',name:'RAJADO',group:'organic'},
    {id:'wing',name:'ASA',group:'organic'},
    {id:'zig',name:'ZIG',group:'angular'},
    {id:'organic-flow',name:'FLUXO ORGÂNICO',group:'organic'},
    {id:'organic-flame',name:'CHAMA ORGÂNICA',group:'organic'},
    {id:'organic-splinter',name:'ESTILHA RAJADA',group:'organic'},
    {id:'dots-wave',name:'PONTILHADO ONDA',group:'dotted'},
    {id:'dots-grid',name:'PONTOS GEOMÉTRICOS',group:'dotted'},
    {id:'dots-fade',name:'HALFTONE',group:'dotted'},
    {id:'hex-grid',name:'MALHA HEXAGONAL',group:'geometric'},
    {id:'chevron',name:'CHEVRON',group:'geometric'},
    {id:'triangles',name:'TRIÂNGULOS',group:'geometric'},
    {id:'diamonds',name:'LOSANGOS',group:'geometric'},
    {id:'arcs',name:'ARCOS',group:'geometric'},
    {id:'bands',name:'BANDAS DIAGONAIS',group:'geometric'}
  ];
  const SHIELDS = [
    {id:'shield',symbol:'🛡️',name:'ESCUDO'},
    {id:'emblem',symbol:'🔰',name:'EMBLEMA'},
    {id:'fleur',symbol:'⚜️',name:'FLOR-DE-LIS'},
    {id:'globe',symbol:'🌐',name:'GLOBO'},
    {id:'symbol-a',symbol:'⛉',name:'SÍMBOLO A'},
    {id:'symbol-b',symbol:'⛨',name:'SÍMBOLO B'},
    {id:'heart',symbol:'❤︎',name:'CORAÇÃO'}
  ];
  function palette(ctx){return {detail:ctx?.detail||'#00C3FF',secondary:ctx?.secondary||'#E31E3F',primary:ctx?.primary||'#0A2D8F'};}
  function patternMarkup(kind,w,h,ctx={}){
    const {detail:d,secondary:s,primary:p}=palette(ctx);
    const sw=Math.max(3,w*.028), dot=Math.max(3,w*.018);
    const defs={
      'bolt-a':()=>`<path d="M0 ${h*.88} L${w*.55} 0 L${w*.32} ${h*.48} L${w} ${h*.1} L${w*.56} ${h*.72} L${w*.76} ${h*.5} L${w*.18} ${h} Z" fill="${d}"/><path d="M${w*.05} ${h*.75} L${w*.6} ${h*.16} L${w*.36} ${h*.65} L${w*.9} ${h*.28}" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
      'bolt-b':()=>`<path d="M${w*.05} ${h*.85} L${w*.72} ${h*.08} L${w*.48} ${h*.5} L${w*.98} ${h*.28} L${w*.58} ${h*.92} L${w*.6} ${h*.62} L${w*.2} ${h} Z" fill="${d}"/>`,
      'slashes':()=>Array.from({length:5},(_,i)=>`<line x1="${-w*.12+i*w*.22}" y1="${h}" x2="${w*.35+i*w*.22}" y2="0" stroke="${i%2?s:d}" stroke-width="${sw*1.15}"/>`).join(''),
      'rain':()=>Array.from({length:9},(_,i)=>`<path d="M${i*w/8} ${h*.95} C${i*w/8+w*.08} ${h*.72},${i*w/8+w*.02} ${h*.32},${i*w/8+w*.22} ${h*.06}" fill="none" stroke="${i%2?d:s}" stroke-width="${sw}"/>`).join(''),
      'wing':()=>`<path d="M0 ${h*.9} C${w*.2} ${h*.45},${w*.5} ${h*.25},${w} ${h*.05} L${w*.68} ${h*.5} L${w*.95} ${h*.34} L${w*.52} ${h*.95} Z" fill="${d}"/><path d="M${w*.05} ${h*.85} L${w*.85} ${h*.15}" stroke="${s}" stroke-width="${sw}"/>`,
      'zig':()=>`<polyline points="0,${h*.85} ${w*.22},${h*.15} ${w*.38},${h*.62} ${w*.62},${h*.05} ${w*.78},${h*.55} ${w},${h*.12}" fill="none" stroke="${d}" stroke-width="${sw*1.5}"/><polyline points="${w*.12},${h} ${w*.32},${h*.32} ${w*.52},${h*.88} ${w*.88},${h*.28}" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
      'organic-flow':()=>`<path d="M0 ${h*.75} C${w*.16} ${h*.25},${w*.28} ${h*.95},${w*.5} ${h*.45} S${w*.78} ${h*.05},${w} ${h*.35}" fill="none" stroke="${d}" stroke-width="${sw*2.1}"/><path d="M0 ${h*.98} C${w*.2} ${h*.58},${w*.42} ${h*.1},${w*.7} ${h*.55} S${w*.88} ${h*.85},${w} ${h*.7}" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
      'organic-flame':()=>`<path d="M${w*.06} ${h} C${w*.18} ${h*.45},${w*.12} ${h*.18},${w*.34} ${h*.03} C${w*.3} ${h*.5},${w*.52} ${h*.36},${w*.58} ${h*.08} C${w*.65} ${h*.5},${w*.86} ${h*.28},${w*.95} 0 C${w*.98} ${h*.45},${w*.82} ${h*.78},${w*.7} ${h} Z" fill="${d}" opacity=".95"/><path d="M${w*.2} ${h} C${w*.4} ${h*.5},${w*.38} ${h*.28},${w*.55} ${h*.12} C${w*.58} ${h*.5},${w*.72} ${h*.45},${w*.78} ${h*.1}" fill="none" stroke="${s}" stroke-width="${sw}"/>`,
      'organic-splinter':()=>Array.from({length:7},(_,i)=>`<path d="M${i*w*.15} ${h} Q${(i+.6)*w*.15} ${h*.4} ${(i+1)*w*.15} ${i%2?h*.12:h*.02}" fill="none" stroke="${i%2?s:d}" stroke-width="${sw*(i%3?1:1.6)}"/>`).join(''),
      'dots-wave':()=>Array.from({length:42},(_,i)=>{const x=(i%7)*w/6,y=Math.floor(i/7)*h/5,r=dot*(.45+((i%5)/7));return `<circle cx="${x}" cy="${y+h*.15*Math.sin(i*.8)}" r="${r}" fill="${i%2?d:s}"/>`;}).join(''),
      'dots-grid':()=>Array.from({length:48},(_,i)=>`<circle cx="${(i%8)*w/7}" cy="${Math.floor(i/8)*h/5}" r="${dot}" fill="${i%3?s:d}"/>`).join(''),
      'dots-fade':()=>Array.from({length:64},(_,i)=>{const col=i%8,row=Math.floor(i/8),r=dot*(1-col/10);return `<circle cx="${col*w/7}" cy="${row*h/7}" r="${Math.max(1,r)}" fill="${d}" opacity="${.2+.8*(1-col/8)}"/>`;}).join(''),
      'hex-grid':()=>{let out='';const R=Math.max(8,w*.06);for(let y=R;y<h+R;y+=R*1.55)for(let x=R;x<w+R;x+=R*1.75){const pts=Array.from({length:6},(_,i)=>`${x+R*Math.cos(Math.PI/3*i)},${y+R*Math.sin(Math.PI/3*i)}`).join(' ');out+=`<polygon points="${pts}" fill="none" stroke="${d}" stroke-width="${Math.max(1,sw*.45)}"/>`;}return out;},
      'chevron':()=>Array.from({length:5},(_,i)=>`<polyline points="0,${h*(.1+i*.2)} ${w*.5},${h*(.25+i*.2)} ${w},${h*(.1+i*.2)}" fill="none" stroke="${i%2?d:s}" stroke-width="${sw}"/>`).join(''),
      'triangles':()=>Array.from({length:8},(_,i)=>{const x=(i%4)*w*.25,y=Math.floor(i/4)*h*.48;return `<polygon points="${x},${y+h*.45} ${x+w*.16},${y} ${x+w*.32},${y+h*.45}" fill="${i%2?d:s}" opacity=".88"/>`;}).join(''),
      'diamonds':()=>Array.from({length:10},(_,i)=>{const x=(i%5)*w*.21+w*.1,y=Math.floor(i/5)*h*.52+h*.25;return `<polygon points="${x},${y-h*.2} ${x+w*.09},${y} ${x},${y+h*.2} ${x-w*.09},${y}" fill="none" stroke="${i%2?d:s}" stroke-width="${sw*.75}"/>`;}).join(''),
      'arcs':()=>Array.from({length:4},(_,i)=>`<path d="M${-w*.15+i*w*.18} ${h} A${w*.42} ${h*.8} 0 0 1 ${w*.65+i*w*.18} 0" fill="none" stroke="${i%2?d:s}" stroke-width="${sw}"/>`).join(''),
      'bands':()=>`<polygon points="0,${h*.65} ${w*.78},0 ${w},0 ${w*.18},${h}" fill="${d}"/><polygon points="0,${h*.9} ${w*.55},0 ${w*.72},0 ${w*.1},${h}" fill="${s}" opacity=".9"/>`
    };
    return (defs[kind]||defs['bolt-a'])();
  }
  function shieldMarkup(symbol,w,h,ctx={}){
    const {detail:d,secondary:s}=palette(ctx);
    const fs=Math.min(w,h)*.76;
    return `<text x="${w/2}" y="${h*.76}" text-anchor="middle" font-size="${fs}" font-family="Segoe UI Symbol, Apple Color Emoji, Noto Color Emoji, sans-serif">${esc(symbol)}</text>`;
  }
  function cardSvg(item){const w=120,h=82;return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${patternMarkup(item.id,w,h,{detail:'#dfe7ee',secondary:'#7e8b97'})}</svg>`;}
  global.StyleLabFormsLibrary={PATTERNS,SHIELDS,patternMarkup,shieldMarkup,cardSvg};
})(window);
