const KEY='my-day-state-v1';
const SUBJECTS=['Matemáticas','Lengua','Química','Biología','Inglés','Filosofía','Historia'];
const COLORS=['#e98fae','#b8a8df','#9fd9d4','#e8b65b','#9db9e8','#a8c98d','#e5a78e'];
const DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{events:[],outfits:[],routines:[],tasks:[],schedule:{},notes:[],favorites:[],reminders:[],tab:'home'};
const app=document.getElementById('app'), modal=document.getElementById('modal');
let viewDate=new Date(); if(viewDate.getFullYear()<2026)viewDate=new Date(2026,0,1);
let outfitWeek=new Date();
let studyDate=iso(new Date());
let wardrobeSearchQuery='';
let wardrobeSeason='Verano'; // Pestaña por defecto

function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function iso(d){return new Date(d).toISOString().slice(0,10)}
function fmt(d){return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()}
function toast(t){const x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2500)}
function setTab(t){state.tab=t;save();document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));render()}
function btn(t,cls='btn btn-primary',attr=''){return `<button class="${cls}" ${attr}>${t}</button>`}
function pageTitle(k,title,sub){return `<div class="section-title"><div><h2>${title}</h2><span>${sub||''}</span></div></div>`}

function home(){
 const today=iso(new Date()), ev=state.events.filter(e=>e.date===today).length, tasks=state.tasks.filter(t=>t.date===today&&!t.done).length, done=state.routines.filter(r=>r.date===today&&r.done).length;
 return `<section class="hero"><div class="eyebrow">My Day ✦ ${fmt(new Date())}</div><h1>Tu día, tu estilo.</h1><p>Organiza tus looks, fechas, rutinas, clases y tardes de estudio en un solo lugar.</p><div class="hero-actions">${btn('＋ Añadir algo','btn btn-primary','data-action="quick-add"')}${btn('🔔 Activar recordatorios','btn btn-soft','data-action="notify"')}</div></section>
 ${pageTitle('','Hoy','Tu pequeño panel de control')}
 <div class="stats"><div class="stat"><b>${ev}</b><small>eventos hoy</small></div><div class="stat"><b>${tasks}</b><small>tareas pendientes</small></div><div class="stat"><b>${done}</b><small>rutinas hechas</small></div></div>
 ${pageTitle('','Tu My Day','Cinco rincones para tenerlo todo bajo control')}
 <div class="grid">
 ${feature('👗','Ropa','Outfits semanales, armario por temporadas e historial.','wardrobe')}${feature('📅','Calendario','Eventos organizados por meses con colores.','calendar')}${feature('🧴','Rutina','Checklists diarias organizadas manualmente.','routine')}${feature('🕰️','Horario','Tu horario semanal de Bachiller.','schedule')}${feature('📚','Estudios','Agenda diaria, exámenes y apuntes.','study')}
 </div><div class="footer-note">🎞️ ⭐️ 🎨 💅🏼 🪩 🍸 🌊 🐆 · My Day</div>`;
}
function feature(e,t,p,tab){return `<div class="card feature" data-tab-go="${tab}"><div class="emoji">${e}</div><h3>${t}</h3><p>${p}</p></div>`}

