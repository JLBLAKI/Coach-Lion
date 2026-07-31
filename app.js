// ═══════════════════════════════════════
// COACH LION v10 — FULL OPTIMIZED
// ═══════════════════════════════════════

const SUPA_URL  = window.__ENV?.SUPA_URL   || 'https://ptuughawsrozmeymbxkp.supabase.co';
const SUPA_KEY  = window.__ENV?.SUPA_KEY   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dXVnaGF3c3Jvem1leW1ieGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIzMzMsImV4cCI6MjA5Mzg1ODMzM30.rN1VMPTq-f-mZrR8Q_LHe-seDnNBZGb-I5fQecJEZs8';
const GEMINI_KEY= window.__ENV?.GEMINI_KEY || 'AIzaSyAG9_BfKPv2SD59T2waNlY3uq1Ls_xjWhc';
const FAL_KEY   = window.__ENV?.FAL_KEY    || '';
const FAL_MODEL = 'fal-ai/flux/schnell';
const COACH_USERNAME    = 'coach';
const BLOCKED_USERNAMES = ['coach','admin','superuser','root','system'];
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

// ── STATE ──
const S = {
  user:null, isCoach:false,
  sessActive:false, sessStart:null, sessTimer:null,
  restTimer:null, restSec:60, restDur:60, restRunning:false,
  workLog:[], curEx:null, modalSets:[],
  rnExs:[], pickerSelEx:null, pickerGenImg:null,
  chGenImg:null, achGenImg:null, recipeGenImg:null,
  editingChId:null, editingAchId:null, editingRecipeId:null,
  progChart:null, volChart:null, weightChart:null, selChartEx:'bench_press',
  achFilter:'all', lbMode:'weekly',
  onboardSlide:0, offlineQueue:[],
  deferredInstallPrompt:null, workoutPage:0,
  _saveUserTimer:null, // debounce
};

const QUOTES=['"El dolor de hoy es la fuerza de mañana."','"No cuentes los días, haz que los días cuenten."','"El único mal entrenamiento es el que no hiciste."','"Sé la bestia que el hierro necesita."','"Un guerrero no se rinde. Se adapta."','"La disciplina hace lo que la motivación no puede."','"Los campeones no nacen, se forjan."','"El hierro no miente. Tu cuerpo tampoco."','"Sé más fuerte que tus excusas."','"Cada serie te acerca a quien quieres ser."'];

const DEFAULT_ACHS=[
  {id:'first_session',icon:'⚡',name:'PRIMER GOLPE',description:'Completa tu primera sesión',xp:100,rarity:'common',category:'sessions',image_data:null},
  {id:'ten_sessions',icon:'🔥',name:'EN LLAMAS',description:'10 sesiones completadas',xp:250,rarity:'uncommon',category:'sessions',image_data:null},
  {id:'fifty_sessions',icon:'💎',name:'DIAMANTE NEGRO',description:'50 sesiones completadas',xp:1000,rarity:'epic',category:'sessions',image_data:null},
  {id:'hundred_sessions',icon:'👑',name:'REY DEL DOJO',description:'100 sesiones completadas',xp:3000,rarity:'legendary',category:'sessions',image_data:null},
  {id:'streak_7',icon:'🗡️',name:'SAMURAI SEMANAL',description:'7 días seguidos',xp:300,rarity:'uncommon',category:'streaks',image_data:null},
  {id:'streak_30',icon:'👹',name:'DEMONIO DEL MES',description:'30 días seguidos',xp:1500,rarity:'legendary',category:'streaks',image_data:null},
  {id:'bench_100',icon:'😈',name:'THANOS JUNIOR',description:'Press de banca 100 kg',xp:500,rarity:'epic',category:'strength',image_data:null},
  {id:'bench_140',icon:'🦁',name:'MODO BESTIA',description:'Press de banca 140 kg',xp:1000,rarity:'legendary',category:'strength',image_data:null},
  {id:'squat_100',icon:'🏋️',name:'GUERRERO DRAGÓN',description:'Sentadilla 100 kg',xp:500,rarity:'epic',category:'strength',image_data:null},
  {id:'deadlift_100',icon:'⚔️',name:'COLOSO',description:'Peso muerto 100 kg',xp:500,rarity:'epic',category:'strength',image_data:null},
  {id:'deadlift_200',icon:'🌠',name:'TITÁN ABSOLUTO',description:'Peso muerto 200 kg',xp:2000,rarity:'legendary',category:'strength',image_data:null},
  {id:'curl_40',icon:'💪',name:'BRAZO DE ACERO',description:'Curl bíceps 40 kg',xp:400,rarity:'epic',category:'strength',image_data:null},
  {id:'pullups_15',icon:'🦅',name:'ÁGUILA REAL',description:'15 dominadas seguidas',xp:350,rarity:'epic',category:'strength',image_data:null},
  {id:'cardio_30',icon:'🎽',name:'CORAZÓN DE FUEGO',description:'30 min de cardio',xp:200,rarity:'uncommon',category:'cardio',image_data:null},
  {id:'volume_10k',icon:'📦',name:'REY DEL VOLUMEN',description:'10,000 kg en una sesión',xp:600,rarity:'epic',category:'volume',image_data:null},
  {id:'early_bird',icon:'🌅',name:'MADRUGADOR BESTIAL',description:'Entrena antes de las 6am',xp:200,rarity:'uncommon',category:'special',image_data:null},
  {id:'night_owl',icon:'🦉',name:'LOBO NOCTURNO',description:'Entrena después de las 10pm',xp:200,rarity:'uncommon',category:'special',image_data:null},
  {id:'level_5',icon:'⬆️',name:'GUERRERO LV5',description:'Alcanza el nivel 5',xp:500,rarity:'uncommon',category:'progression',image_data:null},
  {id:'level_10',icon:'🔱',name:'MAESTRO LV10',description:'Alcanza el nivel 10',xp:1000,rarity:'epic',category:'progression',image_data:null},
];

// ── EXERCISE DB ──
const EX_DB=[
  {id:'bench_press',name:'Press de Banca',muscle:'chest',equip:'barbell',emoji:'🏋️',diff:'intermediate',inst:'Acuéstate, agarra la barra más ancho que los hombros. Baja controlado al pecho, empuja explosivo. Escápulas retraídas.',track:'bench_press'},
  {id:'incline_press',name:'Press Inclinado',muscle:'chest',equip:'barbell',emoji:'💪',diff:'intermediate',inst:'Banco a 30-45°. Enfoca el pecho superior.',track:null},
  {id:'dumbbell_fly',name:'Aperturas con Mancuernas',muscle:'chest',equip:'dumbbell',emoji:'🦅',diff:'beginner',inst:'Brazos ligeramente flexionados, abre en arco amplio.',track:null},
  {id:'pushup',name:'Flexiones',muscle:'chest',equip:'bodyweight',emoji:'🤸',diff:'beginner',inst:'Manos al ancho de hombros, cuerpo recto.',track:null},
  {id:'cable_fly',name:'Cruces en Polea',muscle:'chest',equip:'cable',emoji:'⚡',diff:'intermediate',inst:'Desde poleas altas, junta manos frente al pecho.',track:null},
  {id:'deadlift',name:'Peso Muerto',muscle:'back',equip:'barbell',emoji:'🌋',diff:'advanced',inst:'Pies al ancho de cadera, barra sobre el metatarso. Espalda neutral, empuja el suelo.',track:'deadlift'},
  {id:'pullup',name:'Dominadas',muscle:'back',equip:'bodyweight',emoji:'🦅',diff:'intermediate',inst:'Agarre prono más ancho que hombros. Lleva el pecho a la barra.',track:'pullups'},
  {id:'bent_row',name:'Remo con Barra',muscle:'back',equip:'barbell',emoji:'⚓',diff:'intermediate',inst:'Torso 45°, barra a los abdominales. Codos hacia atrás.',track:null},
  {id:'lat_pulldown',name:'Jalón al Pecho',muscle:'back',equip:'cable',emoji:'🎯',diff:'beginner',inst:'Jala la barra al pecho superior, codos al suelo.',track:null},
  {id:'seated_row',name:'Remo Sentado Polea',muscle:'back',equip:'cable',emoji:'🚣',diff:'beginner',inst:'Espalda recta, jala hacia el ombligo.',track:null},
  {id:'ohp',name:'Press Militar',muscle:'shoulders',equip:'barbell',emoji:'🗡️',diff:'intermediate',inst:'De pie o sentado, empuja la barra por encima hasta extender completamente.',track:null},
  {id:'lateral_raise',name:'Elevaciones Laterales',muscle:'shoulders',equip:'dumbbell',emoji:'✈️',diff:'beginner',inst:'Eleva los brazos lateralmente hasta la altura de hombros.',track:null},
  {id:'face_pull',name:'Face Pull',muscle:'shoulders',equip:'cable',emoji:'🎯',diff:'beginner',inst:'Polea alta, jala hacia la cara abriendo los codos.',track:null},
  {id:'barbell_curl',name:'Curl con Barra',muscle:'biceps',equip:'barbell',emoji:'💪',diff:'beginner',inst:'Codos pegados al torso, curla la barra hasta contraer el bíceps.',track:'bicep_curl'},
  {id:'hammer_curl',name:'Curl Martillo',muscle:'biceps',equip:'dumbbell',emoji:'🔨',diff:'beginner',inst:'Agarre neutro, curla hasta el hombro.',track:null},
  {id:'incline_curl',name:'Curl Inclinado',muscle:'biceps',equip:'dumbbell',emoji:'🌟',diff:'intermediate',inst:'En banco inclinado, brazos colgando. Mayor estiramiento del bíceps.',track:null},
  {id:'skull_crusher',name:'Skull Crusher',muscle:'triceps',equip:'barbell',emoji:'💀',diff:'intermediate',inst:'Acostado, baja la barra a la frente flexionando solo los codos.',track:null},
  {id:'tricep_dip',name:'Fondos para Tríceps',muscle:'triceps',equip:'bodyweight',emoji:'⬇️',diff:'intermediate',inst:'En paralelas, baja hasta 90°.',track:null},
  {id:'tricep_pushdown',name:'Extensión Tríceps Polea',muscle:'triceps',equip:'cable',emoji:'⚡',diff:'beginner',inst:'Codos pegados, empuja hasta extensión completa.',track:null},
  {id:'squat',name:'Sentadilla',muscle:'legs',equip:'barbell',emoji:'🏋️',diff:'intermediate',inst:'Barra en trapecios, pies al ancho de hombros. Baja a paralelo o más.',track:'squat'},
  {id:'leg_press',name:'Prensa de Piernas',muscle:'legs',equip:'machine',emoji:'🦵',diff:'beginner',inst:'Pies al ancho de hombros. Baja controlado.',track:null},
  {id:'romanian_dl',name:'Peso Muerto Rumano',muscle:'legs',equip:'barbell',emoji:'🧲',diff:'intermediate',inst:'Bisagra de cadera, baja sintiendo el isquiotibial.',track:null},
  {id:'lunges',name:'Zancadas',muscle:'legs',equip:'dumbbell',emoji:'🚶',diff:'beginner',inst:'Paso adelante, rodilla trasera casi toca el suelo.',track:null},
  {id:'leg_curl',name:'Curl Femoral',muscle:'legs',equip:'machine',emoji:'🔩',diff:'beginner',inst:'Jala el peso con los isquiotibiales.',track:null},
  {id:'calf_raise',name:'Elevaciones de Talones',muscle:'legs',equip:'machine',emoji:'👟',diff:'beginner',inst:'Sube en punta de pies, mantén 1 segundo arriba.',track:null},
  {id:'plank',name:'Plancha',muscle:'core',equip:'bodyweight',emoji:'🧱',diff:'beginner',inst:'Cuerpo recto en antebrazos y pies. Aprieta abdomen y glúteos.',track:null},
  {id:'crunch',name:'Abdominales',muscle:'core',equip:'bodyweight',emoji:'🎯',diff:'beginner',inst:'Manos en la nuca, curva el tronco contrayendo el abdomen.',track:null},
  {id:'hanging_lr',name:'Elevación Piernas Colgado',muscle:'core',equip:'bodyweight',emoji:'🏋️',diff:'advanced',inst:'Colgado de la barra, eleva las piernas a 90°.',track:null},
  {id:'cable_crunch',name:'Crunch en Polea',muscle:'core',equip:'cable',emoji:'⚡',diff:'intermediate',inst:'De rodillas, jala la cuerda flexionando el torso.',track:null},
];

// ── PRESET ROUTINES (plantillas predefinidas) ──
const PRESET_ROUTINES=[
  {name:'PPL — Empuje (Lunes)',type:'ppl',day:'monday',exercises:[
    {...EX_DB.find(e=>e.id==='bench_press'),plannedSets:4,plannedReps:8,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='incline_press'),plannedSets:3,plannedReps:10,restSec:75,sets:[]},
    {...EX_DB.find(e=>e.id==='cable_fly'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='ohp'),plannedSets:3,plannedReps:10,restSec:75,sets:[]},
    {...EX_DB.find(e=>e.id==='lateral_raise'),plannedSets:3,plannedReps:15,restSec:45,sets:[]},
    {...EX_DB.find(e=>e.id==='skull_crusher'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
  ]},
  {name:'PPL — Jalar (Martes)',type:'ppl',day:'tuesday',exercises:[
    {...EX_DB.find(e=>e.id==='deadlift'),plannedSets:4,plannedReps:5,restSec:120,sets:[]},
    {...EX_DB.find(e=>e.id==='pullup'),plannedSets:4,plannedReps:8,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='bent_row'),plannedSets:3,plannedReps:10,restSec:75,sets:[]},
    {...EX_DB.find(e=>e.id==='lat_pulldown'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='barbell_curl'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='hammer_curl'),plannedSets:3,plannedReps:12,restSec:45,sets:[]},
  ]},
  {name:'PPL — Piernas (Miércoles)',type:'ppl',day:'wednesday',exercises:[
    {...EX_DB.find(e=>e.id==='squat'),plannedSets:4,plannedReps:8,restSec:120,sets:[]},
    {...EX_DB.find(e=>e.id==='leg_press'),plannedSets:3,plannedReps:12,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='romanian_dl'),plannedSets:3,plannedReps:10,restSec:75,sets:[]},
    {...EX_DB.find(e=>e.id==='leg_curl'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='calf_raise'),plannedSets:4,plannedReps:15,restSec:45,sets:[]},
  ]},
  {name:'Full Body (Lunes/Miércoles/Viernes)',type:'fullbody',day:'monday',exercises:[
    {...EX_DB.find(e=>e.id==='squat'),plannedSets:3,plannedReps:8,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='bench_press'),plannedSets:3,plannedReps:8,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='bent_row'),plannedSets:3,plannedReps:8,restSec:90,sets:[]},
    {...EX_DB.find(e=>e.id==='ohp'),plannedSets:3,plannedReps:10,restSec:75,sets:[]},
    {...EX_DB.find(e=>e.id==='plank'),plannedSets:3,plannedReps:30,restSec:45,sets:[]},
  ]},
  {name:'Principiante — Cuerpo Completo',type:'fullbody',day:'any',exercises:[
    {...EX_DB.find(e=>e.id==='pushup'),plannedSets:3,plannedReps:10,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='squat'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='lat_pulldown'),plannedSets:3,plannedReps:12,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='lunges'),plannedSets:3,plannedReps:10,restSec:60,sets:[]},
    {...EX_DB.find(e=>e.id==='plank'),plannedSets:3,plannedReps:20,restSec:45,sets:[]},
  ]},
  {name:'HIIT Cardio + Core',type:'hiit',day:'saturday',exercises:[
    {...EX_DB.find(e=>e.id==='pushup'),plannedSets:4,plannedReps:15,restSec:30,sets:[]},
    {...EX_DB.find(e=>e.id==='crunch'),plannedSets:4,plannedReps:20,restSec:30,sets:[]},
    {...EX_DB.find(e=>e.id==='lunges'),plannedSets:4,plannedReps:12,restSec:30,sets:[]},
    {...EX_DB.find(e=>e.id==='plank'),plannedSets:4,plannedReps:30,restSec:30,sets:[]},
    {...EX_DB.find(e=>e.id==='cable_crunch'),plannedSets:3,plannedReps:15,restSec:45,sets:[]},
  ]},
];

const MUSCLES=['all','chest','back','shoulders','biceps','triceps','legs','core'];
const ML={all:'Todos',chest:'Pecho',back:'Espalda',shoulders:'Hombros',biceps:'Bíceps',triceps:'Tríceps',legs:'Piernas',core:'Core'};
const EQL={barbell:'Barra',dumbbell:'Mancuerna',cable:'Polea',machine:'Máquina',bodyweight:'Peso Corporal'};
const DFL={beginner:'⭐ Principiante',intermediate:'⭐⭐ Intermedio',advanced:'⭐⭐⭐ Avanzado'};
const DAL={monday:'Lunes',tuesday:'Martes',wednesday:'Miércoles',thursday:'Jueves',friday:'Viernes',saturday:'Sábado',sunday:'Domingo',any:'Cualquier día'};
const GL={strength:'⚡ Fuerza',hypertrophy:'💪 Masa',weightloss:'🔥 Definir',endurance:'🏃 Resistencia',athletic:'🏆 Atlético'};
const RC={common:'#9e9e9e',uncommon:'#4caf50',epic:'#9c27b0',legendary:'#ff6f00'};
const RL={common:'COMÚN',uncommon:'INUSUAL',epic:'ÉPICO',legendary:'LEGENDARIO'};
const ACH_CATS=['all','sessions','streaks','strength','cardio','volume','special','progression'];
const ACH_CAT_L={all:'Todos',sessions:'Sesiones',streaks:'Rachas',strength:'Fuerza',cardio:'Cardio',volume:'Volumen',special:'Especiales',progression:'Nivel'};
const TITLES=['⚔️ NOVATO','🔥 GUERRERO','💪 VETERANO','🦁 BESTIA','👹 DEMONIO','🐉 MAESTRO','⚡ LEYENDA','👑 DIOS DEL HIERRO'];
const RECIPE_CATS=['all','desayuno','almuerzo','cena','snack','suplemento'];
const RECIPE_CAT_L={all:'Todas',desayuno:'☀️ Desayuno',almuerzo:'🌞 Almuerzo',cena:'🌙 Cena',snack:'⚡ Snack',suplemento:'💊 Suplemento'};
// Heatmap colores por músculo
const MUSCLE_COLORS={chest:'#e53935',back:'#9c27b0',shoulders:'#ff6f00',biceps:'#f5c518',triceps:'#f5c518',legs:'#4caf50',core:'#00bcd4'};

const $=id=>document.getElementById(id);
const v=id=>$(id)?.value?.trim()||'';
const pad=n=>String(n).padStart(2,'0');

// ── CACHE con TTL optimizado ──
const Cache={
  _m:{},
  get(k){if(this._m[k]!==undefined)return this._m[k];try{const r=JSON.parse(localStorage.getItem('cl_'+k));this._m[k]=r;return r;}catch(e){return null;}},
  set(k,val){this._m[k]=val;try{localStorage.setItem('cl_'+k,JSON.stringify(val));}catch(e){}},
  del(k){delete this._m[k];localStorage.removeItem('cl_'+k);},
  getTTL(k){const w=this.get(k+'_meta');if(w&&Date.now()-w.ts>w.ttl){this.del(k);this.del(k+'_meta');return null;}return this.get(k);},
  setTTL(k,val,ms){this.set(k,val);this.set(k+'_meta',{ts:Date.now(),ttl:ms});},
};

