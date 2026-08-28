const state={
  projectId:"SL-0001",version:1,status:"DRAFT",locked:false,reference:null,
  config:{product:null,collar:"crew",sleeve:"short",fit:"regular",shorts:"basic",baseColor:"#101010",secondaryColor:"#f2f2ee"},
  objects:[]
};
let library={products:[]};
const $=id=>document.getElementById(id);

async function init(){
  try{library=await fetch("data/library.json").then(r=>r.json())}
  catch(e){library={products:[{sku:"BASE-MVP",modelagem:"Camisa + calção",molde:"Base",tecido:"—",cor_tecido:"—",aplicacao:"—"}]}}
  populate(); bind(); render();
}
function populate(){
  const s=$("product");s.innerHTML="";
  library.products.forEach((p,i)=>{const o=document.createElement("option");o.value=i;o.textContent=`${p.sku} — ${p.modelagem||"Base"}`;s.appendChild(o)});
  state.config.product=library.products[0];
}
function bind(){
  $("product").onchange=e=>{state.config.product=library.products[+e.target.value];render()};
  ["collar","sleeve","fit","shorts"].forEach(id=>$(id).onchange=e=>{state.config[id]=e.target.value;render()});
  ["base","secondary"].forEach(id=>$(id).oninput=e=>{state.config[id==="base"?"baseColor":"secondaryColor"]=e.target.value;render()});
  $("reference").onchange=loadReference;
  $("lock").onclick=()=>{state.locked=true;state.status="LOCKED";render()};
  $("json").onclick=exportJSON;$("svg").onclick=exportSVG;
  $("clearObjects").onclick=()=>{state.objects=[];render()};
  $("resetView").onclick=()=>{$(".kit").style.transform="scale(.9)"};
  bindLibrary();
  setupDropZone();
}
function bindLibrary(){
  document.querySelectorAll(".asset-chip").forEach(chip=>{
    chip.addEventListener("dragstart",e=>{e.dataTransfer.setData("application/x-lockaid",JSON.stringify({type:chip.dataset.type,label:chip.dataset.label}))});
    chip.addEventListener("click",()=>addObject(chip.dataset.type,chip.dataset.label,.5,.45));
  });
}
function setupDropZone(){
  const wrap=$(".shirt-wrap");
  ["dragenter","dragover"].forEach(ev=>wrap.addEventListener(ev,e=>{e.preventDefault();wrap.classList.add("drag-over")}));
  ["dragleave","drop"].forEach(ev=>wrap.addEventListener(ev,e=>{e.preventDefault();wrap.classList.remove("drag-over")}));
  wrap.addEventListener("drop",e=>{
    const raw=e.dataTransfer.getData("application/x-lockaid");if(!raw)return;
    const data=JSON.parse(raw);const r=wrap.getBoundingClientRect();
    addObject(data.type,data.label,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
  });
}
function addObject(type,label,x,y){
  const id=crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
  state.objects.push({id,type,label,x:clamp(x,.12,.88),y:clamp(y,.12,.88)});
  renderObjects();
}
function renderObjects(){
  const holder=$("shirtObjects");holder.innerHTML="";
  state.objects.forEach(o=>{
    const el=document.createElement("div");el.className=`placed-object ${o.type}`;el.dataset.id=o.id;
    el.style.left=`${o.x*100}%`;el.style.top=`${o.y*100}%`;
    el.innerHTML=`<div class="object-visual">${escapeHtml(o.label)}</div><button class="object-delete">×</button>`;
    holder.appendChild(el);
    el.addEventListener("click",e=>{e.stopPropagation();document.querySelectorAll(".placed-object").forEach(x=>x.classList.remove("selected"));el.classList.add("selected")});
    el.querySelector(".object-delete").onclick=e=>{e.stopPropagation();state.objects=state.objects.filter(x=>x.id!==o.id);renderObjects()};
    makeDraggable(el,o);
  });
}
function makeDraggable(el,o){
  let active=false;
  el.addEventListener("pointerdown",e=>{
    if(e.target.closest(".object-delete"))return;
    active=true;el.setPointerCapture(e.pointerId);el.classList.add("selected");
  });
  el.addEventListener("pointermove",e=>{
    if(!active)return;
    const r=$(".shirt-wrap").getBoundingClientRect();
    o.x=clamp((e.clientX-r.left)/r.width,.06,.94);o.y=clamp((e.clientY-r.top)/r.height,.06,.94);
    el.style.left=`${o.x*100}%`;el.style.top=`${o.y*100}%`;
  });
  el.addEventListener("pointerup",()=>{active=false});
}
function render(){
  const c=state.config,p=c.product||{};
  $("project").textContent=state.projectId;
  $("badge").textContent=`V${pad(state.version)} · ${state.status}`;
  $("istatus").textContent=state.status;$("iver").textContent=`V${pad(state.version)}`;$("ibase").textContent=p.sku||"—";
  $("title").textContent=(p.modelagem||"CAMISA + CALÇÃO").toUpperCase();
  $("output").textContent=state.locked?"Configuração consolidada":"Projeto visual preliminar";
  $("liveStatus").textContent=state.locked?"LOCKED / VECTOR":"LIVE / VECTOR";
  $("meta").innerHTML=`<strong>${esc(p.sku||"BASE-MVP")}</strong><br>Modelagem: ${esc(p.modelagem||"—")}<br>Molde: ${esc(p.molde||"—")}<br>Tecido: ${esc(p.tecido||"—")}<br>Cor: ${esc(p.cor_tecido||"—")}`;
  $("body").setAttribute("fill",c.baseColor);$("shortbody").setAttribute("fill",c.baseColor);
  $("panel").setAttribute("fill",c.secondaryColor);$("shortpanel").setAttribute("fill",c.secondaryColor);
  ["crew","v"].forEach(id=>$(id).setAttribute("stroke",c.secondaryColor));$("mandarin").setAttribute("fill",c.secondaryColor);
  $("crest").setAttribute("fill",c.secondaryColor);$("rag").querySelectorAll("path").forEach(x=>x.setAttribute("stroke",c.secondaryColor));$("recut").setAttribute("stroke",c.secondaryColor);
  $("crew").style.display=c.collar==="crew"?"":"none";$("v").style.display=c.collar==="v"?"":"none";$("mandarin").style.display=c.collar==="mandarin"?"":"none";
  $("rag").style.opacity=c.sleeve==="raglan"?"1":"0";$("recut").style.display=c.shorts==="side"?"":"none";
  const scale={regular:.9,athletic:.86,loose:.94}[c.fit];$(".kit").style.transform=`scale(${scale})`;
  $("config").innerHTML=[["SKU",p.sku||"—"],["MODELAGEM",p.modelagem||"—"],["MOLDE",p.molde||"—"],["TECIDO",p.tecido||"—"],["GOLA",label("collar",c.collar)],["MANGA",label("sleeve",c.sleeve)],["CAIMENTO",label("fit",c.fit)],["CALÇÃO",label("shorts",c.shorts)],["OBJETOS",state.objects.length]].map(x=>`<dt>${x[0]}</dt><dd>${esc(x[1])}</dd>`).join("");
  const issues=[];if(!p.sku)issues.push("Base industrial não encontrada.");if(c.collar==="mandarin")issues.push("Gola mandarim requer validação de biblioteca.");if(c.sleeve==="raglan")issues.push("Raglan requer validação da modelagem.");
  $("validation").innerHTML=issues.length?`<strong>VALIDAR</strong><br>${issues.map(esc).join("<br>")}`:`<strong>VIÁVEL · MVP</strong><br>Configuração representada sobre a base selecionada. Regras industriais definitivas entram no Rule Engine.`;
  $("validation").className="validation "+(issues.length?"warn":"ok");
  renderObjects();
}
function loadReference(e){
  const f=e.target.files[0];if(!f)return;
  const url=URL.createObjectURL(f);state.reference={name:f.name,type:f.type};
  $("ref").style.backgroundImage=`url("${url}")`;$("ref").classList.remove("hidden");
  $("refinfo").innerHTML=`<strong>${esc(f.name)}</strong><br>Referência preservada como camada visual de consulta.`;
}
function projectData(){return{schema:"LOCKAID_STYLE_LAB_MVP_0.2",projectId:state.projectId,version:`V${pad(state.version)}`,status:state.status,reference:state.reference,configuration:state.config,objects:state.objects}}
function exportJSON(){download("lockaid-project.json",JSON.stringify(projectData(),null,2),"application/json")}
function exportSVG(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650"><rect width="1000" height="650" fill="#e6e6df"/><g transform="translate(120 30)">${$("shirt").outerHTML}</g><g transform="translate(620 95)">${$("shortsvg").outerHTML}</g></svg>`;
  download("lockaid-layout.svg",svg,"image/svg+xml")
}
function download(name,data,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function label(g,v){return({collar:{crew:"Redonda",v:"V",mandarin:"Mandarim"},sleeve:{short:"Curta",raglan:"Raglan"},fit:{regular:"Regular",athletic:"Athletic",loose:"Loose"},shorts:{basic:"Base",side:"Recorte lateral"}}[g]?.[v]||v)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}function pad(v){return String(v).padStart(2,"0")}function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function escapeHtml(s){return esc(s)}
init();