function wardrobe(){
  const monday=new Date(outfitWeek); 
  monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const days=Array.from({length:7},(_,i)=>new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i));

  const query=wardrobeSearchQuery.trim().toLowerCase();
  
  // Filtrado por Temporada y Búsqueda de Texto
  const filteredOutfits=state.outfits.filter(o=>{
    const itemSeason = o.season || 'Verano';
    if(itemSeason !== wardrobeSeason) return false;
    if(!query) return true;
    const matchName=(o.name||'').toLowerCase().includes(query);
    const matchContext=(o.context||'').toLowerCase().includes(query);
    return matchName || matchContext;
  });

  return `${pageTitle('','👗 Ropa','Tu armario organizado por semanas y temporadas')}
<div class="toolbar">${btn('‹','btn','data-action="outfit-prev"')}${btn('Esta semana','btn','data-action="outfit-now"')}${btn('›','btn','data-action="outfit-next"')}${btn('＋ Añadir conjunto','btn btn-primary','data-action="add-outfit"')}</div>
<div class="week-grid" style="margin-top:14px">${days.map((d,i)=>{const ds=iso(d), os=state.outfits.filter(o=>o.date===ds);return `<div class="week-col"><h4>${DAYS[i]} · ${d.getDate()}/${d.getMonth()+1}</h4>${os.length?os.map(o=>`<div class="outfit"><strong>${esc(o.name)}</strong><small>${esc(o.context||'Sin etiqueta')} · ${o.season==='Invierno'?'❄️':'☀️'}</small><div style="margin-top:7px"><button class="circle-btn" style="width:28px;height:28px;font-size:12px" data-action="fav-outfit" data-id="${o.id}">${o.favorite?'❤️':'♡'}</button></div></div>`).join(''):'<div class="empty">Sin conjunto ✦</div>'}</div>`}).join('')}</div>

${pageTitle('','🗄️ Armario Virtual Por Temporadas','Filtra y busca tus outfits según la época del año')}

<div class="toolbar" style="margin-bottom:12px">
  ${btn('☀️ Temporada Verano', wardrobeSeason==='Verano'?'btn btn-primary':'btn','data-action="set-season" data-season="Verano"')}
  ${btn('❄️ Temporada Invierno', wardrobeSeason==='Invierno'?'btn btn-primary':'btn','data-action="set-season" data-season="Invierno"')}
</div>

<div class="card" style="margin-bottom:14px">
  <input class="input" type="text" id="wardrobeSearchInput" placeholder="Buscar prenda o concepto en ${wardrobeSeason.toLowerCase()}..." value="${esc(wardrobeSearchQuery)}">
</div>

${filteredOutfits.length?`<div class="list">${filteredOutfits.map(o=>`<div class="item"><div class="item-main"><strong>${esc(o.name)}</strong><small>${fmt(o.date)}${o.context?' · '+esc(o.context):''} · ${o.season==='Invierno'?'❄️ Invierno':'☀️ Verano'}</small></div><button class="circle-btn" style="width:32px;height:32px" data-action="fav-outfit" data-id="${o.id}">${o.favorite?'❤️':'♡'}</button></div>`).join('')}</div>`:'<div class="empty">No se han encontrado outfits guardados en la temporada de '+wardrobeSeason.toLowerCase()+'.</div>'}

${pageTitle('','❤️ Favoritos','Tus looks destacados')}${state.outfits.filter(o=>o.favorite).length?`<div class="list">${state.outfits.filter(o=>o.favorite).map(o=>`<div class="item"><div class="item-main"><strong>${esc(o.name)}</strong><small>${fmt(o.date)} · ${esc(o.context||'')} (${o.season||'Verano'})</small></div><span>❤️</span></div>`).join('')}</div>`:'<div class="empty">Marca tus favoritos y aparecerán aquí.</div>'}
${pageTitle('','🕘 Historial','Semanas anteriores guardadas')}${state.outfits.length?`<div class="list">${[...new Set(state.outfits.map(o=>o.date.slice(0,7)))].sort().reverse().map(m=>`<div class="item"><div class="item-main"><strong>${m}</strong><small>${state.outfits.filter(o=>o.date.startsWith(m)).length} conjuntos guardados</small></div></div>`).join('')}</div>`:'<div class="empty">Tu historial aparecerá cuando guardes looks.</div>'}`}

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
<div class="calendar-grid">${DAYS.map(d=>`<div class="dow">${d}</div>`).join('')}${cells.map(d=>{if(!d)return '<div></div>';const ds=iso(d),es=state.events.filter(e=>e.date===ds);const today=ds===iso(new Date());return `<div class="day ${today?'today':''}" data-action="day-click" data-date="${ds}"><div class="daynum">${d.getDate()}</div><div class="dots">${es.map(e=>`<span class="dot" style="background:${e.color}" title="${esc(e.title)}"></span>`).join('')}</div></div>`}).join('')}</div>
${pageTitle('','Eventos de este mes','Lista detallada del mes en pantalla')}
${monthEvents.length?`<div class="list">${monthEvents.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<div class="event-row"><span class="color-dot" style="background:${e.color}"></span><div class="item-main"><strong>${esc(e.title)}</strong><small>${fmt(e.date)}${e.time?' · '+e.time:''}${e.reminder?' · 🔔 '+e.reminder:''}</small></div><button class="circle-btn" style="width:32px;height:32px" data-action="delete-event" data-id="${e.id}">×</button></div>`).join('')}</div>`:'<div class="empty">No hay eventos guardados en este mes.</div>'}`}