// ── BIOMETRIC ──
const Bio={
  isSupported(){return!!(window.PublicKeyCredential);},
  async isAvailable(){if(!this.isSupported())return false;try{return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();}catch(e){return false;}},
  async register(user){
    if(!await this.isAvailable())throw new Error('Biometría no disponible en este dispositivo');
    const enc=new TextEncoder();
    const rawId=enc.encode((user.id||'').slice(0,32).padEnd(32,'0'));
    const cred=await navigator.credentials.create({publicKey:{
      challenge:crypto.getRandomValues(new Uint8Array(32)),
      rp:{name:'Coach Lion',id:location.hostname||'localhost'},
      user:{id:rawId,name:user.username,displayName:user.name},
      pubKeyCredParams:[{alg:-7,type:'public-key'},{alg:-257,type:'public-key'}],
      authenticatorSelection:{userVerification:'required',authenticatorAttachment:'platform',requireResidentKey:false},
      timeout:60000,
    }});
    const credId=btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
    localStorage.setItem('cl_bio_id',credId);localStorage.setItem('cl_bio_user',user.username);
    return credId;
  },
  async authenticate(){
    if(!await this.isAvailable())throw new Error('Biometría no disponible');
    const credIdStr=localStorage.getItem('cl_bio_id');
    if(!credIdStr)throw new Error('No hay credencial registrada.');
    const credId=Uint8Array.from(atob(credIdStr),c=>c.charCodeAt(0));
    await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:credId,type:'public-key',transports:['internal']}],userVerification:'required',timeout:60000}});
    return localStorage.getItem('cl_bio_user');
  },
  isRegistered(){return!!localStorage.getItem('cl_bio_id');},
  clear(){localStorage.removeItem('cl_bio_id');localStorage.removeItem('cl_bio_user');},
};

// ── DB LAYER — optimizado ──
const DB={
  async register(name,username,password,profile){
    if(BLOCKED_USERNAMES.includes(username.toLowerCase()))throw new Error('Ese nombre de usuario no está disponible');
    if(username.length<3)throw new Error('El usuario debe tener al menos 3 caracteres');
    if(password.length<6)throw new Error('La contraseña debe tener al menos 6 caracteres');
    const{data:ex}=await sb.from('users').select('id').eq('username',username).maybeSingle();
    if(ex)throw new Error('Ese nombre de usuario ya está en uso');
    const pwHash=await hashPw(password);
    const{data:authData,error:authErr}=await sb.auth.signUp({email:`${username}@coachlion.app`,password,options:{data:{username,name}}});
    if(authErr)throw new Error(authErr.message);
    const uid=authData.user.id;
    const w=profile.weight||null,h=profile.height||null;
    const row={id:uid,name,username,password_hash:pwHash,weight:w,height:h,age:profile.age||null,
      days_per_week:profile.days?parseInt(profile.days):null,goal:profile.goal||null,level:profile.level||null,
      bmi:w&&h?(w/Math.pow(h/100,2)).toFixed(1):null,xp:0,sessions:0,streak:0,last_session:null,
      achievements:[],records:{},total_volume:0,privacy_leaderboard:true,
      weight_log:[],body_measurements:{},workout_notes:[],
      created_at:new Date().toISOString()};
    const{error:dbErr}=await sb.from('users').insert(row);
    if(dbErr)throw new Error(dbErr.message);
    Cache.set('user',row);return row;
  },

  async login(username,password){
    const{data,error}=await sb.auth.signInWithPassword({email:`${username}@coachlion.app`,password});
    if(error){
      const cached=Cache.get('user');
      if(cached&&cached.username===username){const ok=await verifyPw(password,cached.password_hash||'');if(ok)return{user:cached,offline:true};}
      throw new Error('Usuario o contraseña incorrectos');
    }
    const{data:profile,error:pErr}=await sb.from('users').select('*').eq('id',data.user.id).single();
    if(pErr)throw new Error(pErr.message);
    Cache.set('user',profile);
    return{user:profile,offline:false};
  },

  async logout(){await sb.auth.signOut();Cache.del('user');},

  async getSession(){
    // Cache agresivo — solo refresca si pasaron 30 minutos
    const cached=Cache.get('user');
    const lastRefresh=Cache.get('user_refreshed');
    if(cached&&lastRefresh&&Date.now()-lastRefresh<30*60*1000)return cached;
    const{data}=await sb.auth.getSession();
    if(data.session){
      const{data:p}=await sb.from('users').select('*').eq('id',data.session.user.id).single();
      if(p){Cache.set('user',p);Cache.set('user_refreshed',Date.now());return p;}
    }
    return cached;
  },

  async resetPassword(email){
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/?reset=1'});
    if(error)throw new Error(error.message);
  },

  // saveUser con debounce — evita múltiples saves seguidos
  async saveUser(user){
    Cache.set('user',user);Cache.del('all_users');Cache.del('all_users_meta');
    if(!navigator.onLine){S.offlineQueue.push({type:'saveUser',data:user});this._persistQueue();return;}
    clearTimeout(S._saveUserTimer);
    S._saveUserTimer=setTimeout(async()=>{
      await sb.from('users').upsert({id:user.id,name:user.name,username:user.username,
        weight:user.weight,height:user.height,age:user.age,
        days_per_week:user.days_per_week||(user.days?parseInt(user.days):null),
        goal:user.goal,level:user.level,bmi:user.bmi,xp:user.xp||0,
        sessions:user.sessions||0,streak:user.streak||0,last_session:user.last_session,
        achievements:user.achievements||[],records:user.records||{},
        total_volume:user.total_volume||0,privacy_leaderboard:user.privacy_leaderboard!==false,
        weight_log:user.weight_log||[],body_measurements:user.body_measurements||{},
        workout_notes:user.workout_notes||[]});
    },2000); // debounce 2 segundos
  },

  _persistQueue(){
    try{localStorage.setItem('cl_offline_q',JSON.stringify(S.offlineQueue));}catch(e){}
  },

  async getAllUsers(){
    const cached=Cache.getTTL('all_users');if(cached)return cached;
    if(!navigator.onLine)return Cache.get('all_users')||[];
    const{data}=await sb.from('users').select('id,name,username,xp,sessions,streak,total_volume,goal,weight,privacy_leaderboard').neq('username',COACH_USERNAME);
    const r=data||[];Cache.setTTL('all_users',r,5*60*1000);return r;
  },

  async getRoutines(userId){
    const uid=userId||S.user?.id;const k='routines_'+uid;
    const cached=Cache.getTTL(k);if(cached)return cached;
    if(!navigator.onLine)return Cache.get(k)||[];
    const{data}=await sb.from('routines').select('*').eq('user_id',uid).order('created_at',{ascending:false});
    const r=data||[];Cache.setTTL(k,r,10*60*1000);return r;
  },

  async saveRoutine(routine,userId){
    const uid=userId||S.user?.id;
    const row={user_id:uid,name:routine.name,type:routine.type,day_of_week:routine.day||routine.day_of_week,exercises:routine.exercises,circuit_rest:routine.circuitRest||90};
    if(routine.id&&!String(routine.id).startsWith('temp_'))row.id=routine.id;
    Cache.del('routines_'+uid);Cache.del('routines_'+uid+'_meta');
    if(!navigator.onLine){S.offlineQueue.push({type:'saveRoutine',data:row,userId:uid});this._persistQueue();return{...row,id:'temp_'+Date.now()};}
    const{data,error}=await sb.from('routines').upsert(row).select().single();
    if(error){console.warn(error.message);return row;}return data;
  },

  async deleteRoutine(id,userId){
    const uid=userId||S.user?.id;
    Cache.del('routines_'+uid);Cache.del('routines_'+uid+'_meta');
    if(!navigator.onLine){S.offlineQueue.push({type:'deleteRoutine',id,userId:uid});this._persistQueue();return;}
    await sb.from('routines').delete().eq('id',id).eq('user_id',uid);
  },

  async saveWorkout(workout,userId){
    const uid=userId||S.user?.id;
    const row={user_id:uid,exercises:workout.exercises,total_volume:workout.volume||0,duration_seconds:workout.duration||0,notes:workout.notes||null};
    Cache.del('wh_'+uid+'_0');Cache.del('wh_'+uid+'_0_meta');
    if(!navigator.onLine){S.offlineQueue.push({type:'saveWorkout',data:row});this._persistQueue();return;}
    await sb.from('workout_sessions').insert(row);
  },

  async getWorkoutHistory(userId,page=0){
    const uid=userId||S.user?.id;const k='wh_'+uid+'_'+page;
    const cached=Cache.getTTL(k);if(cached)return cached;
    if(!navigator.onLine)return Cache.get(k)||[];
    const from=page*20,to=from+19;
    // No trae exercises completos en lista — solo metadata
    const{data}=await sb.from('workout_sessions').select('id,created_at,total_volume,duration_seconds,notes').eq('user_id',uid).order('created_at',{ascending:false}).range(from,to);
    const r=data||[];Cache.setTTL(k,r,5*60*1000);return r;
  },

  async getWorkoutDetail(id){
    const k='wd_'+id;const cached=Cache.getTTL(k);if(cached)return cached;
    const{data}=await sb.from('workout_sessions').select('*').eq('id',id).single();
    if(data)Cache.setTTL(k,data,60*60*1000);
    return data;
  },

  async getChallenges(){
    const cached=Cache.getTTL('challenges');if(cached)return cached;
    if(!navigator.onLine)return Cache.get('challenges')||[];
    const{data}=await sb.from('challenges').select('*').order('created_at',{ascending:false});
    const r=data||[];Cache.setTTL('challenges',r,30*60*1000); // TTL 30 min — retos cambian poco
    return r;
  },

  async getUserChallengeProgress(userId){
    const uid=userId||S.user?.id;const k='ch_prog_'+uid;
    const cached=Cache.getTTL(k);if(cached)return cached;
    if(!navigator.onLine)return Cache.get(k)||[];
    const{data}=await sb.from('user_challenge_progress').select('*').eq('user_id',uid);
    const r=data||[];Cache.setTTL(k,r,2*60*1000);return r;
  },

  async updateChallengeProgress(challengeId,value,userId){
    const uid=userId||S.user?.id;
    Cache.del('ch_prog_'+uid);Cache.del('ch_prog_'+uid+'_meta');
    if(!navigator.onLine)return;
    await sb.from('user_challenge_progress').upsert({user_id:uid,challenge_id:challengeId,progress:value,updated_at:new Date().toISOString()});
  },

  async saveChallenge(ch){
    Cache.del('challenges');Cache.del('challenges_meta');
    const row={name:ch.name,description:ch.description||ch.desc||'',reward:ch.reward||'XP',
      challenge_type:ch.type||'custom',target_value:ch.target||0,icon:ch.icon||'🎯',
      difficulty:ch.difficulty||'medium',duration_days:ch.duration_days||30,xp_reward:ch.xp_reward||100,
      image_data:ch.imageData&&ch.imageData.length<50000?ch.imageData:null};
    if(ch.id&&!String(ch.id).startsWith('temp'))row.id=ch.id;
    if(!navigator.onLine){S.offlineQueue.push({type:'saveChallenge',data:row});return ch;}
    const{data,error}=await sb.from('challenges').upsert(row).select().single();
    if(error){console.warn(error.message);return ch;}return data;
  },

  async deleteChallenge(id){Cache.del('challenges');Cache.del('challenges_meta');await sb.from('challenges').delete().eq('id',id);},

  async getAchs(){
    const cached=Cache.getTTL('ach_def');if(cached)return cached;
    if(!navigator.onLine)return Cache.get('ach_def')||DEFAULT_ACHS;
    const{data,error}=await sb.from('achievement_definitions').select('*').order('created_at',{ascending:true});
    if(error||!data?.length)return DEFAULT_ACHS;
    Cache.setTTL('ach_def',data,15*60*1000);return data;
  },

  async saveAch(ach){
    Cache.del('ach_def');Cache.del('ach_def_meta');
    const row={id:ach.id,name:ach.name,description:ach.description||ach.desc||'',xp:ach.xp||100,
      rarity:ach.rarity||'common',category:ach.cat||ach.category||'special',icon:ach.icon||'🏆',
      image_data:ach.image_data&&ach.image_data.length<50000?ach.image_data:null};
    const{data,error}=await sb.from('achievement_definitions').upsert(row).select().single();
    if(error){console.warn(error.message);return ach;}return data;
  },

  async deleteAch(id){Cache.del('ach_def');Cache.del('ach_def_meta');await sb.from('achievement_definitions').delete().eq('id',id);},

  async sendMessage(toUserId,text,fromUserId,fromName){
    if(!navigator.onLine){S.offlineQueue.push({type:'sendMessage',toUserId,text,fromUserId,fromName});this._persistQueue();return;}
    await sb.from('coach_messages').insert({to_user_id:toUserId,from_user_id:fromUserId,from_name:fromName,message:text,read:false});
  },

  async getMessages(userId){
    const uid=userId||S.user?.id;
    if(!navigator.onLine)return Cache.get('msgs_'+uid)||[];
    const{data}=await sb.from('coach_messages').select('*').or(`to_user_id.eq.${uid},from_user_id.eq.${uid}`).order('created_at',{ascending:true}).limit(50);
    const r=data||[];Cache.set('msgs_'+uid,r);return r;
  },

  async getUnreadMessages(userId){
    if(!navigator.onLine)return[];
    const{data}=await sb.from('coach_messages').select('*').eq('to_user_id',userId).eq('read',false).order('created_at',{ascending:true});
    return data||[];
  },

  async markMessagesRead(userId){await sb.from('coach_messages').update({read:true}).eq('to_user_id',userId);},

  // RECIPES — lazy: lista sin image_data, imagen solo al abrir
  async getRecipes(){
    const cached=Cache.getTTL('recipes');if(cached)return cached;
    if(!navigator.onLine)return Cache.get('recipes')||[];
    // NO traer image_data en la lista — ahorra ancho de banda
    const{data}=await sb.from('recipes').select('id,name,category,description,prep_time,difficulty,calories,protein,carbs,fat,tags,created_at').order('created_at',{ascending:false});
    const r=data||[];Cache.setTTL('recipes',r,10*60*1000);return r;
  },

  async getRecipeDetail(id){
    const k='recipe_'+id;const cached=Cache.getTTL(k);if(cached)return cached;
    const{data}=await sb.from('recipes').select('*').eq('id',id).single();
    if(data)Cache.setTTL(k,data,30*60*1000);
    return data;
  },

  async saveRecipe(recipe){
    Cache.del('recipes');Cache.del('recipes_meta');
    const row={name:recipe.name,category:recipe.category||'almuerzo',description:recipe.description||'',
      prep_time:recipe.prep_time||15,difficulty:recipe.difficulty||'easy',
      calories:recipe.calories||null,protein:recipe.protein||null,carbs:recipe.carbs||null,fat:recipe.fat||null,
      ingredients:recipe.ingredients||[],steps:recipe.steps||[],tags:recipe.tags||[],
      image_data:recipe.image_data&&recipe.image_data.length<50000?recipe.image_data:null};
    if(recipe.id&&!String(recipe.id).startsWith('temp'))row.id=recipe.id;
    if(!navigator.onLine){S.offlineQueue.push({type:'saveRecipe',data:row});return recipe;}
    const{data,error}=await sb.from('recipes').upsert(row).select().single();
    if(error){console.warn(error.message);return recipe;}return data;
  },

  async deleteRecipe(id){Cache.del('recipes');Cache.del('recipes_meta');Cache.del('recipe_'+id);await sb.from('recipes').delete().eq('id',id);},

  async uploadPhoto(dataUrl,userId){
    const uid=userId||S.user?.id;
    try{
      const blob=await(await fetch(dataUrl)).blob();
      const path=`${uid}/${Date.now()}.jpg`;
      const{error}=await sb.storage.from('progress-photos').upload(path,blob,{contentType:'image/jpeg',upsert:false});
      if(error)throw error;
      const{data}=sb.storage.from('progress-photos').getPublicUrl(path);
      return data.publicUrl;
    }catch(e){return dataUrl;}
  },

  async getPhotos(userId){
    const uid=userId||S.user?.id;
    try{
      const{data}=await sb.storage.from('progress-photos').list(uid,{sortBy:{column:'created_at',order:'desc'},limit:20});
      if(data?.length){return data.map(f=>{const{data:u}=sb.storage.from('progress-photos').getPublicUrl(`${uid}/${f.name}`);return{src:u.publicUrl,date:f.created_at||new Date().toISOString()};});}
    }catch(e){}
    return JSON.parse(localStorage.getItem('cl_ph_'+uid)||'[]');
  },

  async syncOfflineQueue(){
    if(!navigator.onLine||S.offlineQueue.length===0)return;
    const q=[...S.offlineQueue];S.offlineQueue=[];
    for(const item of q){
      try{
        if(item.type==='saveUser')       await this.saveUser(item.data);
        if(item.type==='saveRoutine')    await sb.from('routines').upsert(item.data);
        if(item.type==='deleteRoutine')  await sb.from('routines').delete().eq('id',item.id);
        if(item.type==='saveWorkout')    await sb.from('workout_sessions').insert(item.data);
        if(item.type==='saveChallenge')  await sb.from('challenges').upsert(item.data);
        if(item.type==='deleteChallenge')await sb.from('challenges').delete().eq('id',item.id);
        if(item.type==='saveAch')        await sb.from('achievement_definitions').upsert(item.data);
        if(item.type==='deleteAch')      await sb.from('achievement_definitions').delete().eq('id',item.id);
        if(item.type==='sendMessage')    await sb.from('coach_messages').insert({to_user_id:item.toUserId,from_user_id:item.fromUserId,from_name:item.fromName,message:item.text,read:false});
        if(item.type==='saveRecipe')     await this.saveRecipe(item.data);
        if(item.type==='deleteRecipe')   await sb.from('recipes').delete().eq('id',item.id);
      }catch(e){console.warn('Sync err:',e.message);S.offlineQueue.push(item);}
    }
    localStorage.removeItem('cl_offline_q');
    if(S.offlineQueue.length===0)toast('✅ Datos sincronizados');
  },
};

// ── CRYPTO ──
async function hashPw(pw){const d=new TextEncoder().encode(pw+'cl_salt_2024');const h=await crypto.subtle.digest('SHA-256',d);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function verifyPw(pw,hash){return(await hashPw(pw))===hash;}

// ── IMAGE COMPRESSION ──
function compressImg(dataUrl,maxW=800,q=0.72){
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{
      try{
        const canvas=document.createElement('canvas');
        // Maintain aspect ratio, cap at maxW
        const ratio=Math.min(maxW/img.width,maxW/img.height,1);
        canvas.width=Math.round(img.width*ratio);
        canvas.height=Math.round(img.height*ratio);
        const ctx=canvas.getContext('2d');
        ctx.imageSmoothingEnabled=true;
        ctx.imageSmoothingQuality='high';
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        // Try WebP first, fallback to JPEG
        let out=canvas.toDataURL('image/webp',q);
        if(out.length<100||out==='data:,')out=canvas.toDataURL('image/jpeg',q);
        res(out);
      }catch(e){res(dataUrl);}
    };
    img.onerror=()=>res(dataUrl);
    img.src=dataUrl;
  });
}

// ── AI IMAGE ──
async function genImgGemini(prompt){
  if(!GEMINI_KEY)return null;
  try{
    const full=`${prompt}. Style: vibrant comic book art, Marvel/DC anime fusion, bold colors, dramatic lighting, halftone dots, strong black outlines, dark background with gold accents, no text overlay`;
    const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:full}]}],generationConfig:{responseModalities:['IMAGE','TEXT']}})});
    if(!res.ok)return null;
    const data=await res.json();
    const p=(data?.candidates?.[0]?.content?.parts||[]).find(p=>p.inlineData?.mimeType?.startsWith('image/'));
    if(!p?.inlineData?.data)return null;
    return await compressImg(`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`,400,0.7);
  }catch(e){return null;}
}

