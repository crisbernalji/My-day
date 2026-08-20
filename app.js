const KEY='my-day-state-v5';
const SUBJECTS=['Matemáticas','Lengua','Química','Biología','Inglés','Filosofía','Historia'];
const DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const state=JSON.parse(localStorage.getItem(KEY)||'null')||{
  events:[], outfits:[], routines:[], tasks:[], schedule:{}, favorites:[],
  theme:'pastel', tab:'home', grades:[], reviewDates:[], routineLibrary:[], routineLogs:{}
};
const app=document.getElementById('app'), modal=document.getElementById('modal');

let viewDate=new Date(); if(viewDate.getFullYear()<2026)viewDate=new Date(2026,0,1);
let outfitWeek=new Date();
let studyDate=iso(new Date());
let wardrobeSeason='Verano';
let wardrobeOccasion='Todas';
let wardrobeSearchQuery='';

// Pomodoro
let pomodoroTime = 25 * 60, pomodoroTimer = null;

function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function iso(d){return new Date(d).toISOString().slice(0,10)}
function fmt(d){return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()}
function toast(t){const x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2500)}
function setTab(t){state.tab=t;save();document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));render()}
function btn(t,cls='btn btn-primary',attr=''){return `<button class="${cls}" ${attr}>${t}</button>`}
function pageTitle(k,title,sub){return `<div class="section-title"><div><h2>${title}</h2><span>${sub||''}</span></div></div>`}

// --- SECCIONES ---

function home(){
 const today=iso(new Date()), ev=state.events.filter(e=>e.date===today).length, tasks=state.tasks.filter(t=>t.date===today&&!t.done).length, done=state.routines.filter(r=>r.date===today&&r.done).length;
 return `<section class="hero"><div class="eyebrow">My Day ✦ ${fmt(new Date())}</div><h1>Tu día, tu estilo.</h1><p>Organiza tus looks, fechas, rutinas, clases y tardes de estudio en un solo lugar.</p><div class="hero-actions">${btn('＋ Añadir algo','btn btn-primary','data-action="quick-add"')}${btn('🔔 Recordatorios','btn btn-soft','data-action="notify"')}</div></section>
 ${pageTitle('','Hoy','Tu pequeño panel de control')}
 <div class="stats"><div class="stat"><b>${ev}</b><small>eventos hoy</small></div><div class="stat"><b>${tasks}</b><small>tareas pendientes</small></div><div class="stat"><b>${done}</b><small>rutinas hechas</small></div></div>
 ${pageTitle('','Tu My Day','Cinco rincones para tenerlo todo bajo control')}
 <div class="grid">
 ${feature('👗','Ropa','Buscador en vivo, armario cápsula y lavadora.','wardrobe')}
 ${feature('📅','Calendario','Eventos organizados por meses.','calendar')}
 ${feature('🧴','Rutina','Habit Tracker en cuadrícula mensual.','routine')}
 ${feature('🕰️','Horario','Tu horario semanal de Bachiller.','schedule')}
 ${feature('📚','Estudios','Pomodoro, notas por 3 evaluaciones y repasos.','study')}
 </div><div class="footer-note">🎞️ ⭐️ 🎨 💅🏼 🪩 🍸 🌊 🐆 · My Day</div>`;
}
function feature(e,t,p,tab){return `<div class="card feature" data-tab-go="${tab}"><div class="emoji">${e}</div><h3>${t}</h3><p>${p}</p></div>`}

