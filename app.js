// ═══════════════════════════════════════
// COACH LION v5 — APP.JS
// ═══════════════════════════════════════

const COACH_USERNAME = 'coach';

// ── FAL.AI CONFIG ──
// Para imágenes reales: registra en fal.ai (gratis), copia tu API key aquí
const FAL_KEY = 'YOUR_FAL_API_KEY';
// Modelo recomendado: fal-ai/flux/schnell (rápido y gratuito)
const FAL_MODEL = 'fal-ai/flux/schnell';

// ── STATE ──
const S = {
  user: null, isCoach: false,
  sessActive: false, sessStart: null, sessTimer: null,
  restTimer: null, restSec: 60, restDur: 60, restRunning: false,
  workLog: [], curEx: null, modalSets: [],
  rnExs: [], pickerSelEx: null, pickerGenImg: null,
  chGenImg: null, achGenImg: null,
  editingChId: null, editingAchId: null,
  circuitRestTimer: null,
  progChart: null, volChart: null, selChartEx: 'bench_press',
  achFilter: 'all', lbMode: 'weekly',
  onboardSlide: 0,
};

// ── QUOTES ──
const QUOTES = [
  '"El dolor de hoy es la fuerza de mañana."',
  '"No cuentes los días, haz que los días cuenten."',
  '"El único mal entrenamiento es el que no hiciste."',
  '"Sé la bestia que el hierro necesita."',
  '"Un guerrero no se rinde. Se adapta."',
  '"La disciplina hace lo que la motivación no puede."',
  '"Los campeones no nacen, se forjan."',
  '"El hierro no miente. Tu cuerpo tampoco."',
  '"Sé más fuerte que tus excusas."',
  '"Cada serie te acerca a quien quieres ser."',
];

// ── DEFAULT ACHIEVEMENTS (editable by coach) ──
const DEFAULT_ACHS = [
  { id:'first_session', icon:'⚡', name:'PRIMER GOLPE', desc:'Completa tu primera sesión', xp:100, rarity:'common', cat:'sessions', imageData:null },
  { id:'ten_sessions', icon:'🔥', name:'EN LLAMAS', desc:'10 sesiones completadas', xp:250, rarity:'uncommon', cat:'sessions', imageData:null },
  { id:'fifty_sessions', icon:'💎', name:'DIAMANTE NEGRO', desc:'50 sesiones completadas', xp:1000, rarity:'epic', cat:'sessions', imageData:null },
  { id:'hundred_sessions', icon:'👑', name:'REY DEL DOJO', desc:'100 sesiones completadas', xp:3000, rarity:'legendary', cat:'sessions', imageData:null },
  { id:'streak_7', icon:'🗡️', name:'SAMURAI SEMANAL', desc:'7 días seguidos', xp:300, rarity:'uncommon', cat:'streaks', imageData:null },
  { id:'streak_30', icon:'👹', name:'DEMONIO DEL MES', desc:'30 días seguidos', xp:1500, rarity:'legendary', cat:'streaks', imageData:null },
  { id:'bench_100', icon:'😈', name:'THANOS JUNIOR', desc:'Press de banca 100 kg', xp:500, rarity:'epic', cat:'strength', imageData:null },
  { id:'bench_140', icon:'🦁', name:'MODO BESTIA', desc:'Press de banca 140 kg', xp:1000, rarity:'legendary', cat:'strength', imageData:null },
  { id:'squat_100', icon:'🏋️', name:'GUERRERO DRAGÓN', desc:'Sentadilla 100 kg', xp:500, rarity:'epic', cat:'strength', imageData:null },
  { id:'deadlift_100', icon:'⚔️', name:'COLOSO', desc:'Peso muerto 100 kg', xp:500, rarity:'epic', cat:'strength', imageData:null },
  { id:'deadlift_200', icon:'🌠', name:'TITÁN ABSOLUTO', desc:'Peso muerto 200 kg', xp:2000, rarity:'legendary', cat:'strength', imageData:null },
  { id:'curl_40', icon:'💪', name:'BRAZO DE ACERO', desc:'Curl bíceps 40 kg', xp:400, rarity:'epic', cat:'strength', imageData:null },
  { id:'pullups_15', icon:'🦅', name:'ÁGUILA REAL', desc:'15 dominadas seguidas', xp:350, rarity:'epic', cat:'strength', imageData:null },
  { id:'cardio_30', icon:'🎽', name:'CORAZÓN DE FUEGO', desc:'30 min continuos de cardio', xp:200, rarity:'uncommon', cat:'cardio', imageData:null },
  { id:'volume_10k', icon:'📦', name:'REY DEL VOLUMEN', desc:'10,000 kg en una sesión', xp:600, rarity:'epic', cat:'volume', imageData:null },
  { id:'early_bird', icon:'🌅', name:'MADRUGADOR BESTIAL', desc:'Entrena antes de las 6am', xp:200, rarity:'uncommon', cat:'special', imageData:null },
  { id:'night_owl', icon:'🦉', name:'LOBO NOCTURNO', desc:'Entrena después de las 10pm', xp:200, rarity:'uncommon', cat:'special', imageData:null },
  { id:'level_5', icon:'⬆️', name:'GUERRERO LV5', desc:'Alcanza el nivel 5', xp:500, rarity:'uncommon', cat:'progression', imageData:null },
  { id:'level_10', icon:'🔱', name:'MAESTRO LV10', desc:'Alcanza el nivel 10', xp:1000, rarity:'epic', cat:'progression', imageData:null },
];

// ── EXERCISE DB ──
const EX_DB = [
  { id:'bench_press', name:'Press de Banca', muscle:'chest', equip:'barbell', emoji:'🏋️', diff:'intermediate', inst:'Acuéstate, agarra la barra más ancho que los hombros. Baja controlado al pecho, empuja explosivo. Escápulas retraídas siempre.', track:'bench_press' },
  { id:'incline_press', name:'Press Inclinado', muscle:'chest', equip:'barbell', emoji:'💪', diff:'intermediate', inst:'Banco a 30-45°. Mismo movimiento que press plano, enfoca el pecho superior.', track:null },
  { id:'dumbbell_fly', name:'Aperturas con Mancuernas', muscle:'chest', equip:'dumbbell', emoji:'🦅', diff:'beginner', inst:'Brazos ligeramente flexionados, abre en arco amplio sintiendo el estiramiento del pecho.', track:null },
  { id:'pushup', name:'Flexiones', muscle:'chest', equip:'bodyweight', emoji:'🤸', diff:'beginner', inst:'Manos al ancho de hombros, cuerpo recto. Baja el pecho al suelo, empuja arriba completamente.', track:null },
  { id:'cable_fly', name:'Cruces en Polea', muscle:'chest', equip:'cable', emoji:'⚡', diff:'intermediate', inst:'Desde poleas altas, junta las manos frente al pecho con contracción máxima.', track:null },
  { id:'deadlift', name:'Peso Muerto', muscle:'back', equip:'barbell', emoji:'🌋', diff:'advanced', inst:'Pies al ancho de cadera, barra sobre el metatarso. Espalda neutral, empuja el suelo. El rey de los ejercicios.', track:'deadlift' },
  { id:'pullup', name:'Dominadas', muscle:'back', equip:'bodyweight', emoji:'🦅', diff:'intermediate', inst:'Agarre prono más ancho que hombros. Lleva el pecho a la barra, baja completamente controlado.', track:'pullups' },
  { id:'bent_row', name:'Remo con Barra', muscle:'back', equip:'barbell', emoji:'⚓', diff:'intermediate', inst:'Torso 45°, barra a los abdominales. Codos hacia atrás, contrae las escápulas.', track:null },
  { id:'lat_pulldown', name:'Jalón al Pecho', muscle:'back', equip:'cable', emoji:'🎯', diff:'beginner', inst:'Jala la barra al pecho superior, codos al suelo. Pecho alto durante todo el movimiento.', track:null },
  { id:'seated_row', name:'Remo Sentado Polea', muscle:'back', equip:'cable', emoji:'🚣', diff:'beginner', inst:'Espalda recta, jala hacia el ombligo. Contrae la espalda en cada repetición.', track:null },
  { id:'ohp', name:'Press Militar', muscle:'shoulders', equip:'barbell', emoji:'🗡️', diff:'intermediate', inst:'De pie o sentado, empuja la barra por encima de la cabeza hasta extender completamente.', track:null },
  { id:'lateral_raise', name:'Elevaciones Laterales', muscle:'shoulders', equip:'dumbbell', emoji:'✈️', diff:'beginner', inst:'Eleva los brazos lateralmente hasta la altura de hombros, codo ligeramente flexionado.', track:null },
  { id:'face_pull', name:'Face Pull', muscle:'shoulders', equip:'cable', emoji:'🎯', diff:'beginner', inst:'Polea alta, jala hacia la cara abriendo los codos. Clave para la salud del hombro.', track:null },
  { id:'barbell_curl', name:'Curl con Barra', muscle:'biceps', equip:'barbell', emoji:'💪', diff:'beginner', inst:'Codos pegados al torso, curla la barra hasta contraer el bíceps completamente. Baja controlado.', track:'bicep_curl' },
  { id:'hammer_curl', name:'Curl Martillo', muscle:'biceps', equip:'dumbbell', emoji:'🔨', diff:'beginner', inst:'Agarre neutro, curla hasta el hombro. Trabaja braquial y braquiorradial.', track:null },
  { id:'incline_curl', name:'Curl Inclinado', muscle:'biceps', equip:'dumbbell', emoji:'🌟', diff:'intermediate', inst:'En banco inclinado, brazos colgando. Mayor estiramiento del bíceps en cada repetición.', track:null },
  { id:'skull_crusher', name:'Skull Crusher', muscle:'triceps', equip:'barbell', emoji:'💀', diff:'intermediate', inst:'Acostado, baja la barra a la frente flexionando solo los codos. Extiende explosivo.', track:null },
  { id:'tricep_dip', name:'Fondos para Tríceps', muscle:'triceps', equip:'bodyweight', emoji:'⬇️', diff:'intermediate', inst:'En paralelas, baja hasta 90° de codo. Empuja arriba contrayendo el tríceps.', track:null },
  { id:'tricep_pushdown', name:'Extensión Tríceps Polea', muscle:'triceps', equip:'cable', emoji:'⚡', diff:'beginner', inst:'Codos pegados, empuja hasta extensión completa. Contrae fuerte el tríceps.', track:null },
  { id:'squat', name:'Sentadilla', muscle:'legs', equip:'barbell', emoji:'🏋️', diff:'intermediate', inst:'Barra en trapecios, pies al ancho de hombros. Baja a paralelo o más abajo, rodillas siguiendo los pies.', track:'squat' },
  { id:'leg_press', name:'Prensa de Piernas', muscle:'legs', equip:'machine', emoji:'🦵', diff:'beginner', inst:'Pies al ancho de hombros. Baja controlado sin bloquear completamente la rodilla.', track:null },
  { id:'romanian_dl', name:'Peso Muerto Rumano', muscle:'legs', equip:'barbell', emoji:'🧲', diff:'intermediate', inst:'Bisagra de cadera, baja la barra por las piernas sintiendo el isquiotibial.', track:null },
  { id:'lunges', name:'Zancadas', muscle:'legs', equip:'dumbbell', emoji:'🚶', diff:'beginner', inst:'Paso adelante, rodilla trasera casi toca el suelo. Torso erguido.', track:null },
  { id:'leg_curl', name:'Curl Femoral', muscle:'legs', equip:'machine', emoji:'🔩', diff:'beginner', inst:'En la máquina, jala el peso con los isquiotibiales. Controla la bajada.', track:null },
  { id:'calf_raise', name:'Elevaciones de Talones', muscle:'legs', equip:'machine', emoji:'👟', diff:'beginner', inst:'Sube en punta de pies, mantén 1 segundo arriba. Baja con control total.', track:null },
  { id:'plank', name:'Plancha', muscle:'core', equip:'bodyweight', emoji:'🧱', diff:'beginner', inst:'Cuerpo recto en antebrazos y pies. Aprieta abdomen y glúteos todo el tiempo.', track:null },
  { id:'crunch', name:'Abdominales', muscle:'core', equip:'bodyweight', emoji:'🎯', diff:'beginner', inst:'Manos en la nuca, curva el tronco contrayendo el abdomen. No jales el cuello.', track:null },
  { id:'hanging_lr', name:'Elevación Piernas Colgado', muscle:'core', equip:'bodyweight', emoji:'🏋️', diff:'advanced', inst:'Colgado de la barra, eleva las piernas a 90° o más. Controla la bajada.', track:null },
  { id:'cable_crunch', name:'Crunch en Polea', muscle:'core', equip:'cable', emoji:'⚡', diff:'intermediate', inst:'De rodillas, jala la cuerda flexionando el torso. Contrae el abdomen al final.', track:null },
];

