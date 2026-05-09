// ═══════════════════════════════════════════
// COACH LION v2 — APP.JS
// ═══════════════════════════════════════════

const SUPA_URL = 'https://ptuughawsrozmeymbxkp.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dXVnaGF3c3Jvem1leW1ieGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIzMzMsImV4cCI6MjA5Mzg1ODMzM30.rN1VMPTq-f-mZrR8Q_LHe-seDnNBZGb-I5fQecJEZs8';
const COACH_USERNAME = 'coach';

const S = {
  user:null, isCoach:false,
  sessionActive:false, sessionStart:null, sessionTimer:null,
  restTimer:null, restRemaining:60, restDuration:60,
  intervalTimer:null, intPhase:'work', intRemaining:0, intRound:0,
  workLog:[], currentEx:null, modalSets:[],
  routineExercises:[], progressChart:null, volumeChart:null,
  selectedChartEx:'bench_press', currentAchFilter:'all',
};

const QUOTES=[
  '"El dolor de hoy es la fuerza de mañana."',
  '"No cuentes los días, haz que los días cuenten."',
  '"El único mal entrenamiento es el que no hiciste."',
  '"Sé la bestia que el hierro necesita."',
  '"Un guerrero no se rinde. Se adapta."',
  '"Cada repetición es una batalla ganada."',
  '"Tu cuerpo puede soportarlo. Tu mente debe creerlo."',
  '"Los campeones no nacen, se forjan."',
  '"La disciplina hace lo que la motivación no puede."',
  '"El hierro no miente. Tu cuerpo tampoco."',
];

const ACHS=[
  {id:'first_session',icon:'⚡',name:'PRIMER GOLPE',desc:'Completa tu primera sesión',xp:100,rarity:'common',cat:'sessions'},
  {id:'ten_sessions',icon:'🔥',name:'EN LLAMAS',desc:'10 sesiones completadas',xp:250,rarity:'uncommon',cat:'sessions'},
  {id:'fifty_sessions',icon:'💎',name:'DIAMANTE NEGRO',desc:'50 sesiones completadas',xp:1000,rarity:'epic',cat:'sessions'},
  {id:'hundred_sessions',icon:'👑',name:'REY DEL DOJO',desc:'100 sesiones completadas',xp:3000,rarity:'legendary',cat:'sessions'},
  {id:'streak_7',icon:'🗡️',name:'SAMURAI SEMANAL',desc:'7 días seguidos',xp:300,rarity:'uncommon',cat:'streaks'},
  {id:'streak_30',icon:'👹',name:'DEMONIO DEL MES',desc:'30 días seguidos',xp:1500,rarity:'legendary',cat:'streaks'},
  {id:'streak_100',icon:'🌋',name:'INMORTAL',desc:'100 días seguidos',xp:5000,rarity:'legendary',cat:'streaks'},
  {id:'bench_100',icon:'😈',name:'THANOS JUNIOR',desc:'Press de banca 100 kg',xp:500,rarity:'epic',cat:'strength'},
  {id:'bench_140',icon:'🦁',name:'MODO BESTIA',desc:'Press de banca 140 kg',xp:1000,rarity:'legendary',cat:'strength'},
  {id:'squat_100',icon:'🏋️',name:'GUERRERO DRAGÓN',desc:'Sentadilla 100 kg',xp:500,rarity:'epic',cat:'strength'},
  {id:'squat_180',icon:'🐉',name:'SEÑOR DEL HIERRO',desc:'Sentadilla 180 kg',xp:1500,rarity:'legendary',cat:'strength'},
  {id:'deadlift_100',icon:'⚔️',name:'COLOSO',desc:'Peso muerto 100 kg',xp:500,rarity:'epic',cat:'strength'},
  {id:'deadlift_200',icon:'🌠',name:'TITÁN ABSOLUTO',desc:'Peso muerto 200 kg',xp:2000,rarity:'legendary',cat:'strength'},
  {id:'curl_40',icon:'💪',name:'BRAZO DE ACERO',desc:'Curl bíceps 40 kg',xp:400,rarity:'epic',cat:'strength'},
  {id:'pullups_15',icon:'🦅',name:'ÁGUILA REAL',desc:'15 dominadas seguidas',xp:350,rarity:'epic',cat:'strength'},
  {id:'hyrox_sub60',icon:'🏃',name:'DEMO SLIDER',desc:'Hyrox en menos de 60 min',xp:800,rarity:'legendary',cat:'cardio'},
  {id:'cardio_30',icon:'🎽',name:'CORAZÓN DE FUEGO',desc:'30 min de cardio',xp:200,rarity:'uncommon',cat:'cardio'},
  {id:'cardio_60',icon:'🌊',name:'MARATÓN NINJA',desc:'60 min de cardio',xp:400,rarity:'epic',cat:'cardio'},
  {id:'volume_10k',icon:'📦',name:'REY DEL VOLUMEN',desc:'10,000 kg en una sesión',xp:600,rarity:'epic',cat:'volume'},
  {id:'volume_1m',icon:'🏔️',name:'MONTE OLÍMPICO',desc:'1,000,000 kg volumen total',xp:5000,rarity:'legendary',cat:'volume'},
  {id:'early_bird',icon:'🌅',name:'MADRUGADOR BESTIAL',desc:'Entrena antes de las 6am',xp:200,rarity:'uncommon',cat:'special'},
  {id:'night_owl',icon:'🦉',name:'LOBO NOCTURNO',desc:'Entrena después de las 10pm',xp:200,rarity:'uncommon',cat:'special'},
  {id:'level_5',icon:'⬆️',name:'GUERRERO LV5',desc:'Alcanza el nivel 5',xp:500,rarity:'uncommon',cat:'progression'},
  {id:'level_10',icon:'🔱',name:'MAESTRO LV10',desc:'Alcanza el nivel 10',xp:1000,rarity:'epic',cat:'progression'},
  {id:'level_20',icon:'👁️',name:'LEYENDA LV20',desc:'Alcanza el nivel 20',xp:3000,rarity:'legendary',cat:'progression'},
];

const CHALLENGES=[
  {id:'c1',icon:'🔥',name:'SEMANA DE FUEGO',desc:'5 sesiones esta semana',reward:'500 XP',target:5,type:'sessions_week',progress:0},
  {id:'c2',icon:'💪',name:'VOLUMEN MÁXIMO',desc:'50,000 kg de volumen',reward:'1000 XP',target:50000,type:'total_volume',progress:0},
  {id:'c3',icon:'⚡',name:'VELOCISTA',desc:'Sesión en menos de 45 min',reward:'300 XP',target:1,type:'fast_session',progress:0},
  {id:'c4',icon:'🎯',name:'PERFECCIONISTA',desc:'Registra 20 series',reward:'200 XP',target:20,type:'logged_sets',progress:0},
  {id:'c5',icon:'🦁',name:'MODO BESTIA',desc:'3 días seguidos',reward:'750 XP',target:3,type:'streak',progress:0},
];