function routine(){
  const today=iso(new Date());
  let rs=state.routines.filter(r=>r.date===today);
  return `${pageTitle('','🧴 Rutina','Checklist diaria manual')}
<div class="toolbar">${btn('＋ Nueva tarea','btn btn-primary','data-action="add-routine"')}${btn('🔔 Recordatorios','btn','data-action="notify"')}</div>
<div class="list" style="margin-top:14px">${rs.length?rs.map(r=>`<div class="item"><input class="checkbox" type="checkbox" ${r.done?'checked':''} data-action="toggle-routine" data-id="${r.id}"><div class="item-main"><strong style="text-decoration:${r.done?'line-through':'none'}">${esc(r.title)}</strong><small>${r.time?'A las '+r.time:'Sin hora'}</small></div><button class="circle-btn" style="width:32px;height:32px" data-action="delete-routine" data-id="${r.id}">×</button></div>`).join(''):'<div class="empty">Añade tus tareas diarias de forma manual para completar tu rutina. ✦</div>'}</div>`;
}

function schedule(){const times=['8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00'];const weekdays=['Lunes','Martes','Miércoles','Jueves','Viernes'];return `${pageTitle('','🕰️ Horario','Tu semana escolar con colores')}${btn('＋ Añadir clase','btn btn-primary','data-action="add-class"')}<div class="schedule-wrap" style="margin-top:14px"><div class="schedule-table"><div class="slot header">Hora</div>${weekdays.map(d=>`<div class="slot header">${d}</div>`).join('')}${times.map(t=>`<div class="slot time">${t}</div>${weekdays.map(d=>{const key=d+'|'+t,s=state.schedule[key];return `<div class="slot" data-action="edit-class" data-key="${esc(key)}" style="${s?'background:'+s.color:''}">${s?`<strong>${esc(s.subject)}</strong><br><small>${esc(s.room||'')}</small>`:'＋'}</div>`}).join('')}`).join('')}</div></div>`}