const MUSCLES = ['all','chest','back','shoulders','biceps','triceps','legs','core'];
const ML = { all:'Todos', chest:'Pecho', back:'Espalda', shoulders:'Hombros', biceps:'Bíceps', triceps:'Tríceps', legs:'Piernas', core:'Core' };
const EQL = { barbell:'Barra', dumbbell:'Mancuerna', cable:'Polea', machine:'Máquina', bodyweight:'Peso Corporal' };
const DFL = { beginner:'⭐ Principiante', intermediate:'⭐⭐ Intermedio', advanced:'⭐⭐⭐ Avanzado' };
const DAL = { monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles', thursday:'Jueves', friday:'Viernes', saturday:'Sábado', sunday:'Domingo', any:'Cualquier día' };
const GL = { strength:'⚡ Fuerza', hypertrophy:'💪 Masa', weightloss:'🔥 Definir', endurance:'🏃 Resistencia', athletic:'🏆 Atlético' };
const RC = { common:'#9e9e9e', uncommon:'#4caf50', epic:'#9c27b0', legendary:'#ff6f00' };
const RL = { common:'COMÚN', uncommon:'INUSUAL', epic:'ÉPICO', legendary:'LEGENDARIO' };
const ACH_CATS = ['all','sessions','streaks','strength','cardio','volume','special','progression'];
const ACH_CAT_L = { all:'Todos', sessions:'Sesiones', streaks:'Rachas', strength:'Fuerza', cardio:'Cardio', volume:'Volumen', special:'Especiales', progression:'Nivel' };
const TITLES = ['⚔️ NOVATO','🔥 GUERRERO','💪 VETERANO','🦁 BESTIA','👹 DEMONIO','🐉 MAESTRO','⚡ LEYENDA','👑 DIOS DEL HIERRO'];

// ── HELPERS ──
const $ = id => document.getElementById(id);
const v = id => $(id)?.value?.trim() || '';
const pad = n => String(n).padStart(2,'0');
const getUsers = () => JSON.parse(localStorage.getItem('cl_users') || '[]');
const saveUsers = u => localStorage.setItem('cl_users', JSON.stringify(u));
const getRoutines = (uid) => JSON.parse(localStorage.getItem('cl_rt_' + (uid || S.user?.id || '')) || '[]');
const saveRoutines = (r, uid) => localStorage.setItem('cl_rt_' + (uid || S.user?.id || ''), JSON.stringify(r));
const getChallenges = () => JSON.parse(localStorage.getItem('cl_ch_global') || '[]');
const saveChallenges = c => localStorage.setItem('cl_ch_global', JSON.stringify(c));
const getAchs = () => JSON.parse(localStorage.getItem('cl_achs_global') || JSON.stringify(DEFAULT_ACHS));
const saveAchs = a => localStorage.setItem('cl_achs_global', JSON.stringify(a));

function toast(msg) {
  document.querySelector('.cl-t')?.remove();
  const t = document.createElement('div');
  t.className = 'cl-t';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:calc(var(--nav) + 12px);left:50%;transform:translateX(-50%);background:var(--d3);border:1px solid var(--borderb);color:var(--white);padding:10px 16px;border-radius:11px;font-family:var(--fu);font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;box-shadow:0 8px 28px rgba(0,0,0,.5)';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ── LION ROAR SOUND ──
function playRoar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

// ── FAL.AI IMAGE GENERATION ──
async function generateImageFal(prompt) {
  try {
    // Enhanced prompt for comic/anime style
    const enhancedPrompt = `${prompt}, comic book art style, anime influences, Marvel DC comics aesthetic, bold colors, dynamic composition, dramatic lighting, halftone dot pattern, strong black outlines, vibrant colors, epic action pose, dark background with gold accents, fitness themed`;

    const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: 'square',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('Fal.ai error:', err);
      return null;
    }

    const data = await res.json();
    const imageUrl = data?.images?.[0]?.url;
    if (!imageUrl) return null;

    // Convert URL to base64 for local storage
    const imgRes = await fetch(imageUrl);
    const blob = await imgRes.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch(e) {
    console.warn('Image generation failed:', e.message);
    return null;
  }
}

// ── FALLBACK SVG GENERATOR ──
function fallbackSVG(name, icon) {
  const icons = ['💪','🏆','🔥','⚡','🦁','👹','🐉','⚔️','🌟','👑','😈','🦅','💀','🌋'];
  const ic = icon || icons[Math.floor(Math.random() * icons.length)];
  const cols = ['#f5c518','#e53935','#9c27b0','#ff6f00','#00e5ff','#4caf50'];
  const c1 = cols[Math.floor(Math.random() * cols.length)];
  const c2 = cols[Math.floor(Math.random() * cols.length)];
  const uid = Date.now();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs>
      <radialGradient id="g${uid}" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#08080f"/>
      </radialGradient>
      <pattern id="p${uid}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="${c1}" opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="200" height="200" fill="#08080f"/>
    <rect width="200" height="200" fill="url(#g${uid})"/>
    <rect width="200" height="200" fill="url(#p${uid})"/>
    <polygon points="100,8 192,54 192,146 100,192 8,146 8,54" fill="none" stroke="${c1}" stroke-width="2" opacity="0.35"/>
    <polygon points="100,22 178,61 178,139 100,178 22,139 22,61" fill="none" stroke="${c2}" stroke-width="1" opacity="0.2"/>
    <text x="100" y="122" text-anchor="middle" font-size="80" dominant-baseline="middle">${ic}</text>
    <text x="100" y="174" text-anchor="middle" font-size="9" fill="${c1}" font-family="Impact,Arial Black,sans-serif" letter-spacing="3" opacity="0.85">${(name||'').toUpperCase().slice(0,16)}</text>
    <line x1="30" y1="165" x2="170" y2="165" stroke="${c1}" stroke-width="1" opacity="0.3"/>
  </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

// ── MAIN AI IMAGE FUNCTION ──
async function generateAIImage(prompt, name, icon) {
  if (FAL_KEY && FAL_KEY !== 'YOUR_FAL_API_KEY') {
    const result = await generateImageFal(prompt);
    if (result) return result;
  }
  // Fallback to SVG if no key or error
  return fallbackSVG(name, icon);
}

// ═══════════════════════════════════════
const App = {

  // ── INIT ──
  init() {
    this.seedCoach();
    this.buildMFilters();
    this.buildAchFilters();
    this.setupOfflineDetection();
    setTimeout(() => {
      const sp = $('splash');
      sp.style.cssText = 'opacity:0;transition:opacity .5s;position:fixed;inset:0;z-index:9999;pointer-events:none';
      setTimeout(() => {
        sp.style.display = 'none';
        const isFirst = !localStorage.getItem('cl_onboarded');
        if (isFirst) { this.showOnboarding(); }
        else { this.checkSess(); }
      }, 500);
    }, 2900);
  },

  seedCoach() {
    const users = getUsers();
    if (!users.find(u => u.username === 'coach')) {
      users.unshift({
        id: 'coach-master-001', name: 'Coach', username: 'coach', password: '033534950',
        weight: null, height: null, age: null, days: null, goal: null, level: 'elite',
        bmi: null, xp: 9999, sessions: 0, streak: 0, lastSession: null,
        achievements: [], workoutHistory: [], records: {}, coachMessages: [], totalVolume: 0,
        created: new Date().toISOString()
      });
      saveUsers(users);
    }
  },

  // ── ONBOARDING ──
  showOnboarding() {
    this.showScr('onboarding');
    S.onboardSlide = 0;
    this.renderOnboardDots();
    this.updateOnboardSlide();
  },

  renderOnboardDots() {
    const c = $('onboard-dots'); if (!c) return;
    c.innerHTML = Array(4).fill(0).map((_, i) =>
      `<div class="onboard-dot${i === S.onboardSlide ? ' active' : ''}"></div>`
    ).join('');
  },

  updateOnboardSlide() {
    document.querySelectorAll('.onboard-slide').forEach((s, i) =>
      s.classList.toggle('active', i === S.onboardSlide));
    this.renderOnboardDots();
    const btn = $('onboard-next');
    if (btn) btn.textContent = S.onboardSlide === 3 ? '🦁 COMENZAR' : 'SIGUIENTE →';
  },

  onboardNext() {
    if (S.onboardSlide < 3) {
      S.onboardSlide++;
      this.updateOnboardSlide();
    } else {
      this.skipOnboard();
    }
  },

  skipOnboard() {
    localStorage.setItem('cl_onboarded', '1');
    this.checkSess();
  },

  // ── SESSION ──
  checkSess() {
    const saved = localStorage.getItem('cl_user');
    if (saved) { S.user = JSON.parse(saved); this.enterApp(); }
    else { this.showScr('auth'); if (localStorage.getItem('cl_bio')) $('bio-btn')?.classList.remove('hidden'); }
  },

  showScr(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $(id)?.classList.remove('hidden');
  },

  enterApp() {
    this.showScr('app');
    S.isCoach = S.user.username === COACH_USERNAME;
    if (S.isCoach) $('coach-btn')?.classList.remove('hidden');
    this.updateUI();
    this.renderChallenges();
    this.buildChartSel();
    this.checkCoachMsg();
    this.checkNotif();
    if ('wakeLock' in navigator) this.reqWL();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  },

  // ── AUTH ──
  showReg() { $('form-login')?.classList.add('hidden'); $('form-reg')?.classList.remove('hidden'); },
  showLogin() { $('form-reg')?.classList.add('hidden'); $('form-login')?.classList.remove('hidden'); },

  register() {
    const n = v('r-name'), u = v('r-user'), p = v('r-pass');
    if (!n || !u || !p) return toast('Completa nombre, usuario y contraseña');
    const users = getUsers();
    if (users.find(x => x.username === u)) return toast('Ese usuario ya existe');
    const w = parseFloat(v('r-w')) || null, h = parseFloat(v('r-h')) || null;
    const user = {
      id: Date.now().toString(), name: n, username: u, password: p,
      weight: w, height: h, age: parseInt(v('r-age')) || null,
      days: v('r-days'), goal: v('r-goal'), level: v('r-level'),
      bmi: w && h ? (w / Math.pow(h / 100, 2)).toFixed(1) : null,
      xp: 0, sessions: 0, streak: 0, lastSession: null,
      achievements: [], workoutHistory: [], records: {},
      coachMessages: [], totalVolume: 0, created: new Date().toISOString()
    };
    users.push(user); saveUsers(users);
    S.user = user; localStorage.setItem('cl_user', JSON.stringify(user));
    this.enterApp();
    setTimeout(() => this.showAchPopup({ icon:'🦁', name:'¡BIENVENIDO!', desc:`Perfil @${u} creado. ¡La bestia despierta!`, xp:50 }), 800);
  },

  login() {
    const u = v('l-user'), p = v('l-pass');
    const user = getUsers().find(x => x.username === u && x.password === p);
    if (!user) return toast('Usuario o contraseña incorrectos');
    S.user = user; localStorage.setItem('cl_user', JSON.stringify(user)); this.enterApp();
  },

  async biometricLogin() {
    const bio = localStorage.getItem('cl_bio'); if (!bio) return;
    try { if (window.PublicKeyCredential) await navigator.credentials.get({ publicKey: { challenge: new Uint8Array(32), timeout: 60000, userVerification: 'required' } }); } catch(e) {}
    const user = getUsers().find(x => x.username === bio);
    if (user) { S.user = user; localStorage.setItem('cl_user', JSON.stringify(user)); this.enterApp(); }
  },

  async saveBiometric() {
    if (!S.user) return;
    try {
      if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        const enc = new TextEncoder();
        await navigator.credentials.create({ publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'Coach Lion', id: location.hostname || 'localhost' },
          user: { id: enc.encode(S.user.id), name: S.user.username, displayName: S.user.name },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'required', authenticatorAttachment: 'platform' },
          timeout: 60000
        }});
      }
    } catch(e) {}
    localStorage.setItem('cl_bio', S.user.username);
    toast('✅ Acceso biométrico guardado');
  },

  logout() {
    if (!confirm('¿Cerrar sesión?')) return;
    S.user = null; localStorage.removeItem('cl_user');
    this.stopSess(); this.showScr('auth'); this.showLogin();
  },

  saveUser() {
    if (!S.user) return;
    const users = getUsers(), i = users.findIndex(x => x.id === S.user.id);
    if (i !== -1) users[i] = S.user; else users.push(S.user);
    saveUsers(users); localStorage.setItem('cl_user', JSON.stringify(S.user));
  },

  // ── UI ──
  updateUI() {
    if (!S.user) return;
    const u = S.user, lv = Math.floor((u.xp || 0) / 1000) + 1, xpLv = (u.xp || 0) % 1000;
    $('t-name').textContent = u.username.toUpperCase();
    $('h-name').textContent = u.name.split(' ')[0].toUpperCase();
    $('h-quote').textContent = QUOTES[new Date().getDay() % QUOTES.length];
    $('s-sess').textContent = u.sessions || 0;
    $('s-ach').textContent = (u.achievements || []).length;
    $('s-xp').textContent = u.xp || 0;
    $('s-str').textContent = u.streak || 0;
    $('xp-fill').style.width = (xpLv / 10) + '%';
    $('p-name').textContent = u.name.toUpperCase();
    $('p-lv-txt').textContent = 'NIVEL ' + lv;
    $('lv-fill').style.width = (xpLv / 10) + '%';
    $('p-badge').textContent = TITLES[Math.min(lv - 1, TITLES.length - 1)];
    $('p-stats').innerHTML = [
      { i:'⚖️', v:u.weight||'--', l:'PESO KG' },
      { i:'📏', v:u.height||'--', l:'ALTURA CM' },
      { i:'🎂', v:u.age||'--', l:'EDAD' },
      { i:'📊', v:u.bmi||'--', l:'IMC' },
      { i:'🎯', v:GL[u.goal]||'--', l:'OBJETIVO' },
      { i:'📅', v:(u.days||'--')+'d', l:'DÍAS/SEM' },
    ].map(s => `<div class="ps"><div class="ps-i">${s.i}</div><div class="ps-v">${s.v}</div><div class="ps-l">${s.l}</div></div>`).join('');
    $('p-settings').innerHTML = [
      { i:'⚖️', l:'Actualizar peso', f:'App.updateWeight()' },
      { i:'🔱', l:'Acceso biométrico', f:'App.saveBiometric()' },
      { i:'📸', l:'Fotos de progreso', f:"App.goTo('progress')" },
      { i:'📤', l:'Exportar datos', f:'App.exportData()' },
      { i:'🚪', l:'Cerrar sesión', f:'App.logout()', d:true },
    ].map(s => `<div class="setting${s.d?' danger':''}" onclick="${s.f}"><span>${s.i} ${s.l}</span><span class="s-arr">›</span></div>`).join('');
    this.renderTodayR();
    this.renderActCal();
    this.renderRecentAchs();
    this.renderRecords();
    this.renderLeaderboardMini();
  },

  // ── NAVIGATION ──
  goTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
    $('page-' + page)?.classList.add('active');
    document.querySelector('.nb[data-p="' + page + '"]')?.classList.add('active');
    if (page === 'achievements') this.renderAchs();
    if (page === 'routines') this.renderRoutines();
    if (page === 'progress') { this.renderCharts(); this.renderPhotos(); }
    if (page === 'coach' && S.isCoach) this.renderCoach();
    if (page === 'profile') this.updateUI();
    if (page === 'leaderboard') this.renderLeaderboard();
  },

  // ── COACH TABS ──
  coachTab(tab, btn) {
    document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.ctab-body').forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    $('ct-' + tab)?.classList.remove('hidden');
  },

  // ── OFFLINE DETECTION ──
  setupOfflineDetection() {
    const update = () => {
      const offline = !navigator.onLine;
      $('offline-banner')?.classList.toggle('hidden', !offline);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  },

  // ── WORKOUT ──
  startWorkout() {
    this.goTo('workout');
    if (!S.sessActive) {
      S.sessActive = true; S.sessStart = Date.now();
      S.sessTimer = setInterval(() => this.tickSess(), 1000);
      S.workLog = []; this.renderLog(); this.reqWL();
    }
  },

  tickSess() { /* Internal timer - no UI display */ },

  stopSess() {
    clearInterval(S.sessTimer); clearInterval(S.restTimer); clearInterval(S.circuitRestTimer);
    S.sessActive = false; S.sessStart = null; S.restRunning = false;
    $('circuit-popup')?.classList.add('hidden');
  },

  finishWorkout() {
    const realExs = S.workLog.filter(i => i.type !== 'circuit_break');
    if (realExs.length === 0 && !confirm('No registraste ejercicios. ¿Terminar?')) return;
    const dur = S.sessStart ? Math.floor((Date.now() - S.sessStart) / 1000) : 0;
    this.stopSess();
    const u = S.user;
    u.sessions = (u.sessions || 0) + 1;
    let vol = 0, sets = 0;
    realExs.forEach(ex => {
      (ex.sets || []).forEach(s => {
        vol += (s.weight || 0) * (s.reps || 0); sets++;
        if (ex.track && s.weight) {
          if (!u.records) u.records = {};
          if (!u.records[ex.track] || s.weight > u.records[ex.track]) u.records[ex.track] = s.weight;
        }
      });
    });
    u.totalVolume = (u.totalVolume || 0) + vol;
    if (!u.workoutHistory) u.workoutHistory = [];
    u.workoutHistory.push({ date: new Date().toISOString(), exercises: realExs.map(e => ({ name: e.name, sets: e.sets || [] })), volume: vol, duration: dur });
    const today = new Date().toDateString(), yest = new Date(Date.now() - 86400000).toDateString();
    if (u.lastSession === yest || u.lastSession === today) u.streak = (u.streak || 0) + 1;
    else if (u.lastSession !== today) u.streak = 1;
    u.lastSession = today;
    const xpGain = 150 + (realExs.length * 25) + (sets * 5);
    this.addXP(xpGain);
    const hr = new Date().getHours();
    if (hr < 6) this.tryUnlock('early_bird', {});
    if (hr >= 22) this.tryUnlock('night_owl', {});
    ['first_session','ten_sessions','fifty_sessions','hundred_sessions'].forEach(id => this.tryUnlock(id, { sessions: u.sessions }));
    ['streak_7','streak_30'].forEach(id => this.tryUnlock(id, { streak: u.streak }));
    const r = u.records || {};
    if (r.bench_press) { this.tryUnlock('bench_100', { bench_press: r.bench_press }); this.tryUnlock('bench_140', { bench_press: r.bench_press }); }
    if (r.squat) this.tryUnlock('squat_100', { squat: r.squat });
    if (r.deadlift) { this.tryUnlock('deadlift_100', { deadlift: r.deadlift }); this.tryUnlock('deadlift_200', { deadlift: r.deadlift }); }
    if (r.bicep_curl) this.tryUnlock('curl_40', { bicep_curl: r.bicep_curl });
    if (r.pullups) this.tryUnlock('pullups_15', { pullups: r.pullups });
    if (vol >= 10000) this.tryUnlock('volume_10k', { session_volume: vol });
    this.saveUser();
    S.workLog = []; this.renderLog();
    this.updateUI(); this.goTo('home');
    setTimeout(() => toast(`💪 ¡Sesión completa! +${xpGain} XP · ${Math.round(vol).toLocaleString()} kg vol.`), 300);
  },

  // ── REST TIMER ──
  setRest(sec, btn) {
    S.restDur = sec; S.restSec = sec; S.restRunning = false;
    clearInterval(S.restTimer);
    $('rest-n').textContent = sec;
    this.updateRing(sec, sec);
    document.querySelectorAll('.pre').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    $('rest-start-btn').textContent = '▶ INICIAR';
    $('ring-fg')?.classList.remove('urgent');
  },

  toggleRest() {
    if (S.restRunning) {
      clearInterval(S.restTimer); S.restRunning = false;
      $('rest-start-btn').textContent = '▶ CONTINUAR'; return;
    }
    S.restRunning = true; $('rest-start-btn').textContent = '⏸ PAUSAR';
    const fg = $('ring-fg'); fg?.classList.remove('urgent');
    S.restTimer = setInterval(() => {
      S.restSec--;
      $('rest-n').textContent = S.restSec;
      this.updateRing(S.restSec, S.restDur);
      if (S.restSec <= 10) fg?.classList.add('urgent');
      if (S.restSec <= 0) {
        clearInterval(S.restTimer); S.restRunning = false;
        $('rest-start-btn').textContent = '▶ INICIAR'; fg?.classList.remove('urgent');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        if (Notification.permission === 'granted') new Notification('COACH LION 🦁', { body:'¡Descanso terminado! 💪', icon:'/icon-192.png' });
        playRoar();
        toast('⚡ ¡Descanso terminado! ¡VAMOS!');
        setTimeout(() => { $('rest-n').textContent = S.restDur; this.updateRing(S.restDur, S.restDur); }, 2000);
      }
    }, 1000);
  },

  resetRest() {
    clearInterval(S.restTimer); S.restRunning = false; S.restSec = S.restDur;
    $('rest-n').textContent = S.restDur;
    $('rest-start-btn').textContent = '▶ INICIAR';
    $('ring-fg')?.classList.remove('urgent');
    this.updateRing(S.restDur, S.restDur);
  },

  updateRing(rem, total) {
    const c = 2 * Math.PI * 44;
    if ($('ring-fg')) $('ring-fg').style.strokeDashoffset = c * (1 - Math.max(0, rem) / total);
  },

  // ── CIRCUIT REST ──
  startCircuitRest(circuitNum, restSec) {
    $('circuit-popup')?.classList.remove('hidden');
    $('cp-title').textContent = `CIRCUITO ${circuitNum} COMPLETO`;
    $('cp-sub').textContent = `Descansando ${restSec} segundos entre circuitos`;
    let remaining = restSec;
    $('cp-timer').textContent = remaining;
    this.setRest(restSec, document.querySelector('.pre.active'));
    clearInterval(S.circuitRestTimer);
    S.circuitRestTimer = setInterval(() => {
      remaining--;
      $('cp-timer').textContent = remaining;
      if (remaining <= 0) {
        clearInterval(S.circuitRestTimer);
        $('circuit-popup')?.classList.add('hidden');
        if (navigator.vibrate) navigator.vibrate([200, 100, 400]);
        toast('🔄 ¡Comienza el siguiente circuito!');
      }
    }, 1000);
  },

  skipCircuitRest() {
    clearInterval(S.circuitRestTimer);
    $('circuit-popup')?.classList.add('hidden');
    toast('⏭ Descanso omitido');
  },

  // ── EXERCISE SEARCH ──
  openSearch() { $('ex-search')?.classList.remove('hidden'); this.renderExRes(EX_DB, 'ex-res'); setTimeout(() => $('ex-q')?.focus(), 100); },
  closeSearch() { $('ex-search')?.classList.add('hidden'); },
  searchEx(q) {
    const filt = document.querySelector('.mf.active')?.dataset.m || 'all';
    let r = EX_DB;
    if (filt !== 'all') r = r.filter(e => e.muscle === filt);
    if (q) r = r.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
    this.renderExRes(r, 'ex-res');
  },
  buildMFilters() {
    const c = $('mfilters'); if (!c) return;
    c.innerHTML = MUSCLES.map(m => `<button class="mf${m==='all'?' active':''}" data-m="${m}" onclick="App.fMuscle('${m}')">${ML[m]}</button>`).join('');
  },
  fMuscle(m) {
    document.querySelectorAll('.mf').forEach(b => b.classList.remove('active'));
    document.querySelector(`.mf[data-m="${m}"]`)?.classList.add('active');
    this.searchEx($('ex-q')?.value || '');
  },
  renderExRes(list, cid) {
    const c = $(cid); if (!c) return;
    c.innerHTML = list.length === 0
      ? '<p style="color:var(--wdim);padding:12px;text-align:center;font-size:12px">Sin resultados</p>'
      : list.map(ex => `<div class="ex-item" onclick="App.openExModal('${ex.id}')"><div class="ex-item-i">${ex.emoji}</div><div><div class="ex-item-nm">${ex.name}</div><div class="ex-item-tags">${ML[ex.muscle]} · ${EQL[ex.equip]||ex.equip} · ${DFL[ex.diff]}</div></div></div>`).join('');
  },

  openExModal(id) {
    const pickerOpen = !$('modal-expicker')?.classList.contains('hidden');
    const ex = EX_DB.find(e => e.id === id); if (!ex) return;
    if (pickerOpen) {
      S.pickerSelEx = ex;
      $('picker-sel-name').textContent = `${ex.emoji} ${ex.name}`;
      $('picker-selected')?.classList.remove('hidden');
      $('picker-results').innerHTML = '';
      $('picker-q').value = ex.name;
    } else {
      S.curEx = ex; S.modalSets = [];
      $('ex-m-name').textContent = ex.name.toUpperCase();
      $('ex-tags').innerHTML = `<span class="ex-tag">${ML[ex.muscle]}</span><span class="ex-tag">${EQL[ex.equip]||ex.equip}</span><span class="ex-tag">${DFL[ex.diff]}</span>`;
      $('ex-inst').textContent = ex.inst;
      $('ex-media').innerHTML = `<span id="ex-media-ph">${ex.emoji}</span>`;
      $('sets-done').innerHTML = ''; $('sw').value = ''; $('sr').value = '';
      this.fetchGif(ex);
      this.openModal('modal-ex');
    }
  },

  async fetchGif(ex) {
    const mm = { chest:'chest', back:'back', shoulders:'shoulders', biceps:'upper%20arms', triceps:'upper%20arms', legs:'upper%20legs', core:'waist' };
    try {
      const res = await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${mm[ex.muscle]||ex.muscle}?limit=80`, { headers: { 'X-RapidAPI-Key':'DEMO_KEY', 'X-RapidAPI-Host':'exercisedb.p.rapidapi.com' } });
      if (res.ok) { const data = await res.json(); const q = ex.name.toLowerCase().split(' ')[0]; const m = data.find(d => d.name.toLowerCase().includes(q)); if (m?.gifUrl) $('ex-media').innerHTML = `<img src="${m.gifUrl}" alt="${ex.name}" onerror="this.parentElement.innerHTML='<span style=font-size:52px;opacity:.3>${ex.emoji}</span>'">`; }
    } catch(e) {}
  },

  logSet() {
    const w = parseFloat($('sw').value) || 0, r = parseInt($('sr').value);
    if (!r) return toast('Ingresa las repeticiones');
    S.modalSets.push({ weight: w, reps: r }); this.renderModalSets(); $('sr').value = '';
  },
  renderModalSets() {
    $('sets-done').innerHTML = S.modalSets.map((s, i) => `<div class="sdr"><span class="sdr-n">SET ${i+1}</span><span class="sdr-d">${s.weight?s.weight+' kg':'PC'} × ${s.reps} reps</span></div>`).join('');
  },
  confirmEx() {
    if (!S.curEx) return; if (S.modalSets.length === 0) return toast('Agrega al menos una serie');
    const i = S.workLog.findIndex(e => e.id === S.curEx.id);
    if (i !== -1) S.workLog[i].sets.push(...S.modalSets); else S.workLog.push({ ...S.curEx, sets: [...S.modalSets] });
    this.closeModal('modal-ex'); this.closeSearch(); this.renderLog();
    toast(`✅ ${S.curEx.name} · ${S.modalSets.length} series`); S.modalSets = [];
  },

  renderLog() {
    const c = $('ex-log'); if (!c) return;
    if (S.workLog.length === 0) { c.innerHTML = '<div class="empty-log">Agrega ejercicios para registrar tu sesión 💪</div>'; return; }
    let circNum = 0;
    c.innerHTML = S.workLog.map((ex, xi) => {
      if (ex.type === 'circuit_break') { circNum++; return `<div class="circuit-divider">🔄 CIRCUITO ${circNum} · ${ex.restSec}s desc. entre circuitos</div>`; }
      const sets = (ex.sets || []).map((s, i) => `<div class="log-set"><span class="sn">${i+1}</span><span class="sw">${s.weight?s.weight+' kg':'PC'}</span><span class="srp">${s.reps} reps</span><span class="sv">${s.weight?Math.round(s.weight*s.reps)+' kg':''}</span></div>`).join('');
      const detail = [ex.plannedSets&&`${ex.plannedSets}×${ex.plannedReps}`, ex.weight&&`${ex.weight}kg`, ex.restSec&&`${ex.restSec}s desc.`].filter(Boolean).join(' · ');
      const thumb = ex.imageData ? `<img src="${ex.imageData}" alt="">` : ex.emoji;
      return `<div class="ex-log-item"><div class="log-head"><div class="log-ico">${thumb}</div><div style="flex:1;min-width:0"><div class="log-nm">${ex.name}</div><div class="log-mu">${ML[ex.muscle]||ex.muscle}</div>${detail?`<div class="log-detail">${detail}</div>`:''}</div></div>${sets}<div class="inline-add"><input type="number" placeholder="kg" id="iw${xi}" step="0.5"><input type="number" placeholder="reps" id="ir${xi}"><button class="btn-sm" onclick="App.inlineSet(${xi})">+ SET</button></div></div>`;
    }).join('');
    $('circuit-banner')?.classList.toggle('hidden', !S.workLog.some(i => i.type === 'circuit_break'));
  },
  inlineSet(xi) {
    const w = parseFloat($(`iw${xi}`)?.value) || 0, r = parseInt($(`ir${xi}`)?.value);
    if (!r) return;
    if (!S.workLog[xi].sets) S.workLog[xi].sets = [];
    S.workLog[xi].sets.push({ weight: w, reps: r }); this.renderLog();
  },

  // ── ROUTINE BUILDER ──
  renderTodayR() {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    const r = getRoutines().find(x => x.day === today || x.day === 'any');
    const c = $('today-r'); if (!c) return;
    if (!r) { c.innerHTML = `<div class="no-r"><div>📋</div><p>Sin rutina para hoy</p><button class="btn-ghost" onclick="App.goTo('routines')" style="margin-top:8px;max-width:180px">Ver rutinas</button></div>`; return; }
    const exCount = (r.exercises||[]).filter(e => e.type !== 'circuit_break').length;
    c.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap"><div><div style="font-family:var(--fd);font-size:18px;letter-spacing:2px">${r.name}</div><div style="font-size:11px;color:var(--wdim)">${exCount} ejercicios · ${DAL[r.day]}</div></div><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button></div><div style="display:flex;flex-wrap:wrap;gap:4px">${(r.exercises||[]).filter(e=>e.type!=='circuit_break').slice(0,5).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}</div>`;
  },

  renderRoutines() {
    const rts = getRoutines(); const c = $('routines-list'); if (!c) return;
    if (rts.length === 0) { c.innerHTML = `<div class="empty-log" style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:10px">📋</div><p>No tienes rutinas aún</p><button class="btn-ghost" onclick="App.openCreateRoutine()" style="margin-top:10px;max-width:200px">+ Crear primera rutina</button></div>`; return; }
    const tl = { strength:'🏋️ Fuerza', hypertrophy:'💪 Hipertrofia', cardio:'🏃 Cardio', fullbody:'🔥 Full Body', ppl:'⚡ PPL', hiit:'💥 HIIT' };
    c.innerHTML = rts.map(r => { const exs = (r.exercises||[]).filter(e=>e.type!=='circuit_break'); return `<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day]||r.day}</div></div><div class="rc-type">${tl[r.type]||r.type}</div><div class="rc-pills">${exs.slice(0,4).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}${exs.length>4?`<span class="pill">+${exs.length-4}</span>`:''}</div><div class="rc-actions"><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️</button></div></div>`; }).join('');
  },

  openCreateRoutine() {
    S.rnExs = []; S.pickerSelEx = null; S.pickerGenImg = null;
    $('rn-name').value = ''; $('rn-exlist').innerHTML = '';
    this.openModal('modal-routine');
  },

  addCircuitBreak() {
    const restSec = parseInt($('rn-circuit-rest')?.value) || 90;
    S.rnExs.push({ type:'circuit_break', restSec });
    this.renderRnExList(); toast(`🔄 Separador de circuito (${restSec}s desc.)`);
  },

  openExPicker() {
    S.pickerSelEx = null; S.pickerGenImg = null;
    $('picker-q').value = ''; $('picker-selected')?.classList.add('hidden');
    $('pex-weight').value = ''; $('pex-sets').value = '3'; $('pex-reps').value = '10'; $('pex-rest').value = '60';
    $('pex-img-desc').value = ''; $('pex-img-preview')?.classList.add('hidden');
    this.renderExRes(EX_DB.slice(0, 15), 'picker-results');
    this.openModal('modal-expicker');
  },

  pickerSearch(q) {
    let r = q ? EX_DB.filter(e => e.name.toLowerCase().includes(q.toLowerCase()) || ML[e.muscle]?.toLowerCase().includes(q.toLowerCase())) : EX_DB.slice(0, 15);
    this.renderExRes(r.slice(0, 12), 'picker-results');
  },

  clearPickerSel() {
    S.pickerSelEx = null; $('picker-selected')?.classList.add('hidden');
    $('picker-q').value = ''; this.renderExRes(EX_DB.slice(0, 15), 'picker-results');
  },

  async genExerciseImage() {
    const desc = $('pex-img-desc')?.value?.trim();
    if (!desc) return toast('Describe la imagen primero');
    const btn = $('pex-gen-btn'); btn.textContent = '⏳ Generando...'; btn.disabled = true;
    const prev = $('pex-img-preview');
    prev?.classList.remove('hidden');
    prev.innerHTML = '<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON FAL.AI...</span></div>';
    const url = await generateAIImage(desc, S.pickerSelEx?.name, S.pickerSelEx?.emoji);
    S.pickerGenImg = url;
    prev.innerHTML = `<img src="${url}" alt="Imagen ejercicio"><button class="btn-sm" onclick="App.genExerciseImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent = '🎨 REGENERAR'; btn.disabled = false;
  },

  async confirmPickerEx() {
    const exBase = S.pickerSelEx; if (!exBase) return toast('Selecciona un ejercicio de la lista');
    const newEx = {
      ...exBase,
      plannedSets: parseInt($('pex-sets')?.value) || 3,
      plannedReps: parseInt($('pex-reps')?.value) || 10,
      restSec: parseInt($('pex-rest')?.value) || 60,
      weight: parseFloat($('pex-weight')?.value) || null,
      imageData: S.pickerGenImg || null,
      sets: []
    };
    S.rnExs.push(newEx); this.renderRnExList();
    this.closeModal('modal-expicker');
    toast(`✅ ${exBase.name} agregado`);
    S.pickerSelEx = null; S.pickerGenImg = null;
  },

  renderRnExList() {
    const c = $('rn-exlist'); if (!c) return;
    let cn = 0;
    c.innerHTML = S.rnExs.map((ex, i) => {
      if (ex.type === 'circuit_break') { cn++; return `<div class="rn-circuit-break"><span class="rn-cb-label">🔄 CIRCUITO ${cn} · ${ex.restSec}s desc.</span><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div>`; }
      const thumb = ex.imageData ? `<img src="${ex.imageData}" alt="">` : ex.emoji;
      const detail = [ex.plannedSets&&`${ex.plannedSets}×${ex.plannedReps}`, ex.weight&&`${ex.weight}kg`, ex.restSec&&`${ex.restSec}s desc.`].filter(Boolean).join(' · ');
      return `<div class="rn-ex"><div class="rn-ex-head"><div class="rn-ex-ico">${thumb}</div><div style="flex:1;min-width:0"><div class="rn-ex-nm">${ex.name}</div>${detail?`<div class="rn-ex-detail">${detail}</div>`:''}</div><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div></div>`;
    }).join('');
  },
  rmRnEx(i) { S.rnExs.splice(i, 1); this.renderRnExList(); },

  saveRoutine() {
    const name = v('rn-name'); if (!name) return toast('Dale un nombre a la rutina');
    if (S.rnExs.filter(e=>e.type!=='circuit_break').length === 0) return toast('Agrega al menos un ejercicio');
    const rts = getRoutines();
    rts.push({ id: Date.now().toString(), name, type: $('rn-type')?.value, day: $('rn-day')?.value, exercises: S.rnExs, circuitRest: parseInt($('rn-circuit-rest')?.value)||90, created: new Date().toISOString() });
    saveRoutines(rts); this.closeModal('modal-routine'); this.renderRoutines();
    toast(`✅ Rutina "${name}" guardada`); this.addXP(50);
  },

  delRoutine(id) { if (!confirm('¿Eliminar esta rutina?')) return; saveRoutines(getRoutines().filter(r=>r.id!==id)); this.renderRoutines(); },

  startRoutine(id) {
    const r = getRoutines().find(x => x.id === id); if (!r) return;
    S.workLog = (r.exercises||[]).map(ex => ex.type === 'circuit_break' ? {...ex} : {...ex, sets:[]});
    this.startWorkout();
    setTimeout(() => {
      this.renderLog();
      const firstEx = S.workLog.find(e => e.type !== 'circuit_break');
      if (firstEx?.restSec) this.setRest(firstEx.restSec, document.querySelector('.pre.active'));
      toast(`🏋️ "${r.name}" cargada`);
    }, 300);
  },

  // ── CHALLENGES ──
  renderChallenges() {
    const chs = getChallenges(); const c = $('challenges'); if (!c) return;
    if (chs.length === 0) { c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--wdim);font-size:13px">El coach no ha creado retos todavía</div>'; return; }
    c.innerHTML = chs.map(ch => {
      const pct = Math.min(((ch.progress||0)/(ch.target||1))*100, 100);
      const img = ch.imageData ? `<div class="ch-img"><img src="${ch.imageData}" alt="${ch.name}"></div>` : `<div class="ch-img"><span>${ch.icon||'🎯'}</span></div>`;
      return `<div class="ch-card">${img}<div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.desc}</div><div class="ch-prog"><div class="ch-bar" style="width:${pct}%"></div></div><div class="ch-info-row"><span class="ch-nums">${Math.round(ch.progress||0).toLocaleString()} / ${(ch.target||0).toLocaleString()}</span><span class="ch-reward">${ch.reward}</span></div></div></div>`;
    }).join('');
  },

  openCreateChallenge(editId) {
    S.editingChId = editId || null;
    const existing = editId ? getChallenges().find(c=>c.id===editId) : null;
    $('ch-modal-title').textContent = editId ? 'EDITAR RETO' : 'CREAR RETO';
    $('ch-name').value = existing?.name || '';
    $('ch-desc').value = existing?.desc || '';
    $('ch-reward').value = existing?.reward || '';
    $('ch-target').value = existing?.target || '';
    $('ch-img-desc').value = '';
    $('ch-img-preview')?.classList.add('hidden');
    S.chGenImg = existing?.imageData || null;
    if (S.chGenImg) { $('ch-img-preview')?.classList.remove('hidden'); $('ch-img-preview').innerHTML = `<img src="${S.chGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)">`; }
    this.openModal('modal-challenge');
  },

  async genChallengeImage() {
    const desc = $('ch-img-desc')?.value?.trim() || `Imagen épica para el reto "${$('ch-name')?.value||'fitness'}"`;
    const btn = $('ch-gen-btn'); btn.textContent = '⏳ Generando...'; btn.disabled = true;
    const prev = $('ch-img-preview');
    prev?.classList.remove('hidden');
    prev.innerHTML = '<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON FAL.AI...</span></div>';
    const url = await generateAIImage(desc, $('ch-name')?.value, null);
    S.chGenImg = url;
    prev.innerHTML = `<img src="${url}" alt="Reto" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)"><button class="btn-sm" onclick="App.genChallengeImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent = '🎨 REGENERAR'; btn.disabled = false;
  },

  saveChallenge() {
    const name = v('ch-name'); if (!name) return toast('Dale un nombre al reto');
    const chs = getChallenges();
    const ch = { id: S.editingChId || Date.now().toString(), icon:'🎯', name, desc:v('ch-desc'), reward:v('ch-reward')||'XP', type:$('ch-type')?.value||'custom', target:parseInt($('ch-target')?.value)||10, progress:0, imageData:S.chGenImg||null, created:new Date().toISOString() };
    if (S.editingChId) { const i = chs.findIndex(c=>c.id===S.editingChId); if (i!==-1) { ch.progress=chs[i].progress; chs[i]=ch; } else chs.push(ch); }
    else chs.push(ch);
    saveChallenges(chs); this.closeModal('modal-challenge'); this.renderChallenges();
    if (S.isCoach) this.renderCoachChallenges();
    toast(`✅ Reto "${name}" ${S.editingChId?'actualizado':'creado'}`); S.chGenImg = null; S.editingChId = null;
  },

  renderCoachChallenges() {
    const chs = getChallenges(); const c = $('coach-challenges-list'); if (!c) return;
    if (chs.length === 0) { c.innerHTML = '<div class="empty-log">No has creado retos aún</div>'; return; }
    c.innerHTML = chs.map(ch => {
      const img = ch.imageData ? `<img src="${ch.imageData}" alt="" style="width:100%;height:100%;object-fit:cover">` : (ch.icon||'🎯');
      return `<div class="ch-card"><div class="ch-img">${img}</div><div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.desc}</div><div class="ch-reward">${ch.reward}</div></div><div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0"><button class="btn-sm" onclick="App.openCreateChallenge('${ch.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delChallenge('${ch.id}')">🗑️</button></div></div>`;
    }).join('');
  },

  delChallenge(id) { if (!confirm('¿Eliminar este reto?')) return; saveChallenges(getChallenges().filter(c=>c.id!==id)); this.renderCoachChallenges(); this.renderChallenges(); },

  // ── ACHIEVEMENTS (Coach editable) ──
  buildAchFilters() {
    const c = $('ach-filters'); if (!c) return;
    c.innerHTML = ACH_CATS.map(cat => `<button class="ach-f${cat==='all'?' active':''}" onclick="App.filterAch('${cat}')">${ACH_CAT_L[cat]}</button>`).join('');
  },

  filterAch(cat) {
    S.achFilter = cat;
    document.querySelectorAll('.ach-f').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    this.renderAchs();
  },

  renderAchs() {
    const ul = S.user?.achievements || [];
    const allAchs = getAchs();
    const list = S.achFilter === 'all' ? allAchs : allAchs.filter(a => a.cat === S.achFilter);
    $('ach-grid').innerHTML = list.map(a => {
      const u = ul.includes(a.id);
      const imgEl = u && a.imageData ? `<img class="ag-img" src="${a.imageData}" alt="${a.name}">` : `<div class="ag-ico">${u ? a.icon : '🔒'}</div>`;
      return `<div class="ag ${u?'on':'off'}">${u?'<span class="ag-badge">✅</span>':''}${imgEl}<div class="ag-nm">${a.name}</div><div class="ag-desc">${a.desc}</div><div class="ag-xp" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP</div></div>`;
    }).join('');
  },

  renderRecentAchs() {
    const ul = S.user?.achievements || []; const c = $('recent-ach'); if (!c) return;
    if (ul.length === 0) { c.innerHTML = '<div class="ach-mini"><div class="ach-mini-i">🔒</div><div class="ach-mini-n">???</div></div>'.repeat(3); return; }
    const allAchs = getAchs();
    c.innerHTML = ul.slice(-5).reverse().map(id => { const a = allAchs.find(x=>x.id===id); return a?`<div class="ach-mini on">${a.imageData?`<img src="${a.imageData}" style="width:32px;height:32px;border-radius:7px;object-fit:cover">`:`<div class="ach-mini-i">${a.icon}</div>`}<div class="ach-mini-n">${a.name}</div></div>`:''; }).join('');
  },

  // ── COACH ACHIEVEMENT MANAGER ──
  openCreateAchievement(editId) {
    S.editingAchId = editId || null; S.achGenImg = null;
    const existing = editId ? getAchs().find(a=>a.id===editId) : null;
    $('ach-modal-title').textContent = editId ? 'EDITAR LOGRO' : 'CREAR LOGRO';
    $('ach-name').value = existing?.name || '';
    $('ach-desc').value = existing?.desc || '';
    $('ach-xp').value = existing?.xp || '';
    $('ach-rarity').value = existing?.rarity || 'common';
    $('ach-cat').value = existing?.cat || 'special';
    $('ach-icon').value = existing?.icon || '';
    $('ach-img-desc').value = '';
    $('ach-edit-id').value = editId || '';
    const prev = $('ach-img-preview');
    prev?.classList.add('hidden');
    S.achGenImg = existing?.imageData || null;
    if (S.achGenImg) { prev?.classList.remove('hidden'); prev.innerHTML = `<img src="${S.achGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)">`; }
    this.openModal('modal-achievement');
  },

  async genAchievementImage() {
    const desc = $('ach-img-desc')?.value?.trim() || `Imagen para el logro "${$('ach-name')?.value||'fitness'}" estilo comic Marvel anime`;
    const btn = $('ach-gen-btn'); btn.textContent = '⏳ Generando...'; btn.disabled = true;
    const prev = $('ach-img-preview');
    prev?.classList.remove('hidden');
    prev.innerHTML = '<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON FAL.AI...</span></div>';
    const url = await generateAIImage(desc, $('ach-name')?.value, $('ach-icon')?.value);
    S.achGenImg = url;
    prev.innerHTML = `<img src="${url}" alt="Logro" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)"><button class="btn-sm" onclick="App.genAchievementImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent = '🎨 REGENERAR'; btn.disabled = false;
  },

  saveAchievement() {
    const name = v('ach-name'); if (!name) return toast('Dale un nombre al logro');
    const achs = getAchs();
    const editId = v('ach-edit-id');
    const ach = {
      id: editId || ('custom_' + Date.now()),
      name, desc: v('ach-desc'), xp: parseInt($('ach-xp')?.value)||100,
      rarity: $('ach-rarity')?.value||'common', cat: $('ach-cat')?.value||'special',
      icon: v('ach-icon')||'🏆', imageData: S.achGenImg || null
    };
    if (editId) { const i = achs.findIndex(a=>a.id===editId); if (i!==-1) achs[i]=ach; else achs.push(ach); }
    else achs.push(ach);
    saveAchs(achs);
    this.closeModal('modal-achievement');
    this.renderCoachAchievements();
    this.renderAchs();
    toast(`✅ Logro "${name}" ${editId?'actualizado':'creado'}`);
    S.achGenImg = null; S.editingAchId = null;
  },

  renderCoachAchievements() {
    const achs = getAchs(); const c = $('coach-achievements-list'); if (!c) return;
    c.innerHTML = achs.map(a => {
      const img = a.imageData ? `<img src="${a.imageData}" alt="" style="width:100%;height:100%;object-fit:cover">` : a.icon;
      return `<div class="coach-ach-item"><div class="cai-img">${img}</div><div class="cai-info"><div class="cai-name">${a.name}</div><div class="cai-meta" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP · ${ACH_CAT_L[a.cat]||a.cat}</div></div><div class="cai-actions"><button class="btn-sm" onclick="App.openCreateAchievement('${a.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delAchievement('${a.id}')">🗑️</button></div></div>`;
    }).join('');
  },

  delAchievement(id) {
    const def = DEFAULT_ACHS.find(a=>a.id===id);
    if (def && !confirm(`"${def.name}" es un logro predeterminado. ¿Eliminarlo de todos modos?`)) return;
    if (!def && !confirm('¿Eliminar este logro?')) return;
    saveAchs(getAchs().filter(a=>a.id!==id));
    this.renderCoachAchievements(); this.renderAchs();
    toast('🗑️ Logro eliminado');
  },

  tryUnlock(id, vals) {
    if (!S.user) return;
    if (!S.user.achievements) S.user.achievements = [];
    if (S.user.achievements.includes(id)) return;
    const allAchs = getAchs();
    const a = allAchs.find(x => x.id === id); if (!a) return;
    const checks = {
      first_session:()=>vals.sessions>=1, ten_sessions:()=>vals.sessions>=10,
      fifty_sessions:()=>vals.sessions>=50, hundred_sessions:()=>vals.sessions>=100,
      streak_7:()=>vals.streak>=7, streak_30:()=>vals.streak>=30,
      bench_100:()=>vals.bench_press>=100, bench_140:()=>vals.bench_press>=140,
      squat_100:()=>vals.squat>=100, deadlift_100:()=>vals.deadlift>=100,
      deadlift_200:()=>vals.deadlift>=200, curl_40:()=>vals.bicep_curl>=40,
      pullups_15:()=>vals.pullups>=15, cardio_30:()=>vals.cardio_minutes>=30,
      volume_10k:()=>vals.session_volume>=10000,
      early_bird:()=>true, night_owl:()=>true,
      level_5:()=>vals.level>=5, level_10:()=>vals.level>=10,
    };
    const check = checks[id];
    if (check && check()) {
      S.user.achievements.push(id);
      setTimeout(() => { this.showAchPopup(a); playRoar(); }, 800);
    }
  },

  showAchPopup(a) {
    $('pop-ico').textContent = a.icon;
    $('pop-name').textContent = a.name;
    $('pop-desc').textContent = a.desc;
    $('pop-xp').textContent = `+${a.xp} XP`;
    const chImg = $('pop-ch-img');
    chImg?.classList.add('hidden');
    if (a.imageData) { chImg.innerHTML = `<img src="${a.imageData}" alt="${a.name}">`; chImg?.classList.remove('hidden'); }
    $('ach-popup')?.classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);
  },

  closeAchPopup() { $('ach-popup')?.classList.add('hidden'); this.updateUI(); },

  // ── XP ──
  addXP(amt) {
    if (!S.user) return;
    const prev = Math.floor((S.user.xp||0)/1000)+1;
    S.user.xp = (S.user.xp||0)+amt;
    const nw = Math.floor(S.user.xp/1000)+1;
    if (nw > prev) {
      this.tryUnlock('level_5', { level:nw }); this.tryUnlock('level_10', { level:nw });
      setTimeout(() => { this.showAchPopup({ icon:'⬆️', name:`¡NIVEL ${nw}!`, desc:TITLES[Math.min(nw-1,TITLES.length-1)], xp:0, imageData:null }); playRoar(); }, 1200);
    }
    this.saveUser();
  },

  // ── LEADERBOARD ──
  renderLeaderboardMini() {
    const c = $('leaderboard-mini'); if (!c) return;
    const users = getUsers().filter(u => u.username !== COACH_USERNAME && u.sessions > 0);
    const sorted = [...users].sort((a,b) => (b.totalVolume||0)-(a.totalVolume||0)).slice(0,3);
    if (sorted.length === 0) { c.innerHTML = '<p style="color:var(--wdim);font-size:12px;text-align:center;padding:12px">Completa sesiones para aparecer en el ranking</p>'; return; }
    const medals = ['🥇','🥈','🥉'];
    c.innerHTML = sorted.map((u,i) => `<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i===0?' gold-rank':''}">${medals[i]}</div><div class="lb-name">${u.name}</div><div class="lb-val">${Math.round((u.totalVolume||0)/1000)}t vol.</div></div>`).join('');
  },

  renderLeaderboard() {
    const c = $('leaderboard-full'); if (!c) return;
    const users = getUsers().filter(u => u.username !== COACH_USERNAME);
    let sorted;
    if (S.lbMode === 'weekly') {
      sorted = [...users].sort((a,b) => {
        const aW = this.weekVol(a), bW = this.weekVol(b);
        return bW - aW;
      });
    } else if (S.lbMode === 'total') {
      sorted = [...users].sort((a,b) => (b.totalVolume||0)-(a.totalVolume||0));
    } else {
      sorted = [...users].sort((a,b) => (b.streak||0)-(a.streak||0));
    }
    const medals = ['🥇','🥈','🥉'];
    c.innerHTML = sorted.map((u,i) => {
      const val = S.lbMode==='weekly' ? `${Math.round(this.weekVol(u)/1000)}t esta semana` : S.lbMode==='total' ? `${Math.round((u.totalVolume||0)/1000)}t total` : `${u.streak||0} días racha`;
      return `<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i<3?' gold-rank':''}">${i<3?medals[i]:i+1}</div><div class="lb-name">${u.name} <span style="color:var(--wdim);font-size:11px">@${u.username}</span></div><div class="lb-val">${val}</div></div>`;
    }).join('') || '<p style="color:var(--wdim);padding:20px;text-align:center">No hay atletas aún</p>';
  },

  weekVol(u) {
    const now = Date.now(), week = 7*24*3600*1000;
    return (u.workoutHistory||[]).filter(w => now-new Date(w.date).getTime() < week).reduce((s,w) => s+(w.volume||0), 0);
  },

  lbTab(mode, btn) {
    S.lbMode = mode;
    document.querySelectorAll('.lb-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    this.renderLeaderboard();
  },

  // ── ACTIVITY CAL ──
  renderActCal() {
    const hist = (S.user?.workoutHistory||[]).map(w=>new Date(w.date).toDateString());
    const today = new Date(); let dots = '';
    for (let i=27;i>=0;i--) { const d=new Date(today); d.setDate(d.getDate()-i); const ds=d.toDateString(); dots+=`<div class="cal-dot${hist.includes(ds)?' on':''}${ds===today.toDateString()?' today':''}" title="${d.toLocaleDateString()}"></div>`; }
    $('act-cal').innerHTML = dots;
  },

  // ── CHARTS ──
  buildChartSel() {
    $('chart-sel').innerHTML = EX_DB.filter(e=>e.track).map(e => `<button class="csel-btn${e.track===S.selChartEx?' active':''}" onclick="App.selChart('${e.track}')">${e.emoji} ${e.name}</button>`).join('');
  },
  selChart(t) { S.selChartEx=t; document.querySelectorAll('.csel-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); this.renderCharts(); },
  renderCharts() {
    const hist = S.user?.workoutHistory||[];
    const exData = [];
    hist.forEach(sess => { const dbEx=EX_DB.find(d=>d.track===S.selChartEx); const exS=sess.exercises?.find(e=>dbEx&&e.name===dbEx.name); if (exS?.sets?.length>0) { const mw=Math.max(...exS.sets.map(s=>s.weight||0)); if (mw>0) exData.push({ date:new Date(sess.date).toLocaleDateString('es',{month:'short',day:'numeric'}), weight:mw }); } });
    const co = { responsive:true, maintainAspectRatio:true, plugins:{legend:{labels:{color:'#f0eaff',font:{family:'Orbitron',size:9}}}}, scales:{ x:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9},maxRotation:0},grid:{color:'rgba(255,255,255,.03)'}}, y:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9}},grid:{color:'rgba(255,255,255,.05)'},beginAtZero:false} } };
    const c1 = $('prog-chart')?.getContext('2d'); if (!c1) return;
    if (S.progChart) S.progChart.destroy();
    S.progChart = new Chart(c1, { type:'line', data:{ labels:exData.slice(-8).map(d=>d.date), datasets:[{ label:'Peso máx (kg)', data:exData.slice(-8).map(d=>d.weight), borderColor:'#f5c518', backgroundColor:'rgba(245,197,24,.08)', pointBackgroundColor:'#f5c518', pointRadius:4, tension:.4, fill:true }] }, options:co });
    const wv=[]; for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); const ds=d.toDateString(); const s=hist.find(h=>new Date(h.date).toDateString()===ds); wv.push({ day:d.toLocaleDateString('es',{weekday:'short'}), vol:s?.volume||0 }); }
    const c2 = $('vol-chart')?.getContext('2d'); if (!c2) return;
    if (S.volChart) S.volChart.destroy();
    S.volChart = new Chart(c2, { type:'bar', data:{ labels:wv.map(d=>d.day), datasets:[{ label:'Volumen (kg)', data:wv.map(d=>d.vol), backgroundColor:'rgba(245,197,24,.55)', borderColor:'#f5c518', borderWidth:1, borderRadius:5 }] }, options:{...co, scales:{...co.scales, y:{...co.scales.y, beginAtZero:true}}} });
  },
  renderRecords() {
    const r = S.user?.records||{}, tracked = EX_DB.filter(e=>e.track&&r[e.track]);
    $('records').innerHTML = tracked.length===0 ? '<div class="empty-log" style="grid-column:1/-1">Completa sesiones para ver tus récords</div>' : tracked.map(ex=>`<div class="rec-card"><div class="rec-ico">${ex.emoji}</div><div class="rec-ex">${ex.name.toUpperCase()}</div><div class="rec-val">${r[ex.track]}</div><div class="rec-unit">kg · Récord Personal</div></div>`).join('');
  },

  // ── PHOTOS ──
  addPhoto() {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='user';
    inp.onchange = e => { const f=e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=ev=>{ const ph=JSON.parse(localStorage.getItem('cl_ph_'+S.user.id)||'[]'); ph.push({date:new Date().toISOString(),src:ev.target.result}); localStorage.setItem('cl_ph_'+S.user.id,JSON.stringify(ph)); this.renderPhotos(); toast('📸 Foto guardada'); }; rd.readAsDataURL(f); };
    inp.click();
  },
  renderPhotos() {
    const ph = JSON.parse(localStorage.getItem('cl_ph_'+(S.user?.id||''))||'[]');
    $('photos').innerHTML = [...ph.slice(-9).reverse().map(p=>`<div class="photo-c"><img src="${p.src}"><div class="photo-date">${new Date(p.date).toLocaleDateString('es',{month:'short',day:'numeric'})}</div></div>`), `<div class="photo-c" onclick="App.addPhoto()" style="border-style:dashed;cursor:pointer"><span>📷</span></div>`].join('');
  },

  // ── CALCULATORS ──
  openCalc(t) {
    const titles = {'1rm':'🏋️ CALCULADORA 1RM', cal:'🔥 CALORÍAS QUEMADAS', macros:'🥩 MACROS DIARIOS', bmi:'📊 ÍNDICE DE MASA CORPORAL'};
    $('calc-title').textContent = titles[t];
    const w=S.user?.weight||'', h=S.user?.height||'', age=S.user?.age||'';
    const b = {
      '1rm':`<div class="calc-sec"><p style="font-size:11px;color:var(--wdim)">Fórmula de Epley: peso × (1 + reps/30)</p><div class="field"><span>⚖️</span><input id="c-w" type="number" placeholder="Peso usado (kg)"></div><div class="field"><span>🔢</span><input id="c-r" type="number" placeholder="Repeticiones"></div><button class="btn-gold" onclick="App.c1rm()">CALCULAR</button><div id="calc-out"></div></div>`,
      cal:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw" type="number" placeholder="Tu peso (kg)" value="${w}"></div><div class="field"><span>⏱️</span><input id="c-min" type="number" placeholder="Duración (min)"></div><div class="field"><span>🏃</span><select id="c-act"><option value="3.5">Pesas moderado</option><option value="5">Pesas intenso</option><option value="7">Cardio moderado</option><option value="10">HIIT</option><option value="12">Correr rápido</option></select></div><button class="btn-gold" onclick="App.cCal()">CALCULAR</button><div id="calc-out"></div></div>`,
      macros:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-mw" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-mh" type="number" placeholder="Altura (cm)" value="${h}"></div><div class="field"><span>🎂</span><input id="c-ma" type="number" placeholder="Edad" value="${age}"></div><div class="field"><span>⚧️</span><select id="c-mg"><option value="m">Masculino</option><option value="f">Femenino</option></select></div><div class="field"><span>📅</span><select id="c-act2"><option value="1.375">Ligero (1-3/sem)</option><option value="1.55">Moderado (3-5/sem)</option><option value="1.725">Activo (6-7/sem)</option></select></div><button class="btn-gold" onclick="App.cMacros()">CALCULAR</button><div id="calc-out"></div></div>`,
      bmi:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw2" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-bh" type="number" placeholder="Altura (cm)" value="${h}"></div><button class="btn-gold" onclick="App.cBMI()">CALCULAR</button><div id="calc-out"></div></div>`
    };
    $('calc-body').innerHTML = b[t]||''; this.openModal('modal-calc');
  },
  c1rm() { const w=parseFloat($('c-w')?.value),r=parseInt($('c-r')?.value); if(!w||!r) return toast('Completa los campos'); const rm=(w*(1+r/30)).toFixed(1); $('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${rm} kg</div><div class="calc-lbl">1RM estimado · ${Math.round(rm*0.85)} kg × 3 reps · ${Math.round(rm*0.75)} kg × 8 reps</div></div>`; },
  cCal() { const bw=parseFloat($('c-bw')?.value),min=parseInt($('c-min')?.value),met=parseFloat($('c-act')?.value)||3.5; if(!bw||!min) return toast('Completa los campos'); const cal=Math.round(met*bw*min/60*3.5/200*bw); $('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${cal} kcal</div><div class="calc-lbl">Estimado en ${min} min de entrenamiento</div></div>`; },
  cMacros() { const w=parseFloat($('c-mw')?.value),h=parseFloat($('c-mh')?.value),a=parseInt($('c-ma')?.value),g=$('c-mg')?.value,act=parseFloat($('c-act2')?.value)||1.55; if(!w||!h||!a) return toast('Completa los campos'); const bmr=g==='m'?(10*w)+(6.25*h)-(5*a)+5:(10*w)+(6.25*h)-(5*a)-161; const tdee=Math.round(bmr*act); const goal=S.user?.goal||'hypertrophy'; const kcal=goal==='weightloss'?tdee-400:['strength','hypertrophy'].includes(goal)?tdee+200:tdee; const prot=Math.round(w*2.2),fat=Math.round(kcal*0.25/9),carbs=Math.round((kcal-prot*4-fat*9)/4); $('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${kcal} kcal</div><div class="calc-lbl">Calorías diarias para tu objetivo</div></div><div class="macro-g"><div class="macro-i"><div class="macro-v">${prot}g</div><div class="macro-l">🥩 PROTEÍNA</div></div><div class="macro-i"><div class="macro-v">${carbs}g</div><div class="macro-l">🍚 CARBOS</div></div><div class="macro-i"><div class="macro-v">${fat}g</div><div class="macro-l">🥑 GRASA</div></div></div>`; },
  cBMI() { const w=parseFloat($('c-bw2')?.value),h=parseFloat($('c-bh')?.value); if(!w||!h) return toast('Completa los campos'); const bmi=(w/Math.pow(h/100,2)).toFixed(1); const cat=bmi<18.5?'Bajo peso':bmi<25?'Peso saludable ✅':bmi<30?'Sobrepeso':bmi<35?'Obesidad I':'Obesidad II+'; const col=bmi<18.5?'#00e5ff':bmi<25?'#76ff03':bmi<30?'#f5c518':bmi<35?'#ff9800':'#e53935'; if(S.user){S.user.bmi=bmi;this.saveUser();} $('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val" style="color:${col}">${bmi}</div><div class="calc-lbl">${cat}</div></div>`; },

  // ── COACH PANEL ──
  renderCoach() {
    const users = getUsers().filter(u=>u.username!==COACH_USERNAME);
    const c = $('athletes-list'); if (!c) return;
    c.innerHTML = users.length===0 ? '<div class="empty-log">No hay atletas registrados aún</div>' :
      users.map(u=>`<div class="ath-card"><div class="ath-ico">🦁</div><div class="ath-info"><div class="ath-name">${u.name} <span style="color:var(--gold);font-size:11px">@${u.username}</span></div><div class="ath-stats">⚡ ${u.xp||0} XP · 💪 ${u.sessions||0} ses · 🔥 ${u.streak||0}d racha</div><div class="ath-goal">${GL[u.goal]||'Sin objetivo'} · ${u.weight||'?'}kg · Nv.${Math.floor((u.xp||0)/1000)+1}</div></div></div>`).join('');
    const opts = users.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('');
    $('assign-user').innerHTML = '<option value="">Atleta...</option>'+opts;
    $('msg-user').innerHTML = '<option value="">Atleta...</option>'+opts;
    $('assign-routine').innerHTML = '<option value="">Rutina...</option>'+getRoutines().map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    this.renderCoachRoutines();
    this.renderCoachChallenges();
    this.renderCoachAchievements();
    this.renderSentMsgs();
  },

  renderCoachRoutines() {
    const rts = getRoutines(); const c = $('coach-routines-list'); if (!c) return;
    if (rts.length===0) { c.innerHTML = '<div class="empty-log">Crea tu primera rutina</div>'; return; }
    const tl = { strength:'🏋️ Fuerza', hypertrophy:'💪 Hipertrofia', cardio:'🏃 Cardio', fullbody:'🔥 Full Body', ppl:'⚡ PPL', hiit:'💥 HIIT' };
    c.innerHTML = rts.map(r => { const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break'); return `<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day]||r.day}</div></div><div class="rc-type">${tl[r.type]||r.type} · ${exs.length} ejercicios</div><div class="rc-actions"><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️ Borrar</button></div></div>`; }).join('');
  },

  assignRoutine() {
    const uid=$('assign-user')?.value, rid=$('assign-routine')?.value;
    if (!uid||!rid) return toast('Selecciona atleta y rutina');
    const users=getUsers(), u=users.find(x=>x.id===uid), r=getRoutines().find(x=>x.id===rid);
    if (!u||!r) return;
    const uRts=getRoutines(u.id);
    if (!uRts.find(x=>x.id===r.id)) uRts.push(r);
    saveRoutines(uRts, u.id);
    toast(`✅ Rutina asignada a ${u.name}`);
  },

  sendMsg() {
    const uid=$('msg-user')?.value, txt=$('msg-text')?.value?.trim();
    if (!uid||!txt) return toast('Selecciona atleta y escribe el mensaje');
    const users=getUsers(), u=users.find(x=>x.id===uid); if (!u) return;
    if (!u.coachMessages) u.coachMessages=[];
    u.coachMessages.push({ text:txt, from:S.user.name, date:new Date().toISOString(), read:false });
    saveUsers(users); $('msg-text').value='';
    const msgs=JSON.parse(localStorage.getItem('cl_sent_msgs_'+S.user.id)||'[]');
    msgs.push({ to:u.name, text:txt, date:new Date().toISOString() });
    localStorage.setItem('cl_sent_msgs_'+S.user.id, JSON.stringify(msgs));
    this.renderSentMsgs(); toast(`💬 Mensaje enviado a ${u.name}`);
  },

  renderSentMsgs() {
    const msgs=JSON.parse(localStorage.getItem('cl_sent_msgs_'+(S.user?.id||''))||'[]');
    const c=$('sent-msgs'); if (!c) return;
    c.innerHTML = msgs.length===0 ? '<div class="empty-log">No has enviado mensajes aún</div>' :
      msgs.slice(-5).reverse().map(m=>`<div class="sent-msg"><div class="sm-to">PARA: ${m.to}</div><div class="sm-txt">${m.text}</div><div class="sm-date">${new Date(m.date).toLocaleDateString('es',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div></div>`).join('');
  },

  checkCoachMsg() {
    if (!S.user) return;
    const msgs=(S.user.coachMessages||[]).filter(m=>!m.read);
    if (msgs.length>0) {
      const latest=msgs[msgs.length-1];
      setTimeout(()=>{ $('coach-msg-txt').textContent=`"${latest.text}" — ${latest.from}`; $('coach-popup')?.classList.remove('hidden'); S.user.coachMessages.forEach(m=>m.read=true); this.saveUser(); }, 2000);
    }
  },
  closeCoachPopup() { $('coach-popup')?.classList.add('hidden'); },

  // ── MODALS ──
  openModal(id) { $(id)?.classList.remove('hidden'); },
  closeModal(id) { $(id)?.classList.add('hidden'); },

  // ── NOTIFICATIONS ──
  checkNotif() { if ('Notification' in window && Notification.permission==='default') setTimeout(()=>$('notif-bar')?.classList.remove('hidden'), 3000); },
  reqNotif() { Notification.requestPermission().then(()=>this.dimNotif()); toast('🔔 Notificaciones activadas'); },
  dimNotif() { $('notif-bar')?.classList.add('hidden'); },

  // ── MISC ──
  updateWeight() { const w=prompt('Nuevo peso (kg):',S.user?.weight||''); if (!w) return; S.user.weight=parseFloat(w); if (S.user.height) S.user.bmi=(S.user.weight/Math.pow(S.user.height/100,2)).toFixed(1); this.saveUser(); this.updateUI(); toast(`⚖️ ${w} kg guardado`); },
  exportData() { const b=new Blob([JSON.stringify(S.user,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`coach-lion-${S.user.username}-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(a.href); toast('📤 Datos exportados'); },
  async reqWL() { try { if ('wakeLock' in navigator) await navigator.wakeLock.request('screen'); } catch(e) {} },
};

document.addEventListener('DOMContentLoaded', () => App.init());