function wardrobe(){
  const monday=new Date(outfitWeek); monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const days=Array.from({length:7},(_,i)=>new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i));
  
  const query=wardrobeSearchQuery.trim().toLowerCase();
  const filteredOutfits=state.outfits.filter(o=>{
    if((o.season||'Verano') !== wardrobeSeason) return false;
    if(wardrobeOccasion !== 'Todas' && (o.occasion||'Casual') !== wardrobeOccasion) return false;
    if(!query) return true;
    return (o.name||'').toLowerCase().includes(query) || (o.items||'').toLowerCase().includes(query);
  });
  
  const laundryList = state.outfits.filter(o => o.inLaundry);

  return `${pageTitle('','👗 Ropa y Estilo','Buscador, armario cápsula, lavadora y recuento de uso')}
<div class="toolbar">${btn('‹','btn','data-action="outfit-prev"')}${btn('Esta semana','btn','data-action="outfit-now"')}${btn('›','btn','data-action="outfit-next"')}${btn('＋ Añadir conjunto','btn btn-primary','data-action="add-outfit"')}</div>
<div class="week-grid" style="margin-top:14px">${days.map((d,i)=>{const ds=iso(d), os=state.outfits.filter(o=>o.date===ds);return `<div class="week-col"><h4>${DAYS[i]} · ${d.getDate()}/${d.getMonth()+1}</h4>${os.length?os.map(o=>`<div class="outfit" style="${o.inLaundry?'opacity:0.5;border:1px dashed var(--pink)':''}"><strong>${esc(o.name)} ${o.inLaundry?'🧺':''}</strong><small>${esc(o.items||'Sin prendas')}</small><div style="margin-top:7px;display:flex;gap:4px"><button class="circle-btn" style="width:auto;padding:0 8px;height:28px;font-size:11px" data-action="wear-outfit" data-id="${o.id}">👕 ${o.uses||0} usos</button><button class="circle-btn" style="width:28px;height:28px;font-size:12px" data-action="toggle-laundry" data-id="${o.id}">${o.inLaundry?'🧼':'🧺'}</button></div></div>`).join(''):'<div class="empty">Sin conjunto ✦</div>'}</div>`}).join('')}</div>

${pageTitle('','🧺 Zona de Lavadora / Colada', 'Ropa en la colada (no disponible)')}
${laundryList.length?`<div class="list">${laundryList.map(o=>`<div class="item"><div class="item-main"><strong>🧺 ${esc(o.name)}</strong><small>${esc(o.items)}</small></div><button class="btn" data-action="toggle-laundry" data-id="${o.id}">🧼 Sacar de la lavadora</button></div>`).join('')}</div>`:'<div class="empty">La lavadora está vacía. Toda tu ropa está lista para usar.</div>'}

${pageTitle('','🗄️ Armario Virtual Completo','Busca y filtra tus prendas')}
<div class="card" style="margin-bottom:12px">
  <input class="input" id="wardrobeSearch" placeholder="🔍 Buscar por ropa, look o prenda (ej: jeans, top...)" value="${esc(wardrobeSearchQuery)}">
</div>
<div class="toolbar" style="margin-bottom:8px">
  ${btn('☀️ Verano', wardrobeSeason==='Verano'?'btn btn-primary':'btn','data-action="set-season" data-season="Verano"')}
  ${btn('❄️ Invierno', wardrobeSeason==='Invierno'?'btn btn-primary':'btn','data-action="set-season" data-season="Invierno"')}
</div>
${filteredOutfits.length?`<div class="list">${filteredOutfits.map(o=>`<div class="item"><div class="item-main"><strong>${esc(o.name)} ${o.inLaundry?'(En lavadora 🧺)':''}</strong><small>Prendas: ${esc(o.items||'Sin detallar')} · 📌 ${esc(o.occasion||'Casual')} · <b>Puesto ${o.uses||0} veces</b></small></div><button class="btn" data-action="wear-outfit" data-id="${o.id}">＋1 Uso</button><button class="btn btn-soft" data-action="toggle-laundry" data-id="${o.id}">${o.inLaundry?'🧼 Sacar':'🧺 Lavar'}</button></div>`).join('')}</div>`:'<div class="empty">No se encontraron prendas con la búsqueda aplicada.</div>'}`;
}