function study(){
  const dayTasks=state.tasks.filter(t=>t.date===studyDate);
  const isToday = studyDate === iso(new Date());

  return `${pageTitle('','📚 Estudios','Agenda diaria y tareas')}
<div class="toolbar">${btn('＋ Añadir tarea','btn btn-primary','data-action="add-task"')}${btn('📸 Añadir apuntes','btn','data-action="add-note"')}</div>

${pageTitle('','Agenda Diaria', isToday ? 'Mostrando el día de hoy' : fmt(studyDate))}
<div class="card" style="margin-bottom:14px">
  <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap">
    <label class="label" style="margin:0">Seleccionar fecha:</label>
    <input class="input" type="date" id="studyDateInput" value="${studyDate}" style="max-width:200px">
    ${!isToday ? btn('Ir a Hoy','btn btn-soft','data-action="study-go-today"') : ''}
  </div>
</div>

<div class="list">${dayTasks.length?dayTasks.map(t=>`<div class="item"><input class="checkbox" type="checkbox" ${t.done?'checked':''} data-action="toggle-task" data-id="${t.id}"><div class="item-main"><strong style="text-decoration:${t.done?'line-through':'none'}">${esc(t.title)}</strong><small>${esc(t.subject)} · ${t.duration||'Sin duración'}${t.time?' · '+t.time:''}</small></div><button class="circle-btn" style="width:32px;height:32px" data-action="delete-task" data-id="${t.id}">×</button></div>`).join(''):'<div class="empty">No hay tareas de estudio para este día.</div>'}</div>

${pageTitle('','📚 Próximos exámenes','Eventos marcados como examen')}${state.events.filter(e=>e.category==='Examen').length?`<div class="list">${state.events.filter(e=>e.category==='Examen').sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<div class="item reminder"><div class="item-main"><strong>${esc(e.title)}</strong><small>${fmt(e.date)} ${e.time?'· '+e.time:''}</small></div></div>`).join('')}`:'<div class="empty">Todavía no has añadido exámenes.</div>'}
${pageTitle('','📸 Apuntes','Fotografías organizadas')}${state.notes.length?`<div class="photo-grid">${state.notes.map(n=>`<div class="card"><img class="note-thumb" src="${n.data}" alt="Apunte"><strong>${esc(n.title)}</strong><div class="mini-note">${esc(n.subject)}</div><button class="btn" data-action="delete-note" data-id="${n.id}">Eliminar</button></div>`).join('')}</div>`:'<div class="empty">Guarda fotos de tus apuntes aquí.</div>'}
<div class="footer-note">Asignaturas: ${SUBJECTS.join(' · ')}</div>`}

function render(){if(state.tab==='home')app.innerHTML=home();else if(state.tab==='wardrobe')app.innerHTML=wardrobe();else if(state.tab==='calendar')app.innerHTML=calendar();else if(state.tab==='routine')app.innerHTML=routine();else if(state.tab==='schedule')app.innerHTML=schedule();else app.innerHTML=study();}
function openModal(title,body){modal.innerHTML=`<div class="sheet"><div class="sheet-head"><h2>${title}</h2><button class="close" data-action="close">×</button></div><div style="margin-top:16px">${body}</div></div>`;modal.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden');modal.innerHTML=''}

function formEvent(date=''){openModal('Añadir evento',`<form id="eventForm"><div class="form-grid"><div class="full"><label class="label">Nombre</label><input class="input" name="title" required placeholder="Examen de Biología"></div><div><label class="label">Fecha</label><input class="input" type="date" name="date" min="2026-01-01" value="${date||iso(new Date())}" required></div><div><label class="label">Hora</label><input class="input" type="time" name="time"></div><div><label class="label">Categoría</label><select class="select" name="category"><option>Personal</option><option>Examen</option><option>Cumpleaños</option><option>Entrega</option><option>Viaje</option><option>Regla</option><option>Cita</option></select></div><div><label class="label">Color</label><input class="color-input" type="color" name="color" value="#e98fae"></div><div><label class="label">Recordatorio</label><select class="select" name="reminder"><option value="">Sin recordatorio</option><option value="10 min antes">10 min antes</option><option value="1 h antes">1 h antes</option><option value="1 día antes">1 día antes</option></select></div><div class="full"><label class="label">Notas</label><textarea class="textarea" name="notes" placeholder="Detalles..."></textarea></div></div><div style="margin-top:14px">${btn('Guardar evento','btn btn-primary','type="submit"')}</div></form>`)}
function addOutfit(){const d=iso(outfitWeek);openModal('Nuevo conjunto',`<form id="outfitForm"><div class="form-grid"><div class="full"><label class="label">Conjunto</label><textarea class="textarea" name="name" required placeholder="Camiseta blanca + pantalón negro + zapatillas"></textarea></div><div><label class="label">Día</label><input class="input" type="date" name="date" value="${d}"></div><div><label class="label">Temporada</label><select class="select" name="season"><option value="Verano" ${wardrobeSeason==='Verano'?'selected':''}>☀️ Verano</option><option value="Invierno" ${wardrobeSeason==='Invierno'?'selected':''}>❄️ Invierno</option></select></div><div class="full"><label class="label">Contexto</label><input class="input" name="context" placeholder="Examen · informal · fiesta"></div></div><div style="margin-top:14px">${btn('Guardar look','btn btn-primary','type="submit"')}</div></form>`)}
function addRoutine(){openModal('Nueva tarea de rutina',`<form id="routineForm"><div class="form-grid"><div class="full"><label class="label">Qué tienes que hacer</label><input class="input" name="title" required placeholder="Preparar mochila"></div><div><label class="label">Hora</label><input class="input" type="time" name="time"></div><div><label class="label">Repetir</label><select class="select" name="repeat"><option>Hoy</option><option>Todos los días</option></select></div></div><div style="margin-top:14px">${btn('Guardar','btn btn-primary','type="submit"')}</div></form>`)}
function addTask(){openModal('Nueva tarea de estudio',`<form id="taskForm"><div class="form-grid"><div class="full"><label class="label">Tarea</label><input class="input" name="title" required placeholder="Hacer ejercicios de Matemáticas"></div><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label class="label">Fecha</label><input class="input" type="date" name="date" value="${studyDate}" required></div><div><label class="label">Hora</label><input class="input" type="time" name="time"></div><div><label class="label">Duración</label><input class="input" name="duration" placeholder="1 h 30 min"></div></div><div style="margin-top:14px">${btn('Guardar tarea','btn btn-primary','type="submit"')}</div></form>`)}
function addClass(key=''){const [day,time]=key.split('|');openModal('Añadir clase',`<form id="classForm"><input type="hidden" name="key" value="${esc(key)}"><div class="form-grid"><div><label class="label">Día</label><select class="select" name="day">${['Lunes','Martes','Miércoles','Jueves','Viernes'].map(d=>`<option ${d===day?'selected':''}>${d}</option>`).join('')}</select></div><div><label class="label">Hora</label><select class="select" name="time">${['8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00'].map(t=>`<option ${t===time?'selected':''}>${t}</option>`).join('')}</select></div><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label class="label">Color</label><input class="color-input" type="color" name="color" value="#e8b6ca"></div><div class="full"><label class="label">Aula / profesor</label><input class="input" name="room" placeholder="Aula 2 · Profesora Ana"></div></div><div style="margin-top:14px">${btn('Guardar clase','btn btn-primary','type="submit"')}</div></form>`)}
function addNote(){openModal('Añadir foto de apuntes',`<form id="noteForm"><div class="form-grid"><div class="full"><label class="label">Fotos</label><input class="input" type="file" name="files" accept="image/*" multiple required></div><div><label class="label">Asignatura</label><select class="select" name="subject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label class="label">Título</label><input class="input" name="title" placeholder="Tema 3"></div></div><div style="margin-top:14px">${btn('Guardar apuntes','btn btn-primary','type="submit"')}</div></form>`)}

async function requestNotifications(){
  if(!('Notification' in window)){toast('Este navegador no admite notificaciones.');return}
  const p = await Notification.requestPermission();
  if(p === 'granted'){
    toast('🔔 Recordatorios activados correctamente');
    new Notification('My Day ✦',{body:'Los recordatorios están activados para tus eventos y rutinas.',icon:'icons/icon-192.png'});
  } else {
    toast('Permiso de notificaciones denegado.');
  }
}

function checkRemindersAndNotify(){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const todayStr = iso(now);
  const curHours = String(now.getHours()).padStart(2,'0');
  const curMins = String(now.getMinutes()).padStart(2,'0');
  const nowTimeStr = `${curHours}:${curMins}`;

  state.events.forEach(e => {
    if(e.date === todayStr && e.time === nowTimeStr && !e.notified){
      new Notification(`Recordatorio My Day: ${e.title}`, { body: e.notes || `Tienes programado: ${e.title}`, icon: 'icons/icon-192.png' });
      e.notified = true;
      save();
    }
  });

  state.routines.forEach(r => {
    if(r.date === todayStr && r.time === nowTimeStr && !r.done && !r.notified){
      new Notification(`Rutina My Day: ${r.title}`, { body: `Es hora de tu rutina: ${r.title}`, icon: 'icons/icon-192.png' });
      r.notified = true;
      save();
    }
  });
}
setInterval(checkRemindersAndNotify, 30000);

function quickAdd(){
  openModal('Añadir a My Day',`
    <div class="grid">
      <div class="card feature" data-quick-go="wardrobe"><div class="emoji">👗</div><h3>Outfit</h3></div>
      <div class="card feature" data-quick-go="calendar"><div class="emoji">📅</div><h3>Evento</h3></div>
      <div class="card feature" data-quick-go="routine"><div class="emoji">✓</div><h3>Rutina</h3></div>
      <div class="card feature" data-quick-go="study"><div class="emoji">📚</div><h3>Tarea</h3></div>
    </div>
  `);
}

app.addEventListener('click',e=>{
  const qBtn = e.target.closest('[data-quick-go]');
  if(qBtn){
    const targetTab = qBtn.dataset.quickGo;
    closeModal();
    setTab(targetTab);
    if(targetTab === 'wardrobe') addOutfit();
    else if(targetTab === 'calendar') formEvent();
    else if(targetTab === 'routine') addRoutine();
    else if(targetTab === 'study') addTask();
    return;
  }

  const b=e.target.closest('[data-action],[data-tab-go]');
  if(!b)return;
  const a=b.dataset.action;
  if(b.dataset.tabGo){setTab(b.dataset.tabGo);return}
  if(a==='close'){closeModal();return}
  if(a==='quick-add')quickAdd();
  else if(a==='set-season'){wardrobeSeason=b.dataset.season;render()}
  else if(a==='notify')requestNotifications();
  else if(a==='add-event')formEvent();
  else if(a==='day-click')formEvent(b.dataset.date);
  else if(a==='cal-prev'){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);render()}
  else if(a==='cal-next'){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);render()}
  else if(a==='delete-event'){state.events=state.events.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='add-outfit')addOutfit();
  else if(a==='outfit-prev'){outfitWeek.setDate(outfitWeek.getDate()-7);render()}
  else if(a==='outfit-next'){outfitWeek.setDate(outfitWeek.getDate()+7);render()}
  else if(a==='outfit-now'){outfitWeek=new Date();render()}
  else if(a==='fav-outfit'){const o=state.outfits.find(x=>x.id===b.dataset.id);if(o){o.favorite=!o.favorite;save();render()}}
  else if(a==='add-routine')addRoutine();
  else if(a==='toggle-routine'){const r=state.routines.find(x=>x.id===b.dataset.id);if(r){r.done=b.checked;save()}}
  else if(a==='delete-routine'){state.routines=state.routines.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='add-class')addClass();
  else if(a==='edit-class')addClass(b.dataset.key);
  else if(a==='add-task')addTask();
  else if(a==='toggle-task'){const t=state.tasks.find(x=>x.id===b.dataset.id);if(t){t.done=b.checked;save()}}
  else if(a==='delete-task'){state.tasks=state.tasks.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='add-note')addNote();
  else if(a==='delete-note'){state.notes=state.notes.filter(x=>x.id!==b.dataset.id);save();render()}
  else if(a==='study-go-today'){studyDate=iso(new Date());render()}
});