const EX_DB=[
  {id:'bench_press',name:'Press de Banca',muscle:'chest',equip:'barbell',emoji:'🏋️',diff:'intermediate',inst:'Acuéstate, agarra la barra más ancho que los hombros. Baja controlado al pecho, empuja explosivo. Escápulas retraídas.',track:'bench_press'},
  {id:'incline_press',name:'Press Inclinado',muscle:'chest',equip:'barbell',emoji:'💪',diff:'intermediate',inst:'Banco a 30-45°. Misma mecánica que plano pero enfoca el pecho superior.',track:null},
  {id:'dumbbell_fly',name:'Aperturas Mancuernas',muscle:'chest',equip:'dumbbell',emoji:'🦅',diff:'beginner',inst:'Brazos ligeramente flexionados, abre en arco amplio sintiendo el estiramiento del pecho.',track:null},
  {id:'pushup',name:'Flexiones',muscle:'chest',equip:'bodyweight',emoji:'🤸',diff:'beginner',inst:'Manos al ancho de hombros, cuerpo recto. Baja pecho al suelo, empuja arriba completamente.',track:null},
  {id:'cable_fly',name:'Cruces en Polea',muscle:'chest',equip:'cable',emoji:'⚡',diff:'intermediate',inst:'Desde poleas altas, junta manos frente al pecho con contracción máxima.',track:null},
  {id:'deadlift',name:'Peso Muerto',muscle:'back',equip:'barbell',emoji:'🌋',diff:'advanced',inst:'Pies al ancho de cadera, barra sobre el metatarso. Espalda neutral, empuja el suelo. El rey.',track:'deadlift'},
  {id:'pullup',name:'Dominadas',muscle:'back',equip:'bodyweight',emoji:'🦅',diff:'intermediate',inst:'Agarre prono más ancho que hombros. Lleva el pecho a la barra, baja completamente.',track:'pullups'},
  {id:'bent_row',name:'Remo con Barra',muscle:'back',equip:'barbell',emoji:'⚓',diff:'intermediate',inst:'Torso 45°, barra a los abdominales. Codos hacia atrás, contrae escápulas.',track:null},
  {id:'lat_pulldown',name:'Jalón al Pecho',muscle:'back',equip:'cable',emoji:'🎯',diff:'beginner',inst:'Jala la barra al pecho superior, codos al suelo. Pecho alto durante todo el movimiento.',track:null},
  {id:'ohp',name:'Press Militar',muscle:'shoulders',equip:'barbell',emoji:'🗡️',diff:'intermediate',inst:'De pie o sentado, empuja la barra por encima hasta extender completamente.',track:null},
  {id:'lateral_raise',name:'Elevaciones Laterales',muscle:'shoulders',equip:'dumbbell',emoji:'✈️',diff:'beginner',inst:'Eleva los brazos lateralmente hasta la altura de hombros, codo ligeramente flexionado.',track:null},
  {id:'face_pull',name:'Face Pull',muscle:'shoulders',equip:'cable',emoji:'🎯',diff:'beginner',inst:'Polea alta, jala hacia la cara abriendo los codos. Clave para la salud del hombro.',track:null},
  {id:'barbell_curl',name:'Curl con Barra',muscle:'biceps',equip:'barbell',emoji:'💪',diff:'beginner',inst:'Codos pegados al torso, curla la barra hasta contraer el bíceps completamente. Baja controlado.',track:'bicep_curl'},
  {id:'hammer_curl',name:'Curl Martillo',muscle:'biceps',equip:'dumbbell',emoji:'🔨',diff:'beginner',inst:'Agarre neutro (pulgar arriba), curla hasta el hombro. Trabaja braquial y braquiorradial.',track:null},
  {id:'skull_crusher',name:'Skull Crusher',muscle:'triceps',equip:'barbell',emoji:'💀',diff:'intermediate',inst:'Acostado, baja la barra a la frente flexionando solo los codos. Extiende explosivo.',track:null},
  {id:'tricep_dip',name:'Fondos para Tríceps',muscle:'triceps',equip:'bodyweight',emoji:'⬇️',diff:'intermediate',inst:'En paralelas, baja hasta 90° de codo. Empuja arriba contrayendo el tríceps.',track:null},
  {id:'tricep_pushdown',name:'Extensión Tríceps Polea',muscle:'triceps',equip:'cable',emoji:'⚡',diff:'beginner',inst:'Codos pegados, empuja hasta extensión completa. Contrae fuerte el tríceps.',track:null},
  {id:'squat',name:'Sentadilla',muscle:'legs',equip:'barbell',emoji:'🏋️',diff:'intermediate',inst:'Barra en trapecios, pies al ancho de hombros. Baja a paralelo o más abajo, rodillas siguiendo los pies.',track:'squat'},
  {id:'leg_press',name:'Prensa de Piernas',muscle:'legs',equip:'machine',emoji:'🦵',diff:'beginner',inst:'Pies al ancho de hombros. Baja controlado sin bloquear completamente la rodilla.',track:null},
  {id:'romanian_dl',name:'Peso Muerto Rumano',muscle:'legs',equip:'barbell',emoji:'🧲',diff:'intermediate',inst:'Bisagra de cadera, baja la barra por las piernas sintiendo el isquiotibial.',track:null},
  {id:'lunges',name:'Zancadas',muscle:'legs',equip:'dumbbell',emoji:'🚶',diff:'beginner',inst:'Paso adelante, rodilla trasera casi toca el suelo. Torso erguido.',track:null},
  {id:'calf_raise',name:'Elevaciones de Talones',muscle:'legs',equip:'machine',emoji:'👟',diff:'beginner',inst:'Sube en punta de pies, mantén 1 segundo arriba. Baja con control total.',track:null},
  {id:'plank',name:'Plancha',muscle:'core',equip:'bodyweight',emoji:'🧱',diff:'beginner',inst:'Cuerpo recto en antebrazos y pies. Aprieta abdomen y glúteos todo el tiempo.',track:null},
  {id:'crunch',name:'Abdominales',muscle:'core',equip:'bodyweight',emoji:'🎯',diff:'beginner',inst:'Manos en la nuca, curva el tronco contrayendo el abdomen. No jales el cuello.',track:null},
  {id:'hanging_lr',name:'Elevación Piernas Colgado',muscle:'core',equip:'bodyweight',emoji:'🦅',diff:'advanced',inst:'Colgado de la barra, eleva las piernas a 90° o más. Controla la bajada.',track:null},
];

const ML={all:'Todos',chest:'Pecho',back:'Espalda',shoulders:'Hombros',biceps:'Bíceps',triceps:'Tríceps',legs:'Piernas',core:'Core'};
const EL={barbell:'Barra',dumbbell:'Mancuerna',cable:'Polea',machine:'Máquina',bodyweight:'Peso Corporal'};
const DL={beginner:'⭐ Principiante',intermediate:'⭐⭐ Intermedio',advanced:'⭐⭐⭐ Avanzado'};
const DaL={monday:'Lunes',tuesday:'Martes',wednesday:'Miércoles',thursday:'Jueves',friday:'Viernes',saturday:'Sábado',sunday:'Domingo',any:'Cualquier día'};
const GL={strength:'⚡ Fuerza',hypertrophy:'💪 Masa',weightloss:'🔥 Definir',endurance:'🏃 Resistencia',athletic:'🏆 Atlético'};
const RC={common:'#9e9e9e',uncommon:'#4caf50',epic:'#9c27b0',legendary:'#ff6f00'};
const RL={common:'COMÚN',uncommon:'INUSUAL',epic:'ÉPICO',legendary:'LEGENDARIO'};
const ACH_CATS=['all','sessions','streaks','strength','cardio','volume','special','progression'];
const ACH_CAT_L={all:'Todos',sessions:'Sesiones',streaks:'Rachas',strength:'Fuerza',cardio:'Cardio',volume:'Volumen',special:'Especiales',progression:'Nivel'};
const TITLES=['⚔️ NOVATO','🔥 GUERRERO','💪 VETERANO','🦁 BESTIA','👹 DEMONIO','🐉 MAESTRO','⚡ LEYENDA','👑 DIOS DEL HIERRO'];
const MUSCLES=['all','chest','back','shoulders','biceps','triceps','legs','core'];

// ─── HELPERS ───
const $=id=>document.getElementById(id);
const v=id=>$(id)?.value?.trim();
const pad=n=>String(n).padStart(2,'0');
const getUsers=()=>JSON.parse(localStorage.getItem('cl_users')||'[]');
const saveUsers=u=>localStorage.setItem('cl_users',JSON.stringify(u));
const getRoutines=()=>JSON.parse(localStorage.getItem('cl_routines_'+(S.user?.id||''))||'[]');
const saveRoutines=r=>localStorage.setItem('cl_routines_'+(S.user?.id||''),JSON.stringify(r));