function calendar(){
  const y=viewDate.getFullYear(),m=viewDate.getMonth(),first=new Date(y,m,1),start=(first.getDay()+6)%7,last=new Date(y,m+1,0).getDate(),cells=[];
  for(let i=0;i<start;i++)cells.push(null);
  for(let d=1;d<=last;d++)cells.push(new Date(y,m,d));
  while(cells.length%7)cells.push(null);
  const monthName=new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(viewDate);
  const currentMonthKey = `${y}-${String(m+1).padStart(2,'0')}`;
  const monthEvents = state.events.filter(e => e.date.startsWith(currentMonthKey));

  return `${pageTitle('','📅 Calendario','Eventos organizados por meses')}
<div class="calendar-head">${btn('‹','btn','data-action="cal-prev"')}<h3 style="text-transform:capitalize;margin:0;font-family:Georgia,serif">${monthName}</h3>${btn('›','btn','data-action="cal-next"')}</div>
<div class="calendar-grid">${DAYS.map(d=>`<div class="dow">${d}</div>`).join('')}${cells.map(d=>{if(!d)return '<div></div>';const ds=iso(d),es=state.events.filter(e=>e.date===ds);const today=ds===iso(new Date());return `<div class="day ${today?'today':''}" data-action="day-click" data-date="${ds}"><div class="daynum">${d.getDate()}</div><div class="dots">${es.map(e=>`<span class="dot" style="background:${e.color}"></span>`).join('')}</div></div>`}).join('')}</div>
${pageTitle('','Eventos de este mes','')}
${monthEvents.length?`<div class="list">${monthEvents.map(e=>`<div class="event-row"><span class="color-dot" style="background:${e.color}"></span><div class="item-main"><strong>${esc(e.title)}</strong><small>${fmt(e.date)} ${e.time||''}</small></div><button class="circle-btn" data-action="delete-event" data-id="${e.id}">×</button></div>`).join('')}</div>`:'<div class="empty">No hay eventos guardados este mes.</div>'}`;
}

function routine(){
  const today=iso(new Date());
  let rs=state.routines.filter(r=>r.date===today);
  const y=viewDate.getFullYear(), m=viewDate.getMonth(), last=new Date(y,m+1,0).getDate();
  const gridDays = Array.from({length:last},(_,i)=> {
    const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
    return { day: i+1, date: dStr, status: state.routineLogs[dStr] };
  });

  return `${pageTitle('','🧴 Rutina y Hábitos','Biblioteca de rutinas y Habit Tracker en cuadrícula')}
<div class="toolbar">${btn('＋ Añadir tarea hoy','btn btn-primary','data-action="add-routine"')}${btn('📚 Biblioteca de Rutinas','btn btn-soft','data-action="open-library"')}</div>

<div class="list" style="margin-top:14px">
  ${rs.length?rs.map(r=>`<div class="item"><input class="checkbox" type="checkbox" ${r.done?'checked':''} data-action="toggle-routine" data-id="${r.id}"><div class="item-main"><strong style="text-decoration:${r.done?'line-through':'none'}">${esc(r.title)}</strong></div><button class="circle-btn" data-action="delete-routine" data-id="${r.id}">×</button></div>`).join(''):'<div class="empty">Sin tareas en la rutina de hoy.</div>'}
</div>

${pageTitle('','📊 Habit Tracker Mensual','🟢 Cumplido · 🔴 Incompleto / No hecho')}
<div class="card">
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center">
    ${gridDays.map(d=>{
      let bg = '#eee';
      if(d.status === true) bg = '#87e1b5';
      else if(d.status === false) bg = '#ff9aa2';
      const isToday = d.date === today;
      return `<div style="background:${bg};padding:10px 2px;border-radius:8px;font-size:12px;font-weight:bold;${isToday?'border:2px solid var(--pink)':''}" title="${d.date}">${d.day}</div>`;
    }).join('')}
  </div>
  <div class="toolbar" style="margin-top:14px;justify-content:center">
    ${btn('🟢 Marcar HOY Cumplido','btn','data-action="mark-tracker" data-status="true"')}
    ${btn('🔴 Marcar HOY Incompleto','btn','data-action="mark-tracker" data-status="false"')}
  </div>
</div>`;
}