app.addEventListener('input', e=>{
  if(e.target.id==='wardrobeSearchInput'){
    wardrobeSearchQuery = e.target.value;
    render();
    const input = document.getElementById('wardrobeSearchInput');
    if(input){ input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
});

app.addEventListener('change', e=>{
  if(e.target.id==='studyDateInput'){
    studyDate = e.target.value;
    render();
  }
});

modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));

modal.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,fd=new FormData(f);
 if(f.id==='eventForm'){state.events.push({id:uid(),title:fd.get('title'),date:fd.get('date'),time:fd.get('time'),category:fd.get('category'),color:fd.get('color'),reminder:fd.get('reminder'),notes:fd.get('notes')});save();closeModal();render();toast('Evento guardado ✦')}
 else if(f.id==='outfitForm'){state.outfits.push({id:uid(),name:fd.get('name'),date:fd.get('date'),season:fd.get('season')||'Verano',context:fd.get('context'),favorite:false});save();closeModal();render();toast('Look guardado 👗')}
 else if(f.id==='routineForm'){const dates=fd.get('repeat')==='Todos los días'?[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return iso(d)}):[iso(new Date())];dates.forEach(date=>state.routines.push({id:uid(),title:fd.get('title'),time:fd.get('time'),date,done:false}));save();closeModal();render();toast('Rutina guardada ✓')}
 else if(f.id==='taskForm'){state.tasks.push({id:uid(),title:fd.get('title'),subject:fd.get('subject'),date:fd.get('date'),time:fd.get('time'),duration:fd.get('duration'),done:false});save();closeModal();render();toast('Tarea añadida 📚')}
 else if(f.id==='classForm'){const key=fd.get('day')+'|'+fd.get('time');state.schedule[key]={subject:fd.get('subject'),color:fd.get('color'),room:fd.get('room')};save();closeModal();render();toast('Clase guardada 🕰️')}
 else if(f.id==='noteForm'){for(const file of fd.getAll('files')){const data=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file)});state.notes.push({id:uid(),subject:fd.get('subject'),title:fd.get('title')||file.name,data})}save();closeModal();render();toast('Apuntes guardados 📸')}
});

document.getElementById('settingsBtn').addEventListener('click',()=>openModal('⚙️ My Day',`<div class="card"><h3>Identidad visual</h3><p class="mini-note">Icono de la PWA configurado.</p><img src="icons/icon-512.png" style="width:150px;border-radius:28px;display:block;margin:12px auto;box-shadow:var(--shadow)" alt="Icono My Day"></div><div class="card" style="margin-top:12px"><h3>🔔 Notificaciones</h3><p class="mini-note">Activa los avisos del navegador para tus recordatorios.</p>${btn('Activar notificaciones','btn btn-primary','data-action="notify"')}</div><div class="card" style="margin-top:12px"><h3>💾 Datos</h3><p class="mini-note">Tus datos se guardan en este dispositivo.</p>${btn('Borrar todos mis datos','btn','data-action="wipe"')}</div>`));

modal.addEventListener('click',e=>{if(e.target.closest('[data-action="notify"]'))requestNotifications();if(e.target.closest('[data-action="wipe"]')){if(confirm('¿Borrar todos los datos de My Day?')){localStorage.removeItem(KEY);location.reload()}}});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.location.reload();
          }
        });
      });
    }).catch(() => {});
  });
}
render();