async function genImgFal(prompt){
  if(!FAL_KEY)return null;
  try{
    const res=await fetch(`https://fal.run/${FAL_MODEL}`,{method:'POST',headers:{Authorization:`Key ${FAL_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({prompt:`${prompt}, comic book anime Marvel style`,image_size:'square',num_inference_steps:4,num_images:1})});
    if(!res.ok)return null;
    const data=await res.json();const url=data?.images?.[0]?.url;if(!url)return null;
    const blob=await(await fetch(url)).blob();
    const du=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob);});
    return await compressImg(du,400,0.7);
  }catch(e){return null;}
}

function fallbackSVG(name,icon){
  const ic=icon||['💪','🏆','🔥','⚡','🦁','👹'][Math.floor(Math.random()*6)];
  const c1=['#f5c518','#e53935','#9c27b0','#ff6f00','#00e5ff','#4caf50'][Math.floor(Math.random()*6)];
  const uid=Date.now();
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g${uid}" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="${c1}" stop-opacity="0.25"/><stop offset="100%" stop-color="#08080f"/></radialGradient></defs><rect width="200" height="200" fill="#08080f"/><rect width="200" height="200" fill="url(#g${uid})"/><polygon points="100,8 192,54 192,146 100,192 8,146 8,54" fill="none" stroke="${c1}" stroke-width="2" opacity="0.35"/><text x="100" y="115" text-anchor="middle" font-size="80" dominant-baseline="middle">${ic}</text><text x="100" y="174" text-anchor="middle" font-size="9" fill="${c1}" font-family="Impact,sans-serif" letter-spacing="3" opacity="0.85">${(name||'').toUpperCase().slice(0,16)}</text></svg>`;
  return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
}

async function generateAIImage(prompt,name,icon){
  const gem=await genImgGemini(prompt);if(gem)return gem;
  const fal=await genImgFal(prompt);if(fal)return fal;
  return fallbackSVG(name,icon);
}

// ── GEMINI TEXT ──
// Gemini JSON (recetas, rutinas)
async function askGemini(prompt,sys){
  if(!GEMINI_KEY)return null;
  const MODELS=['gemini-1.5-flash','gemini-1.5-flash-8b','gemini-pro'];
  for(const model of MODELS){
    try{
      const fullPrompt=sys?`${sys}\n\n${prompt}`:prompt;
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:fullPrompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:1500}})
      });
      if(!res.ok)continue;
      const data=await res.json();
      const text=data?.candidates?.[0]?.content?.parts?.[0]?.text||'';
      if(!text)continue;
      try{return JSON.parse(text.replace(/```json|```/g,'').trim());}catch{return null;}
    }catch(e){continue;}
  }
  return null;
}

// Gemini texto libre (chat IA coach)
async function askGeminiText(prompt){
  if(!GEMINI_KEY)return null;
  const MODELS=['gemini-1.5-flash','gemini-1.5-flash-8b','gemini-pro'];
  for(const model of MODELS){
    try{
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.85,maxOutputTokens:250}})
      });
      if(!res.ok){const err=await res.json().catch(()=>({}));console.warn(model+':',err?.error?.message);continue;}
      const data=await res.json();
      const text=data?.candidates?.[0]?.content?.parts?.[0]?.text||'';
      if(text)return text.trim();
    }catch(e){continue;}
  }
  return null;
}

// ── VOICE TIMER (síntesis de voz) ──
function speak(text){
  if(!window.speechSynthesis)return;
  const u=new SpeechSynthesisUtterance(text);
  u.lang='es-ES';u.rate=1.1;u.pitch=1.2;u.volume=0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ── SHARE ACHIEVEMENT (compartir como imagen) ──
async function shareAchievement(ach){
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=600;
  const ctx=canvas.getContext('2d');
  // Background
  ctx.fillStyle='#08080f';ctx.fillRect(0,0,600,600);
  // Gold gradient
  const grd=ctx.createRadialGradient(300,200,50,300,300,350);
  grd.addColorStop(0,'rgba(245,197,24,0.2)');grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd;ctx.fillRect(0,0,600,600);
  // Hexagon border
  ctx.strokeStyle='#f5c518';ctx.lineWidth=3;ctx.globalAlpha=0.4;
  ctx.beginPath();const pts=[[300,30],[570,165],[570,435],[300,570],[30,435],[30,165]];
  pts.forEach((p,i)=>i===0?ctx.moveTo(...p):ctx.lineTo(...p));ctx.closePath();ctx.stroke();
  ctx.globalAlpha=1;
  // Icon
  ctx.font='160px serif';ctx.textAlign='center';ctx.fillText(ach.icon||'🏆',300,260);
  // Name
  ctx.font='bold 36px Impact, sans-serif';ctx.fillStyle='#f5c518';ctx.letterSpacing='4px';
  ctx.fillText((ach.name||'LOGRO').toUpperCase(),300,340);
  // Description
  ctx.font='20px sans-serif';ctx.fillStyle='rgba(240,234,255,0.7)';
  ctx.fillText(ach.description||'',300,380);
  // App name
  ctx.font='bold 18px sans-serif';ctx.fillStyle='rgba(245,197,24,0.5)';
  ctx.fillText('COACH LION 🦁',300,540);
  // Share or download
  canvas.toBlob(async blob=>{
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],'logro.png',{type:'image/png'})]})){
      await navigator.share({title:'Coach Lion — '+ach.name,files:[new File([blob],'logro.png',{type:'image/png'})]});
    } else {
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`logro-${(ach.name||'coach-lion').toLowerCase().replace(/\s+/g,'-')}.png`;a.click();URL.revokeObjectURL(a.href);
    }
  },'image/png');
}

// ── SOUND ──
function playRoar(){
  try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type='sawtooth';osc.frequency.setValueAtTime(120,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(60,ctx.currentTime+0.3);gain.gain.setValueAtTime(0.4,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.6);}catch(e){}
}

// ── TOAST ──
function toast(msg){
  document.querySelector('.cl-t')?.remove();
  const t=document.createElement('div');t.className='cl-t';t.textContent=msg;
  t.style.cssText='position:fixed;bottom:calc(var(--nav) + 12px);left:50%;transform:translateX(-50%);background:var(--d3);border:1px solid var(--borderb);color:var(--white);padding:10px 16px;border-radius:11px;font-family:var(--fu);font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;box-shadow:0 8px 28px rgba(0,0,0,.5)';
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},3000);
}