function schedule(){const times=['8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00'];const weekdays=['Lunes','Martes','Miércoles','Jueves','Viernes'];return `${pageTitle('','🕰️ Horario','Tu semana escolar')}${btn('＋ Añadir clase','btn btn-primary','data-action="add-class"')}<div class="schedule-wrap" style="margin-top:14px"><div class="schedule-table"><div class="slot header">Hora</div>${weekdays.map(d=>`<div class="slot header">${d}</div>`).join('')}${times.map(t=>`<div class="slot time">${t}</div>${weekdays.map(d=>{const key=d+'|'+t,s=state.schedule[key];return `<div class="slot" data-action="edit-class" data-key="${esc(key)}" style="${s?'background:'+s.color:''}">${s?`<strong>${esc(s.subject)}</strong><br><small>${esc(s.room||'')}</small>`:'＋'}</div>`}).join('')}`).join('')}</div></div>`}

function study(){
  const dayTasks=state.tasks.filter(t=>t.date===studyDate);
  const mins = Math.floor(pomodoroTime / 60), secs = String(pomodoroTime % 60).padStart(2, '0');

  // Cálculo de notas por las 3 Evaluaciones por asignatura
  let totalSubjectAveragesSum = 0;
  let activeSubjectsCount = 0;

  const subjectCardsHtml = SUBJECTS.map(sub => {
    const e1Grades = state.grades.filter(g => g.subject === sub && String(g.eval) === '1');
    const e2Grades = state.grades.filter(g => g.subject === sub && String(g.eval) === '2');
    const e3Grades = state.grades.filter(g => g.subject === sub && String(g.eval) === '3');

    const calcAvg = (arr) => arr.length ? (arr.reduce((a,b)=>a+Number(b.score),0)/arr.length) : null;

    const avg1 = calcAvg(e1Grades);
    const avg2 = calcAvg(e2Grades);
    const avg3 = calcAvg(e3Grades);

    // Media de las tres evaluaciones para esta asignatura
    const evAvgs = [avg1, avg2, avg3].filter(v => v !== null);
    const finalSubjectAvg = evAvgs.length ? (evAvgs.reduce((a,b)=>a+b,0) / evAvgs.length).toFixed(2) : '-';

    if(evAvgs.length) {
      totalSubjectAveragesSum += Number(finalSubjectAvg);
      activeSubjectsCount++;
    }

    return `<div class="card">
      <strong style="font-size:16px">${sub}</strong>
      <div style="font-size:22px;font-weight:bold;color:var(--pink);margin:4px 0">Nota Final: ${finalSubjectAvg}</div>
      <div style="font-size:12px;color:#666">
        1ª Eval: <b>${avg1 !== null ? avg1.toFixed(1) : '-'}</b> | 
        2ª Eval: <b>${avg2 !== null ? avg2.toFixed(1) : '-'}</b> | 
        3ª Eval: <b>${avg3 !== null ? avg3.toFixed(1) : '-'}</b>
      </div>
    </div>`;
  }).join('');

  const courseGlobalAvg = activeSubjectsCount ? (totalSubjectAveragesSum / activeSubjectsCount).toFixed(2) : '-';

  return `${pageTitle('','📚 Estudios','Pomodoro, notas por evaluación y calendario de repasos')}
<div class="toolbar">${btn('＋ Tarea hoy','btn btn-primary','data-action="add-task"')}${btn('＋ Añadir Nota Examen','btn','data-action="add-grade"')}${btn('📖 Programar Repaso','btn btn-soft','data-action="add-review"')}</div>

<div class="card text-center" style="margin-top:14px;padding:24px">
  <h3>⏱️ Temporizador Pomodoro</h3>
  <div style="font-size:64px;font-weight:bold;font-family:Georgia,serif;color:var(--pink);margin:10px 0">${mins}:${secs}</div>
  <div class="toolbar" style="justify-content:center">
    ${btn(pomodoroTimer ? '⏸️ Pausar' : '▶️ Empezar', 'btn btn-primary', 'data-action="toggle-pomodoro"')}
    ${btn('🔄 Reiniciar', 'btn btn-soft', 'data-action="reset-pomodoro"')}
  </div>
</div>

${pageTitle('','📊 Control de Notas (1ª, 2ª y 3ª Evaluación)', `Media Curso: ${courseGlobalAvg}`)}
<div class="grid">${subjectCardsHtml}</div>

${pageTitle('','📖 Calendario de Repasos Programados','Organiza qué repasar cada día')}
${state.reviewDates.length?`<div class="list">${state.reviewDates.map(r=>`<div class="item"><div class="item-main"><strong>📖 ${esc(r.subject)} - ${esc(r.topic)}</strong><small>📅 Fecha: ${fmt(r.date)}</small></div><button class="circle-btn" data-action="delete-review" data-id="${r.id}">×</button></div>`).join('')}</div>`:'<div class="empty">No tienes repasos programados por el momento.</div>'}

${pageTitle('','Agenda de Tareas Diarias', fmt(studyDate))}
<div class="list">${dayTasks.length?dayTasks.map(t=>`<div class="item"><input class="checkbox" type="checkbox" ${t.done?'checked':''} data-action="toggle-task" data-id="${t.id}"><div class="item-main"><strong>${esc(t.title)}</strong><small>${esc(t.subject)}</small></div></div>`).join(''):'<div class="empty">Sin tareas registradas para hoy.</div>'}`;
}

