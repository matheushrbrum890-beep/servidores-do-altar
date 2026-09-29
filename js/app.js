const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=window.APP_DATA;
const KEY="altar-app-v1";
let state=JSON.parse(localStorage.getItem(KEY)||'{"done":[],"fav":[],"dark":false,"score":null}');
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
if(state.dark) document.body.classList.add("dark");

function yt(url){let m=url.match(/youtu\.be\/([^?]+)/)||url.match(/[?&]v=([^&]+)/);return m?`https://www.youtube.com/embed/${m[1]}`:null}
function pct(){return Math.round(state.done.length/data.modules.length*100)}
function renderNav(){
  $("#sideNav").innerHTML=data.modules.map(m=>`<button class="nav-item" data-route="${m.id}">${m.icon} <span>${m.title}</span></button>`).join("");
  $$(".nav-item").forEach(b=>b.onclick=()=>{location.hash=b.dataset.route;$("#sidebar").classList.remove("open")});
}
function renderHome(filter=""){
 const list=data.modules.filter(m=>(m.title+" "+m.desc+" "+m.content).toLowerCase().includes(filter.toLowerCase()));
 $("#app").innerHTML=`
 <section class="hero" id="inicio">
  <div><div class="eyebrow">PASTORAL SERVIDORES DO ALTAR</div>
  <h1>Formação Litúrgica</h1>
  <p>Estude, pratique e sirva com conhecimento, reverência e organização. Uma plataforma digital para acompanhar sua formação.</p>
  <div class="search"><input id="search" placeholder="🔎 Pesquisar formação, Missal, turíbulo..." value="${filter.replaceAll('"','&quot;')}"><button class="btn primary" id="goQuiz">📝 Fazer quiz</button></div></div>
  <div></div>
 </section>
 <div class="stats">
  <div class="stat"><strong>${data.modules.length}</strong><span>MÓDULOS</span></div>
  <div class="stat"><strong>${pct()}%</strong><span>FORMAÇÃO CONCLUÍDA</span></div>
  <div class="stat"><strong>${state.fav.length}</strong><span>FAVORITOS</span></div>
 </div>
 <div class="section-head"><div><h2>📚 Trilha de formação</h2><p>${list.length} conteúdo(s) encontrado(s)</p></div></div>
 <div class="grid">${list.map(card).join("")||`<div class="empty">Nenhum conteúdo encontrado.</div>`}</div>`;
 $("#search").oninput=e=>renderHome(e.target.value);
 $("#goQuiz").onclick=()=>location.hash="quiz";
 $$(".card").forEach(c=>c.onclick=e=>{if(e.target.closest(".star"))return;location.hash=c.dataset.id});
 $$(".star").forEach(s=>s.onclick=e=>{e.stopPropagation();toggleFav(s.dataset.id)});
}
function card(m){
 const done=state.done.includes(m.id), fav=state.fav.includes(m.id);
 return `<article class="card" data-id="${m.id}"><button class="star" data-id="${m.id}" title="Favorito">${fav?"⭐":"☆"}</button><div class="icon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p><span class="tag">${done?"CONCLUÍDO":"ESTUDAR"}</span><div class="progress"><i style="width:${done?100:0}%"></i></div></article>`;
}
function toggleFav(id){state.fav=state.fav.includes(id)?state.fav.filter(x=>x!==id):[...state.fav,id];save();route()}
function renderModule(id){
 const m=data.modules.find(x=>x.id===id); if(!m)return renderHome();
 const done=state.done.includes(id);
 const videos=m.videos.map(v=>{let e=yt(v[1]);return e?`<div class="video"><iframe src="${e}" title="${v[0]}" loading="lazy" allowfullscreen></iframe><div class="video-info"><strong>${v[0]}</strong></div></div>`:`<div class="video"><div class="video-info"><strong>${v[0]}</strong><br><a class="video-link" target="_blank" rel="noopener" href="${v[1]}">Abrir conteúdo ↗</a></div></div>`}).join("");
 $("#app").innerHTML=`<article class="module-page"><button class="back" onclick="location.hash='inicio'">← Voltar para a formação</button>
 <div class="module-title"><span class="big">${m.icon}</span><div><h1>${m.title}</h1><p>${m.desc}</p></div></div>
 <div class="notice">🟨 <strong>Orientação da comunidade:</strong> quando o manual registrar uma prática específica da comunidade, ela deve ser entendida como orientação local e não automaticamente como regra geral para todas as paróquias.</div>
 <div class="content">${m.content}</div>
 ${videos?`<div class="section-head"><div><h2>🎥 Formações em vídeo</h2><p>Conteúdos indicados no manual.</p></div></div><div class="video-grid">${videos}</div>`:""}
 <div class="section-head"><div><h2>✅ Seu progresso</h2><p>${done?"Módulo concluído":"Marque como concluído após estudar"}</p></div></div>
 <button class="btn ${done?"secondary":"primary"}" id="doneBtn">${done?"↩ Marcar como não concluído":"✓ Marcar módulo como concluído"}</button>
 <button class="btn secondary" id="favModule"> ${state.fav.includes(id)?"⭐ Remover favorito":"☆ Adicionar aos favoritos"}</button>
 </article>`;
 $("#doneBtn").onclick=()=>{state.done=done?state.done.filter(x=>x!==id):[...state.done,id];save();route()};
 $("#favModule").onclick=()=>toggleFav(id);
}
function renderQuiz(){
 let answers={};
 $("#app").innerHTML=`<section class="module-page"><button class="back" onclick="location.hash='inicio'">← Voltar</button><div class="module-title"><span class="big">📝</span><div><h1>Quiz de Formação</h1><p>Teste seus conhecimentos com base no manual.</p></div></div><div id="quizForm"></div><button class="btn primary" id="finish">Finalizar quiz</button><div id="result"></div></section>`;
 $("#quizForm").innerHTML=data.quiz.map((q,i)=>`<div class="quiz-q"><h3>${i+1}. ${q[0]}</h3>${q[1].map((o,j)=>`<button class="option" data-q="${i}" data-a="${j}">${String.fromCharCode(65+j)}) ${o}</button>`).join("")}</div>`).join("");
 $$(".option").forEach(b=>b.onclick=()=>{answers[b.dataset.q]=+b.dataset.a;$$(`.option[data-q="${b.dataset.q}"]`).forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
 $("#finish").onclick=()=>{let score=data.quiz.reduce((n,q,i)=>n+(answers[i]===q[2]?1:0),0);state.score=score;save();$("#result").innerHTML=`<div class="notice"><strong>Resultado: ${score}/${data.quiz.length}</strong><br>${score>=8?"Excelente! Revise os módulos que ainda não concluiu.":score>=6?"Bom resultado. Continue estudando e tente novamente.":"Vale uma revisão. Volte aos módulos e faça o quiz novamente."}</div>`};
}
function renderCalendar(){
 $("#app").innerHTML=`<section class="module-page"><button class="back" onclick="location.hash='inicio'">← Voltar</button><div class="module-title"><span class="big">🗓️</span><div><h1>Ano Litúrgico</h1><p>Visão geral dos tempos citados no manual.</p></div></div><div class="calendar">
 <div class="season s1"><span>Advento</span><small>Preparação</small></div>
 <div class="season s2"><span>Natal</span><small>Nascimento do Senhor</small></div>
 <div class="season s3"><span>Quaresma</span><small>Penitência e preparação</small></div>
 <div class="season s4"><span>Semana Santa</span><small>Mistério Pascal</small></div>
 <div class="season s5"><span>Páscoa</span><small>Ressurreição</small></div>
 <div class="season s6"><span>Tempo Comum</span><small>Esperança e caminhada</small></div>
 </div><div class="notice">O manual apresenta esses tempos como visão geral. Para datas e celebrações específicas, consulte o calendário/diretório litúrgico utilizado pela sua comunidade.</div></section>`;
}
function renderMaterials(){
 const m=data.modules.find(x=>x.id==="materiais");
 $("#app").innerHTML=`<section class="module-page"><button class="back" onclick="location.hash='inicio'">← Voltar</button><div class="module-title"><span class="big">🗂️</span><div><h1>Materiais</h1><p>Área preparada para receber PDFs, apostilas e arquivos.</p></div></div><div class="materials-box"><div class="panel"><h3>📚 Arquivos de formação</h3><p>Você pode adicionar aqui materiais sobre Missas, tempos litúrgicos, cores, símbolos, solenidades, festas e memórias.</p></div><div class="panel"><h3>📱 Apoio complementar</h3><p><a target="_blank" href="https://www.instagram.com/cerimoniarios12/">cerimoniarios12 ↗</a><br><a target="_blank" href="https://www.instagram.com/michelpag/">michelpag ↗</a></p></div></div></section>`;
}
function route(){
 renderNav();let r=location.hash.slice(1)||"inicio";
 if(r==="inicio")renderHome();
 else if(r==="quiz")renderQuiz();
 else if(r==="calendario")renderCalendar();
 else if(r==="materiais")renderMaterials();
 else renderModule(r);
}
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#themeBtn").onclick=()=>{state.dark=!state.dark;document.body.classList.toggle("dark",state.dark);save()};
$("#favBtn").onclick=()=>{let f=data.modules.filter(m=>state.fav.includes(m.id));renderHome("");setTimeout(()=>{if(!f.length)alert("Você ainda não tem favoritos.");else alert("Seus favoritos: "+f.map(x=>x.title).join(", "));},10)};
window.addEventListener("hashchange",route);route();