// ═══════════════════════════════════════
const App={

  async init(){
    this.buildMFilters();this.buildAchFilters();this.buildRecipeFilters();
    this.setupOffline();this.setupPWAInstall();
    // Restore offline queue from localStorage
    try{const q=JSON.parse(localStorage.getItem('cl_offline_q')||'[]');if(q.length)S.offlineQueue=q;}catch(e){}
    // Restore timer if app was closed mid-session
    const saved=localStorage.getItem('cl_sess_start');
    if(saved){S.sessActive=true;S.sessStart=parseInt(saved);S.sessTimer=setInterval(()=>this.tickSess(),1000);}
    setTimeout(async()=>{
      const sp=$('splash');sp.style.cssText='opacity:0;transition:opacity .5s;position:fixed;inset:0;z-index:9999;pointer-events:none';
      setTimeout(async()=>{sp.style.display='none';if(!localStorage.getItem('cl_onboarded'))this.showOnboarding();else await this.checkSess();},500);
    },2900);
  },

  setupPWAInstall(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.deferredInstallPrompt=e;$('install-btn')?.classList.remove('hidden');});
    window.addEventListener('appinstalled',()=>{$('install-btn')?.classList.add('hidden');S.deferredInstallPrompt=null;toast('✅ Coach Lion instalada');});
    if(navigator.standalone===false&&/iphone|ipad|ipod/i.test(navigator.userAgent))$('install-btn')?.classList.remove('hidden');
  },

  async triggerInstall(){
    if(S.deferredInstallPrompt){S.deferredInstallPrompt.prompt();const{outcome}=await S.deferredInstallPrompt.userChoice;S.deferredInstallPrompt=null;if(outcome==='accepted')toast('✅ ¡Coach Lion instalada!');}
    else if(/iphone|ipad|ipod/i.test(navigator.userAgent))this.openModal('modal-ios-install');
    else toast('📲 Menú del navegador → "Añadir a pantalla de inicio"');
  },

  showOnboarding(){this.showScr('onboarding');S.onboardSlide=0;this.updateOnboardSlide();},
  updateOnboardSlide(){
    document.querySelectorAll('.onboard-slide').forEach((s,i)=>s.classList.toggle('active',i===S.onboardSlide));
    const c=$('onboard-dots');if(c)c.innerHTML=Array(4).fill(0).map((_,i)=>`<div class="onboard-dot${i===S.onboardSlide?' active':''}"></div>`).join('');
    const btn=$('onboard-next');if(btn)btn.textContent=S.onboardSlide===3?'🦁 COMENZAR':'SIGUIENTE →';
  },
  onboardNext(){if(S.onboardSlide<3){S.onboardSlide++;this.updateOnboardSlide();}else this.skipOnboard();},
  skipOnboard(){localStorage.setItem('cl_onboarded','1');this.checkSess();},

  async checkSess(){
    try{
      const profile=await DB.getSession();
      if(profile){S.user=profile;this.enterApp();}
      else{this.showScr('auth');if(Bio.isRegistered())$('bio-btn')?.classList.remove('hidden');if(location.search.includes('reset=1'))this.showResetForm();}
    }catch(e){this.showScr('auth');}
  },

  showScr(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$(id)?.classList.remove('hidden');},

  async enterApp(){
    try{
      this.showScr('app');
      S.isCoach=S.user.username===COACH_USERNAME;
      if(S.isCoach){$('coach-btn')?.classList.remove('hidden');$('coach-nav')?.classList.remove('hidden');}
      this.updateHeader();
      // Home en background — no bloquea UI
      setTimeout(async()=>{try{await this.updateHome();}catch(e){console.warn('updateHome:',e);}},80);
      this.checkCoachMsg();this.checkNotif();this.buildChartSel();
      if('wakeLock' in navigator)this.reqWL();
      if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
    }catch(e){
      console.error('enterApp:',e);
      // Restaurar cualquier botón deshabilitado
      const b1=document.querySelector('#form-login .btn-gold');
      if(b1){b1.textContent='⚡ ENTRAR';b1.disabled=false;}
      const b2=document.querySelector('#form-reg .btn-gold');
      if(b2){b2.textContent='🦁 CREAR MI PERFIL';b2.disabled=false;}
      toast('Error al cargar. Intenta de nuevo.');
      this.showScr('auth');
    }
  },

  showReg(){$('form-login')?.classList.add('hidden');$('form-reg')?.classList.remove('hidden');},
  showLogin(){['form-reg','form-forgot','form-reset-pw'].forEach(id=>$(id)?.classList.add('hidden'));$('form-login')?.classList.remove('hidden');},
  showForgot(){$('form-login')?.classList.add('hidden');$('form-forgot')?.classList.remove('hidden');},
  showResetForm(){$('form-login')?.classList.add('hidden');$('form-reset-pw')?.classList.remove('hidden');},

  async register(){
    const n=v('r-name'),u=v('r-user'),p=v('r-pass');
    if(!n||!u||!p)return toast('Completa nombre, usuario y contraseña');
    const btn=document.querySelector('#form-reg .btn-gold');btn.textContent='⏳ CREANDO...';btn.disabled=true;
    try{
      const w=parseFloat(v('r-w'))||null,h=parseFloat(v('r-h'))||null;
      const user=await DB.register(n,u,p,{weight:w,height:h,age:parseInt(v('r-age'))||null,days:v('r-days'),goal:v('r-goal'),level:v('r-level')});
      S.user=user;await this.enterApp();
      setTimeout(()=>this.showAchPopup({icon:'🦁',name:'¡BIENVENIDO!',description:`Perfil @${u} creado. ¡La bestia despierta!`,xp:50,image_data:null}),800);
    }catch(e){toast('Error: '+e.message);btn.textContent='🦁 CREAR MI PERFIL';btn.disabled=false;}
  },

  async login(){
    const u=v('l-user'),p=v('l-pass');
    if(!u||!p)return toast('Ingresa usuario y contraseña');
    const btn=document.querySelector('#form-login .btn-gold');
    btn.textContent='⏳ ENTRANDO...';btn.disabled=true;
    const _restore=()=>{btn.textContent='⚡ ENTRAR';btn.disabled=false;};
    // Failsafe: siempre restaura botón después de 12s
    const _timeout=setTimeout(_restore,12000);
    try{
      const{user}=await DB.login(u,p);
      S.user=user;
      clearTimeout(_timeout);
      await this.enterApp();
    }catch(e){
      clearTimeout(_timeout);
      _restore();
      toast(e.message||'Usuario o contraseña incorrectos');
    }
  },

  async forgotPassword(){
    const email=v('forgot-email');if(!email)return toast('Ingresa tu correo electrónico');
    try{await DB.resetPassword(email);toast('📧 Revisa tu correo para restablecer la contraseña');this.showLogin();}
    catch(e){toast('Error: '+e.message);}
  },

  async biometricLogin(){
    if(!Bio.isRegistered()){toast('Activa el acceso biométrico en tu perfil primero');return;}
    const btn=$('bio-btn');if(btn){btn.textContent='⏳ Verificando...';btn.disabled=true;}
    try{
      const username=await Bio.authenticate();
      let user=Cache.get('user');
      if(!user||user.username!==username){
        const{data}=await sb.auth.getSession();
        if(data?.session){const{data:p}=await sb.from('users').select('*').eq('username',username).single();if(p){user=p;Cache.set('user',p);}}
      }
      if(user&&user.username===username){
        S.user=user;await this.enterApp();toast('🔓 Acceso biométrico exitoso');
      } else {
        const storedPw=localStorage.getItem('cl_bio_pw');
        if(storedPw){
          try{const{user:u}=await DB.login(username,atob(storedPw));S.user=u;await this.enterApp();toast('🔓 Acceso biométrico exitoso');}
          catch(e2){Bio.clear();localStorage.removeItem('cl_bio_pw');toast('Sesión expirada. Inicia sesión manualmente.');}
        } else toast('Inicia sesión una vez manualmente para vincular la biometría.');
      }
    }catch(e){
      if(e.name==='NotAllowedError')toast('Autenticación cancelada o denegada');
      else toast('Error: '+e.message);
    }finally{if(btn){btn.textContent='🔱 Face ID / Huella';btn.disabled=false;}}
  },

  async saveBiometric(){
    if(!S.user)return;
    if(!await Bio.isAvailable()){toast('Este dispositivo no soporta Face ID / Huella digital');return;}
    const pw=prompt('Ingresa tu contraseña para activar la biometría:');if(!pw)return;
    try{
      await DB.login(S.user.username,pw);
      await Bio.register(S.user);
      localStorage.setItem('cl_bio_pw',btoa(pw));
      toast('✅ Face ID / Huella activada correctamente');
      await this.updateProfile();
    }catch(e){
      if(e.name==='NotAllowedError')toast('Permiso denegado. Ve a Ajustes del dispositivo.');
      else if(e.name==='InvalidStateError'){localStorage.setItem('cl_bio_pw',btoa(pw));toast('✅ Contraseña actualizada.');}
      else if(e.message?.includes('incorrectos'))toast('Contraseña incorrecta.');
      else toast('Error: '+e.message);
    }
  },

  async removeBiometric(){
    if(!confirm('¿Desactivar Face ID / Huella digital?'))return;
    Bio.clear();localStorage.removeItem('cl_bio_pw');toast('🔒 Acceso biométrico desactivado');await this.updateProfile();
  },

  async logout(){
    if(!confirm('¿Cerrar sesión?'))return;
    this.stopSess();await DB.logout();S.user=null;S.isCoach=false;
    this.showScr('auth');this.showLogin();
    $('coach-btn')?.classList.add('hidden');$('coach-nav')?.classList.add('hidden');
    const biobtn=$('bio-btn');if(biobtn)biobtn.classList.toggle('hidden',!Bio.isRegistered());
  },

  // ── UI SELECTIVO — divide updateUI en partes para evitar queries innecesarias ──
  async updateUI(){
    await this.updateHeader();
    await this.updateHome();
    await this.updateProfile();
  },

  updateHeader(){
    if(!S.user)return;
    const u=S.user,lv=Math.floor((u.xp||0)/1000)+1,xpLv=(u.xp||0)%1000;
    $('t-name').textContent=u.username.toUpperCase();
    $('h-name').textContent=u.name.split(' ')[0].toUpperCase();
    $('h-quote').textContent=QUOTES[new Date().getDay()%QUOTES.length];
    $('s-sess').textContent=u.sessions||0;$('s-ach').textContent=(u.achievements||[]).length;
    $('s-xp').textContent=u.xp||0;$('s-str').textContent=u.streak||0;
    $('xp-fill').style.width=(xpLv/10)+'%';
  },

  async updateHome(){
    if(!S.user)return;
    await this.renderTodayR();this.renderActCal();this.renderMuscleHeatmap();
    await this.renderRecentAchs();this.renderRecords();
    await this.renderLeaderboardMini();await this.renderChallengesHome();
  },

  async updateProfile(){
    if(!S.user)return;
    const u=S.user,lv=Math.floor((u.xp||0)/1000)+1,xpLv=(u.xp||0)%1000;
    $('p-name').textContent=u.name.toUpperCase();$('p-lv-txt').textContent='NIVEL '+lv;
    $('lv-fill').style.width=(xpLv/10)+'%';$('p-badge').textContent=TITLES[Math.min(lv-1,TITLES.length-1)];
    $('p-stats').innerHTML=[
      {i:'⚖️',v:u.weight||'--',l:'PESO KG'},{i:'📏',v:u.height||'--',l:'ALTURA CM'},
      {i:'🎂',v:u.age||'--',l:'EDAD'},{i:'📊',v:u.bmi||'--',l:'IMC'},
      {i:'🎯',v:GL[u.goal]||'--',l:'OBJETIVO'},{i:'📅',v:(u.days_per_week||u.days||'--')+'d',l:'DÍAS/SEM'},
    ].map(s=>`<div class="ps"><div class="ps-i">${s.i}</div><div class="ps-v">${s.v}</div><div class="ps-l">${s.l}</div></div>`).join('');
    const bioReg=Bio.isRegistered(),bioAvail=await Bio.isAvailable();
    $('p-settings').innerHTML=[
      {i:'⚖️',l:'Registrar peso de hoy',f:'App.logWeight()'},
      {i:'📐',l:'Medidas corporales',f:'App.openMeasurements()'},
      bioAvail&&!bioReg?{i:'👁️',l:'Activar Face ID / Huella',f:'App.saveBiometric()'}:null,
      bioAvail&&bioReg?{i:'🔓',l:'Desactivar Face ID / Huella',f:'App.removeBiometric()'}:null,
      {i:'👁️',l:u.privacy_leaderboard!==false?'Ocultar del ranking':'Mostrar en el ranking',f:'App.togglePrivacy()'},

      {i:'📲',l:'Instalar App',f:'App.triggerInstall()'},
      {i:'📤',l:'Exportar datos',f:'App.exportData()'},
      {i:'🚪',l:'Cerrar sesión',f:'App.logout()',d:true},
    ].filter(Boolean).map(s=>`<div class="setting${s.d?' danger':''}" onclick="${s.f}"><span>${s.i} ${s.l}</span><span class="s-arr">›</span></div>`).join('');
    // Weight log mini chart
    this.renderWeightMini();
  },

  async togglePrivacy(){
    S.user.privacy_leaderboard=S.user.privacy_leaderboard===false?true:false;
    await DB.saveUser(S.user);
    toast(S.user.privacy_leaderboard?'✅ Ahora apareces en el ranking':'🔒 Oculto del ranking');
    await this.updateProfile();
  },

  // ── PESO CORPORAL ──
  async logWeight(){
    const w=prompt('Tu peso hoy (kg):',S.user?.weight||'');if(!w)return;
    const kg=parseFloat(w);if(isNaN(kg)||kg<20||kg>400)return toast('Peso inválido');
    S.user.weight=kg;
    if(S.user.height)S.user.bmi=(kg/Math.pow(S.user.height/100,2)).toFixed(1);
    if(!S.user.weight_log)S.user.weight_log=[];
    S.user.weight_log.push({date:new Date().toISOString().split('T')[0],kg});
    // Keep max 90 days
    S.user.weight_log=S.user.weight_log.slice(-90);
    await DB.saveUser(S.user);
    this.renderWeightMini();
    await this.updateProfile();
    toast(`⚖️ ${kg} kg registrado`);
  },

  renderWeightMini(){
    const c=$('weight-mini');if(!c)return;
    const log=(S.user?.weight_log||[]).slice(-14);
    if(log.length<2){c.innerHTML='<p style="color:var(--wdim);font-size:11px;text-align:center;padding:10px">Registra tu peso diario para ver la gráfica</p>';return;}
    const min=Math.min(...log.map(x=>x.kg)),max=Math.max(...log.map(x=>x.kg));
    const range=max-min||1;
    const w=c.clientWidth||300,h=80;
    const pts=log.map((x,i)=>{
      const px=i/(log.length-1)*(w-20)+10;
      const py=h-10-((x.kg-min)/range)*(h-20);
      return`${px},${py}`;
    }).join(' ');
    const last=log[log.length-1];const first=log[0];const diff=(last.kg-first.kg).toFixed(1);
    const col=diff<=0?'#4caf50':'#e53935';
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:11px;color:var(--wdim)">PESO CORPORAL</span><span style="font-size:12px;font-weight:700;color:${col}">${diff>0?'+':''}${diff} kg (14d)</span></div><svg viewBox="0 0 ${w} ${h}" style="width:100%;height:80px"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${log.map((x,i)=>{const px=i/(log.length-1)*(w-20)+10;const py=h-10-((x.kg-min)/range)*(h-20);return i===log.length-1?`<circle cx="${px}" cy="${py}" r="4" fill="${col}"/><text x="${px+6}" y="${py+4}" font-size="9" fill="${col}">${x.kg}kg</text>`:''}).join('')}</svg>`;
  },

  // ── MEDIDAS CORPORALES ──
  openMeasurements(){
    const m=S.user?.body_measurements||{};
    $('m-chest').value=m.chest||'';$('m-waist').value=m.waist||'';
    $('m-hip').value=m.hip||'';$('m-arm').value=m.arm||'';$('m-leg').value=m.leg||'';
    this.openModal('modal-measurements');
  },

  async saveMeasurements(){
    if(!S.user.body_measurements)S.user.body_measurements={};
    const fields=['chest','waist','hip','arm','leg'];
    fields.forEach(f=>{const val=parseFloat($(`m-${f}`)?.value);if(val)S.user.body_measurements[f]=val;});
    // Save history
    if(!S.user.body_measurements.history)S.user.body_measurements.history=[];
    S.user.body_measurements.history.push({date:new Date().toISOString().split('T')[0],...Object.fromEntries(fields.map(f=>[f,S.user.body_measurements[f]||null]))});
    S.user.body_measurements.history=S.user.body_measurements.history.slice(-30);
    await DB.saveUser(S.user);this.closeModal('modal-measurements');toast('📐 Medidas guardadas');
  },

  // ── MUSCLE HEATMAP ──
  renderMuscleHeatmap(){
    const c=$('muscle-heatmap');if(!c)return;
    // Calcular músculos trabajados esta semana desde el log
    const hist=S.user?.workout_history||[];const weekAgo=Date.now()-7*24*3600*1000;
    const muscleCount={};
    hist.filter(w=>new Date(w.date||w.created_at).getTime()>weekAgo).forEach(w=>{
      (w.exercises||[]).forEach(e=>{const ex=EX_DB.find(d=>d.name===e.name);if(ex){muscleCount[ex.muscle]=(muscleCount[ex.muscle]||0)+1;}});
    });
    const maxCount=Math.max(...Object.values(muscleCount),1);
    const MUSCLE_SVGS={
      chest:'M120,110 Q150,100 180,110 Q170,140 150,145 Q130,140 120,110Z',
      back:'M120,110 Q150,118 180,110 Q170,140 150,145 Q130,140 120,110Z',
      shoulders:'M100,100 Q120,90 120,110Z M180,110 Q180,90 200,100Z',
      biceps:'M105,120 Q110,150 115,165Z M185,120 Q190,150 185,165Z',
      triceps:'M115,165 Q110,185 115,195Z M185,165 Q190,185 185,195Z',
      legs:'M130,200 Q140,260 135,300Z M170,200 Q160,260 165,300Z',
      core:'M125,145 Q150,155 175,145 Q172,195 150,200 Q128,195 125,145Z',
    };
    const bodyParts=Object.entries(MUSCLE_SVGS).map(([muscle,path])=>{
      const count=muscleCount[muscle]||0;const opacity=count>0?0.3+0.7*(count/maxCount):0.05;
      const col=MUSCLE_COLORS[muscle]||'#f5c518';
      return`<path d="${path}" fill="${col}" opacity="${opacity.toFixed(2)}" stroke="${col}" stroke-width="0.5"/>`;
    }).join('');
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:11px;color:var(--wdim)">MÚSCULOS ESTA SEMANA</span><span style="font-size:10px;color:var(--wdim)">${Object.keys(muscleCount).length} grupos</span></div>
    <svg viewBox="80 80 140 240" style="width:100%;max-height:180px">
      <!-- Cuerpo base -->
      <ellipse cx="150" cy="95" rx="20" ry="22" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      <rect x="118" y="115" width="64" height="85" rx="8" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      <rect x="100" y="115" width="22" height="65" rx="8" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      <rect x="178" y="115" width="22" height="65" rx="8" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      <rect x="125" y="198" width="22" height="90" rx="8" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      <rect x="153" y="198" width="22" height="90" rx="8" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
      ${bodyParts}
    </svg>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${Object.entries(muscleCount).map(([m,n])=>`<span class="pill" style="color:${MUSCLE_COLORS[m]}">${ML[m]} ×${n}</span>`).join('')}</div>`;
  },

  // ── NAVIGATION ──
  async goTo(page){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
    $('page-'+page)?.classList.add('active');
    document.querySelector(`.nb[data-p="${page}"]`)?.classList.add('active');
    if(page==='achievements')await this.renderAchs();
    if(page==='routines')await this.renderRoutines();
    if(page==='progress'){await this.renderCharts();await this.renderPhotos();await this.renderWeightMini();}
    if(page==='coach'&&S.isCoach)await this.renderCoach();
    if(page==='profile')await this.updateProfile();
    if(page==='leaderboard')await this.renderLeaderboard();
    if(page==='recipes')await this.renderRecipes();
    if(page==='chat')await this.renderChat();
    if(page==='ai-coach'){this.renderAICoachChat();}
    if(page==='history')await this.renderHistory(0);
  },

  coachTab(tab,btn){
    document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.ctab-body').forEach(c=>c.classList.add('hidden'));
    btn.classList.add('active');$('ct-'+tab)?.classList.remove('hidden');
  },

  setupOffline(){
    const update=()=>{$('offline-banner')?.classList.toggle('hidden',navigator.onLine);if(navigator.onLine)DB.syncOfflineQueue();};
    window.addEventListener('online',update);window.addEventListener('offline',update);update();
  },

  // ── WORKOUT ──
  async startWorkout(){
    this.goTo('workout');
    if(!S.sessActive){
      S.sessActive=true;S.sessStart=Date.now();
      localStorage.setItem('cl_sess_start',S.sessStart);
      S.sessTimer=setInterval(()=>this.tickSess(),1000);
      S.workLog=[];this.renderLog();this.reqWL();
    }
  },

  tickSess(){
    if(!S.sessStart)return;
    const sec=Math.floor((Date.now()-S.sessStart)/1000);
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    const el=$('sess-timer');if(el)el.textContent=(h>0?pad(h)+':':'')+pad(m)+':'+pad(s);
  },

  stopSess(){
    clearInterval(S.sessTimer);clearInterval(S.restTimer);
    S.sessActive=false;S.sessStart=null;S.restRunning=false;
    localStorage.removeItem('cl_sess_start');
  },

  async finishWorkout(){
    const realExs=S.workLog.filter(i=>i.type!=='circuit_break');
    if(realExs.length===0&&!confirm('No registraste ejercicios. ¿Terminar?'))return;
    // Ask for workout note
    const note=prompt('📝 Nota de la sesión (opcional):','')||'';
    const dur=S.sessStart?Math.floor((Date.now()-S.sessStart)/1000):0;
    this.stopSess();
    const u=S.user;u.sessions=(u.sessions||0)+1;
    let vol=0;
    realExs.forEach(ex=>{
      (ex.sets||[]).forEach(s=>{
        vol+=(s.weight||0)*(s.reps||0);
        if(ex.track&&s.weight){if(!u.records)u.records={};
          // Auto 1RM con fórmula Epley
          const sets=ex.sets.filter(s2=>s2.weight);
          if(sets.length>0){
            const best=sets.reduce((b,s2)=>{const rm=s2.weight*(1+s2.reps/30);return rm>b.rm?{rm,weight:s2.weight,reps:s2.reps}:b;},{rm:0});
            if(!u.records[ex.track]||best.weight>u.records[ex.track])u.records[ex.track]=best.weight;
            if(!u.records[ex.track+'_1rm']||best.rm>u.records[ex.track+'_1rm'])u.records[ex.track+'_1rm']=Math.round(best.rm*10)/10;
          }
        }
      });
    });
    u.total_volume=(u.total_volume||0)+vol;
    // Save workout notes
    if(note){if(!u.workout_notes)u.workout_notes=[];u.workout_notes.push({date:new Date().toISOString(),note,vol,dur});u.workout_notes=u.workout_notes.slice(-50);}
    await DB.saveWorkout({exercises:realExs.map(e=>({name:e.name,sets:e.sets||[],muscle:e.muscle})),volume:vol,duration:dur,notes:note});
    const today=new Date().toDateString(),yest=new Date(Date.now()-86400000).toDateString();
    const last=u.last_session?new Date(u.last_session).toDateString():null;
    if(last===yest||last===today)u.streak=(u.streak||0)+1;else if(last!==today)u.streak=1;
    u.last_session=new Date().toISOString();
    const hr=new Date().getHours();
    const vals={sessions:u.sessions,streak:u.streak,bench_press:u.records?.bench_press||0,squat:u.records?.squat||0,deadlift:u.records?.deadlift||0,bicep_curl:u.records?.bicep_curl||0,pullups:u.records?.pullups||0,session_volume:vol,level:Math.floor((u.xp||0)/1000)+1};
    await this.addXP(vol>0?Math.min(Math.round(vol/10),500):50);
    const achIds=['first_session','ten_sessions','fifty_sessions','hundred_sessions','streak_7','streak_30','bench_100','bench_140','squat_100','deadlift_100','deadlift_200','curl_40','pullups_15','volume_10k'];
    for(const id of achIds)await this.tryUnlock(id,vals);
    if(hr<6)await this.tryUnlock('early_bird',vals);if(hr>=22)await this.tryUnlock('night_owl',vals);
    await this.updateChallengesAfterWorkout(vol,realExs);
    await DB.saveUser(u);
    this.updateHeader();await this.updateHome();
    S.workLog=[];
    toast(`🏋️ Sesión #${u.sessions} · ${Math.round(vol).toLocaleString()} kg · ${pad(Math.floor(dur/60))}:${pad(dur%60)}`);
    this.goTo('home');
  },

  async updateChallengesAfterWorkout(vol,exs){
    try{
      const chs=await DB.getChallenges();const prog=await DB.getUserChallengeProgress();
      for(const ch of chs){
        const cur=(prog.find(p=>p.challenge_id===ch.id)?.progress)||0;let nv=cur;
        if(ch.challenge_type==='total_volume')nv=cur+vol;
        if(ch.challenge_type==='sessions_week')nv=cur+1;
        if(ch.challenge_type==='logged_sets')nv=cur+exs.reduce((a,e)=>a+(e.sets?.length||0),0);
        if(nv!==cur){
          await DB.updateChallengeProgress(ch.id,nv);
          if(nv>=(ch.target_value||ch.target||1)&&cur<(ch.target_value||ch.target||1)){
            await this.addXP(ch.xp_reward||100);
            setTimeout(()=>this.showAchPopup({icon:ch.icon||'🎯',name:'¡RETO COMPLETADO!',description:ch.name,xp:ch.xp_reward||100,image_data:ch.image_data||null}),1000);
          }
        }
      }
    }catch(e){console.warn('Challenge err:',e);}
  },

  // ── EXERCISE ──
  openSearch(){const c=$('ex-search');if(!c)return;c.classList.toggle('hidden');if(!c.classList.contains('hidden')){this.renderExRes(EX_DB.slice(0,15),'ex-res');$('ex-q')?.focus();}},
  closeSearch(){$('ex-search')?.classList.add('hidden');},
  buildMFilters(){const c=$('mfilters')||$('muscle-filters');if(!c)return;c.innerHTML=MUSCLES.map(m=>`<button class="mf-btn${m==='all'?' active':''}" onclick="App.filterEx('${m}')">${ML[m]}</button>`).join('');},
  filterEx(m){document.querySelectorAll('.mf-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');const q=v('ex-q');this.renderExRes(EX_DB.filter(e=>(m==='all'||e.muscle===m)&&(!q||e.name.toLowerCase().includes(q.toLowerCase()))),'ex-res');},
  searchEx(q){const m=document.querySelector('.mf-btn.active')?.textContent;const mk=Object.keys(ML).find(k=>ML[k]===m)||'all';this.renderExRes(EX_DB.filter(e=>(mk==='all'||e.muscle===mk)&&(!q||e.name.toLowerCase().includes(q.toLowerCase()))),'ex-res');},
  renderExRes(exs,cid){const c=$(cid);if(!c)return;c.innerHTML=exs.map(ex=>`<div class="ex-card" onclick="App.openEx('${ex.id}')"><div class="ex-ico">${ex.emoji}</div><div class="ex-info"><div class="ex-nm">${ex.name}</div><div class="ex-mu">${ML[ex.muscle]} · ${EQL[ex.equip]}</div></div><div class="ex-diff">${DFL[ex.diff]}</div></div>`).join('');},

  openEx(id){
    const ex=EX_DB.find(e=>e.id===id);if(!ex)return;
    if(S.sessActive){const i=S.workLog.findIndex(e=>e.id===ex.id);if(i===-1)S.workLog.push({...ex,sets:[]});this.closeSearch();this.renderLog();toast(`✅ ${ex.name} agregado`);return;}
    S.curEx=ex;S.modalSets=[];
    const nm=$('ex-title')||$('ex-m-name');if(nm)nm.textContent=ex.name;
    const em=$('ex-emoji');if(em)em.textContent=ex.emoji;
    const inst=$('ex-inst');if(inst)inst.textContent=ex.inst;
    const media=$('ex-media');if(media)media.innerHTML=`<span style="font-size:52px;opacity:.3">${ex.emoji}</span>`;
    // Show 1RM record if exists
    if(ex.track&&S.user?.records){
      const rm=S.user.records[ex.track+'_1rm'];const best=S.user.records[ex.track];
      if(best){const rmEl=$('ex-record');if(rmEl)rmEl.textContent=`🏆 Récord: ${best}kg${rm?' · 1RM est: '+rm+'kg':''}`;}
    }
    const sd=$('sets-done');if(sd)sd.innerHTML='';
    const sw=$('sw');if(sw)sw.value='';const sr=$('sr');if(sr)sr.value='';
    this.openModal('modal-ex');
  },

  logSet(){const w=parseFloat($('sw').value)||0,r=parseInt($('sr').value);if(!r)return toast('Ingresa las repeticiones');
    const set={weight:w,reps:r};
    // Auto 1RM preview
    if(w>0){const rm=(w*(1+r/30)).toFixed(1);toast(`Set ${S.modalSets.length+1} — 1RM est: ${rm}kg`);}
    S.modalSets.push(set);this.renderModalSets();$('sr').value='';
  },
  renderModalSets(){$('sets-done').innerHTML=S.modalSets.map((s,i)=>`<div class="sdr"><span class="sdr-n">SET ${i+1}</span><span class="sdr-d">${s.weight?s.weight+' kg':'PC'} × ${s.reps} reps</span></div>`).join('');},
  confirmEx(){
    if(!S.curEx)return;if(S.modalSets.length===0)return toast('Agrega al menos una serie');
    const i=S.workLog.findIndex(e=>e.id===S.curEx.id);
    if(i!==-1)S.workLog[i].sets.push(...S.modalSets);else S.workLog.push({...S.curEx,sets:[...S.modalSets]});
    this.closeModal('modal-ex');this.renderLog();toast(`✅ ${S.curEx.name} · ${S.modalSets.length} series`);S.modalSets=[];
  },

  renderLog(){
    const c=$('ex-log');if(!c)return;
    if(S.workLog.length===0){c.innerHTML='<div class="empty-log">Agrega ejercicios para registrar tu sesión 💪</div>';return;}
    let cn=0;
    c.innerHTML=S.workLog.map((ex,xi)=>{
      if(ex.type==='circuit_break'){cn++;return`<div class="circuit-divider">🔄 CIRCUITO ${cn} · ${ex.restSec}s desc.</div>`;}
      const sets=(ex.sets||[]).map((s,i)=>`<div class="log-set"><span class="sn">${i+1}</span><span class="sw">${s.weight?s.weight+' kg':'PC'}</span><span class="srp">${s.reps} reps</span></div>`).join('');
      return`<div class="ex-log-item"><div class="log-head"><div class="log-ico">${ex.emoji}</div><div style="flex:1;min-width:0"><div class="log-nm">${ex.name}</div><div class="log-mu">${ML[ex.muscle]||ex.muscle}</div></div></div>${sets}<div class="inline-add"><input type="number" placeholder="kg" id="iw${xi}" step="0.5"><input type="number" placeholder="reps" id="ir${xi}"><button class="btn-sm" onclick="App.inlineSet(${xi})">+ SET</button></div></div>`;
    }).join('');
  },
  inlineSet(xi){const w=parseFloat($(`iw${xi}`)?.value)||0,r=parseInt($(`ir${xi}`)?.value);if(!r)return;if(!S.workLog[xi].sets)S.workLog[xi].sets=[];S.workLog[xi].sets.push({weight:w,reps:r});this.renderLog();},

  // ── TIMER — sincronizado con HTML ──
  setRest(sec,btn){
    document.querySelectorAll('.pre').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');
    clearInterval(S.restTimer);S.restSec=sec;S.restDur=sec;S.restRunning=false;
    const el=$('rest-n');if(el)el.textContent=sec;
    const fg=$('ring-fg');if(fg){const c=2*Math.PI*44;fg.style.strokeDasharray=c;fg.style.strokeDashoffset=0;}
    const sb2=$('rest-start-btn');if(sb2)sb2.textContent='▶ INICIAR';
  },

  toggleRest(){
    if(S.restRunning){
      clearInterval(S.restTimer);S.restRunning=false;
      const b=$('rest-start-btn');if(b)b.textContent='▶ CONTINUAR';
    }else{
      if(S.restSec<=0)S.restSec=S.restDur;
      S.restRunning=true;
      const b=$('rest-start-btn');if(b)b.textContent='⏸ PAUSAR';
      // Announce start with voice
      if(S.restDur>=60)speak(`${Math.floor(S.restDur/60)} minuto${S.restDur>=120?'s':''} de descanso`);
      const run=()=>{
        if(!S.restRunning)return;
        if(S.restSec<=0){
          clearInterval(S.restTimer);S.restRunning=false;
          const b2=$('rest-start-btn');if(b2)b2.textContent='▶ INICIAR';
          const el=$('rest-n');if(el)el.textContent=S.restDur;
          const fg=$('ring-fg');if(fg){const c=2*Math.PI*44;fg.style.strokeDasharray=c;fg.style.strokeDashoffset=0;}
          if(navigator.vibrate)navigator.vibrate([300,100,300,100,600]);
          playRoar();speak('¡Descanso terminado! ¡A darle!');
          if(navigator.serviceWorker?.controller)navigator.serviceWorker.controller.postMessage({type:'REST_DONE'});
          return;
        }
        S.restSec--;
        // Voice countdown at 10, 5, 3, 2, 1
        if([10,5,3,2,1].includes(S.restSec))speak(String(S.restSec));
        const el=$('rest-n');if(el)el.textContent=S.restSec;
        const fg=$('ring-fg');if(fg){const c=2*Math.PI*44;fg.style.strokeDasharray=c;fg.style.strokeDashoffset=c*(S.restSec/S.restDur);}
      };
      run();S.restTimer=setInterval(run,1000);
    }
  },

  resetRest(){
    clearInterval(S.restTimer);S.restRunning=false;S.restSec=S.restDur;
    const el=$('rest-n');if(el)el.textContent=S.restDur;
    const fg=$('ring-fg');if(fg){const c=2*Math.PI*44;fg.style.strokeDasharray=c;fg.style.strokeDashoffset=0;}
    const b=$('rest-start-btn');if(b)b.textContent='▶ INICIAR';
  },

  // ── ROUTINES ──
  async renderTodayR(){
    const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today=days[new Date().getDay()];const rts=await DB.getRoutines();
    const r=rts.find(x=>(x.day_of_week||x.day)===today||(x.day_of_week||x.day)==='any');
    const c=$('today-r');if(!c)return;
    if(!r){c.innerHTML=`<div class="no-r"><div>📋</div><p>Sin rutina para hoy</p><button class="btn-ghost" onclick="App.goTo('routines')" style="margin-top:8px;max-width:180px">Ver rutinas</button></div>`;return;}
    const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');
    c.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap"><div><div style="font-family:var(--fd);font-size:18px;letter-spacing:2px">${r.name}</div><div style="font-size:11px;color:var(--wdim)">${exs.length} ejercicios · ${DAL[r.day_of_week||r.day]}</div></div><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button></div><div style="display:flex;flex-wrap:wrap;gap:4px">${exs.slice(0,5).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}</div>`;
  },

  async renderRoutines(){
    const rts=await DB.getRoutines();const c=$('routines-list');if(!c)return;
    // Show presets if no routines
    if(rts.length===0){
      c.innerHTML=`<div class="empty-log" style="padding:20px;text-align:center"><div style="font-size:36px;margin-bottom:8px">📋</div><p style="margin-bottom:12px">No tienes rutinas. ¿Usar una plantilla?</p><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${PRESET_ROUTINES.map((r,i)=>`<button class="btn-ghost" style="font-size:11px" onclick="App.loadPreset(${i})">${r.name}</button>`).join('')}</div></div>`;
      return;
    }
    const tl={strength:'🏋️ Fuerza',hypertrophy:'💪 Hipertrofia',cardio:'🏃 Cardio',fullbody:'🔥 Full Body',ppl:'⚡ PPL',hiit:'💥 HIIT'};
    // Show presets button at top
    const presetsRow=`<div style="margin-bottom:10px"><button class="btn-ghost" style="font-size:11px;width:100%" onclick="App.showPresets()">📚 Cargar plantilla predefinida</button></div>`;
    c.innerHTML=presetsRow+rts.map(r=>{const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');return`<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day_of_week||r.day]||r.day_of_week}</div></div><div class="rc-type">${tl[r.type]||r.type}</div><div class="rc-pills">${exs.slice(0,4).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}${exs.length>4?`<span class="pill">+${exs.length-4}</span>`:''}</div><div class="rc-actions"><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️</button></div></div>`;}).join('');
  },

  showPresets(){
    $('presets-list').innerHTML=PRESET_ROUTINES.map((r,i)=>`<div class="rc" onclick="App.loadPreset(${i})" style="cursor:pointer"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day]||r.day}</div></div><div class="rc-type">${r.type} · ${r.exercises.length} ejercicios</div><div class="rc-pills">${r.exercises.slice(0,3).map(e=>`<span class="pill">${e.emoji} ${e.name}</span>`).join('')}</div></div>`).join('');
    this.openModal('modal-presets');
  },

  async loadPreset(idx){
    const preset=PRESET_ROUTINES[idx];if(!preset)return;
    await DB.saveRoutine({name:preset.name,type:preset.type,day:preset.day,exercises:preset.exercises.map(e=>({...e,sets:[]}))});
    this.closeModal('modal-presets');await this.renderRoutines();toast(`✅ "${preset.name}" cargada`);
  },

  openCreateRoutine(){S.rnExs=[];$('rn-name').value='';$('rn-exlist').innerHTML='';this.openModal('modal-routine');},
  addCircuitBreak(){const sec=parseInt($('rn-circuit-rest')?.value)||90;S.rnExs.push({type:'circuit_break',restSec:sec});this.renderRnExList();toast(`🔄 Separador (${sec}s)`);},
  openExPicker(){S.pickerSelEx=null;S.pickerGenImg=null;$('picker-q').value='';$('picker-selected')?.classList.add('hidden');$('pex-weight').value='';$('pex-sets').value='3';$('pex-reps').value='10';$('pex-rest').value='60';$('pex-img-desc').value='';$('pex-img-preview')?.classList.add('hidden');this.renderExRes(EX_DB.slice(0,15),'picker-results');this.openModal('modal-expicker');},
  pickerSearch(q){this.renderExRes((q?EX_DB.filter(e=>e.name.toLowerCase().includes(q.toLowerCase())):EX_DB).slice(0,12),'picker-results');},
  selectPickerEx(id){S.pickerSelEx=EX_DB.find(e=>e.id===id);if(!S.pickerSelEx)return;$('picker-selected-name').textContent=`${S.pickerSelEx.emoji} ${S.pickerSelEx.name}`;$('picker-selected')?.classList.remove('hidden');},
  clearPickerSel(){S.pickerSelEx=null;$('picker-selected')?.classList.add('hidden');$('picker-q').value='';this.renderExRes(EX_DB.slice(0,15),'picker-results');},
  async genExerciseImage(){
    const desc=$('pex-img-desc')?.value?.trim();if(!desc)return toast('Describe la imagen primero');
    const btn=$('pex-gen-btn');btn.textContent='⏳ Generando...';btn.disabled=true;
    const prev=$('pex-img-preview');prev?.classList.remove('hidden');prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON IA...</span></div>';
    const url=await generateAIImage(desc,S.pickerSelEx?.name,S.pickerSelEx?.emoji);
    S.pickerGenImg=url;prev.innerHTML=`<img src="${url}" alt="img"><button class="btn-sm" onclick="App.genExerciseImage()" style="margin-top:6px">↺ REGENERAR</button>`;btn.textContent='🎨 REGENERAR';btn.disabled=false;
  },
  async confirmPickerEx(){
    const ex=S.pickerSelEx;if(!ex)return toast('Selecciona un ejercicio');
    S.rnExs.push({...ex,plannedSets:parseInt($('pex-sets')?.value)||3,plannedReps:parseInt($('pex-reps')?.value)||10,restSec:parseInt($('pex-rest')?.value)||60,weight:parseFloat($('pex-weight')?.value)||null,imageData:S.pickerGenImg||null,sets:[]});
    this.renderRnExList();this.closeModal('modal-expicker');toast(`✅ ${ex.name} agregado`);S.pickerSelEx=null;S.pickerGenImg=null;
  },
  renderRnExList(){
    const c=$('rn-exlist');if(!c)return;let cn=0;
    c.innerHTML=S.rnExs.map((ex,i)=>{
      if(ex.type==='circuit_break'){cn++;return`<div class="rn-circuit-break"><span class="rn-cb-label">🔄 CIRCUITO ${cn} · ${ex.restSec}s</span><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div>`;}
      const detail=[ex.plannedSets&&`${ex.plannedSets}×${ex.plannedReps}`,ex.weight&&`${ex.weight}kg`,ex.restSec&&`${ex.restSec}s desc.`].filter(Boolean).join(' · ');
      return`<div class="rn-ex"><div class="rn-ex-head"><div class="rn-ex-ico">${ex.imageData?`<img src="${ex.imageData}" alt="">`:ex.emoji}</div><div style="flex:1;min-width:0"><div class="rn-ex-nm">${ex.name}</div>${detail?`<div class="rn-ex-detail">${detail}</div>`:''}</div><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div></div>`;
    }).join('');
  },
  rmRnEx(i){S.rnExs.splice(i,1);this.renderRnExList();},
  async saveRoutine(){
    const name=v('rn-name');if(!name)return toast('Dale un nombre a la rutina');
    if(S.rnExs.filter(e=>e.type!=='circuit_break').length===0)return toast('Agrega al menos un ejercicio');
    await DB.saveRoutine({name,type:$('rn-type')?.value,day:$('rn-day')?.value,exercises:S.rnExs,circuitRest:parseInt($('rn-circuit-rest')?.value)||90});
    this.closeModal('modal-routine');await this.renderRoutines();toast(`✅ Rutina "${name}" guardada`);await this.addXP(50);
  },
  async delRoutine(id){if(!confirm('¿Eliminar rutina?'))return;await DB.deleteRoutine(id);await this.renderRoutines();},
  async startRoutine(id){
    const rts=await DB.getRoutines();const r=rts.find(x=>x.id===id);if(!r)return;
    S.workLog=(r.exercises||[]).map(ex=>ex.type==='circuit_break'?{...ex}:{...ex,sets:[]});
    await this.startWorkout();setTimeout(()=>{this.renderLog();toast(`🏋️ "${r.name}" cargada`);},300);
  },

  // ── HISTORY paginado ──
  async renderHistory(page=0){
    S.workoutPage=page;const c=$('history-list');if(!c)return;
    c.innerHTML='<div class="empty-log">Cargando...</div>';
    const hist=await DB.getWorkoutHistory(S.user?.id,page);
    if(hist.length===0&&page===0){c.innerHTML='<div class="empty-log" style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:10px">📊</div><p>No hay sesiones registradas aún</p></div>';return;}
    c.innerHTML=hist.map(s=>{
      const d=new Date(s.created_at);
      return`<div class="hist-card" onclick="App.openHistDetail('${s.id}')"><div class="hist-date">${d.toLocaleDateString('es',{weekday:'short',day:'numeric',month:'short'})}</div><div class="hist-body"><div class="hist-vol">📦 ${Math.round(s.total_volume||0).toLocaleString()} kg</div><div class="hist-dur">⏱️ ${pad(Math.floor((s.duration_seconds||0)/60))}:${pad((s.duration_seconds||0)%60)}</div></div>${s.notes?`<div class="hist-exs">📝 ${s.notes.slice(0,60)}${s.notes.length>60?'...':''}</div>`:''}</div>`;
    }).join('');
    const nav=$('history-nav');if(nav)nav.innerHTML=`${page>0?`<button class="btn-ghost" onclick="App.renderHistory(${page-1})">← Anterior</button>`:''} ${hist.length===20?`<button class="btn-ghost" onclick="App.renderHistory(${page+1})">Siguiente →</button>`:''}`;
  },

  async openHistDetail(id){
    const s=await DB.getWorkoutDetail(id);if(!s)return;
    const d=new Date(s.created_at);
    $('hist-detail-content').innerHTML=`
      <div style="font-family:var(--fd);font-size:16px;margin-bottom:8px">${d.toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</div>
      <div class="macro-g" style="margin-bottom:12px">
        <div class="macro-i"><div class="macro-v">${Math.round(s.total_volume||0).toLocaleString()}</div><div class="macro-l">kg vol.</div></div>
        <div class="macro-i"><div class="macro-v">${pad(Math.floor((s.duration_seconds||0)/60))}:${pad((s.duration_seconds||0)%60)}</div><div class="macro-l">tiempo</div></div>
        <div class="macro-i"><div class="macro-v">${(s.exercises||[]).length}</div><div class="macro-l">ejercicios</div></div>
      </div>
      ${s.notes?`<div style="background:var(--d3);border-radius:10px;padding:10px;margin-bottom:12px;font-size:13px;color:var(--wdim)">📝 ${s.notes}</div>`:''}
      ${(s.exercises||[]).map(ex=>`<div style="margin-bottom:10px"><div style="font-weight:700;margin-bottom:4px">${ex.name}</div>${(ex.sets||[]).map((s2,i)=>`<div class="sdr"><span class="sdr-n">SET ${i+1}</span><span class="sdr-d">${s2.weight?s2.weight+' kg':'PC'} × ${s2.reps} reps</span></div>`).join('')}</div>`).join('')}
    `;
    this.openModal('modal-hist-detail');
  },

  // ── CHALLENGES ──
  async renderChallengesHome(){
    const chs=await DB.getChallenges();const c=$('challenges');if(!c)return;
    if(chs.length===0){c.innerHTML='<div style="text-align:center;padding:20px;color:var(--wdim);font-size:13px">El coach no ha creado retos todavía</div>';return;}
    const prog=await DB.getUserChallengeProgress();
    c.innerHTML=chs.map(ch=>{
      const myProg=prog.find(p=>p.challenge_id===ch.id)?.progress||0;
      const pct=Math.min((myProg/(ch.target_value||ch.target||1))*100,100);
      const img=ch.image_data?`<div class="ch-img"><img src="${ch.image_data}" alt="${ch.name}"></div>`:`<div class="ch-img"><span>${ch.icon||'🎯'}</span></div>`;
      const diffCol={easy:'#4caf50',medium:'#f5c518',hard:'#ff6f00',extreme:'#e53935'}[ch.difficulty||'medium'];
      return`<div class="ch-card">${img}<div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.description||''}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="pill" style="color:${diffCol}">${ch.difficulty||'medium'}</span>${ch.duration_days?`<span class="pill">📅 ${ch.duration_days}d</span>`:''}<span class="pill">⭐ +${ch.xp_reward||100} XP</span></div><div class="ch-prog"><div class="ch-bar" style="width:${pct}%"></div></div><div class="ch-info-row"><span class="ch-nums">${Math.round(myProg).toLocaleString()} / ${(ch.target_value||ch.target||0).toLocaleString()}</span><span class="ch-reward">${ch.reward}</span></div></div></div>`;
    }).join('');
  },

  async openCreateChallenge(editId){
    S.editingChId=editId||null;S.chGenImg=null;
    const existing=editId?(await DB.getChallenges()).find(c=>c.id==editId):null;
    $('ch-modal-title').textContent=editId?'EDITAR RETO':'CREAR RETO';
    $('ch-name').value=existing?.name||'';$('ch-desc').value=existing?.description||'';
    $('ch-reward').value=existing?.reward||'';$('ch-target').value=existing?.target_value||existing?.target||'';
    $('ch-type').value=existing?.challenge_type||existing?.type||'custom';$('ch-difficulty').value=existing?.difficulty||'medium';
    $('ch-duration').value=existing?.duration_days||'30';$('ch-xp-reward').value=existing?.xp_reward||'100';
    $('ch-img-desc').value='';const prev=$('ch-img-preview');prev?.classList.add('hidden');
    S.chGenImg=existing?.image_data||null;
    if(S.chGenImg){prev?.classList.remove('hidden');prev.innerHTML=`<img src="${S.chGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover">`;}
    this.openModal('modal-challenge');
  },
  async genChallengeImage(){
    const desc=$('ch-img-desc')?.value?.trim()||`Imagen épica para reto "${$('ch-name')?.value||'fitness'}"`;
    const btn=$('ch-gen-btn');btn.textContent='⏳ Generando...';btn.disabled=true;
    const prev=$('ch-img-preview');prev?.classList.remove('hidden');prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO...</span></div>';
    const url=await generateAIImage(desc,$('ch-name')?.value,null);
    S.chGenImg=url;prev.innerHTML=`<img src="${url}" alt="Reto" style="width:150px;height:150px;border-radius:12px;object-fit:cover"><button class="btn-sm" onclick="App.genChallengeImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent='🎨 REGENERAR';btn.disabled=false;
  },
  async saveChallenge(){
    const name=v('ch-name');if(!name)return toast('Dale un nombre al reto');
    const ch={id:S.editingChId||null,name,description:v('ch-desc'),reward:v('ch-reward')||'XP',type:$('ch-type')?.value||'custom',difficulty:$('ch-difficulty')?.value||'medium',duration_days:parseInt($('ch-duration')?.value)||30,xp_reward:parseInt($('ch-xp-reward')?.value)||100,target:parseInt($('ch-target')?.value)||10,imageData:S.chGenImg||null,icon:'🎯'};
    await DB.saveChallenge(ch);this.closeModal('modal-challenge');await this.renderChallengesHome();
    if(S.isCoach)await this.renderCoachChallenges();
    toast(`✅ Reto "${name}" ${S.editingChId?'actualizado':'creado'}`);S.chGenImg=null;S.editingChId=null;
  },
  async renderCoachChallenges(){
    const chs=await DB.getChallenges();const c=$('coach-challenges-list');if(!c)return;
    if(chs.length===0){c.innerHTML='<div class="empty-log">No has creado retos aún</div>';return;}
    const diffCol={easy:'#4caf50',medium:'#f5c518',hard:'#ff6f00',extreme:'#e53935'};
    c.innerHTML=chs.map(ch=>`<div class="ch-card"><div class="ch-img">${ch.image_data?`<img src="${ch.image_data}" alt="" style="width:100%;height:100%;object-fit:cover">`:ch.icon||'🎯'}</div><div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.description||''}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px"><span class="pill" style="color:${diffCol[ch.difficulty||'medium']}">${ch.difficulty||''}</span><span class="pill">📅 ${ch.duration_days||30}d</span><span class="pill">⭐ +${ch.xp_reward||100} XP</span></div></div><div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0"><button class="btn-sm" onclick="App.openCreateChallenge('${ch.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delChallenge('${ch.id}')">🗑️</button></div></div>`).join('');
  },
  async delChallenge(id){if(!confirm('¿Eliminar reto?'))return;await DB.deleteChallenge(id);await this.renderCoachChallenges();await this.renderChallengesHome();},

  // ── ACHIEVEMENTS ──
  buildAchFilters(){const c=$('ach-filters');if(!c)return;c.innerHTML=ACH_CATS.map(cat=>`<button class="ach-f${cat==='all'?' active':''}" onclick="App.filterAch('${cat}')">${ACH_CAT_L[cat]}</button>`).join('');},
  async filterAch(cat){S.achFilter=cat;document.querySelectorAll('.ach-f').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');await this.renderAchs();},
  async renderAchs(){
    const ul=S.user?.achievements||[],all=await DB.getAchs();
    const list=S.achFilter==='all'?all:all.filter(a=>(a.category||a.cat)===S.achFilter);
    $('ach-grid').innerHTML=list.map(a=>{
      const u=ul.includes(a.id);
      const imgEl=u&&a.image_data?`<img class="ag-img" src="${a.image_data}" alt="${a.name}">`:`<div class="ag-ico">${u?a.icon:'🔒'}</div>`;
      const shareBtn=u?`<button class="btn-share-ach" onclick="event.stopPropagation();shareAchievement(${JSON.stringify({icon:a.icon,name:a.name,description:a.description,image_data:a.image_data}).replace(/"/g,'&quot;')})" title="Compartir">📤</button>`:'';
      return`<div class="ag ${u?'on':'off'}">${u?'<span class="ag-badge">✅</span>':''}${shareBtn}${imgEl}<div class="ag-nm">${a.name}</div><div class="ag-desc">${a.description||''}</div><div class="ag-xp" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP</div></div>`;
    }).join('');
  },
  async renderRecentAchs(){
    const ul=S.user?.achievements||[];const c=$('recent-ach');if(!c)return;
    if(ul.length===0){c.innerHTML='<div class="ach-mini"><div class="ach-mini-i">🔒</div><div class="ach-mini-n">???</div></div>'.repeat(3);return;}
    const all=await DB.getAchs();
    c.innerHTML=ul.slice(-5).reverse().map(id=>{const a=all.find(x=>x.id===id);return a?`<div class="ach-mini on">${a.image_data?`<img src="${a.image_data}" style="width:32px;height:32px;border-radius:7px;object-fit:cover">`:`<div class="ach-mini-i">${a.icon}</div>`}<div class="ach-mini-n">${a.name}</div></div>`:'';}).join('');
  },
  async openCreateAchievement(editId){
    S.editingAchId=editId||null;S.achGenImg=null;
    const existing=editId?(await DB.getAchs()).find(a=>a.id===editId):null;
    $('ach-modal-title').textContent=editId?'EDITAR LOGRO':'CREAR LOGRO';
    $('ach-name').value=existing?.name||'';$('ach-desc').value=existing?.description||'';
    $('ach-xp').value=existing?.xp||'';$('ach-rarity').value=existing?.rarity||'common';
    $('ach-cat').value=existing?.category||existing?.cat||'special';
    $('ach-icon').value=existing?.icon||'';$('ach-edit-id').value=editId||'';
    $('ach-img-desc').value='';const prev=$('ach-img-preview');prev?.classList.add('hidden');
    S.achGenImg=existing?.image_data||null;
    if(S.achGenImg){prev?.classList.remove('hidden');prev.innerHTML=`<img src="${S.achGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover">`;}
    this.openModal('modal-achievement');
  },
  async genAchievementImage(){
    const desc=$('ach-img-desc')?.value?.trim()||`Imagen para logro "${$('ach-name')?.value||'fitness'}"`;
    const btn=$('ach-gen-btn');btn.textContent='⏳ Generando...';btn.disabled=true;
    const prev=$('ach-img-preview');prev?.classList.remove('hidden');prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO...</span></div>';
    const url=await generateAIImage(desc,$('ach-name')?.value,$('ach-icon')?.value);
    S.achGenImg=url;prev.innerHTML=`<img src="${url}" alt="Logro" style="width:150px;height:150px;border-radius:12px;object-fit:cover"><button class="btn-sm" onclick="App.genAchievementImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent='🎨 REGENERAR';btn.disabled=false;
  },
  async saveAchievement(){
    const name=v('ach-name');if(!name)return toast('Dale un nombre al logro');const editId=v('ach-edit-id');
    const ach={id:editId||('custom_'+Date.now()),name,description:v('ach-desc'),xp:parseInt($('ach-xp')?.value)||100,rarity:$('ach-rarity')?.value||'common',category:$('ach-cat')?.value||'special',cat:$('ach-cat')?.value||'special',icon:v('ach-icon')||'🏆',image_data:S.achGenImg||null};
    await DB.saveAch(ach);this.closeModal('modal-achievement');await this.renderCoachAchievements();await this.renderAchs();
    toast(`✅ Logro "${name}" ${editId?'actualizado':'creado'}`);S.achGenImg=null;S.editingAchId=null;
  },
  async renderCoachAchievements(){
    const all=await DB.getAchs();const c=$('coach-achievements-list');if(!c)return;
    c.innerHTML=all.map(a=>`<div class="ch-card"><div class="ch-img" style="background:${RC[a.rarity]}22">${a.image_data?`<img src="${a.image_data}" alt="" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:28px">${a.icon}</span>`}</div><div class="ch-body"><div class="ch-name">${a.name}</div><div class="ch-desc">${a.description||''}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px"><span class="pill" style="color:${RC[a.rarity]}">${RL[a.rarity]}</span><span class="pill">+${a.xp} XP</span><span class="pill">${a.category||a.cat||'special'}</span></div></div><div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0"><button class="btn-sm" onclick="App.openCreateAchievement('${a.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delAch('${a.id}')">🗑️</button></div></div>`).join('');
  },
  async delAch(id){if(!confirm('¿Eliminar logro?'))return;await DB.deleteAch(id);await this.renderCoachAchievements();await this.renderAchs();toast('🗑️ Logro eliminado');},

  async tryUnlock(id,vals){
    if(!S.user.achievements)S.user.achievements=[];if(S.user.achievements.includes(id))return;
    const all=await DB.getAchs();const a=all.find(x=>x.id===id);if(!a)return;
    const checks={first_session:()=>vals.sessions>=1,ten_sessions:()=>vals.sessions>=10,fifty_sessions:()=>vals.sessions>=50,hundred_sessions:()=>vals.sessions>=100,streak_7:()=>vals.streak>=7,streak_30:()=>vals.streak>=30,bench_100:()=>vals.bench_press>=100,bench_140:()=>vals.bench_press>=140,squat_100:()=>vals.squat>=100,deadlift_100:()=>vals.deadlift>=100,deadlift_200:()=>vals.deadlift>=200,curl_40:()=>vals.bicep_curl>=40,pullups_15:()=>vals.pullups>=15,cardio_30:()=>vals.cardio_minutes>=30,volume_10k:()=>vals.session_volume>=10000,early_bird:()=>true,night_owl:()=>true,level_5:()=>vals.level>=5,level_10:()=>vals.level>=10};
    if(checks[id]&&checks[id]()){S.user.achievements.push(id);setTimeout(()=>{this.showAchPopup(a);playRoar();},800);}
  },

  showAchPopup(a){
    $('pop-ico').textContent=a.icon;$('pop-name').textContent=a.name;$('pop-desc').textContent=a.description||'';$('pop-xp').textContent=`+${a.xp} XP`;
    const ci=$('pop-ch-img');ci?.classList.add('hidden');
    if(a.image_data){ci.innerHTML=`<img src="${a.image_data}" alt="${a.name}">`;ci?.classList.remove('hidden');}
    // Add share button
    const sb2=$('pop-share');if(sb2){sb2.onclick=()=>shareAchievement(a);}
    $('ach-popup')?.classList.remove('hidden');if(navigator.vibrate)navigator.vibrate([100,50,100,50,300]);
  },
  closeAchPopup(){$('ach-popup')?.classList.add('hidden');this.updateHeader();},

  async addXP(amt){
    if(!S.user)return;const prev=Math.floor((S.user.xp||0)/1000)+1;
    S.user.xp=(S.user.xp||0)+amt;const nw=Math.floor(S.user.xp/1000)+1;
    if(nw>prev){await this.tryUnlock('level_5',{level:nw});await this.tryUnlock('level_10',{level:nw});setTimeout(()=>{this.showAchPopup({icon:'⬆️',name:`¡NIVEL ${nw}!`,description:TITLES[Math.min(nw-1,TITLES.length-1)],xp:0,image_data:null});playRoar();},1200);}
    await DB.saveUser(S.user);
  },

  // ── LEADERBOARD ──
  async renderLeaderboardMini(){
    const c=$('leaderboard-mini');if(!c)return;
    const users=(await DB.getAllUsers()).filter(u=>u.privacy_leaderboard!==false);
    const sorted=[...users].sort((a,b)=>(b.total_volume||0)-(a.total_volume||0)).slice(0,3);
    if(sorted.length===0){c.innerHTML='<p style="color:var(--wdim);font-size:12px;text-align:center;padding:12px">Completa sesiones para aparecer en el ranking</p>';return;}
    const medals=['🥇','🥈','🥉'];
    c.innerHTML=sorted.map((u,i)=>`<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i===0?' gold-rank':''}">${medals[i]}</div><div class="lb-name">${u.name}</div><div class="lb-val">${Math.round((u.total_volume||0)/1000)}t vol.</div></div>`).join('');
  },
  async renderLeaderboard(){
    const c=$('leaderboard-full');if(!c)return;
    const all=(await DB.getAllUsers()).filter(u=>u.privacy_leaderboard!==false);
    let sorted;
    if(S.lbMode==='weekly')sorted=[...all].sort((a,b)=>this.weekVol(b)-this.weekVol(a));
    else if(S.lbMode==='total')sorted=[...all].sort((a,b)=>(b.total_volume||0)-(a.total_volume||0));
    else sorted=[...all].sort((a,b)=>(b.streak||0)-(a.streak||0));
    const medals=['🥇','🥈','🥉'];
    c.innerHTML=sorted.map((u,i)=>{const val=S.lbMode==='weekly'?`${Math.round(this.weekVol(u)/1000)}t sem.`:S.lbMode==='total'?`${Math.round((u.total_volume||0)/1000)}t total`:`${u.streak||0}d racha`;return`<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i<3?' gold-rank':''}">${i<3?medals[i]:i+1}</div><div class="lb-name">${u.name} <span style="color:var(--wdim);font-size:11px">@${u.username}</span></div><div class="lb-val">${val}</div></div>`;}).join('')||'<p style="color:var(--wdim);padding:20px;text-align:center">No hay atletas aún</p>';
  },
  weekVol(u){const now=Date.now(),wk=7*24*3600*1000;return(u.workout_history_summary||[]).filter(w=>now-new Date(w.date||w.created_at).getTime()<wk).reduce((s,w)=>s+(w.volume||w.total_volume||0),0);},
  async lbTab(mode,btn){S.lbMode=mode;document.querySelectorAll('.lb-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');await this.renderLeaderboard();},

  renderActCal(){
    const hist=(S.user?.workout_history||[]).map(w=>new Date(w.date||w.created_at).toDateString());const today=new Date();let dots='';
    for(let i=27;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const ds=d.toDateString();dots+=`<div class="cal-dot${hist.includes(ds)?' on':''}${ds===today.toDateString()?' today':''}" title="${d.toLocaleDateString()}"></div>`;}
    $('act-cal').innerHTML=dots;
  },

  // ── CHARTS ──
  buildChartSel(){$('chart-sel').innerHTML=EX_DB.filter(e=>e.track).map(e=>`<button class="csel-btn${e.track===S.selChartEx?' active':''}" onclick="App.selChart('${e.track}')">${e.emoji} ${e.name}</button>`).join('');},
  async selChart(t){S.selChartEx=t;document.querySelectorAll('.csel-btn').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');await this.renderCharts();},
  async renderCharts(){
    const hist=await DB.getWorkoutHistory();const exData=[];
    hist.forEach(sess=>{const dbEx=EX_DB.find(d=>d.track===S.selChartEx);const exS=(sess.exercises||[]).find(e=>dbEx&&e.name===dbEx.name);if(exS?.sets?.length>0){const mw=Math.max(...exS.sets.map(s=>s.weight||0));if(mw>0)exData.push({date:new Date(sess.created_at||sess.date).toLocaleDateString('es',{month:'short',day:'numeric'}),weight:mw});}});
    const co={responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:'#f0eaff',font:{family:'Orbitron',size:9}}}},scales:{x:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9},maxRotation:0},grid:{color:'rgba(255,255,255,.03)'}},y:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9}},grid:{color:'rgba(255,255,255,.05)'},beginAtZero:false}}};
    const tryDraw=()=>{
      const c1=$('prog-chart')?.getContext('2d');if(!c1||$('prog-chart').clientWidth===0){setTimeout(tryDraw,300);return;}
      if(S.progChart)S.progChart.destroy();
      S.progChart=new Chart(c1,{type:'line',data:{labels:exData.slice(-8).map(d=>d.date),datasets:[{label:'Peso máx (kg)',data:exData.slice(-8).map(d=>d.weight),borderColor:'#f5c518',backgroundColor:'rgba(245,197,24,.08)',pointBackgroundColor:'#f5c518',pointRadius:4,tension:.4,fill:true}]},options:co});
      const wv=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toDateString();const s=hist.find(h=>new Date(h.created_at||h.date).toDateString()===ds);wv.push({day:d.toLocaleDateString('es',{weekday:'short'}),vol:s?.total_volume||s?.volume||0});}
      const c2=$('vol-chart')?.getContext('2d');if(!c2)return;if(S.volChart)S.volChart.destroy();
      S.volChart=new Chart(c2,{type:'bar',data:{labels:wv.map(d=>d.day),datasets:[{label:'Volumen (kg)',data:wv.map(d=>d.vol),backgroundColor:'rgba(245,197,24,.55)',borderColor:'#f5c518',borderWidth:1,borderRadius:5}]},options:{...co,scales:{...co.scales,y:{...co.scales.y,beginAtZero:true}}}});
      // Weight chart
      const wlog=(S.user?.weight_log||[]).slice(-14);
      if(wlog.length>1){const c3=$('weight-chart')?.getContext('2d');if(c3){if(S.weightChart)S.weightChart.destroy();S.weightChart=new Chart(c3,{type:'line',data:{labels:wlog.map(w=>w.date.slice(5)),datasets:[{label:'Peso corporal (kg)',data:wlog.map(w=>w.kg),borderColor:'#4caf50',backgroundColor:'rgba(76,175,80,.08)',pointBackgroundColor:'#4caf50',pointRadius:4,tension:.4,fill:true}]},options:co});}}
    };
    tryDraw();
  },

  renderRecords(){
    const r=S.user?.records||{},tracked=EX_DB.filter(e=>e.track&&r[e.track]);
    $('records').innerHTML=tracked.length===0?'<div class="empty-log" style="grid-column:1/-1">Completa sesiones para ver tus récords</div>':tracked.map(ex=>{
      const rm=r[ex.track+'_1rm'];
      return`<div class="rec-card"><div class="rec-ico">${ex.emoji}</div><div class="rec-ex">${ex.name.toUpperCase()}</div><div class="rec-val">${r[ex.track]}</div><div class="rec-unit">kg · Récord</div>${rm?`<div style="font-size:10px;color:var(--gold);margin-top:2px">1RM est: ${rm}kg</div>`:''}</div>`;
    }).join('');
  },

  // ── PHOTOS ──
  addPhoto(){
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=async e=>{
      const f=e.target.files[0];if(!f)return;
      // Validate size
      if(f.size>20*1024*1024)return toast('La foto es muy grande. Máximo 20MB.');
      toast('📸 Procesando foto...');
      try{
        const rd=new FileReader();
        rd.onload=async ev=>{
          try{
            // Compress aggressively — max 800px, 70% quality
            const compressed=await compressImg(ev.target.result,800,0.70);
            // Check compressed size
            const sizeKB=Math.round(compressed.length*0.75/1024);
            if(sizeKB>500)toast('⚠️ Foto comprimida a '+sizeKB+'KB');
            const url=await DB.uploadPhoto(compressed,S.user.id);
            // Save to localStorage as fallback
            try{
              const ph=JSON.parse(localStorage.getItem('cl_ph_'+S.user.id)||'[]');
              ph.unshift({date:new Date().toISOString(),src:url});
              localStorage.setItem('cl_ph_'+S.user.id,JSON.stringify(ph.slice(-20)));
            }catch(storErr){console.warn('localStorage full:',storErr);}
            await this.renderPhotos();
            // Also update body tab if open
            if(document.querySelector('#page-body.active'))await this.renderBodyPhotos();
            toast('✅ Foto guardada correctamente');
          }catch(err){toast('Error al guardar foto: '+err.message);}
        };
        rd.onerror=()=>toast('Error al leer la foto');
        rd.readAsDataURL(f);
      }catch(e){toast('Error: '+e.message);}
    };
    inp.click();
  },
  async renderPhotos(){
    const ph=await DB.getPhotos(S.user?.id);
    const c=$('photos');if(!c)return;
    if(ph.length===0){
      c.innerHTML=`<div class="photo-empty"><div style="font-size:48px;margin-bottom:12px">📸</div><p>No hay fotos de progreso</p><p style="font-size:11px;color:var(--wdim);margin-top:4px">Toca + para agregar tu primera foto</p></div><div class="photo-c photo-add" onclick="App.addPhoto()"><span>📷</span><span class="photo-add-label">AÑADIR</span></div>`;
      return;
    }
    c.innerHTML=[
      ...ph.slice(0,12).map((p,i)=>{
        const date=new Date(p.date).toLocaleDateString('es',{month:'short',day:'numeric'});
        return`<div class="photo-c" onclick="App.viewPhoto('${p.src}','${date}',${i},[${ph.slice(0,12).map(x=>"'"+x.src+"'").join(',')}])"><img src="${p.src}" loading="lazy" onerror="this.parentElement.classList.add('photo-error');this.style.display='none'"><div class="photo-date">${date}</div></div>`;
      }),
      `<div class="photo-c photo-add" onclick="App.addPhoto()"><span>📷</span><span class="photo-add-label">AÑADIR</span></div>`
    ].join('');
  },

  async renderBodyPhotos(){
    await this.renderPhotos();
  },

  viewPhoto(src,date,idx,allSrcs){
    // Full screen viewer with swipe support
    const o=document.createElement('div');
    o.id='photo-viewer';
    o.style.cssText='position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;touch-action:pan-y';
    o.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:rgba(0,0,0,.8)">
        <button onclick="document.getElementById('photo-viewer').remove()" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✕</button>
        <span style="color:var(--gold);font-family:var(--fu);font-size:12px;letter-spacing:2px">${date}</span>
        <button onclick="App.deletePhoto(${idx})" style="background:none;border:none;color:#e53935;font-size:13px;font-family:var(--fu);cursor:pointer">🗑️ ELIMINAR</button>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:10px">
        <img src="${src}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px" id="viewer-img">
      </div>
      <div style="display:flex;justify-content:center;gap:6px;padding:12px;flex-wrap:wrap">
        ${allSrcs.map((s,i)=>`<div onclick="document.getElementById('viewer-img').src='${s}'" style="width:44px;height:44px;border-radius:6px;overflow:hidden;border:2px solid ${i===idx?'var(--gold)':'transparent'};cursor:pointer;flex-shrink:0"><img src="${s}" style="width:100%;height:100%;object-fit:cover"></div>`).join('')}
      </div>`;
    document.body.appendChild(o);
  },

  async deletePhoto(idx){
    if(!confirm('¿Eliminar esta foto?'))return;
    try{
      const ph=JSON.parse(localStorage.getItem('cl_ph_'+S.user.id)||'[]');
      ph.splice(idx,1);
      localStorage.setItem('cl_ph_'+S.user.id,JSON.stringify(ph));
      document.getElementById('photo-viewer')?.remove();
      await this.renderPhotos();
      toast('🗑️ Foto eliminada');
    }catch(e){toast('Error al eliminar');}
  },

  // ── RECIPES (lazy load) ──
  buildRecipeFilters(){const c=$('recipe-filters');if(!c)return;c.innerHTML=RECIPE_CATS.map(cat=>`<button class="ach-f${cat==='all'?' active':''}" onclick="App.filterRecipes('${cat}')">${RECIPE_CAT_L[cat]}</button>`).join('');},
  async filterRecipes(cat){document.querySelectorAll('#recipe-filters .ach-f').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');await this.renderRecipes(cat);},
  async renderRecipes(cat){
    const c=$('recipes-list');if(!c)return;c.innerHTML='<div class="empty-log">Cargando...</div>';
    const all=await DB.getRecipes();const list=(cat&&cat!=='all')?all.filter(r=>r.category===cat):all;
    if(S.isCoach)$('recipe-add-btn')?.classList.remove('hidden');
    if(list.length===0){c.innerHTML=`<div class="empty-log" style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:10px">🥗</div><p>No hay recetas todavía</p>${S.isCoach?'<button class="btn-ghost" onclick="App.openCreateRecipe()" style="margin-top:10px;max-width:220px">+ Crear receta con IA</button>':''}</div>`;return;}
    // Lista sin image_data — lazy
    c.innerHTML=list.map(r=>{
      const macros=[r.calories&&`🔥 ${r.calories}kcal`,r.protein&&`🥩 ${r.protein}g`].filter(Boolean).join(' · ');
      return`<div class="recipe-card" onclick="App.openRecipe('${r.id}')">
        <div class="recipe-img-placeholder">${RECIPE_CAT_L[r.category]||'🥗'}</div>
        <div class="recipe-body"><div class="recipe-cat-badge">${RECIPE_CAT_L[r.category]||r.category}</div>
        <div class="recipe-name">${r.name}</div>
        ${r.description?`<div class="recipe-desc">${r.description}</div>`:''}
        <div class="recipe-meta">${r.prep_time?`<span class="pill">⏱️ ${r.prep_time} min</span>`:''}<span class="pill" style="color:${r.difficulty==='easy'?'#4caf50':r.difficulty==='medium'?'#f5c518':'#ff6f00'}">${r.difficulty==='easy'?'Fácil':r.difficulty==='medium'?'Moderado':'Difícil'}</span>${(r.tags||[]).slice(0,2).map(t=>`<span class="pill">${t}</span>`).join('')}</div>
        ${macros?`<div style="font-size:10px;color:var(--wdim);margin-top:4px">${macros}</div>`:''}</div></div>`;
    }).join('');
  },

  async openRecipe(id){
    // Lazy: load full recipe detail (with image_data) only when opening
    const r=await DB.getRecipeDetail(id);if(!r)return;
    const mr=[r.calories&&`<div class="macro-i"><div class="macro-v">${r.calories}</div><div class="macro-l">kcal</div></div>`,r.protein&&`<div class="macro-i"><div class="macro-v">${r.protein}g</div><div class="macro-l">🥩 Prot</div></div>`,r.carbs&&`<div class="macro-i"><div class="macro-v">${r.carbs}g</div><div class="macro-l">🍚 Carbs</div></div>`,r.fat&&`<div class="macro-i"><div class="macro-v">${r.fat}g</div><div class="macro-l">🥑 Grasa</div></div>`].filter(Boolean).join('');
    $('recipe-view-content').innerHTML=`${r.image_data?`<img src="${r.image_data}" alt="${r.name}" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;margin-bottom:14px">`:''}<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><span class="pill">${RECIPE_CAT_L[r.category]||r.category}</span>${r.prep_time?`<span class="pill">⏱️ ${r.prep_time} min</span>`:''}</div><div style="font-family:var(--fd);font-size:20px;letter-spacing:2px;margin-bottom:6px">${r.name}</div>${r.description?`<div style="font-size:13px;color:var(--wdim);margin-bottom:12px">${r.description}</div>`:''}${mr?`<div class="macro-g" style="margin-bottom:14px">${mr}</div>`:''}<div style="font-family:var(--fu);font-size:11px;color:var(--gold);letter-spacing:2px;margin-bottom:8px">🧾 INGREDIENTES</div><ul style="margin:0 0 14px;padding-left:18px;font-size:13px;line-height:1.8">${(r.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul><div style="font-family:var(--fu);font-size:11px;color:var(--gold);letter-spacing:2px;margin-bottom:8px">📋 PREPARACIÓN</div>${(r.steps||[]).map((s,i)=>`<div style="display:flex;gap:10px;margin-bottom:10px;font-size:13px"><div style="min-width:24px;height:24px;border-radius:50%;background:var(--gold);color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">${i+1}</div><div style="flex:1;line-height:1.6">${s}</div></div>`).join('')}${S.isCoach?`<div style="display:flex;gap:8px;margin-top:16px"><button class="btn-ghost" onclick="App.openCreateRecipe('${r.id}');App.closeModal('modal-recipe-view')">✏️ Editar</button><button class="btn-danger-sm" onclick="App.delRecipe('${r.id}');App.closeModal('modal-recipe-view')">🗑️ Eliminar</button></div>`:''}`;
    this.openModal('modal-recipe-view');
  },

  async openCreateRecipe(editId){
    if(!S.isCoach)return;S.editingRecipeId=editId||null;S.recipeGenImg=null;
    const existing=editId?await DB.getRecipeDetail(editId):null;
    $('recipe-modal-title').textContent=editId?'EDITAR RECETA':'NUEVA RECETA';
    $('recipe-name').value=existing?.name||'';$('recipe-category').value=existing?.category||'almuerzo';
    $('recipe-desc').value=existing?.description||'';$('recipe-prep-time').value=existing?.prep_time||'15';
    $('recipe-difficulty').value=existing?.difficulty||'easy';$('recipe-calories').value=existing?.calories||'';
    $('recipe-protein').value=existing?.protein||'';$('recipe-carbs').value=existing?.carbs||'';
    $('recipe-fat').value=existing?.fat||'';$('recipe-ingredients').value=(existing?.ingredients||[]).join('\n');
    $('recipe-steps').value=(existing?.steps||[]).join('\n');$('recipe-tags').value=(existing?.tags||[]).join(', ');
    $('recipe-ai-prompt').value='';const prev=$('recipe-img-preview');prev?.classList.add('hidden');
    S.recipeGenImg=existing?.image_data||null;
    if(S.recipeGenImg){prev?.classList.remove('hidden');prev.innerHTML=`<img src="${S.recipeGenImg}" alt="" style="width:100%;max-height:180px;border-radius:12px;object-fit:cover">`;}
    this.openModal('modal-recipe-create');
  },
  async genRecipeWithAI(){
    const prompt=$('recipe-ai-prompt')?.value?.trim();if(!prompt)return toast('Describe qué receta quieres');
    const btn=$('recipe-ai-btn');btn.textContent='⏳ Generando...';btn.disabled=true;
    toast('🤖 Gemini está creando tu receta...');
    const result=await askGemini(`Crea una receta fitness fácil y rápida basada en: "${prompt}". Responde SOLO con este JSON: {"name":"...","description":"...","category":"desayuno|almuerzo|cena|snack|suplemento","prep_time":15,"difficulty":"easy|medium|hard","calories":0,"protein":0,"carbs":0,"fat":0,"ingredients":["..."],"steps":["..."],"tags":["..."]}`,
      'Eres nutricionista deportivo experto. Responde SOLO en JSON válido sin markdown.');
    btn.textContent='🤖 GENERAR CON IA';btn.disabled=false;
    if(!result){toast('❌ Error generando receta. Verifica tu GEMINI_KEY.');return;}
    $('recipe-name').value=result.name||'';$('recipe-category').value=result.category||'almuerzo';
    $('recipe-desc').value=result.description||'';$('recipe-prep-time').value=result.prep_time||'15';
    $('recipe-difficulty').value=result.difficulty||'easy';$('recipe-calories').value=result.calories||'';
    $('recipe-protein').value=result.protein||'';$('recipe-carbs').value=result.carbs||'';$('recipe-fat').value=result.fat||'';
    $('recipe-ingredients').value=(result.ingredients||[]).join('\n');$('recipe-steps').value=(result.steps||[]).join('\n');
    $('recipe-tags').value=(result.tags||[]).join(', ');toast('✅ Receta generada — revisa y guarda');
  },
  async genRecipeImage(){
    const name=$('recipe-name')?.value?.trim()||'receta fitness';
    const btn=$('recipe-img-btn');btn.textContent='⏳ Generando...';btn.disabled=true;
    const prev=$('recipe-img-preview');prev?.classList.remove('hidden');prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO...</span></div>';
    const url=await generateAIImage(`Fotografía apetitosa de "${name}", plato fitness saludable, colores vibrantes, fondo oscuro elegante`,name,'🍽️');
    S.recipeGenImg=url;prev.innerHTML=`<img src="${url}" alt="Receta" style="width:100%;max-height:180px;border-radius:12px;object-fit:cover"><button class="btn-sm" onclick="App.genRecipeImage()" style="margin-top:6px">↺ REGENERAR</button>`;btn.textContent='🎨 REGENERAR IMAGEN';btn.disabled=false;
  },
  async saveRecipe(){
    const name=v('recipe-name');if(!name)return toast('Dale un nombre a la receta');
    const ingredients=$('recipe-ingredients')?.value?.split('\n').map(s=>s.trim()).filter(Boolean)||[];
    const steps=$('recipe-steps')?.value?.split('\n').map(s=>s.trim()).filter(Boolean)||[];
    if(ingredients.length===0)return toast('Agrega al menos un ingrediente');if(steps.length===0)return toast('Agrega al menos un paso');
    const recipe={id:S.editingRecipeId||null,name,category:$('recipe-category')?.value||'almuerzo',description:v('recipe-desc'),prep_time:parseInt($('recipe-prep-time')?.value)||15,difficulty:$('recipe-difficulty')?.value||'easy',calories:parseInt($('recipe-calories')?.value)||null,protein:parseInt($('recipe-protein')?.value)||null,carbs:parseInt($('recipe-carbs')?.value)||null,fat:parseInt($('recipe-fat')?.value)||null,ingredients,steps,tags:v('recipe-tags').split(',').map(t=>t.trim()).filter(Boolean),image_data:S.recipeGenImg||null};
    await DB.saveRecipe(recipe);this.closeModal('modal-recipe-create');await this.renderRecipes();
    toast(`✅ Receta "${name}" guardada`);S.recipeGenImg=null;S.editingRecipeId=null;
  },
  async delRecipe(id){if(!confirm('¿Eliminar receta?'))return;await DB.deleteRecipe(id);await this.renderRecipes();toast('🗑️ Receta eliminada');},

  // ── AI COACH ──
  async sendAICoachMsg(){
    const input=$('ai-coach-input');
    const txt=input?.value?.trim();if(!txt)return;
    input.value='';
    const c=$('ai-coach-messages');if(!c)return;
    c.innerHTML+=`<div class="ai-msg user"><div class="ai-bubble">${txt}</div></div>`;
    c.scrollTop=c.scrollHeight;
    const thinkId='think_'+Date.now();
    c.innerHTML+=`<div class="ai-msg coach" id="${thinkId}"><div class="ai-bubble ai-thinking">🦁 Analizando...</div></div>`;
    c.scrollTop=c.scrollHeight;
    const u=S.user||{};
    const prompt=`Eres el Coach Lion, entrenador personal experto, motivador y directo.
Datos del atleta: Nombre=${u.name||'atleta'}, Objetivo=${u.goal||'no definido'}, Peso=${u.weight||'?'}kg, Sesiones=${u.sessions||0}, Racha=${u.streak||0} días.
Responde en español. Máximo 3 oraciones cortas. Motivador y específico para este atleta.
Sin asteriscos, sin markdown, solo texto plano.
Pregunta: ${txt}`;
    try{
      const reply=await askGeminiText(prompt);
      const el=document.getElementById(thinkId);
      if(reply){
        if(el)el.outerHTML=`<div class="ai-msg coach"><div class="ai-bubble">🦁 ${reply}</div></div>`;
        if(!u.ai_chat_history)u.ai_chat_history=[];
        u.ai_chat_history.push({role:'user',text:txt,ts:Date.now()},{role:'coach',text:reply,ts:Date.now()});
        u.ai_chat_history=u.ai_chat_history.slice(-30);
      }else{
        if(el)el.outerHTML=`<div class="ai-msg coach"><div class="ai-bubble">🦁 No pude conectar con Gemini. Verifica la GEMINI_KEY en Vercel → Environment Variables.</div></div>`;
      }
    }catch(e){
      const el=document.getElementById(thinkId);
      if(el)el.outerHTML=`<div class="ai-msg coach"><div class="ai-bubble">🦁 Error: ${e.message}</div></div>`;
    }
    c.scrollTop=c.scrollHeight;
  },

  renderAICoachChat(){
    const c=$('ai-coach-messages');if(!c)return;
    const hist=S.user?.ai_chat_history||[];
    if(hist.length===0){
      c.innerHTML=`<div class="ai-welcome">
        <div style="font-size:50px;margin-bottom:10px">🦁</div>
        <div style="font-family:var(--fd);font-size:20px;letter-spacing:2px;color:var(--gold);margin-bottom:8px">COACH LION IA</div>
        <p style="font-size:12px;color:var(--wdim);line-height:1.7;margin-bottom:14px">Tu entrenador personal con inteligencia artificial.</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
          ${['¿Qué ejercicio mejora mis hombros?','Tips para ganar masa muscular','¿Cómo mejorar mi bench press?','¿Qué comer antes de entrenar?','Motívame para hoy'].map(q=>`<button class="ai-suggestion" onclick="document.getElementById('ai-coach-input').value='${q}';App.sendAICoachMsg()">${q}</button>`).join('')}
        </div>
      </div>`;
      return;
    }
    c.innerHTML=hist.map(m=>`<div class="ai-msg ${m.role==='user'?'user':'coach'}"><div class="ai-bubble">${m.role!=='user'?'🦁 ':''}${m.text}</div></div>`).join('');
    c.scrollTop=c.scrollHeight;
  },

  // ── CHAT ──
  async renderChat(){
    const c=$('chat-messages');if(!c)return;
    const msgs=await DB.getMessages(S.user?.id);
    if(msgs.length===0){c.innerHTML='<div class="empty-log" style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:10px">💬</div><p>Sin mensajes todavía</p><p style="font-size:11px;color:var(--wdim);margin-top:6px">Tu coach puede enviarte mensajes aquí</p></div>';return;}
    const myId=S.user?.id;
    c.innerHTML=msgs.map(m=>`<div class="chat-msg ${m.from_user_id===myId?'mine':'theirs'}"><div class="chat-bubble">${m.message}</div><div class="chat-meta">${m.from_name} · ${new Date(m.created_at).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})}</div></div>`).join('');
    c.scrollTop=c.scrollHeight;await DB.markMessagesRead(myId);
  },
  async sendChatMsg(){
    const txt=$('chat-input')?.value?.trim();if(!txt)return;
    const{data:coachUser}=await sb.from('users').select('id').eq('username',COACH_USERNAME).single();
    if(!coachUser)return toast('No se pudo enviar el mensaje');
    await DB.sendMessage(coachUser.id,txt,S.user.id,S.user.name);
    $('chat-input').value='';await this.renderChat();
  },

  // ── CALCULATORS ──
  openCalc(t){
    const titles={'1rm':'🏋️ 1RM',cal:'🔥 CALORÍAS',macros:'🥩 MACROS',bmi:'📊 IMC'};
    $('calc-title').textContent=titles[t];
    const w=S.user?.weight||'',h=S.user?.height||'',age=S.user?.age||'';
    const b={'1rm':`<div class="calc-sec"><p style="font-size:11px;color:var(--wdim)">Fórmula de Epley: peso × (1 + reps/30)</p><div class="field"><span>⚖️</span><input id="c-w" type="number" placeholder="Peso usado (kg)"></div><div class="field"><span>🔢</span><input id="c-r" type="number" placeholder="Repeticiones"></div><button class="btn-gold" onclick="App.c1rm()">CALCULAR</button><div id="calc-out"></div></div>`,cal:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw" type="number" placeholder="Tu peso (kg)" value="${w}"></div><div class="field"><span>⏱️</span><input id="c-min" type="number" placeholder="Duración (min)"></div><div class="field"><span>🏃</span><select id="c-act"><option value="3.5">Pesas moderado</option><option value="5">Pesas intenso</option><option value="7">Cardio moderado</option><option value="10">HIIT</option><option value="12">Correr rápido</option></select></div><button class="btn-gold" onclick="App.cCal()">CALCULAR</button><div id="calc-out"></div></div>`,macros:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-mw" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-mh" type="number" placeholder="Altura (cm)" value="${h}"></div><div class="field"><span>🎂</span><input id="c-ma" type="number" placeholder="Edad" value="${age}"></div><div class="field"><span>⚧️</span><select id="c-mg"><option value="m">Masculino</option><option value="f">Femenino</option></select></div><div class="field"><span>📅</span><select id="c-act2"><option value="1.375">Ligero (1-3/sem)</option><option value="1.55">Moderado (3-5/sem)</option><option value="1.725">Activo (6-7/sem)</option></select></div><button class="btn-gold" onclick="App.cMacros()">CALCULAR</button><div id="calc-out"></div></div>`,bmi:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw2" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-bh" type="number" placeholder="Altura (cm)" value="${h}"></div><button class="btn-gold" onclick="App.cBMI()">CALCULAR</button><div id="calc-out"></div></div>`};
    $('calc-body').innerHTML=b[t]||'';this.openModal('modal-calc');
  },
  c1rm(){
    const w=parseFloat($('c-w')?.value),r=parseInt($('c-r')?.value);
    if(!w||!r)return toast('Completa los campos');
    const rm=parseFloat((w*(1+r/30)).toFixed(1));
    const pcts=[{p:100,l:'1RM Máximo',c:'#f5c518'},{p:95,l:'95% · Fuerza máxima',c:'#ff6f00'},{p:90,l:'90% · Fuerza',c:'#ff9800'},{p:85,l:'85% · Potencia',c:'#4caf50'},{p:80,l:'80% · Hipertrofia',c:'#00bcd4'},{p:75,l:'75% · Volumen',c:'#9c27b0'},{p:70,l:'70% · Resistencia',c:'#607d8b'}];
    const bars=pcts.map(x=>{const kg=(rm*x.p/100).toFixed(1);const repsEst=x.p>=95?1:x.p>=90?2:x.p>=85?3:x.p>=80?5:x.p>=75?8:x.p>=70?10:12;return`<div class="calc-bar-row"><div class="calc-bar-label"><span style="color:${x.c};font-weight:700">${x.p}%</span><span class="calc-bar-desc">${x.l}</span></div><div class="calc-bar-track"><div class="calc-bar-fill" style="width:${x.p}%;background:${x.c}"></div></div><div class="calc-bar-kg">${kg}kg<span class="calc-reps-hint">~${repsEst}rep</span></div></div>`;}).join('');
    $('calc-out').innerHTML=`<div class="calc-hero"><div class="calc-hero-val">${rm}</div><div class="calc-hero-unit">kg · 1RM</div></div><div class="calc-bars">${bars}</div>`;
  },
  cCal(){
    const bw=parseFloat($('c-bw')?.value),min=parseInt($('c-min')?.value),met=parseFloat($('c-act')?.value)||3.5;
    if(!bw||!min)return toast('Completa los campos');
    const cal=Math.round(met*bw*min/60*3.5/200*bw);
    const pct=Math.min(cal/800*100,100);
    const col=cal<200?'#4caf50':cal<400?'#f5c518':cal<600?'#ff9800':'#e53935';
    const tip=cal<200?'Actividad ligera':'Actividad moderada';
    $('calc-out').innerHTML=`
      <div class="calc-hero" style="border-color:${col}">
        <div class="calc-hero-icon">🔥</div>
        <div class="calc-hero-val" style="color:${col}">${cal}</div>
        <div class="calc-hero-unit">kcal quemadas</div>
        <div class="calc-hero-sub">${min} minutos · ${tip}</div>
      </div>
      <div class="calc-ring-wrap">
        <svg viewBox="0 0 120 120" class="calc-ring-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--d3)" stroke-width="10"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="${col}" stroke-width="10"
            stroke-dasharray="${2*Math.PI*50}" stroke-dashoffset="${2*Math.PI*50*(1-pct/100)}"
            stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset .8s ease"/>
        </svg>
        <div class="calc-ring-label">${Math.round(pct)}%<br><span style="font-size:10px;color:var(--wdim)">del límite</span></div>
      </div>`;
  },
  cMacros(){
    const w=parseFloat($('c-mw')?.value),h=parseFloat($('c-mh')?.value),a=parseInt($('c-ma')?.value),g=$('c-mg')?.value,act=parseFloat($('c-act2')?.value)||1.55;
    if(!w||!h||!a)return toast('Completa los campos');
    const bmr=g==='m'?(10*w)+(6.25*h)-(5*a)+5:(10*w)+(6.25*h)-(5*a)-161;
    const tdee=Math.round(bmr*act);
    const goal=S.user?.goal||'hypertrophy';
    const kcal=goal==='weightloss'?tdee-400:['strength','hypertrophy'].includes(goal)?tdee+200:tdee;
    const prot=Math.round(w*2.2),fat=Math.round(kcal*0.25/9),carbs=Math.round((kcal-prot*4-fat*9)/4);
    const protKcal=prot*4,carbsKcal=carbs*4,fatKcal=fat*9,total=protKcal+carbsKcal+fatKcal||1;
    const protPct=Math.round(protKcal/total*100),carbsPct=Math.round(carbsKcal/total*100),fatPct=Math.round(fatKcal/total*100);
    // Donut SVG
    const r=44,circ=2*Math.PI*r;
    const seg1=circ*protPct/100,seg2=circ*carbsPct/100,seg3=circ*fatPct/100;
    const off1=0,off2=circ-seg1,off3=circ-(seg1+seg2);
    $('calc-out').innerHTML=`
      <div class="calc-hero"><div class="calc-hero-val">${kcal}</div><div class="calc-hero-unit">kcal / día</div><div class="calc-hero-sub">${GL[goal]||goal} · TMB ${Math.round(bmr)} · TDEE ${tdee}</div></div>
      <div class="macro-donut-wrap">
        <svg viewBox="0 0 100 100" class="macro-donut">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e53935" stroke-width="12" stroke-dasharray="${seg1} ${circ-seg1}" stroke-dashoffset="${circ*0.25}" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#f5c518" stroke-width="12" stroke-dasharray="${seg2} ${circ-seg2}" stroke-dashoffset="${circ*0.25-seg1}" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#4caf50" stroke-width="12" stroke-dasharray="${seg3} ${circ-seg3}" stroke-dashoffset="${circ*0.25-seg1-seg2}" stroke-linecap="round"/>
          <text x="50" y="46" text-anchor="middle" font-size="10" fill="var(--white)" font-family="Orbitron,sans-serif">MACROS</text>
          <text x="50" y="58" text-anchor="middle" font-size="7" fill="var(--wdim)">diarios</text>
        </svg>
      </div>
      <div class="macro-cards">
        <div class="macro-card" style="border-color:#e53935"><div class="mc-icon">🥩</div><div class="mc-val">${prot}g</div><div class="mc-name">PROTEÍNA</div><div class="mc-pct" style="color:#e53935">${protPct}%</div><div class="mc-kcal">${protKcal} kcal</div></div>
        <div class="macro-card" style="border-color:#f5c518"><div class="mc-icon">🍚</div><div class="mc-val">${carbs}g</div><div class="mc-name">CARBOS</div><div class="mc-pct" style="color:#f5c518">${carbsPct}%</div><div class="mc-kcal">${carbsKcal} kcal</div></div>
        <div class="macro-card" style="border-color:#4caf50"><div class="mc-icon">🥑</div><div class="mc-val">${fat}g</div><div class="mc-name">GRASA</div><div class="mc-pct" style="color:#4caf50">${fatPct}%</div><div class="mc-kcal">${fatKcal} kcal</div></div>
      </div>`;
  },
  async cBMI(){
    const w=parseFloat($('c-bw2')?.value),h=parseFloat($('c-bh')?.value);
    if(!w||!h)return toast('Completa los campos');
    const bmi=parseFloat((w/Math.pow(h/100,2)).toFixed(1));
    const ranges=[
      {max:16,  label:'Delgadez severa', col:'#0288d1', tip:'Consulta con un médico'},
      {max:18.5,label:'Bajo peso',        col:'#00bcd4', tip:'Aumenta tu ingesta calórica'},
      {max:25,  label:'Peso saludable ✅',col:'#4caf50', tip:'¡Mantén ese ritmo!'},
      {max:30,  label:'Sobrepeso',        col:'#f5c518', tip:'Reduce calorías y entrena'},
      {max:35,  label:'Obesidad I',       col:'#ff9800', tip:'Busca asesoría nutricional'},
      {max:999, label:'Obesidad II+',     col:'#e53935', tip:'Consulta con un especialista'},
    ];
    const range=ranges.find(r=>bmi<r.max)||ranges[ranges.length-1];
    const col=range.col;
    // Gauge: BMI de 15 a 40
    const minB=15,maxB=40,pct=Math.min(Math.max((bmi-minB)/(maxB-minB)*100,0),100);
    const gradStops='#0288d1 0%,#00bcd4 15%,#4caf50 35%,#f5c518 60%,#ff9800 75%,#e53935 100%';
    if(S.user){S.user.bmi=bmi;await DB.saveUser(S.user);}
    $('calc-out').innerHTML=`
      <div class="calc-hero" style="border-color:${col}">
        <div class="calc-hero-val" style="color:${col}">${bmi}</div>
        <div class="calc-hero-unit">IMC</div>
        <div class="bmi-badge" style="background:${col}22;color:${col};border:1px solid ${col}">${range.label}</div>
        <div class="calc-hero-sub" style="margin-top:6px">${range.tip}</div>
      </div>
      <div class="bmi-gauge-wrap">
        <div class="bmi-gauge-track" style="background:linear-gradient(90deg,${gradStops})">
          <div class="bmi-gauge-needle" style="left:${pct}%"></div>
        </div>
        <div class="bmi-gauge-labels">
          <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span>
        </div>
      </div>
      <div class="bmi-scale">
        ${ranges.slice(0,-1).map(rr=>`<div class="bmi-scale-item${bmi<rr.max&&bmi>=(ranges[ranges.indexOf(rr)-1]?.max||0)?' bmi-active':''}"><div class="bmi-dot" style="background:${rr.col}"></div><span>${rr.label}</span></div>`).join('')}
      </div>`;
  },
  // ── COACH PANEL ──
  async renderCoach(){
    const users=await DB.getAllUsers();const c=$('athletes-list');if(!c)return;
    // Search filter
    const sq=$('athlete-search')?.value?.toLowerCase()||'';
    const gq=$('athlete-goal-filter')?.value||'all';
    const filtered=users.filter(u=>{
      const matchName=!sq||u.name.toLowerCase().includes(sq)||u.username.toLowerCase().includes(sq);
      const matchGoal=gq==='all'||u.goal===gq;
      return matchName&&matchGoal;
    });
    c.innerHTML=filtered.length===0?'<div class="empty-log">No hay atletas que coincidan</div>':filtered.map(u=>{
      const lv=Math.floor((u.xp||0)/1000)+1;
      const lastSess=u.last_session?new Date(u.last_session).toLocaleDateString('es',{day:'numeric',month:'short'}):'Nunca';
      return`<div class="ath-card-pro" onclick="App.viewAthlete('${u.id}')">
        <div class="ath-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <div class="ath-info-pro">
          <div class="ath-name-pro">${u.name} <span class="ath-user">@${u.username}</span></div>
          <div class="ath-goal-badge">${GL[u.goal]||'Sin objetivo'}</div>
          <div class="ath-mini-stats">
            <span>💪 ${u.sessions||0} ses</span>
            <span>🔥 ${u.streak||0}d</span>
            <span>⚡ Nv.${lv}</span>
            <span>📅 ${lastSess}</span>
          </div>
        </div>
        <div class="ath-actions">
          <button class="btn-sm" onclick="event.stopPropagation();App.msgAthlete('${u.id}','${u.name}')">💬</button>
        </div>
      </div>`;
    }).join('');
    const opts=users.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('');
    if($('assign-user'))$('assign-user').innerHTML='<option value="">Atleta...</option>'+opts;
    if($('msg-user'))$('msg-user').innerHTML='<option value="">Atleta...</option>'+opts;
    const rts=await DB.getRoutines();
    if($('assign-routine'))$('assign-routine').innerHTML='<option value="">Rutina...</option>'+rts.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    await this.renderCoachRoutines();await this.renderCoachChallenges();await this.renderCoachAchievements();await this.renderCoachMessages();
  },
  async viewAthlete(uid){
    // Get full athlete data
    const{data:u}=await sb.from('users').select('*').eq('id',uid).single();
    if(!u)return toast('No se pudo cargar el perfil');
    const lv=Math.floor((u.xp||0)/1000)+1;
    const hist=await DB.getWorkoutHistory(uid,0);
    const allAchs=await DB.getAchs();
    const unlockedAchs=(u.achievements||[]).map(id=>allAchs.find(a=>a.id===id)).filter(Boolean);
    const recs=u.records||{};
    const meas=u.body_measurements||{};
    const weightLog=(u.weight_log||[]).slice(-5).reverse();
    // Build modal
    const recHtml=Object.entries(recs).filter(([k])=>!k.endsWith('_1rm')).map(([k,v])=>{
      const ex=EX_DB.find(e=>e.track===k);
      return ex?`<div class="ath-rec-item"><span>${ex.emoji} ${ex.name}</span><span>${v}kg</span></div>`:'';
    }).join('');
    const measHtml=Object.entries({arm_r:'B.Der↓',arm_r_flex:'B.Der↑',arm_l:'B.Izq↓',arm_l_flex:'B.Izq↑',leg_r:'P.Der',leg_l:'P.Izq',chest:'Pecho',abdomen:'Abd',cadera:'Cadera'}).filter(([k])=>meas[k]).map(([k,l])=>`<div class="ath-meas-item"><span>${l}</span><span>${meas[k]}cm</span></div>`).join('');
    const achHtml=unlockedAchs.slice(-6).map(a=>`<div class="ath-ach-mini" title="${a.name}">${a.icon}</div>`).join('');
    const weightHtml=weightLog.map(w=>`<div class="ath-weight-row"><span>${w.date}</span><span>${w.kg}kg</span></div>`).join('');

    const modal=document.createElement('div');
    modal.className='modal';modal.id='modal-athlete-view';
    modal.innerHTML=`<div class="modal-card">
      <div class="modal-head"><h3>👤 PERFIL ATLETA</h3><button onclick="document.getElementById('modal-athlete-view').remove()">✕</button></div>

      <!-- HERO -->
      <div class="ath-hero">
        <div class="ath-hero-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <div class="ath-hero-info">
          <div class="ath-hero-name">${u.name}</div>
          <div class="ath-hero-user">@${u.username}</div>
          <div class="ath-hero-badge">${TITLES[Math.min(lv-1,TITLES.length-1)]}</div>
        </div>
        <div class="ath-hero-level">
          <div class="ath-lv-num">${lv}</div>
          <div class="ath-lv-label">NIVEL</div>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="ath-stats-grid">
        <div class="ath-stat"><div class="ath-stat-v">${u.sessions||0}</div><div class="ath-stat-l">Sesiones</div></div>
        <div class="ath-stat"><div class="ath-stat-v">${u.streak||0}d</div><div class="ath-stat-l">Racha</div></div>
        <div class="ath-stat"><div class="ath-stat-v">${u.xp||0}</div><div class="ath-stat-l">XP Total</div></div>
        <div class="ath-stat"><div class="ath-stat-v">${Math.round((u.total_volume||0)/1000)}t</div><div class="ath-stat-l">Volumen</div></div>
      </div>

      <!-- FÍSICO -->
      <div class="ath-section"><div class="ath-section-title">📏 DATOS FÍSICOS</div>
        <div class="ath-phys-row">
          <div class="ath-phys-item"><div class="ath-phys-v">${u.weight||'--'}kg</div><div class="ath-phys-l">Peso</div></div>
          <div class="ath-phys-item"><div class="ath-phys-v">${u.height||'--'}cm</div><div class="ath-phys-l">Altura</div></div>
          <div class="ath-phys-item"><div class="ath-phys-v">${u.age||'--'}</div><div class="ath-phys-l">Edad</div></div>
          <div class="ath-phys-item"><div class="ath-phys-v">${u.bmi||'--'}</div><div class="ath-phys-l">IMC</div></div>
        </div>
        <div style="font-size:11px;color:var(--wdim);margin-top:6px">Objetivo: ${GL[u.goal]||'Sin definir'} · ${(u.days_per_week||u.days||'--')} días/semana</div>
      </div>

      ${recHtml?`<div class="ath-section"><div class="ath-section-title">🏆 RÉCORDS PERSONALES</div><div class="ath-recs">${recHtml}</div></div>`:''}

      ${measHtml?`<div class="ath-section"><div class="ath-section-title">📐 MEDIDAS CORPORALES</div><div class="ath-meas-grid">${measHtml}</div></div>`:''}

      ${weightHtml?`<div class="ath-section"><div class="ath-section-title">⚖️ HISTORIAL DE PESO</div><div class="ath-weight-list">${weightHtml}</div></div>`:''}

      ${achHtml?`<div class="ath-section"><div class="ath-section-title">🎖️ LOGROS (${unlockedAchs.length})</div><div class="ath-achs-mini">${achHtml}</div></div>`:''}

      <div class="ath-section"><div class="ath-section-title">📊 ÚLTIMAS SESIONES (${hist.length})</div>
        ${hist.slice(0,5).map(s=>`<div class="ath-sess-row"><span>${new Date(s.created_at).toLocaleDateString('es',{weekday:'short',day:'numeric',month:'short'})}</span><span>${Math.round(s.total_volume||0).toLocaleString()}kg · ${pad(Math.floor((s.duration_seconds||0)/60))}m</span></div>`).join('')||'<p style="color:var(--wdim);font-size:12px">Sin sesiones aún</p>'}
      </div>

      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="btn-ghost" onclick="App.msgAthlete('${u.id}','${u.name}');document.getElementById('modal-athlete-view').remove()">💬 Enviar mensaje</button>
        <button class="btn-ghost" onclick="document.getElementById('modal-athlete-view').remove()">✕ Cerrar</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
  },

  msgAthlete(uid,name){if($('msg-user'))$('msg-user').value=uid;this.coachTab('messages',document.querySelector('.ctab[onclick*="messages"]'));if($('msg-text'))$('msg-text').focus();toast(`💬 Enviando mensaje a ${name}`);},
  async renderCoachRoutines(){
    const rts=await DB.getRoutines();const c=$('coach-routines-list');if(!c)return;
    if(rts.length===0){c.innerHTML='<div class="empty-log">Crea tu primera rutina</div>';return;}
    const tl={strength:'🏋️ Fuerza',hypertrophy:'💪 Hipertrofia',cardio:'🏃 Cardio',fullbody:'🔥 Full Body',ppl:'⚡ PPL',hiit:'💥 HIIT'};
    c.innerHTML=rts.map(r=>{const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');return`<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day_of_week||r.day]||r.day_of_week}</div></div><div class="rc-type">${tl[r.type]||r.type} · ${exs.length} ejs</div><div class="rc-actions"><button class="btn-sm" onclick="App.assignRoutineById('${r.id}')">📤 Asignar</button><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️</button></div></div>`;}).join('');
  },
  async assignRoutine(){const uid=$('assign-user')?.value,rid=$('assign-routine')?.value;if(!uid||!rid)return toast('Selecciona atleta y rutina');const rts=await DB.getRoutines();const r=rts.find(x=>x.id===rid);if(!r)return;await DB.saveRoutine({...r,id:null},uid);toast('✅ Rutina asignada al atleta');},
  async assignRoutineById(rid){const uid=$('assign-user')?.value;if(!uid)return toast('Selecciona primero un atleta');const rts=await DB.getRoutines();const r=rts.find(x=>x.id===rid);if(!r)return;await DB.saveRoutine({...r,id:null},uid);toast('✅ Rutina asignada');},
  async sendMsg(){
    const uid=$('msg-user')?.value,txt=$('msg-text')?.value?.trim();
    if(!uid||!txt)return toast('Selecciona atleta y escribe el mensaje');
    await DB.sendMessage(uid,txt,S.user.id,S.user.name);
    $('msg-text').value='';await this.renderCoachMessages();toast('💬 Mensaje enviado');
  },
  async renderCoachMessages(){
    const c=$('sent-msgs');if(!c)return;c.innerHTML='<div class="empty-log">Cargando...</div>';
    const{data:msgs}=await sb.from('coach_messages').select('*').eq('from_user_id',S.user?.id).order('created_at',{ascending:false}).limit(20);
    if(!msgs?.length){c.innerHTML='<div class="empty-log">No has enviado mensajes aún</div>';return;}
    const users=await DB.getAllUsers();
    c.innerHTML=(msgs||[]).map(m=>{const ath=users.find(u=>u.id===m.to_user_id);return`<div class="sent-msg"><div class="sm-to">PARA: ${ath?.name||m.to_user_id}</div><div class="sm-txt">${m.message}</div><div class="sm-date">${new Date(m.created_at).toLocaleDateString('es',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div></div>`;}).join('');
  },
  async checkCoachMsg(){
    if(!S.user||S.isCoach)return;
    try{const msgs=await DB.getUnreadMessages(S.user.id);if(msgs.length>0){const latest=msgs[msgs.length-1];setTimeout(()=>{$('coach-msg-txt').textContent=`"${latest.message}" — ${latest.from_name}`;$('coach-popup')?.classList.remove('hidden');DB.markMessagesRead(S.user.id);},2000);}}catch(e){}
  },
  closeCoachPopup(){$('coach-popup')?.classList.add('hidden');},

  openModal(id){$(id)?.classList.remove('hidden');},
  closeModal(id){$(id)?.classList.add('hidden');},
  checkNotif(){if('Notification' in window&&Notification.permission==='default')setTimeout(()=>$('notif-bar')?.classList.remove('hidden'),3000);},
  reqNotif(){Notification.requestPermission().then(()=>this.dimNotif());toast('🔔 Notificaciones activadas');},
  dimNotif(){$('notif-bar')?.classList.add('hidden');},
  async updateWeight(){const w=prompt('Nuevo peso (kg):',S.user?.weight||'');if(!w)return;S.user.weight=parseFloat(w);if(S.user.height)S.user.bmi=(S.user.weight/Math.pow(S.user.height/100,2)).toFixed(1);await DB.saveUser(S.user);await this.updateProfile();toast(`⚖️ ${w} kg guardado`);},
  exportData(){const b=new Blob([JSON.stringify(S.user,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`coach-lion-${S.user.username}-${new Date().toISOString().split('T')[0]}.json`;a.click();URL.revokeObjectURL(a.href);toast('📤 Datos exportados');},
  async reqWL(){try{if('wakeLock' in navigator)await navigator.wakeLock.request('screen');}catch(e){}},
};

document.addEventListener('DOMContentLoaded',()=>App.init());