// --- LOGICA DE EVENTOS ---

function applyTheme(){ document.documentElement.setAttribute('data-theme', state.theme || 'pastel'); }
function render(){ applyTheme(); if(state.tab==='home')app.innerHTML=home(); else if(state.tab==='wardrobe')app.innerHTML=wardrobe(); else if(state.tab==='calendar')app.innerHTML=calendar(); else if(state.tab==='routine')app.innerHTML=routine(); else if(state.tab==='schedule')app.innerHTML=schedule(); else app.innerHTML=study(); }

function openModal(title,body){modal.innerHTML=`<div class="sheet"><div class="sheet-head"><h2>${title}</h2><button class="close" data-action="close">×</button></div><div style="margin-top:16px">${body}</div></div>`;modal.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden');modal.innerHTML=''}

function quickAdd(){openModal('Añadir a My Day',`<div class="grid"><div class="card feature" data-quick-go="wardrobe"><div class="emoji">👗</div><h3>Outfit</h3></div><div class="card feature" data-quick-go="calendar"><div class="emoji">📅</div><h3>Evento</h3></div><div class="card feature" data-quick-go="routine"><div class="emoji">✓</div><h3>Rutina</h3></div><div class="card feature" data-quick-go="study"><div class="emoji">📚</div><h3>Tarea</h3></div></div>`);}

function addOutfit(){openModal('Nuevo conjunto',`<form id="outfitForm"><div class="form-grid"><div class="full"><label class="label">Nombre look</label><input class="input" name="name" required placeholder="Look clase"></div><div class="full"><label class="label">Prendas</label><textarea class="textarea" name="items" placeholder="Jeans, camiseta blanca, zapatillas..."></textarea></div><div><label class="label">Temporada</label><select class="select" name="season"><option value="Verano">☀️ Verano</option><option value="Invierno">❄️ Invierno</option></select></div><div><label class="label">Ocasión</label><select class="select" name="occasion"><option>Casual</option><option>Clase</option><option>Fiesta</option><option>Deporte</option></select></div><div><label class="label">Fecha</label><input class="input" type="date" name="date" value="${iso(new Date())}"></div></div><div style="margin-top:14px">${btn('Guardar','btn btn-primary','type="submit"')}</div></form>`)}
function formEvent(date=''){openModal('Añadir evento',`<form id="eventForm"><div class="form-grid"><div class="full"><label class="label">Nombre</label><input class="input" name="title" required placeholder="Evento"></div><div><label class="label">Fecha</label><input class="input" type="date" name="date" value="${date||iso(new Date())}"></div><div><label class="label">Color</label><input class="color-input" type="color" name="color" value="#e98fae"></div></div><div style="margin-top:14px">${btn('Guardar','btn btn-primary','type="submit"')}</div></form>`)}
function addRoutine(){openModal('Nueva rutina hoy',`<form id="routineForm"><div class="form-grid"><div class="full"><label class="label">Tarea / Hábito</label><input class="input" name="title" required></div></div><div style="margin-top:14px">${btn('Guardar','btn btn-primary','type="submit"')}</div></form>`)}
function addTask(){openModal('Nueva tarea',`<form id="taskForm"><div class="form-grid"><div class="full"><label class="label">Tarea</label><input class="input" name="title" required></div><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label class="label">Fecha</label><input class="input" type="date" name="date" value="${studyDate}"></div></div><div style="margin-top:14px">${btn('Guardar','btn btn-primary','type="submit"')}</div></form>`)}

app.addEventListener('input',e=>{
  if(e.target.id==='wardrobeSearch'){
    wardrobeSearchQuery=e.target.value;
    render();
    const input=document.getElementById('wardrobeSearch');
    if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
  }
});

app.addEventListener('click',e=>{
  const qBtn = e.target.closest('[data-quick-go]');
  if(qBtn){
    const targetTab = qBtn.dataset.quickGo; closeModal(); setTab(targetTab);
    if(targetTab === 'wardrobe') addOutfit(); else if(targetTab === 'calendar') formEvent(); else if(targetTab === 'routine') addRoutine(); else if(targetTab === 'study') addTask(); return;
  }
  const b=e.target.closest('[data-action],[data-tab-go]'); if(!b)return; const a=b.dataset.action;
  if(b.dataset.tabGo){setTab(b.dataset.tabGo);return}
  if(a==='close'){closeModal();return}
  if(a==='quick-add')quickAdd();
  else if(a==='set-season'){wardrobeSeason=b.dataset.season;render()}
  else if(a==='add-outfit')addOutfit();
  else if(a==='wear-outfit'){const o=state.outfits.find(x=>x.id===b.dataset.id);if(o){o.uses=(o.uses||0)+1;save();render();toast('¡Uso registrado!')}}
  else if(a==='toggle-laundry'){const o=state.outfits.find(x=>x.id===b.dataset.id);if(o){o.inLaundry=!o.inLaundry;save();render();toast(o.inLaundry?'En lavadora 🧺':'Disponible 🧼')}}
  else if(a==='cal-prev'){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);render()}
  else if(a==='cal-next'){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);render()}
  else if(a==='day-click')formEvent(b.dataset.date);
  else if(a==='delete-event'){state.events=state.events.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='add-routine')addRoutine();
  else if(a==='toggle-routine'){const r=state.routines.find(x=>x.id===b.dataset.id);if(r){r.done=b.checked;save()}}
  else if(a==='delete-routine'){state.routines=state.routines.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='mark-tracker'){state.routineLogs[iso(new Date())] = (b.dataset.status === 'true'); save(); render(); toast('Día guardado en el tracker');}
  else if(a==='open-library'){
    openModal('📚 Biblioteca de Rutinas',`
      <form id="libForm"><div class="form-grid"><div class="full"><input class="input" name="title" placeholder="Ej: Rutina Skincare Noche" required></div></div><div style="margin-top:8px">${btn('Guardar plantilla','btn btn-primary','type="submit"')}</div></form>
      <div class="list" style="margin-top:14px">
        ${state.routineLibrary.length?state.routineLibrary.map(item=>`<div class="item"><div class="item-main"><strong>${esc(item.title)}</strong></div><button class="btn" data-action="use-lib" data-title="${esc(item.title)}">＋ Usar hoy</button></div>`).join(''):'<div class="empty">Sin rutinas plantilla.</div>'}
      </div>
    `);
  }
  else if(a==='use-lib'){state.routines.push({id:uid(),title:b.dataset.title,date:iso(new Date()),done:false});save();closeModal();render();toast('¡Añadida hoy!');}
  else if(a==='add-task')addTask();
  else if(a==='toggle-task'){const t=state.tasks.find(x=>x.id===b.dataset.id);if(t){t.done=b.checked;save()}}
  else if(a==='add-grade'){
    openModal('Añadir Nota de Examen',`<form id="gradeForm"><div class="form-grid"><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label class="label">Evaluación</label><select class="select" name="eval"><option value="1">1ª Eval</option><option value="2">2ª Eval</option><option value="3">3ª Eval</option></select></div><div class="full"><label class="label">Nota (0-10)</label><input class="input" type="number" step="0.1" name="score" required></div></div><div style="margin-top:14px">${btn('Guardar Nota','btn btn-primary','type="submit"')}</div></form>`);
  }
  else if(a==='add-review'){
    openModal('Programar Repaso',`<form id="reviewForm"><div class="form-grid"><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div class="full"><label class="label">Tema / Contenido</label><input class="input" name="topic" placeholder="Ej: Tema 2 - Derivadas" required></div><div class="full"><label class="label">Fecha de repaso</label><input class="input" type="date" name="date" value="${iso(new Date())}" required></div></div><div style="margin-top:14px">${btn('Guardar Repaso','btn btn-primary','type="submit"')}</div></form>`);
  }
  else if(a==='delete-review'){state.reviewDates=state.reviewDates.filter(x=>x.id!==b.dataset.id);save();render();}
  else if(a==='toggle-pomodoro'){
    if(pomodoroTimer){clearInterval(pomodoroTimer);pomodoroTimer=null;}
    else{pomodoroTimer=setInterval(()=>{if(pomodoroTime>0){pomodoroTime--;render();}else{clearInterval(pomodoroTimer);pomodoroTimer=null;render();}},1000);}
    render();
  }
  else if(a==='reset-pomodoro'){if(pomodoroTimer){clearInterval(pomodoroTimer);pomodoroTimer=null;}pomodoroTime=25*60;render();}
});