function toast(msg){
  document.querySelector('.cl-toast')?.remove();
  const t=document.createElement('div');t.className='cl-toast';t.textContent=msg;
  t.style.cssText='position:fixed;bottom:calc(var(--nav) + 14px);left:50%;transform:translateX(-50%) translateY(0);background:var(--d3);border:1px solid var(--borderb);color:var(--white);padding:11px 18px;border-radius:12px;font-family:var(--fu);font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;max-width:90vw;box-shadow:0 8px 30px rgba(0,0,0,.5)';
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},3000);
}

// ─── APP ───
const App={
  init(){
    setTimeout(()=>{
      const sp=$('splash');sp.style.opacity='0';sp.style.transition='opacity .5s';
      setTimeout(()=>{sp.style.display='none';this.checkSession();},500);
    },2900);
    this.buildMuscleFilters();
    this.buildAchFilters();
  },

  checkSession(){
    const saved=localStorage.getItem('cl_user');
    if(saved){S.user=JSON.parse(saved);this.enterApp();}
    else{
      this.showScreen('auth');
      if(localStorage.getItem('cl_bio')) $('bio-login-btn').classList.remove('hidden');
    }
  },

  showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$(id).classList.remove('hidden');},

  enterApp(){
    this.showScreen('app');
    S.isCoach=S.user.username===COACH_USERNAME;
    if(S.isCoach) $('coach-btn').classList.remove('hidden');
    this.updateUI();this.renderChallenges();this.buildChartSelector();
    this.checkCoachMessages();this.checkNotifPermission();
    if('wakeLock' in navigator) this.reqWakeLock();
    if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  },

  // ─ AUTH ─
  showRegister(){$('form-login').classList.add('hidden');$('form-register').classList.remove('hidden');},
  showLogin(){$('form-register').classList.add('hidden');$('form-login').classList.remove('hidden');},

  register(){
    const n=v('r-name'),u=v('r-user'),p=v('r-pass');
    if(!n||!u||!p) return toast('Completa nombre, usuario y contraseña');
    const users=getUsers();
    if(users.find(x=>x.username===u)) return toast('Ese usuario ya existe');
    const w=parseFloat(v('r-weight'))||null,h=parseFloat(v('r-height'))||null;
    const user={
      id:Date.now().toString(),name:n,username:u,password:p,
      weight:w,height:h,age:parseInt(v('r-age'))||null,
      days:v('r-days'),goal:v('r-goal'),level:v('r-level'),
      bmi:w&&h?(w/Math.pow(h/100,2)).toFixed(1):null,
      xp:0,sessions:0,streak:0,lastSession:null,
      achievements:[],workoutHistory:[],records:{},
      coachMessages:[],totalVolume:0,created:new Date().toISOString()
    };
    users.push(user);saveUsers(users);
    S.user=user;localStorage.setItem('cl_user',JSON.stringify(user));
    this.enterApp();
    setTimeout(()=>this.showAchPopup({icon:'🦁',name:'¡BIENVENIDO!',desc:`Perfil @${u} creado. ¡La bestia despierta!`,xp:50}),800);
  },

  login(){
    const u=v('l-user'),p=v('l-pass');
    const user=getUsers().find(x=>x.username===u&&x.password===p);
    if(!user) return toast('Usuario o contraseña incorrectos');
    S.user=user;localStorage.setItem('cl_user',JSON.stringify(user));this.enterApp();
  },

  async biometricLogin(){
    const bio=localStorage.getItem('cl_bio');if(!bio)return;
    try{if(window.PublicKeyCredential) await navigator.credentials.get({publicKey:{challenge:new Uint8Array(32),timeout:60000,userVerification:'required'}});}catch(e){}
    const user=getUsers().find(x=>x.username===bio);
    if(user){S.user=user;localStorage.setItem('cl_user',JSON.stringify(user));this.enterApp();}
  },

  async saveBiometric(){
    if(!S.user)return;
    try{
      if(window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()){
        const enc=new TextEncoder();
        await navigator.credentials.create({publicKey:{
          challenge:crypto.getRandomValues(new Uint8Array(32)),
          rp:{name:'Coach Lion',id:location.hostname||'localhost'},
          user:{id:enc.encode(S.user.id),name:S.user.username,displayName:S.user.name},
          pubKeyCredParams:[{alg:-7,type:'public-key'}],
          authenticatorSelection:{userVerification:'required',authenticatorAttachment:'platform'},
          timeout:60000
        }});
      }
    }catch(e){}
    localStorage.setItem('cl_bio',S.user.username);
    toast('✅ Acceso biométrico guardado');
  },

  logout(){
    if(!confirm('¿Cerrar sesión?'))return;
    S.user=null;localStorage.removeItem('cl_user');
    this.stopSession();this.showScreen('auth');this.showLogin();
  },

  saveUser(){
    if(!S.user)return;
    const users=getUsers(),i=users.findIndex(x=>x.id===S.user.id);
    if(i!==-1)users[i]=S.user;else users.push(S.user);
    saveUsers(users);localStorage.setItem('cl_user',JSON.stringify(S.user));
  },

  // ─ UI ─
  updateUI(){
    if(!S.user)return;const u=S.user;
    $('t-name').textContent=u.username.toUpperCase();
    $('h-name').textContent=u.name.split(' ')[0].toUpperCase();
    $('h-quote').textContent=QUOTES[new Date().getDay()%QUOTES.length];
    $('s-sessions').textContent=u.sessions||0;
    $('s-ach').textContent=(u.achievements||[]).length;
    $('s-xp').textContent=u.xp||0;
    $('s-streak').textContent=u.streak||0;
    const xpLv=(u.xp||0)%1000,lv=Math.floor((u.xp||0)/1000)+1;
    $('xp-fill').style.width=(xpLv/10)+'%';
    $('xp-txt').textContent=`LV${lv} · ${xpLv}/1000 XP`;
    $('p-name').textContent=u.name.toUpperCase();
    $('p-lv').textContent=`NIVEL ${lv}`;
    $('lv-fill').style.width=(xpLv/10)+'%';
    $('p-badge').textContent=TITLES[Math.min(lv-1,TITLES.length-1)];
    $('p-stats').innerHTML=[
      {ico:'⚖️',val:u.weight||'--',lbl:'PESO KG'},
      {ico:'📏',val:u.height||'--',lbl:'ALTURA CM'},
      {ico:'🎂',val:u.age||'--',lbl:'EDAD'},
      {ico:'📊',val:u.bmi||'--',lbl:'IMC'},
      {ico:'🎯',val:GL[u.goal]||'--',lbl:'OBJETIVO'},
      {ico:'📅',val:(u.days||'--')+'d',lbl:'DÍAS/SEM'},
    ].map(s=>`<div class="ps"><div class="ps-ico">${s.ico}</div><div class="ps-val">${s.val}</div><div class="ps-lbl">${s.lbl}</div></div>`).join('');
    $('settings-list').innerHTML=[
      {ico:'⚖️',lbl:'Actualizar peso',fn:"App.updateWeight()"},
      {ico:'🔱',lbl:'Guardar acceso biométrico',fn:"App.saveBiometric()"},
      {ico:'📸',lbl:'Progreso con fotos',fn:"App.goTo('progress')"},
      {ico:'📤',lbl:'Exportar mis datos',fn:"App.exportData()"},
      {ico:'🚪',lbl:'Cerrar sesión',fn:"App.logout()",danger:true},
    ].map(s=>`<div class="setting${s.danger?' danger':''}" onclick="${s.fn}"><span>${s.ico} ${s.lbl}</span><span class="setting-arr">›</span></div>`).join('');
    this.renderTodayRoutine();this.renderActivityCal();this.renderRecentAchs();this.renderRecords();
  },

  // ─ NAV ─
  goTo(page){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
    $(`page-${page}`).classList.add('active');
    const nb=document.querySelector(`.nb[data-p="${page}"]`);if(nb)nb.classList.add('active');
    if(page==='achievements')this.renderAchs();
    if(page==='routines')this.renderRoutines();
    if(page==='progress'){this.renderProgressCharts();this.renderPhotos();}
    if(page==='coach'&&S.isCoach)this.renderCoachPanel();
    if(page==='profile')this.updateUI();
  },

  // ─ WORKOUT ─
  startWorkout(){
    this.goTo('workout');
    if(!S.sessionActive){
      S.sessionActive=true;S.sessionStart=Date.now();
      $('sess-tog').textContent='⏸';
      S.sessionTimer=setInterval(()=>this.tickSession(),1000);
      S.workLog=[];this.renderLog();this.reqWakeLock();
    }
  },

  tickSession(){
    if(!S.sessionStart)return;
    const e=Date.now()-S.sessionStart;
    $('sess-time').textContent=`${pad(Math.floor(e/3600000))}:${pad(Math.floor((e%3600000)/60000))}:${pad(Math.floor((e%60000)/1000))}`;
  },

  toggleSession(){
    if(S.sessionActive){clearInterval(S.sessionTimer);S.sessionActive=false;$('sess-tog').textContent='▶';}
    else{S.sessionActive=true;S.sessionTimer=setInterval(()=>this.tickSession(),1000);$('sess-tog').textContent='⏸';}
  },

  stopSession(){
    clearInterval(S.sessionTimer);clearInterval(S.restTimer);clearInterval(S.intervalTimer);
    S.sessionActive=false;S.sessionStart=null;
  },

  finishWorkout(){
    if(S.workLog.length===0&&!confirm('No registraste ejercicios. ¿Terminar?'))return;
    const dur=S.sessionStart?Math.floor((Date.now()-S.sessionStart)/1000):0;
    this.stopSession();
    const u=S.user;u.sessions=(u.sessions||0)+1;
    let vol=0,sets=0;
    S.workLog.forEach(ex=>ex.sets.forEach(s=>{
      vol+=(s.weight||0)*(s.reps||0);sets++;
      if(ex.track&&s.weight){if(!u.records)u.records={};if(!u.records[ex.track]||s.weight>u.records[ex.track])u.records[ex.track]=s.weight;}
    }));
    u.totalVolume=(u.totalVolume||0)+vol;
    if(!u.workoutHistory)u.workoutHistory=[];
    u.workoutHistory.push({date:new Date().toISOString(),exercises:S.workLog.map(e=>({name:e.name,sets:e.sets})),volume:vol,duration:dur});
    const today=new Date().toDateString(),yest=new Date(Date.now()-86400000).toDateString();
    if(u.lastSession===yest||u.lastSession===today)u.streak=(u.streak||0)+1;
    else if(u.lastSession!==today)u.streak=1;
    u.lastSession=today;
    const ch=JSON.parse(localStorage.getItem('cl_ch_'+u.id)||JSON.stringify(CHALLENGES));
    ch.forEach(c=>{
      if(c.type==='sessions_week')c.progress=Math.min(c.progress+1,c.target);
      if(c.type==='total_volume')c.progress=Math.min(Math.round(u.totalVolume),c.target);
      if(c.type==='fast_session'&&dur>0&&dur<2700)c.progress=1;
      if(c.type==='logged_sets')c.progress=Math.min((c.progress||0)+sets,c.target);
      if(c.type==='streak')c.progress=Math.min(u.streak,c.target);
    });
    localStorage.setItem('cl_ch_'+u.id,JSON.stringify(ch));
    const xpGain=150+(S.workLog.length*25)+(sets*5);this.addXP(xpGain);
    const hr=new Date().getHours();
    if(hr<6)this.tryUnlock('early_bird',{});if(hr>=22)this.tryUnlock('night_owl',{});
    this.tryUnlock('first_session',{sessions:u.sessions});this.tryUnlock('ten_sessions',{sessions:u.sessions});
    this.tryUnlock('fifty_sessions',{sessions:u.sessions});this.tryUnlock('hundred_sessions',{sessions:u.sessions});
    this.tryUnlock('streak_7',{streak:u.streak});this.tryUnlock('streak_30',{streak:u.streak});this.tryUnlock('streak_100',{streak:u.streak});
    const r=u.records||{};
    if(r.bench_press){this.tryUnlock('bench_100',{bench_press:r.bench_press});this.tryUnlock('bench_140',{bench_press:r.bench_press});}
    if(r.squat){this.tryUnlock('squat_100',{squat:r.squat});this.tryUnlock('squat_180',{squat:r.squat});}
    if(r.deadlift){this.tryUnlock('deadlift_100',{deadlift:r.deadlift});this.tryUnlock('deadlift_200',{deadlift:r.deadlift});}
    if(r.bicep_curl)this.tryUnlock('curl_40',{bicep_curl:r.bicep_curl});
    if(r.pullups)this.tryUnlock('pullups_15',{pullups:r.pullups});
    if(vol>=10000)this.tryUnlock('volume_10k',{session_volume:vol});
    if(u.totalVolume>=1000000)this.tryUnlock('volume_1m',{total_volume:u.totalVolume});
    this.saveUser();S.workLog=[];this.renderLog();$('sess-time').textContent='00:00:00';
    this.updateUI();this.goTo('home');
    setTimeout(()=>toast(`💪 ¡Sesión completa! +${xpGain} XP · ${Math.round(vol).toLocaleString()} kg vol.`),300);
  },

  // ─ REST TIMER ─
  setRest(sec){
    S.restDuration=sec;S.restRemaining=sec;$('rest-disp').textContent=sec;this.updateRing(sec,sec);
    document.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');
  },
  startRest(){
    if(S.restTimer)clearInterval(S.restTimer);
    S.restRemaining=S.restDuration;const fg=$('ring-fg');fg.classList.remove('urgent');
    S.restTimer=setInterval(()=>{
      S.restRemaining--;$('rest-disp').textContent=S.restRemaining;this.updateRing(S.restRemaining,S.restDuration);
      if(S.restRemaining<=10)fg.classList.add('urgent');
      if(S.restRemaining<=0){
        clearInterval(S.restTimer);S.restTimer=null;$('rest-disp').textContent='🏋️';fg.classList.remove('urgent');
        if(navigator.vibrate)navigator.vibrate([200,100,200,100,400]);
        if(Notification.permission==='granted')new Notification('COACH LION 🦁',{body:'¡Descanso terminado! 💪',icon:'/icon-192.png'});
        toast('⚡ ¡Descanso terminado! VAMOS!');
      }
    },1000);
  },
  stopRest(){
    if(S.restTimer)clearInterval(S.restTimer);S.restTimer=null;
    S.restRemaining=S.restDuration;$('rest-disp').textContent=S.restDuration;
    this.updateRing(S.restDuration,S.restDuration);$('ring-fg').classList.remove('urgent');
  },
  updateRing(rem,total){$('ring-fg').style.strokeDashoffset=(2*Math.PI*52)*(1-rem/total);},

  // ─ INTERVAL TIMER ─
  toggleInterval(){
    if(S.intervalTimer){clearInterval(S.intervalTimer);S.intervalTimer=null;$('int-btn').textContent='▶ INICIAR HIIT';$('int-display').classList.add('hidden');return;}
    const work=parseInt($('int-work').value)||40,rest=parseInt($('int-rest').value)||20,rounds=parseInt($('int-rounds').value)||8;
    S.intPhase='work';S.intRemaining=work;S.intRound=1;
    $('int-display').classList.remove('hidden');$('int-btn').textContent='⏹ DETENER';
    const tick=()=>{
      $('int-time').textContent=S.intRemaining;
      $('int-phase').textContent=S.intPhase==='work'?'🔥 TRABAJO':'💤 DESCANSO';
      $('int-round').textContent=`Ronda ${S.intRound} / ${rounds}`;
      $('int-time').style.color=S.intPhase==='work'?'var(--gold)':'var(--cyan)';
      S.intRemaining--;
      if(S.intRemaining<0){
        if(S.intPhase==='work'){S.intPhase='rest';S.intRemaining=rest;}
        else{S.intRound++;if(S.intRound>rounds){clearInterval(S.intervalTimer);S.intervalTimer=null;$('int-btn').textContent='▶ INICIAR HIIT';$('int-display').classList.add('hidden');toast('🏁 ¡HIIT completado! Eres una bestia.');if(navigator.vibrate)navigator.vibrate([400,100,400]);return;}S.intPhase='work';S.intRemaining=work;}
        if(navigator.vibrate)navigator.vibrate([100,50,100]);
      }
    };
    tick();S.intervalTimer=setInterval(tick,1000);
  },

  // ─ EXERCISE SEARCH ─
  openExSearch(){el2('ex-search').classList.remove('hidden');this.renderExResults(EX_DB);$('ex-q').focus();},
  closeExSearch(){el2('ex-search').classList.add('hidden');},
  searchEx(q){
    const filt=document.querySelector('.mf.active')?.dataset.m||'all';
    let res=EX_DB;
    if(filt!=='all')res=res.filter(e=>e.muscle===filt);
    if(q)res=res.filter(e=>e.name.toLowerCase().includes(q.toLowerCase()));
    this.renderExResults(res);
  },
  buildMuscleFilters(){
    const c=$('mfilters');if(!c)return;
    c.innerHTML=MUSCLES.map(m=>`<button class="mf${m==='all'?' active':''}" data-m="${m}" onclick="App.filterMuscle('${m}')">${ML[m]}</button>`).join('');
  },
  filterMuscle(m){
    document.querySelectorAll('.mf').forEach(b=>b.classList.remove('active'));
    document.querySelector(`.mf[data-m="${m}"]`)?.classList.add('active');
    this.searchEx($('ex-q').value);
  },
  renderExResults(list){
    $('ex-results').innerHTML=list.length===0?'<p style="color:var(--wdim);padding:14px;text-align:center">Sin resultados</p>':
      list.map(ex=>`<div class="ex-item" onclick="App.openExModal('${ex.id}')"><div class="ex-item-ico">${ex.emoji}</div><div><div class="ex-item-nm">${ex.name}</div><div class="ex-item-tags">${ML[ex.muscle]} · ${EL[ex.equip]||ex.equip} · ${DL[ex.diff]}</div></div></div>`).join('');
  },

  openExModal(id){
    const ex=EX_DB.find(e=>e.id===id);if(!ex)return;
    S.currentEx=ex;S.modalSets=[];
    $('ex-m-name').textContent=ex.name.toUpperCase();
    $('ex-m-tags').innerHTML=`<span class="ex-tag">${ML[ex.muscle]}</span><span class="ex-tag">${EL[ex.equip]||ex.equip}</span><span class="ex-tag">${DL[ex.diff]}</span>`;
    $('ex-m-inst').textContent=ex.inst;
    $('ex-media').innerHTML=`<div class="ex-media-ph" id="ex-media-ph">${ex.emoji}</div>`;
    $('sets-done').innerHTML='';$('sw').value='';$('sr').value='';
    this.fetchExGif(ex);this.openModal('modal-ex');
  },

  async fetchExGif(ex){
    const mm={chest:'chest',back:'back',shoulders:'shoulders',biceps:'upper%20arms',triceps:'upper%20arms',legs:'upper%20legs',core:'waist'};
    try{
      const res=await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${mm[ex.muscle]||ex.muscle}?limit=80`,{headers:{'X-RapidAPI-Key':'fa7db717a2msh1eab804168a164dp1a67bdjsn186f173b7732','X-RapidAPI-Host':'exercisedb.p.rapidapi.com'}});
      if(res.ok){const data=await res.json();const q=ex.name.toLowerCase().split(' ')[0];const match=data.find(d=>d.name.toLowerCase().includes(q));if(match?.gifUrl)$('ex-media').innerHTML=`<img src="${match.gifUrl}" alt="${ex.name}" onerror="this.parentElement.innerHTML='<div class=ex-media-ph>${ex.emoji}</div>'">`;}
    }catch(e){}
  },

  logSet(){
    const w=parseFloat($('sw').value)||0,r=parseInt($('sr').value);
    if(!r)return toast('Ingresa las repeticiones');
    S.modalSets.push({weight:w,reps:r});this.renderModalSets();$('sr').value='';
  },
  renderModalSets(){
    $('sets-done').innerHTML=S.modalSets.map((s,i)=>`<div class="set-done-row"><span class="set-done-n">SET ${i+1}</span><span class="set-done-d">${s.weight?s.weight+' kg':'PC'} × ${s.reps} reps</span><span class="set-done-v">${s.weight?Math.round(s.weight*s.reps)+' kg vol.':''}</span></div>`).join('');
  },
  confirmExercise(){
    if(!S.currentEx)return;if(S.modalSets.length===0)return toast('Agrega al menos una serie');
    const idx=S.workLog.findIndex(e=>e.id===S.currentEx.id);
    if(idx!==-1)S.workLog[idx].sets.push(...S.modalSets);else S.workLog.push({...S.currentEx,sets:[...S.modalSets]});
    this.closeModal('modal-ex');this.closeExSearch();this.renderLog();
    toast(`✅ ${S.currentEx.name} · ${S.modalSets.length} series`);S.modalSets=[];
  },
  renderLog(){
    const c=$('ex-log');
    if(S.workLog.length===0){c.innerHTML='<div class="empty-log">Agrega ejercicios para registrar tu sesión 💪</div>';return;}
    c.innerHTML=S.workLog.map((ex,xi)=>`<div class="ex-log-item">
      <div class="log-head"><div class="log-ico">${ex.emoji}</div><div><div class="log-nm">${ex.name}</div><div class="log-muscle">${ML[ex.muscle]||ex.muscle}</div></div></div>
      ${ex.sets.map((s,i)=>`<div class="log-set"><span class="sn">${i+1}</span><span class="sw">${s.weight?s.weight+' kg':'PC'}</span><span class="srp">${s.reps} reps</span><span class="sv">${s.weight?Math.round(s.weight*s.reps)+' kg':''}</span></div>`).join('')}
      <div class="inline-add"><input type="number" placeholder="kg" id="iw${xi}" step="0.5"><input type="number" placeholder="reps" id="ir${xi}"><button class="btn-sm" onclick="App.inlineSet(${xi})">+ SET</button></div>
    </div>`).join('');
  },
  inlineSet(xi){
    const w=parseFloat($(`iw${xi}`).value)||0,r=parseInt($(`ir${xi}`).value);
    if(!r)return;S.workLog[xi].sets.push({weight:w,reps:r});this.renderLog();
  },

  // ─ ROUTINES ─
  renderTodayRoutine(){
    const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today=days[new Date().getDay()];
    const r=getRoutines().find(x=>x.day===today||x.day==='any');
    const c=$('today-routine');
    if(!r){c.innerHTML=`<div class="no-routine"><div>📋</div><p>Sin rutina asignada para hoy</p><button class="btn-ghost" onclick="App.goTo('routines')" style="margin-top:8px">Ver rutinas</button></div>`;return;}
    c.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div><div style="font-family:var(--fd);font-size:20px;letter-spacing:2px">${r.name}</div><div style="font-size:11px;color:var(--wdim)">${r.exercises.length} ejercicios · ${DaL[r.day]}</div></div><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button></div><div style="display:flex;flex-wrap:wrap;gap:4px">${r.exercises.slice(0,6).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}${r.exercises.length>6?`<span class="pill">+${r.exercises.length-6}</span>`:''}</div>`;
  },
  renderRoutines(){
    const routines=getRoutines();const c=$('routines-list');
    if(routines.length===0){c.innerHTML=`<div class="empty-log" style="padding:36px"><div style="font-size:44px;margin-bottom:10px">📋</div><p>No tienes rutinas aún</p><button class="btn-ghost" onclick="App.openCreateRoutine()" style="margin-top:12px;max-width:200px">+ Crear primera rutina</button></div>`;return;}
    const tl={strength:'🏋️ Fuerza',hypertrophy:'💪 Hipertrofia',cardio:'🏃 Cardio',fullbody:'🔥 Full Body',ppl:'⚡ PPL',hiit:'💥 HIIT'};
    c.innerHTML=routines.map(r=>`<div class="routine-card"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DaL[r.day]||r.day}</div></div><div class="rc-type">${tl[r.type]||r.type}</div><div class="rc-pills">${r.exercises.slice(0,5).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}${r.exercises.length>5?`<span class="pill">+${r.exercises.length-5}</span>`:''}</div><div class="rc-actions"><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button><button class="btn-ghost" style="padding:5px 12px;font-size:11px;width:auto" onclick="App.deleteRoutine('${r.id}')">🗑️ Borrar</button></div></div>`).join('');
  },
  openCreateRoutine(){S.routineExercises=[];$('rn-name').value='';$('rn-exlist').innerHTML='';this.openModal('modal-routine');},
  addExToRoutine(){const q=prompt('Nombre del ejercicio:');if(!q)return;const ex=EX_DB.find(e=>e.name.toLowerCase().includes(q.toLowerCase()));S.routineExercises.push(ex||{id:Date.now().toString(),name:q,emoji:'💪',muscle:'general',equip:'various'});this.renderRnExList();},
  renderRnExList(){$('rn-exlist').innerHTML=S.routineExercises.map((ex,i)=>`<div class="rn-ex"><span>${ex.emoji||'💪'}</span><span class="rn-ex-nm">${ex.name}</span><button class="rn-ex-rm" onclick="App.removeRnEx(${i})">✕</button></div>`).join('');},
  removeRnEx(i){S.routineExercises.splice(i,1);this.renderRnExList();},
  saveRoutine(){
    const name=v('rn-name');if(!name)return toast('Dale un nombre a la rutina');
    if(S.routineExercises.length===0)return toast('Agrega al menos un ejercicio');
    const routines=getRoutines();
    routines.push({id:Date.now().toString(),name,type:$('rn-type').value,day:$('rn-day').value,exercises:S.routineExercises,created:new Date().toISOString()});
    saveRoutines(routines);this.closeModal('modal-routine');this.renderRoutines();toast(`✅ Rutina "${name}" guardada`);this.addXP(50);
  },
  deleteRoutine(id){if(!confirm('¿Eliminar esta rutina?'))return;saveRoutines(getRoutines().filter(r=>r.id!==id));this.renderRoutines();},
  startRoutine(id){const r=getRoutines().find(x=>x.id===id);if(!r)return;S.workLog=r.exercises.map(ex=>({...ex,sets:[]}));this.startWorkout();setTimeout(()=>{this.renderLog();toast(`🏋️ "${r.name}" cargada`);},300);},

  // ─ ACHIEVEMENTS ─
  tryUnlock(id,vals){
    if(!S.user)return;if(!S.user.achievements)S.user.achievements=[];
    if(S.user.achievements.includes(id))return;
    const a=ACHS.find(x=>x.id===id);if(!a)return;
    const checks={first_session:()=>vals.sessions>=1,ten_sessions:()=>vals.sessions>=10,fifty_sessions:()=>vals.sessions>=50,hundred_sessions:()=>vals.sessions>=100,streak_7:()=>vals.streak>=7,streak_30:()=>vals.streak>=30,streak_100:()=>vals.streak>=100,bench_100:()=>vals.bench_press>=100,bench_140:()=>vals.bench_press>=140,squat_100:()=>vals.squat>=100,squat_180:()=>vals.squat>=180,deadlift_100:()=>vals.deadlift>=100,deadlift_200:()=>vals.deadlift>=200,curl_40:()=>vals.bicep_curl>=40,pullups_15:()=>vals.pullups>=15,volume_10k:()=>vals.session_volume>=10000,volume_1m:()=>vals.total_volume>=1000000,cardio_30:()=>vals.cardio_minutes>=30,cardio_60:()=>vals.cardio_minutes>=60,hyrox_sub60:()=>vals.hyrox_time<=60,early_bird:()=>true,night_owl:()=>true,level_5:()=>vals.level>=5,level_10:()=>vals.level>=10,level_20:()=>vals.level>=20};
    if(checks[id]&&checks[id]()){S.user.achievements.push(id);setTimeout(()=>this.showAchPopup(a),800);}
  },
  buildAchFilters(){
    const c=$('ach-filters');if(!c)return;
    c.innerHTML=ACH_CATS.map(cat=>`<button class="ach-filter${cat==='all'?' active':''}" onclick="App.filterAchs('${cat}')">${ACH_CAT_L[cat]}</button>`).join('');
  },
  filterAchs(cat){
    S.currentAchFilter=cat;
    document.querySelectorAll('.ach-filter').forEach(b=>b.classList.remove('active'));
    event.target.classList.add('active');this.renderAchs();
  },
  renderAchs(){
    const unlocked=S.user?.achievements||[];
    const list=S.currentAchFilter==='all'?ACHS:ACHS.filter(a=>a.cat===S.currentAchFilter);
    $('ach-grid').innerHTML=list.map(a=>{const u=unlocked.includes(a.id);return`<div class="ag-card ${u?'unlocked':'locked'}">${u?'<span class="ag-badge">✅</span>':''}<div class="ag-ico">${u?a.icon:'🔒'}</div><div class="ag-nm">${a.name}</div><div class="ag-desc">${a.desc}</div><div class="ag-xp" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP</div></div>`;}).join('');
  },
  renderRecentAchs(){
    const unlocked=S.user?.achievements||[];const c=$('recent-ach');
    if(unlocked.length===0){c.innerHTML='<div class="ach-mini"><div class="ach-mini-ico">🔒</div><div class="ach-mini-nm">???</div></div>'.repeat(3);return;}
    c.innerHTML=unlocked.slice(-5).reverse().map(id=>{const a=ACHS.find(x=>x.id===id);return a?`<div class="ach-mini unlocked"><div class="ach-mini-ico">${a.icon}</div><div class="ach-mini-nm">${a.name}</div></div>`:''}).join('');
  },
  showAchPopup(a){
    $('pop-ico').textContent=a.icon;$('pop-name').textContent=a.name;
    $('pop-desc').textContent=a.desc;$('pop-xp').textContent=`+${a.xp} XP`;
    $('ach-popup').classList.remove('hidden');
    if(navigator.vibrate)navigator.vibrate([100,50,100,50,300]);
  },
  closeAchPopup(){$('ach-popup').classList.add('hidden');this.updateUI();},

  // ─ XP ─
  addXP(amt){
    if(!S.user)return;
    const prev=Math.floor((S.user.xp||0)/1000)+1;
    S.user.xp=(S.user.xp||0)+amt;
    const nw=Math.floor(S.user.xp/1000)+1;
    if(nw>prev){this.tryUnlock('level_5',{level:nw});this.tryUnlock('level_10',{level:nw});this.tryUnlock('level_20',{level:nw});setTimeout(()=>this.showAchPopup({icon:'⬆️',name:`¡NIVEL ${nw}!`,desc:`${TITLES[Math.min(nw-1,TITLES.length-1)]} — ¡Sigue creciendo!`,xp:0}),1200);}
    this.saveUser();
  },

  // ─ CHALLENGES ─
  renderChallenges(){
    const saved=JSON.parse(localStorage.getItem('cl_ch_'+(S.user?.id||''))||JSON.stringify(CHALLENGES));
    $('challenges').innerHTML=saved.map(c=>{const pct=Math.min((c.progress/c.target)*100,100);return`<div class="ch-card"><div class="ch-ico">${c.icon}</div><div class="ch-info"><div class="ch-name">${c.name}</div><div class="ch-desc">${c.desc}</div><div class="ch-prog"><div class="ch-bar" style="width:${pct}%"></div></div><div style="font-size:10px;color:var(--wdim);margin-top:3px">${Math.round(c.progress).toLocaleString()} / ${c.target.toLocaleString()}</div></div><div class="ch-reward">${c.reward}</div></div>`;}).join('');
  },

  // ─ ACTIVITY CALENDAR ─
  renderActivityCal(){
    const hist=(S.user?.workoutHistory||[]).map(w=>new Date(w.date).toDateString());
    const today=new Date();let dots='';
    for(let i=27;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const ds=d.toDateString();dots+=`<div class="cal-dot${hist.includes(ds)?' active':''}${ds===today.toDateString()?' today':''}" title="${d.toLocaleDateString()}"></div>`;}
    $('activity-cal').innerHTML=dots;
  },

  // ─ PROGRESS CHARTS ─
  buildChartSelector(){
    const tracked=EX_DB.filter(e=>e.track);
    $('chart-selector').innerHTML=tracked.map(e=>`<button class="chart-sel-btn${e.track===S.selectedChartEx?' active':''}" onclick="App.selectChartEx('${e.track}')">${e.emoji} ${e.name}</button>`).join('');
  },
  selectChartEx(track){S.selectedChartEx=track;document.querySelectorAll('.chart-sel-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');this.renderProgressCharts();},
  renderProgressCharts(){
    const hist=S.user?.workoutHistory||[];
    const exData=[];
    hist.forEach(sess=>{
      const exSess=sess.exercises?.find(e=>{const dbEx=EX_DB.find(d=>d.track===S.selectedChartEx);return dbEx&&e.name===dbEx.name;});
      if(exSess?.sets?.length>0){const maxW=Math.max(...exSess.sets.map(s=>s.weight||0));if(maxW>0)exData.push({date:new Date(sess.date).toLocaleDateString('es',{month:'short',day:'numeric'}),weight:maxW});}
    });
    const co={responsive:true,plugins:{legend:{labels:{color:'#f0eaff',font:{family:'Orbitron',size:10}}}},scales:{x:{ticks:{color:'rgba(240,234,255,0.5)',font:{size:10}},grid:{color:'rgba(255,255,255,0.03)'}},y:{ticks:{color:'rgba(240,234,255,0.5)',font:{size:10}},grid:{color:'rgba(255,255,255,0.05)'},beginAtZero:false}}};
    const c1=$('progress-chart').getContext('2d');
    if(S.progressChart)S.progressChart.destroy();
    S.progressChart=new Chart(c1,{type:'line',data:{labels:exData.slice(-10).map(d=>d.date),datasets:[{label:'Peso máximo (kg)',data:exData.slice(-10).map(d=>d.weight),borderColor:'#f5c518',backgroundColor:'rgba(245,197,24,0.1)',pointBackgroundColor:'#f5c518',pointRadius:5,tension:0.4,fill:true}]},options:co});
    const weekVols=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toDateString();const s=hist.find(h=>new Date(h.date).toDateString()===ds);weekVols.push({day:d.toLocaleDateString('es',{weekday:'short'}),vol:s?.volume||0});}
    const c2=$('volume-chart').getContext('2d');
    if(S.volumeChart)S.volumeChart.destroy();
    S.volumeChart=new Chart(c2,{type:'bar',data:{labels:weekVols.map(d=>d.day),datasets:[{label:'Volumen (kg)',data:weekVols.map(d=>d.vol),backgroundColor:'rgba(245,197,24,0.6)',borderColor:'#f5c518',borderWidth:1,borderRadius:6}]},options:{...co,scales:{...co.scales,y:{...co.scales.y,beginAtZero:true}}}});
  },
  renderRecords(){
    const r=S.user?.records||{};const tracked=EX_DB.filter(e=>e.track&&r[e.track]);
    $('records-list').innerHTML=tracked.length===0?'<div class="empty-log" style="grid-column:1/-1">Completa sesiones para ver tus récords</div>':
      tracked.map(ex=>`<div class="record-card"><div style="font-size:26px;margin-bottom:4px">${ex.emoji}</div><div class="rc-ex">${ex.name.toUpperCase()}</div><div class="rc-val">${r[ex.track]}</div><div class="rc-unit">kg · Récord Personal</div></div>`).join('');
  },

  // ─ PHOTOS ─
  addProgressPhoto(){
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.capture='user';
    input.onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const photos=JSON.parse(localStorage.getItem('cl_photos_'+S.user.id)||'[]');photos.push({date:new Date().toISOString(),src:ev.target.result});localStorage.setItem('cl_photos_'+S.user.id,JSON.stringify(photos));this.renderPhotos();toast('📸 Foto guardada');};reader.readAsDataURL(file);};
    input.click();
  },
  renderPhotos(){
    const photos=JSON.parse(localStorage.getItem('cl_photos_'+(S.user?.id||''))||'[]');
    $('photos-grid').innerHTML=[...photos.slice(-9).reverse().map(p=>`<div class="photo-card"><img src="${p.src}"><div class="photo-date">${new Date(p.date).toLocaleDateString('es',{month:'short',day:'numeric'})}</div></div>`),`<div class="photo-card" onclick="App.addProgressPhoto()" style="border-style:dashed;cursor:pointer"><span>📷</span></div>`].join('');
  },

  // ─ CALCULATORS ─
  openCalc(type){
    const titles={'1rm':'🏋️ 1RM',calories:'🔥 CALORÍAS',macros:'🥩 MACROS',bmi:'📊 IMC'};
    $('calc-title').textContent=titles[type];
    const w=S.user?.weight||'',h=S.user?.height||'',age=S.user?.age||'';
    const bodies={
      '1rm':`<div class="calc-section"><p style="font-size:12px;color:var(--wdim);margin-bottom:4px">Fórmula de Epley: peso × (1 + reps/30)</p><div class="field"><span>⚖️</span><input id="c-w" type="number" placeholder="Peso usado (kg)"></div><div class="field"><span>🔢</span><input id="c-r" type="number" placeholder="Repeticiones"></div><button class="btn-gold" onclick="App.calc1RM()">CALCULAR</button><div id="calc-out"></div></div>`,
      calories:`<div class="calc-section"><div class="field"><span>⚖️</span><input id="c-bw" type="number" placeholder="Tu peso (kg)" value="${w}"></div><div class="field"><span>⏱️</span><input id="c-min" type="number" placeholder="Duración (min)"></div><div class="field"><span>🏃</span><select id="c-act"><option value="3.5">Pesas moderado</option><option value="5">Pesas intenso</option><option value="7">Cardio moderado</option><option value="10">HIIT</option><option value="12">Correr rápido</option></select></div><button class="btn-gold" onclick="App.calcCal()">CALCULAR</button><div id="calc-out"></div></div>`,
      macros:`<div class="calc-section"><div class="field"><span>⚖️</span><input id="c-mw" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-mh" type="number" placeholder="Altura (cm)" value="${h}"></div><div class="field"><span>🎂</span><input id="c-ma" type="number" placeholder="Edad" value="${age}"></div><div class="field"><span>⚧️</span><select id="c-mg"><option value="m">Masculino</option><option value="f">Femenino</option></select></div><div class="field"><span>📅</span><select id="c-act2"><option value="1.375">Ligero (1-3/sem)</option><option value="1.55">Moderado (3-5/sem)</option><option value="1.725">Activo (6-7/sem)</option></select></div><button class="btn-gold" onclick="App.calcMacros()">CALCULAR</button><div id="calc-out"></div></div>`,
      bmi:`<div class="calc-section"><div class="field"><span>⚖️</span><input id="c-bw2" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-bh" type="number" placeholder="Altura (cm)" value="${h}"></div><button class="btn-gold" onclick="App.calcBMI()">CALCULAR</button><div id="calc-out"></div></div>`
    };
    $('calc-body').innerHTML=bodies[type]||'';this.openModal('modal-calc');
  },
  calc1RM(){const w=parseFloat($('c-w')?.value),r=parseInt($('c-r')?.value);if(!w||!r)return toast('Completa los campos');const rm=(w*(1+r/30)).toFixed(1);$('calc-out').innerHTML=`<div class="calc-result"><div class="calc-result-val">${rm} kg</div><div class="calc-result-lbl">1RM estimado · ${Math.round(rm*0.85)} kg para 3 reps · ${Math.round(rm*0.75)} kg para 8 reps</div></div>`;},
  calcCal(){const bw=parseFloat($('c-bw')?.value),min=parseInt($('c-min')?.value),met=parseFloat($('c-act')?.value)||3.5;if(!bw||!min)return toast('Completa los campos');const cal=Math.round(met*bw*min/60*3.5/200*bw);$('calc-out').innerHTML=`<div class="calc-result"><div class="calc-result-val">${cal} kcal</div><div class="calc-result-lbl">Estimado en ${min} min de entrenamiento</div></div>`;},
  calcMacros(){const w=parseFloat($('c-mw')?.value),h=parseFloat($('c-mh')?.value),a=parseInt($('c-ma')?.value),g=$('c-mg')?.value,act=parseFloat($('c-act2')?.value)||1.55;if(!w||!h||!a)return toast('Completa los campos');const bmr=g==='m'?(10*w)+(6.25*h)-(5*a)+5:(10*w)+(6.25*h)-(5*a)-161;const tdee=Math.round(bmr*act);const goal=S.user?.goal||'hypertrophy';const kcal=goal==='weightloss'?tdee-400:['strength','hypertrophy'].includes(goal)?tdee+200:tdee;const prot=Math.round(w*2.2),fat=Math.round(kcal*0.25/9),carbs=Math.round((kcal-prot*4-fat*9)/4);$('calc-out').innerHTML=`<div class="calc-result"><div class="calc-result-val">${kcal} kcal</div><div class="calc-result-lbl">Calorías diarias para tu objetivo</div></div><div class="macro-grid" style="margin-top:10px"><div class="macro-item"><div class="macro-val">${prot}g</div><div class="macro-lbl">🥩 PROTEÍNA</div></div><div class="macro-item"><div class="macro-val">${carbs}g</div><div class="macro-lbl">🍚 CARBOS</div></div><div class="macro-item"><div class="macro-val">${fat}g</div><div class="macro-lbl">🥑 GRASA</div></div></div>`;},
  calcBMI(){const w=parseFloat($('c-bw2')?.value),h=parseFloat($('c-bh')?.value);if(!w||!h)return toast('Completa los campos');const bmi=(w/Math.pow(h/100,2)).toFixed(1);const cat=bmi<18.5?'Bajo peso':bmi<25?'Peso saludable ✅':bmi<30?'Sobrepeso':bmi<35?'Obesidad I':'Obesidad II+';const col=bmi<18.5?'#00e5ff':bmi<25?'#76ff03':bmi<30?'#f5c518':bmi<35?'#ff9800':'#e53935';if(S.user){S.user.bmi=bmi;this.saveUser();}$('calc-out').innerHTML=`<div class="calc-result"><div class="calc-result-val" style="color:${col}">${bmi}</div><div class="calc-result-lbl">${cat}</div></div>`;},

  // ─ COACH PANEL ─
  renderCoachPanel(){
    const users=getUsers().filter(u=>u.username!==COACH_USERNAME);
    $('athletes-list').innerHTML=users.length===0?'<div class="empty-log">No hay atletas registrados aún</div>':users.map(u=>`<div class="athlete-card"><div class="athlete-ico">🦁</div><div class="athlete-info"><div class="athlete-name">${u.name} <span style="color:var(--gold);font-size:12px">@${u.username}</span></div><div class="athlete-stats">⚡ ${u.xp||0} XP · 💪 ${u.sessions||0} sesiones · 🔥 ${u.streak||0}d racha</div><div class="athlete-goal">${GL[u.goal]||'Sin objetivo'} · ${u.weight||'?'}kg · Nv.${Math.floor((u.xp||0)/1000)+1}</div></div></div>`).join('');
    const opts=users.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('');
    $('assign-user').innerHTML='<option value="">Seleccionar atleta...</option>'+opts;
    $('msg-user').innerHTML='<option value="">Seleccionar atleta...</option>'+opts;
    $('assign-routine').innerHTML='<option value="">Seleccionar rutina...</option>'+getRoutines().map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
  },
  assignRoutine(){
    const uid=$('assign-user').value,rid=$('assign-routine').value;
    if(!uid||!rid)return toast('Selecciona atleta y rutina');
    const users=getUsers(),u=users.find(x=>x.id===uid),r=getRoutines().find(x=>x.id===rid);
    if(!u||!r)return;if(!u.assignedRoutines)u.assignedRoutines=[];
    u.assignedRoutines.push({...r,assignedBy:S.user.username,assignedAt:new Date().toISOString()});
    saveUsers(users);toast(`✅ Rutina "${r.name}" asignada a ${u.name}`);
  },
  sendCoachMessage(){
    const uid=$('msg-user').value,txt=$('msg-text').value.trim();
    if(!uid||!txt)return toast('Selecciona atleta y escribe el mensaje');
    const users=getUsers(),u=users.find(x=>x.id===uid);if(!u)return;
    if(!u.coachMessages)u.coachMessages=[];
    u.coachMessages.push({text:txt,from:S.user.name,date:new Date().toISOString(),read:false});
    saveUsers(users);$('msg-text').value='';toast(`💬 Mensaje enviado a ${u.name}`);
  },
  checkCoachMessages(){
    if(!S.user)return;
    const msgs=(S.user.coachMessages||[]).filter(m=>!m.read);
    if(msgs.length>0){const latest=msgs[msgs.length-1];setTimeout(()=>{$('coach-msg-text').textContent=`"${latest.text}" — ${latest.from}`;$('coach-msg-popup').classList.remove('hidden');S.user.coachMessages.forEach(m=>m.read=true);this.saveUser();},2000);}
  },
  closeCoachMsg(){$('coach-msg-popup').classList.add('hidden');},

  // ─ MODALS ─
  openModal(id){$(id).classList.remove('hidden');},
  closeModal(id){$(id).classList.add('hidden');},

  // ─ NOTIFS ─
  checkNotifPermission(){if('Notification' in window&&Notification.permission==='default')setTimeout(()=>$('notif-bar').classList.remove('hidden'),3000);},
  reqNotif(){Notification.requestPermission().then(()=>this.dimNotif());toast('🔔 Notificaciones activadas');},
  dimNotif(){$('notif-bar').classList.add('hidden');},

  // ─ MISC ─
  updateWeight(){const w=prompt('Nuevo peso (kg):',S.user?.weight||'');if(!w)return;S.user.weight=parseFloat(w);if(S.user.height)S.user.bmi=(S.user.weight/Math.pow(S.user.height/100,2)).toFixed(1);this.saveUser();this.updateUI();toast(`⚖️ Peso actualizado: ${w} kg`);},
  exportData(){const blob=new Blob([JSON.stringify(S.user,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`coach-lion-${S.user.username}-${new Date().toISOString().split('T')[0]}.json`;a.click();URL.revokeObjectURL(a.href);toast('📤 Datos exportados');},
  async reqWakeLock(){try{if('wakeLock' in navigator)await navigator.wakeLock.request('screen');}catch(e){}},
};

// second alias for querySelector shortcut
function el2(id){return document.getElementById(id);}

document.addEventListener('DOMContentLoaded',()=>App.init());