modal.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,fd=new FormData(f);
  if(f.id==='outfitForm'){state.outfits.push({id:uid(),name:fd.get('name'),items:fd.get('items'),season:fd.get('season'),occasion:fd.get('occasion'),date:fd.get('date'),uses:0,inLaundry:false});save();closeModal();render();}
  else if(f.id==='eventForm'){state.events.push({id:uid(),title:fd.get('title'),date:fd.get('date'),color:fd.get('color')});save();closeModal();render();}
  else if(f.id==='routineForm'){state.routines.push({id:uid(),title:fd.get('title'),date:iso(new Date()),done:false});save();closeModal();render();}
  else if(f.id==='libForm'){state.routineLibrary.push({id:uid(),title:fd.get('title')});save();closeModal();render();toast('Guardada en biblioteca');}
  else if(f.id==='taskForm'){state.tasks.push({id:uid(),title:fd.get('title'),subject:fd.get('subject'),date:fd.get('date'),done:false});save();closeModal();render();}
  else if(f.id==='gradeForm'){state.grades.push({id:uid(),subject:fd.get('subject'),eval:fd.get('eval'),score:fd.get('score')});save();closeModal();render();}
  else if(f.id==='reviewForm'){state.reviewDates.push({id:uid(),subject:fd.get('subject'),topic:fd.get('topic'),date:fd.get('date')});save();closeModal();render();}
});

document.getElementById('settingsBtn').addEventListener('click',()=>openModal('⚙️ Configuración',`
  <div class="card"><h3>🎨 Tema de color</h3>
    <div class="toolbar" style="margin-top:10px">
      ${btn('🌸 Pastel', 'btn', 'data-action="set-theme" data-theme="pastel"')}
      ${btn('🌙 Noche', 'btn', 'data-action="set-theme" data-theme="dark"')}
      ${btn('✨ Coquette', 'btn', 'data-action="set-theme" data-theme="coquette"')}
      ${btn('☁️ Minimal', 'btn', 'data-action="set-theme" data-theme="minimal"')}
    </div>
  </div>
  <div class="card" style="margin-top:12px"><h3>💾 Copia de Seguridad</h3>${btn('📥 Exportar datos', 'btn', 'data-action="export-data"')}</div>
  <div class="card danger-card" style="margin-top:12px">${btn('Borrar todo', 'btn danger', 'data-action="wipe"')}</div>
`));

modal.addEventListener('click',e=>{
  if(e.target.closest('[data-action="set-theme"]')){state.theme = e.target.closest('[data-action="set-theme"]').dataset.theme;save();render();closeModal();}
  if(e.target.closest('[data-action="export-data"]')){const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));const a = document.createElement('a'); a.href = dataStr; a.download = `my-day-backup.json`; a.click();}
  if(e.target.closest('[data-action="wipe"]')){if(confirm('¿Borrar todo?')){localStorage.removeItem(KEY);location.reload();}}
});

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
render();
