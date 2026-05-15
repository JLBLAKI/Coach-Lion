// ═══════════════════════════════════════
// COACH LION v6 — SUPABASE EDITION
// ═══════════════════════════════════════

// ── SUPABASE CONFIG ──
const SUPA_URL = 'https://ptuughawsrozmeymbxkp.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dXVnaGF3c3Jvem1leW1ieGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIzMzMsImV4cCI6MjA5Mzg1ODMzM30.rN1VMPTq-f-mZrR8Q_LHe-seDnNBZGb-I5fQecJEZs8';

// Inicializar cliente Supabase
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

// ── IMAGE AI CONFIG ──
// Tu key de Gemini va aquí (la que ya tenías)
const GEMINI_KEY = 'YOUR_GEMINI_API_KEY';
const FAL_KEY    = 'YOUR_FAL_API_KEY';
const FAL_MODEL  = 'fal-ai/flux/schnell';

const COACH_USERNAME = 'coach';

// ── STATE ──
const S = {
  user: null, isCoach: false, supaUserId: null,
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
  // Offline queue for syncing when connection returns
  offlineQueue: [],
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

// ── DEFAULT ACHIEVEMENTS ──
const DEFAULT_ACHS = [
  { id:'first_session', icon:'⚡', name:'PRIMER GOLPE', desc:'Completa tu primera sesión', xp:100, rarity:'common', cat:'sessions', image_data:null },
  { id:'ten_sessions', icon:'🔥', name:'EN LLAMAS', desc:'10 sesiones completadas', xp:250, rarity:'uncommon', cat:'sessions', image_data:null },
  { id:'fifty_sessions', icon:'💎', name:'DIAMANTE NEGRO', desc:'50 sesiones completadas', xp:1000, rarity:'epic', cat:'sessions', image_data:null },
  { id:'hundred_sessions', icon:'👑', name:'REY DEL DOJO', desc:'100 sesiones completadas', xp:3000, rarity:'legendary', cat:'sessions', image_data:null },
  { id:'streak_7', icon:'🗡️', name:'SAMURAI SEMANAL', desc:'7 días seguidos', xp:300, rarity:'uncommon', cat:'streaks', image_data:null },
  { id:'streak_30', icon:'👹', name:'DEMONIO DEL MES', desc:'30 días seguidos', xp:1500, rarity:'legendary', cat:'streaks', image_data:null },
  { id:'bench_100', icon:'😈', name:'THANOS JUNIOR', desc:'Press de banca 100 kg', xp:500, rarity:'epic', cat:'strength', image_data:null },
  { id:'bench_140', icon:'🦁', name:'MODO BESTIA', desc:'Press de banca 140 kg', xp:1000, rarity:'legendary', cat:'strength', image_data:null },
  { id:'squat_100', icon:'🏋️', name:'GUERRERO DRAGÓN', desc:'Sentadilla 100 kg', xp:500, rarity:'epic', cat:'strength', image_data:null },
  { id:'deadlift_100', icon:'⚔️', name:'COLOSO', desc:'Peso muerto 100 kg', xp:500, rarity:'epic', cat:'strength', image_data:null },
  { id:'deadlift_200', icon:'🌠', name:'TITÁN ABSOLUTO', desc:'Peso muerto 200 kg', xp:2000, rarity:'legendary', cat:'strength', image_data:null },
  { id:'curl_40', icon:'💪', name:'BRAZO DE ACERO', desc:'Curl bíceps 40 kg', xp:400, rarity:'epic', cat:'strength', image_data:null },
  { id:'pullups_15', icon:'🦅', name:'ÁGUILA REAL', desc:'15 dominadas seguidas', xp:350, rarity:'epic', cat:'strength', image_data:null },
  { id:'cardio_30', icon:'🎽', name:'CORAZÓN DE FUEGO', desc:'30 min de cardio', xp:200, rarity:'uncommon', cat:'cardio', image_data:null },
  { id:'volume_10k', icon:'📦', name:'REY DEL VOLUMEN', desc:'10,000 kg en una sesión', xp:600, rarity:'epic', cat:'volume', image_data:null },
  { id:'early_bird', icon:'🌅', name:'MADRUGADOR BESTIAL', desc:'Entrena antes de las 6am', xp:200, rarity:'uncommon', cat:'special', image_data:null },
  { id:'night_owl', icon:'🦉', name:'LOBO NOCTURNO', desc:'Entrena después de las 10pm', xp:200, rarity:'uncommon', cat:'special', image_data:null },
  { id:'level_5', icon:'⬆️', name:'GUERRERO LV5', desc:'Alcanza el nivel 5', xp:500, rarity:'uncommon', cat:'progression', image_data:null },
  { id:'level_10', icon:'🔱', name:'MAESTRO LV10', desc:'Alcanza el nivel 10', xp:1000, rarity:'epic', cat:'progression', image_data:null },
];

// ── EXERCISE DB ──
const EX_DB = [
  { id:'bench_press', name:'Press de Banca', muscle:'chest', equip:'barbell', emoji:'🏋️', diff:'intermediate', inst:'Acuéstate, agarra la barra más ancho que los hombros. Baja controlado al pecho, empuja explosivo. Escápulas retraídas.', track:'bench_press' },
  { id:'incline_press', name:'Press Inclinado', muscle:'chest', equip:'barbell', emoji:'💪', diff:'intermediate', inst:'Banco a 30-45°. Enfoca el pecho superior.', track:null },
  { id:'dumbbell_fly', name:'Aperturas con Mancuernas', muscle:'chest', equip:'dumbbell', emoji:'🦅', diff:'beginner', inst:'Brazos ligeramente flexionados, abre en arco amplio sintiendo el estiramiento del pecho.', track:null },
  { id:'pushup', name:'Flexiones', muscle:'chest', equip:'bodyweight', emoji:'🤸', diff:'beginner', inst:'Manos al ancho de hombros, cuerpo recto. Baja el pecho al suelo, empuja arriba.', track:null },
  { id:'cable_fly', name:'Cruces en Polea', muscle:'chest', equip:'cable', emoji:'⚡', diff:'intermediate', inst:'Desde poleas altas, junta manos frente al pecho con contracción máxima.', track:null },
  { id:'deadlift', name:'Peso Muerto', muscle:'back', equip:'barbell', emoji:'🌋', diff:'advanced', inst:'Pies al ancho de cadera, barra sobre el metatarso. Espalda neutral, empuja el suelo. El rey.', track:'deadlift' },
  { id:'pullup', name:'Dominadas', muscle:'back', equip:'bodyweight', emoji:'🦅', diff:'intermediate', inst:'Agarre prono más ancho que hombros. Lleva el pecho a la barra, baja completamente.', track:'pullups' },
  { id:'bent_row', name:'Remo con Barra', muscle:'back', equip:'barbell', emoji:'⚓', diff:'intermediate', inst:'Torso 45°, barra a los abdominales. Codos hacia atrás, contrae escápulas.', track:null },
  { id:'lat_pulldown', name:'Jalón al Pecho', muscle:'back', equip:'cable', emoji:'🎯', diff:'beginner', inst:'Jala la barra al pecho superior, codos al suelo.', track:null },
  { id:'seated_row', name:'Remo Sentado Polea', muscle:'back', equip:'cable', emoji:'🚣', diff:'beginner', inst:'Espalda recta, jala hacia el ombligo.', track:null },
  { id:'ohp', name:'Press Militar', muscle:'shoulders', equip:'barbell', emoji:'🗡️', diff:'intermediate', inst:'De pie o sentado, empuja la barra por encima hasta extender completamente.', track:null },
  { id:'lateral_raise', name:'Elevaciones Laterales', muscle:'shoulders', equip:'dumbbell', emoji:'✈️', diff:'beginner', inst:'Eleva los brazos lateralmente hasta la altura de hombros.', track:null },
  { id:'face_pull', name:'Face Pull', muscle:'shoulders', equip:'cable', emoji:'🎯', diff:'beginner', inst:'Polea alta, jala hacia la cara abriendo los codos.', track:null },
  { id:'barbell_curl', name:'Curl con Barra', muscle:'biceps', equip:'barbell', emoji:'💪', diff:'beginner', inst:'Codos pegados al torso, curla la barra hasta contraer el bíceps completamente.', track:'bicep_curl' },
  { id:'hammer_curl', name:'Curl Martillo', muscle:'biceps', equip:'dumbbell', emoji:'🔨', diff:'beginner', inst:'Agarre neutro, curla hasta el hombro.', track:null },
  { id:'incline_curl', name:'Curl Inclinado', muscle:'biceps', equip:'dumbbell', emoji:'🌟', diff:'intermediate', inst:'En banco inclinado, brazos colgando. Mayor estiramiento del bíceps.', track:null },
  { id:'skull_crusher', name:'Skull Crusher', muscle:'triceps', equip:'barbell', emoji:'💀', diff:'intermediate', inst:'Acostado, baja la barra a la frente flexionando solo los codos.', track:null },
  { id:'tricep_dip', name:'Fondos para Tríceps', muscle:'triceps', equip:'bodyweight', emoji:'⬇️', diff:'intermediate', inst:'En paralelas, baja hasta 90°. Empuja contrayendo el tríceps.', track:null },
  { id:'tricep_pushdown', name:'Extensión Tríceps Polea', muscle:'triceps', equip:'cable', emoji:'⚡', diff:'beginner', inst:'Codos pegados, empuja hasta extensión completa.', track:null },
  { id:'squat', name:'Sentadilla', muscle:'legs', equip:'barbell', emoji:'🏋️', diff:'intermediate', inst:'Barra en trapecios, pies al ancho de hombros. Baja a paralelo o más abajo.', track:'squat' },
  { id:'leg_press', name:'Prensa de Piernas', muscle:'legs', equip:'machine', emoji:'🦵', diff:'beginner', inst:'Pies al ancho de hombros. Baja controlado.', track:null },
  { id:'romanian_dl', name:'Peso Muerto Rumano', muscle:'legs', equip:'barbell', emoji:'🧲', diff:'intermediate', inst:'Bisagra de cadera, baja sintiendo el isquiotibial.', track:null },
  { id:'lunges', name:'Zancadas', muscle:'legs', equip:'dumbbell', emoji:'🚶', diff:'beginner', inst:'Paso adelante, rodilla trasera casi toca el suelo.', track:null },
  { id:'leg_curl', name:'Curl Femoral', muscle:'legs', equip:'machine', emoji:'🔩', diff:'beginner', inst:'Jala el peso con los isquiotibiales. Controla la bajada.', track:null },
  { id:'calf_raise', name:'Elevaciones de Talones', muscle:'legs', equip:'machine', emoji:'👟', diff:'beginner', inst:'Sube en punta de pies, mantén 1 segundo arriba.', track:null },
  { id:'plank', name:'Plancha', muscle:'core', equip:'bodyweight', emoji:'🧱', diff:'beginner', inst:'Cuerpo recto en antebrazos y pies. Aprieta abdomen y glúteos.', track:null },
  { id:'crunch', name:'Abdominales', muscle:'core', equip:'bodyweight', emoji:'🎯', diff:'beginner', inst:'Manos en la nuca, curva el tronco contrayendo el abdomen.', track:null },
  { id:'hanging_lr', name:'Elevación Piernas Colgado', muscle:'core', equip:'bodyweight', emoji:'🏋️', diff:'advanced', inst:'Colgado de la barra, eleva las piernas a 90° o más.', track:null },
  { id:'cable_crunch', name:'Crunch en Polea', muscle:'core', equip:'cable', emoji:'⚡', diff:'intermediate', inst:'De rodillas, jala la cuerda flexionando el torso.', track:null },
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
const pad = n => String(n).padStart(2, '0');

// ── LOCAL CACHE (for offline support) ──
const Cache = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('cl_' + key)) } catch(e) { return null; } },
  set: (key, val) => { try { localStorage.setItem('cl_' + key, JSON.stringify(val)); } catch(e) {} },
  del: (key) => localStorage.removeItem('cl_' + key),
};

// ── SUPABASE DB LAYER ──
// Each function tries Supabase first, falls back to localStorage cache
const DB = {

  // ── AUTH ──
  async register(name, username, password, profile) {
    const pwHash = await hashPassword(password);
    // Use Supabase Auth for secure authentication
    const { data: authData, error: authErr } = await sb.auth.signUp({
      email: `${username}@coachlion.app`,
      password: password,
      options: { data: { username, name } }
    });
    if (authErr) throw new Error(authErr.message);

    const userId = authData.user.id;
    const userRow = {
      id: userId, name, username, password_hash: pwHash,
      weight: profile.weight, height: profile.height, age: profile.age,
      days_per_week: profile.days ? parseInt(profile.days) : null,
      goal: profile.goal, level: profile.level,
      bmi: profile.bmi, xp: 0, sessions: 0, streak: 0,
      last_session: null, achievements: [], records: {},
      total_volume: 0, coach_messages: [],
      created_at: new Date().toISOString()
    };
    const { error: dbErr } = await sb.from('users').insert(userRow);
    if (dbErr) throw new Error(dbErr.message);
    Cache.set('user', userRow);
    Cache.set('supa_uid', userId);
    return userRow;
  },

  async login(username, password) {
    // Try Supabase auth
    const { data, error } = await sb.auth.signInWithPassword({
      email: `${username}@coachlion.app`,
      password: password
    });
    if (error) {
      // Fallback: check local cache for offline
      const cached = Cache.get('user');
      if (cached && cached.username === username) {
        const valid = await verifyPassword(password, cached.password_hash);
        if (valid) return { user: cached, offline: true };
      }
      throw new Error('Usuario o contraseña incorrectos');
    }
    // Fetch full profile from DB
    const { data: profile, error: pErr } = await sb.from('users').select('*').eq('id', data.user.id).single();
    if (pErr) throw new Error(pErr.message);
    Cache.set('user', profile);
    Cache.set('supa_uid', data.user.id);
    return { user: profile, offline: false };
  },

  async logout() {
    await sb.auth.signOut();
    Cache.del('user'); Cache.del('supa_uid');
  },

  async getSession() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
      const { data: profile } = await sb.from('users').select('*').eq('id', data.session.user.id).single();
      if (profile) { Cache.set('user', profile); return profile; }
    }
    return Cache.get('user');
  },

  // ── USER ──
  async saveUser(user) {
    Cache.set('user', user);
    if (!navigator.onLine) { S.offlineQueue.push({ type:'saveUser', data:user }); return; }
    const { error } = await sb.from('users').upsert({
      id: user.id, name: user.name, username: user.username,
      weight: user.weight, height: user.height, age: user.age,
      days_per_week: user.days_per_week || (user.days ? parseInt(user.days) : null),
      goal: user.goal, level: user.level, bmi: user.bmi,
      xp: user.xp || 0, sessions: user.sessions || 0,
      streak: user.streak || 0, last_session: user.last_session,
      achievements: user.achievements || [],
      records: user.records || {},
      total_volume: user.total_volume || 0,
      coach_messages: user.coach_messages || [],
    });
    if (error) console.warn('saveUser error:', error.message);
  },

  async getAllUsers() {
    if (!navigator.onLine) return Cache.get('all_users') || [];
    const { data, error } = await sb.from('users').select('id,name,username,xp,sessions,streak,total_volume,goal,weight,workout_history_summary').neq('username', COACH_USERNAME);
    if (error) return Cache.get('all_users') || [];
    Cache.set('all_users', data);
    return data || [];
  },

  // ── ROUTINES ──
  async getRoutines(userId) {
    const uid = userId || S.user?.id;
    if (!navigator.onLine) return Cache.get('routines_' + uid) || [];
    const { data, error } = await sb.from('routines').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (error) return Cache.get('routines_' + uid) || [];
    Cache.set('routines_' + uid, data || []);
    return data || [];
  },

  async saveRoutine(routine, userId) {
    const uid = userId || S.user?.id;
    const row = { user_id: uid, name: routine.name, type: routine.type, day_of_week: routine.day, exercises: routine.exercises, circuit_rest: routine.circuitRest || 90 };
    if (routine.id && !routine.id.startsWith('temp_')) row.id = routine.id;
    Cache.set('routines_' + uid, [...(Cache.get('routines_' + uid) || []).filter(r => r.id !== routine.id), { ...row, id: routine.id }]);
    if (!navigator.onLine) { S.offlineQueue.push({ type:'saveRoutine', data:row, userId:uid }); return { ...row, id: 'temp_' + Date.now() }; }
    const { data, error } = await sb.from('routines').upsert(row).select().single();
    if (error) { console.warn('saveRoutine error:', error.message); return row; }
    return data;
  },

  async deleteRoutine(id, userId) {
    const uid = userId || S.user?.id;
    const cached = Cache.get('routines_' + uid) || [];
    Cache.set('routines_' + uid, cached.filter(r => r.id !== id));
    if (!navigator.onLine) { S.offlineQueue.push({ type:'deleteRoutine', id, userId:uid }); return; }
    await sb.from('routines').delete().eq('id', id).eq('user_id', uid);
  },

  // ── WORKOUTS ──
  async saveWorkout(workout, userId) {
    const uid = userId || S.user?.id;
    const row = { user_id: uid, exercises: workout.exercises, total_volume: workout.volume || 0, duration_seconds: workout.duration || 0, notes: workout.notes || null };
    if (!navigator.onLine) { S.offlineQueue.push({ type:'saveWorkout', data:row }); return; }
    const { error } = await sb.from('workout_sessions').insert(row);
    if (error) console.warn('saveWorkout error:', error.message);
  },

  async getWorkoutHistory(userId) {
    const uid = userId || S.user?.id;
    if (!navigator.onLine) return Cache.get('workout_history_' + uid) || [];
    const { data, error } = await sb.from('workout_sessions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50);
    if (error) return Cache.get('workout_history_' + uid) || [];
    Cache.set('workout_history_' + uid, data || []);
    return data || [];
  },

  // ── CHALLENGES ──
  async getChallenges() {
    if (!navigator.onLine) return Cache.get('challenges') || [];
    const { data, error } = await sb.from('challenges').select('*').order('created_at', { ascending: false });
    if (error) return Cache.get('challenges') || [];
    Cache.set('challenges', data || []);
    return data || [];
  },

  async saveChallenge(ch) {
    Cache.set('challenges', [...(Cache.get('challenges') || []).filter(c => c.id !== ch.id), ch]);
    if (!navigator.onLine) { S.offlineQueue.push({ type:'saveChallenge', data:ch }); return ch; }
    const row = { name: ch.name, description: ch.desc, reward: ch.reward, challenge_type: ch.type, target_value: ch.target || 0, image_data: ch.imageData || null, icon: ch.icon || '🎯' };
    if (ch.id && !ch.id.toString().startsWith('temp')) row.id = ch.id;
    const { data, error } = await sb.from('challenges').upsert(row).select().single();
    if (error) { console.warn('saveChallenge error:', error.message); return ch; }
    return data;
  },

  async deleteChallenge(id) {
    Cache.set('challenges', (Cache.get('challenges') || []).filter(c => c.id !== id));
    if (!navigator.onLine) { S.offlineQueue.push({ type:'deleteChallenge', id }); return; }
    await sb.from('challenges').delete().eq('id', id);
  },

  // ── ACHIEVEMENTS ──
  async getAchs() {
    if (!navigator.onLine) return Cache.get('achievements_def') || DEFAULT_ACHS;
    const { data, error } = await sb.from('achievement_definitions').select('*').order('created_at', { ascending: true });
    if (error || !data?.length) return Cache.get('achievements_def') || DEFAULT_ACHS;
    Cache.set('achievements_def', data);
    return data;
  },

  async saveAch(ach) {
    const current = Cache.get('achievements_def') || DEFAULT_ACHS;
    Cache.set('achievements_def', [...current.filter(a => a.id !== ach.id), ach]);
    if (!navigator.onLine) { S.offlineQueue.push({ type:'saveAch', data:ach }); return ach; }
    const row = { id: ach.id, name: ach.name, description: ach.desc, xp: ach.xp || 100, rarity: ach.rarity || 'common', category: ach.cat || 'special', icon: ach.icon || '🏆', image_data: ach.image_data || null };
    const { data, error } = await sb.from('achievement_definitions').upsert(row).select().single();
    if (error) { console.warn('saveAch error:', error.message); return ach; }
    return data;
  },

  async deleteAch(id) {
    const current = Cache.get('achievements_def') || DEFAULT_ACHS;
    Cache.set('achievements_def', current.filter(a => a.id !== id));
    if (!navigator.onLine) { S.offlineQueue.push({ type:'deleteAch', id }); return; }
    await sb.from('achievement_definitions').delete().eq('id', id);
  },

  // ── MESSAGES ──
  async sendMessage(toUserId, text, fromName) {
    if (!navigator.onLine) { S.offlineQueue.push({ type:'sendMessage', toUserId, text, fromName }); return; }
    await sb.from('coach_messages').insert({ to_user_id: toUserId, from_name: fromName, message: text, read: false });
  },

  async getUnreadMessages(userId) {
    if (!navigator.onLine) return [];
    const { data } = await sb.from('coach_messages').select('*').eq('to_user_id', userId).eq('read', false).order('created_at', { ascending: true });
    return data || [];
  },

  async markMessagesRead(userId) {
    await sb.from('coach_messages').update({ read: true }).eq('to_user_id', userId);
  },

  async getSentMessages(fromUserId) {
    if (!navigator.onLine) return Cache.get('sent_msgs') || [];
    const { data } = await sb.from('coach_messages').select('*').eq('from_user_id', fromUserId).order('created_at', { ascending: false }).limit(20);
    return data || [];
  },

  // ── OFFLINE SYNC ──
  async syncOfflineQueue() {
    if (!navigator.onLine || S.offlineQueue.length === 0) return;
    const queue = [...S.offlineQueue];
    S.offlineQueue = [];
    for (const item of queue) {
      try {
        if (item.type === 'saveUser') await this.saveUser(item.data);
        if (item.type === 'saveRoutine') await sb.from('routines').upsert(item.data);
        if (item.type === 'deleteRoutine') await sb.from('routines').delete().eq('id', item.id);
        if (item.type === 'saveWorkout') await sb.from('workout_sessions').insert(item.data);
        if (item.type === 'saveChallenge') await sb.from('challenges').upsert(item.data);
        if (item.type === 'deleteChallenge') await sb.from('challenges').delete().eq('id', item.id);
        if (item.type === 'saveAch') await sb.from('achievement_definitions').upsert(item.data);
        if (item.type === 'deleteAch') await sb.from('achievement_definitions').delete().eq('id', item.id);
        if (item.type === 'sendMessage') await sb.from('coach_messages').insert({ to_user_id: item.toUserId, from_name: item.fromName, message: item.text, read: false });
      } catch(e) { console.warn('Sync error:', e.message); S.offlineQueue.push(item); }
    }
    if (S.offlineQueue.length === 0) toast('✅ Datos sincronizados con la nube');
  }
};

// ── SECURITY HELPERS ──
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password + 'cl_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function verifyPassword(password, hash) {
  return (await hashPassword(password)) === hash;
}

// ── PHOTO COMPRESSION ──
function compressImage(dataUrl, maxWidth = 600, quality = 0.75) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ── SOUND ──
function playRoar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

// ── IMAGE GENERATION ──
async function generateImageGemini(prompt) {
  if (!GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY') return null;
  try {
    const full = `${prompt}. Style: vibrant comic book art, Marvel/DC anime fusion, bold colors, dynamic composition, dramatic lighting, halftone dots, strong black outlines, dark background with gold accents, fitness achievement illustration, no text overlay`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: full }] }], generationConfig: { responseModalities: ['IMAGE','TEXT'] } })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const imgPart = (data?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imgPart?.inlineData?.data) return null;
    return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
  } catch(e) { return null; }
}

async function generateImageFal(prompt) {
  if (!FAL_KEY || FAL_KEY === 'YOUR_FAL_API_KEY') return null;
  try {
    const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: 'POST', headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${prompt}, comic book anime Marvel style, bold colors, dramatic lighting`, image_size: 'square', num_inference_steps: 4, num_images: 1 })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.images?.[0]?.url; if (!url) return null;
    const blob = await (await fetch(url)).blob();
    return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  } catch(e) { return null; }
}

function fallbackSVG(name, icon) {
  const icons = ['💪','🏆','🔥','⚡','🦁','👹','🐉','⚔️','🌟','👑','😈','🦅'];
  const ic = icon || icons[Math.floor(Math.random() * icons.length)];
  const cols = ['#f5c518','#e53935','#9c27b0','#ff6f00','#00e5ff','#4caf50'];
  const c1 = cols[Math.floor(Math.random() * cols.length)];
  const uid = Date.now();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g${uid}" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="${c1}" stop-opacity="0.25"/><stop offset="100%" stop-color="#08080f"/></radialGradient><pattern id="p${uid}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="${c1}" opacity="0.12"/></pattern></defs><rect width="200" height="200" fill="#08080f"/><rect width="200" height="200" fill="url(#g${uid})"/><rect width="200" height="200" fill="url(#p${uid})"/><polygon points="100,8 192,54 192,146 100,192 8,146 8,54" fill="none" stroke="${c1}" stroke-width="2" opacity="0.35"/><text x="100" y="122" text-anchor="middle" font-size="80" dominant-baseline="middle">${ic}</text><text x="100" y="174" text-anchor="middle" font-size="9" fill="${c1}" font-family="Impact,sans-serif" letter-spacing="3" opacity="0.85">${(name||'').toUpperCase().slice(0,16)}</text></svg>`;
  const blob = new Blob([svg], { type:'image/svg+xml' });
  return URL.createObjectURL(blob);
}

async function generateAIImage(prompt, name, icon) {
  const gem = await generateImageGemini(prompt); if (gem) return gem;
  const fal = await generateImageFal(prompt); if (fal) return fal;
  return fallbackSVG(name, icon);
}

// ── TOAST ──
function toast(msg) {
  document.querySelector('.cl-t')?.remove();
  const t = document.createElement('div'); t.className = 'cl-t'; t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:calc(var(--nav) + 12px);left:50%;transform:translateX(-50%);background:var(--d3);border:1px solid var(--borderb);color:var(--white);padding:10px 16px;border-radius:11px;font-family:var(--fu);font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;box-shadow:0 8px 28px rgba(0,0,0,.5)';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 3000);
}

// ═══════════════════════════════════════
const App = {

  // ── INIT ──
  async init() {
    this.buildMFilters();
    this.buildAchFilters();
    this.setupOffline();
    setTimeout(async () => {
      const sp = $('splash');
      sp.style.cssText = 'opacity:0;transition:opacity .5s;position:fixed;inset:0;z-index:9999;pointer-events:none';
      setTimeout(async () => {
        sp.style.display = 'none';
        if (!localStorage.getItem('cl_onboarded')) { this.showOnboarding(); }
        else { await this.checkSess(); }
      }, 500);
    }, 2900);
  },

  // ── ONBOARDING ──
  showOnboarding() {
    this.showScr('onboarding'); S.onboardSlide = 0;
    this.renderOnboardDots(); this.updateOnboardSlide();
  },
  renderOnboardDots() {
    const c = $('onboard-dots'); if (!c) return;
    c.innerHTML = Array(4).fill(0).map((_,i) => `<div class="onboard-dot${i===S.onboardSlide?' active':''}"></div>`).join('');
  },
  updateOnboardSlide() {
    document.querySelectorAll('.onboard-slide').forEach((s,i) => s.classList.toggle('active', i===S.onboardSlide));
    this.renderOnboardDots();
    const btn = $('onboard-next'); if (btn) btn.textContent = S.onboardSlide===3 ? '🦁 COMENZAR' : 'SIGUIENTE →';
  },
  onboardNext() { if (S.onboardSlide<3) { S.onboardSlide++; this.updateOnboardSlide(); } else { this.skipOnboard(); } },
  skipOnboard() { localStorage.setItem('cl_onboarded','1'); this.checkSess(); },

  // ── SESSION ──
  async checkSess() {
    try {
      const profile = await DB.getSession();
      if (profile) { S.user = profile; this.enterApp(); }
      else { this.showScr('auth'); if (localStorage.getItem('cl_bio')) $('bio-btn')?.classList.remove('hidden'); }
    } catch(e) { this.showScr('auth'); }
  },

  showScr(id) { document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); $(id)?.classList.remove('hidden'); },

  async enterApp() {
    this.showScr('app');
    S.isCoach = S.user.username === COACH_USERNAME;
    if (S.isCoach) $('coach-btn')?.classList.remove('hidden');
    await this.updateUI();
    this.checkCoachMsg();
    this.checkNotif();
    this.buildChartSel();
    if ('wakeLock' in navigator) this.reqWL();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  },

  // ── AUTH ──
  showReg() { $('form-login')?.classList.add('hidden'); $('form-reg')?.classList.remove('hidden'); },
  showLogin() { $('form-reg')?.classList.add('hidden'); $('form-login')?.classList.remove('hidden'); },

  async register() {
    const n=v('r-name'), u=v('r-user'), p=v('r-pass');
    if (!n||!u||!p) return toast('Completa nombre, usuario y contraseña');
    const btn = document.querySelector('#form-reg .btn-gold');
    btn.textContent = '⏳ CREANDO...'; btn.disabled = true;
    try {
      const w=parseFloat(v('r-w'))||null, h=parseFloat(v('r-h'))||null;
      const bmi = w&&h ? (w/Math.pow(h/100,2)).toFixed(1) : null;
      const user = await DB.register(n, u, p, { weight:w, height:h, age:parseInt(v('r-age'))||null, days:v('r-days'), goal:v('r-goal'), level:v('r-level'), bmi });
      S.user = user; await this.enterApp();
      setTimeout(() => this.showAchPopup({ icon:'🦁', name:'¡BIENVENIDO!', desc:`Perfil @${u} creado. ¡La bestia despierta!`, xp:50, image_data:null }), 800);
    } catch(e) {
      toast('Error: ' + e.message);
      btn.textContent = '🦁 CREAR MI PERFIL'; btn.disabled = false;
    }
  },

  async login() {
    const u=v('l-user'), p=v('l-pass');
    const btn = document.querySelector('#form-login .btn-gold');
    btn.textContent = '⏳ ENTRANDO...'; btn.disabled = true;
    try {
      const { user } = await DB.login(u, p);
      S.user = user; await this.enterApp();
    } catch(e) {
      toast(e.message || 'Usuario o contraseña incorrectos');
      btn.textContent = '⚡ ENTRAR'; btn.disabled = false;
    }
  },

  async biometricLogin() {
    const bio = localStorage.getItem('cl_bio'); if (!bio) return;
    try { if (window.PublicKeyCredential) await navigator.credentials.get({ publicKey:{ challenge:new Uint8Array(32), timeout:60000, userVerification:'required' } }); } catch(e) {}
    const cached = Cache.get('user');
    if (cached && cached.username === bio) { S.user = cached; await this.enterApp(); }
    else { toast('Inicia sesión manualmente la primera vez'); }
  },

  async saveBiometric() {
    if (!S.user) return;
    try {
      if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        const enc = new TextEncoder();
        await navigator.credentials.create({ publicKey:{ challenge:crypto.getRandomValues(new Uint8Array(32)), rp:{name:'Coach Lion',id:location.hostname||'localhost'}, user:{id:enc.encode(S.user.id),name:S.user.username,displayName:S.user.name}, pubKeyCredParams:[{alg:-7,type:'public-key'}], authenticatorSelection:{userVerification:'required',authenticatorAttachment:'platform'}, timeout:60000 } });
      }
    } catch(e) {}
    localStorage.setItem('cl_bio', S.user.username);
    toast('✅ Acceso biométrico guardado');
  },

  async logout() {
    if (!confirm('¿Cerrar sesión?')) return;
    this.stopSess();
    await DB.logout();
    S.user = null; S.isCoach = false;
    this.showScr('auth'); this.showLogin();
    $('coach-btn')?.classList.add('hidden');
  },

  // ── UI ──
  async updateUI() {
    if (!S.user) return;
    const u = S.user, lv=Math.floor((u.xp||0)/1000)+1, xpLv=(u.xp||0)%1000;
    $('t-name').textContent = u.username.toUpperCase();
    $('h-name').textContent = u.name.split(' ')[0].toUpperCase();
    $('h-quote').textContent = QUOTES[new Date().getDay()%QUOTES.length];
    $('s-sess').textContent = u.sessions||0;
    $('s-ach').textContent = (u.achievements||[]).length;
    $('s-xp').textContent = u.xp||0;
    $('s-str').textContent = u.streak||0;
    $('xp-fill').style.width = (xpLv/10)+'%';
    $('p-name').textContent = u.name.toUpperCase();
    $('p-lv-txt').textContent = 'NIVEL '+lv;
    $('lv-fill').style.width = (xpLv/10)+'%';
    $('p-badge').textContent = TITLES[Math.min(lv-1,TITLES.length-1)];
    $('p-stats').innerHTML = [
      {i:'⚖️',v:u.weight||'--',l:'PESO KG'},
      {i:'📏',v:u.height||'--',l:'ALTURA CM'},
      {i:'🎂',v:u.age||'--',l:'EDAD'},
      {i:'📊',v:u.bmi||'--',l:'IMC'},
      {i:'🎯',v:GL[u.goal]||'--',l:'OBJETIVO'},
      {i:'📅',v:(u.days_per_week||u.days||'--')+'d',l:'DÍAS/SEM'},
    ].map(s=>`<div class="ps"><div class="ps-i">${s.i}</div><div class="ps-v">${s.v}</div><div class="ps-l">${s.l}</div></div>`).join('');
    $('p-settings').innerHTML = [
      {i:'⚖️',l:'Actualizar peso',f:'App.updateWeight()'},
      {i:'🔱',l:'Acceso biométrico',f:'App.saveBiometric()'},
      {i:'📸',l:'Fotos de progreso',f:"App.goTo('progress')"},
      {i:'📤',l:'Exportar datos',f:'App.exportData()'},
      {i:'🚪',l:'Cerrar sesión',f:'App.logout()',d:true},
    ].map(s=>`<div class="setting${s.d?' danger':''}" onclick="${s.f}"><span>${s.i} ${s.l}</span><span class="s-arr">›</span></div>`).join('');
    await this.renderTodayR();
    this.renderActCal();
    await this.renderRecentAchs();
    this.renderRecords();
    await this.renderLeaderboardMini();
    await this.renderChallenges();
  },

  // ── NAVIGATION ──
  async goTo(page) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
    $('page-'+page)?.classList.add('active');
    document.querySelector('.nb[data-p="'+page+'"]')?.classList.add('active');
    if (page==='achievements') await this.renderAchs();
    if (page==='routines') await this.renderRoutines();
    if (page==='progress') { await this.renderCharts(); await this.renderPhotos(); }
    if (page==='coach'&&S.isCoach) await this.renderCoach();
    if (page==='profile') await this.updateUI();
    if (page==='leaderboard') await this.renderLeaderboard();
  },

  coachTab(tab, btn) {
    document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.ctab-body').forEach(c=>c.classList.add('hidden'));
    btn.classList.add('active'); $('ct-'+tab)?.classList.remove('hidden');
  },

  // ── OFFLINE ──
  setupOffline() {
    const update = () => {
      $('offline-banner')?.classList.toggle('hidden', navigator.onLine);
      if (navigator.onLine) DB.syncOfflineQueue();
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  },

  // ── WORKOUT ──
  async startWorkout() {
    this.goTo('workout');
    if (!S.sessActive) {
      S.sessActive=true; S.sessStart=Date.now();
      S.sessTimer=setInterval(()=>this.tickSess(),1000);
      S.workLog=[]; this.renderLog(); this.reqWL();
    }
  },
  tickSess() {},
  stopSess() {
    clearInterval(S.sessTimer); clearInterval(S.restTimer); clearInterval(S.circuitRestTimer);
    S.sessActive=false; S.sessStart=null; S.restRunning=false;
    $('circuit-popup')?.classList.add('hidden');
  },

  async finishWorkout() {
    const realExs = S.workLog.filter(i=>i.type!=='circuit_break');
    if (realExs.length===0 && !confirm('No registraste ejercicios. ¿Terminar?')) return;
    const dur = S.sessStart ? Math.floor((Date.now()-S.sessStart)/1000) : 0;
    this.stopSess();
    const u = S.user;
    u.sessions = (u.sessions||0)+1;
    let vol=0, sets=0;
    realExs.forEach(ex=>{
      (ex.sets||[]).forEach(s=>{
        vol+=(s.weight||0)*(s.reps||0); sets++;
        if (ex.track&&s.weight) { if (!u.records) u.records={}; if (!u.records[ex.track]||s.weight>u.records[ex.track]) u.records[ex.track]=s.weight; }
      });
    });
    u.total_volume=(u.total_volume||0)+vol;

    // Save workout session to Supabase
    await DB.saveWorkout({ exercises:realExs.map(e=>({name:e.name,sets:e.sets||[]})), volume:vol, duration:dur });

    // Update streak
    const today=new Date().toDateString(), yest=new Date(Date.now()-86400000).toDateString();
    const lastSess = u.last_session ? new Date(u.last_session).toDateString() : null;
    if (lastSess===yest||lastSess===today) u.streak=(u.streak||0)+1;
    else if (lastSess!==today) u.streak=1;
    u.last_session=new Date().toISOString();

    const xpGain=150+(realExs.length*25)+(sets*5);
    await this.addXP(xpGain);

    const hr=new Date().getHours();
    if (hr<6) await this.tryUnlock('early_bird',{});
    if (hr>=22) await this.tryUnlock('night_owl',{});
    ['first_session','ten_sessions','fifty_sessions','hundred_sessions'].forEach(id=>this.tryUnlock(id,{sessions:u.sessions}));
    ['streak_7','streak_30'].forEach(id=>this.tryUnlock(id,{streak:u.streak}));
    const r=u.records||{};
    if (r.bench_press){this.tryUnlock('bench_100',{bench_press:r.bench_press});this.tryUnlock('bench_140',{bench_press:r.bench_press});}
    if (r.squat) this.tryUnlock('squat_100',{squat:r.squat});
    if (r.deadlift){this.tryUnlock('deadlift_100',{deadlift:r.deadlift});this.tryUnlock('deadlift_200',{deadlift:r.deadlift});}
    if (r.bicep_curl) this.tryUnlock('curl_40',{bicep_curl:r.bicep_curl});
    if (r.pullups) this.tryUnlock('pullups_15',{pullups:r.pullups});
    if (vol>=10000) this.tryUnlock('volume_10k',{session_volume:vol});

    await DB.saveUser(u);
    S.workLog=[]; this.renderLog();
    await this.updateUI(); this.goTo('home');
    setTimeout(()=>toast(`💪 ¡Sesión completa! +${xpGain} XP · ${Math.round(vol).toLocaleString()} kg vol.`),300);
  },

  // ── REST TIMER ──
  setRest(sec, btn) {
    S.restDur=sec; S.restSec=sec; S.restRunning=false; clearInterval(S.restTimer);
    $('rest-n').textContent=sec; this.updateRing(sec,sec);
    document.querySelectorAll('.pre').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    $('rest-start-btn').textContent='▶ INICIAR'; $('ring-fg')?.classList.remove('urgent');
  },
  toggleRest() {
    if (S.restRunning) { clearInterval(S.restTimer); S.restRunning=false; $('rest-start-btn').textContent='▶ CONTINUAR'; return; }
    S.restRunning=true; $('rest-start-btn').textContent='⏸ PAUSAR';
    const fg=$('ring-fg'); fg?.classList.remove('urgent');
    S.restTimer=setInterval(()=>{
      S.restSec--; $('rest-n').textContent=S.restSec; this.updateRing(S.restSec,S.restDur);
      if (S.restSec<=10) fg?.classList.add('urgent');
      if (S.restSec<=0) {
        clearInterval(S.restTimer); S.restRunning=false; $('rest-start-btn').textContent='▶ INICIAR'; fg?.classList.remove('urgent');
        if (navigator.vibrate) navigator.vibrate([200,100,200,100,400]);
        if (Notification.permission==='granted') new Notification('COACH LION 🦁',{body:'¡Descanso terminado! 💪',icon:'/icon-192.png'});
        playRoar(); toast('⚡ ¡Descanso terminado! ¡VAMOS!');
        setTimeout(()=>{ $('rest-n').textContent=S.restDur; this.updateRing(S.restDur,S.restDur); },2000);
      }
    },1000);
  },
  resetRest() {
    clearInterval(S.restTimer); S.restRunning=false; S.restSec=S.restDur;
    $('rest-n').textContent=S.restDur; $('rest-start-btn').textContent='▶ INICIAR';
    $('ring-fg')?.classList.remove('urgent'); this.updateRing(S.restDur,S.restDur);
  },
  updateRing(rem,total) { if($('ring-fg')) $('ring-fg').style.strokeDashoffset=(2*Math.PI*44)*(1-Math.max(0,rem)/total); },

  startCircuitRest(num, sec) {
    $('circuit-popup')?.classList.remove('hidden');
    $('cp-title').textContent=`CIRCUITO ${num} COMPLETO`;
    $('cp-sub').textContent=`Descansando ${sec} segundos`;
    let r=sec; $('cp-timer').textContent=r;
    this.setRest(sec, document.querySelector('.pre.active'));
    clearInterval(S.circuitRestTimer);
    S.circuitRestTimer=setInterval(()=>{ r--; $('cp-timer').textContent=r; if(r<=0){clearInterval(S.circuitRestTimer);$('circuit-popup')?.classList.add('hidden');if(navigator.vibrate)navigator.vibrate([200,100,400]);toast('🔄 ¡Comienza el siguiente circuito!');} },1000);
  },
  skipCircuitRest() { clearInterval(S.circuitRestTimer); $('circuit-popup')?.classList.add('hidden'); toast('⏭ Descanso omitido'); },

  // ── EX SEARCH ──
  openSearch() { $('ex-search')?.classList.remove('hidden'); this.renderExRes(EX_DB,'ex-res'); setTimeout(()=>$('ex-q')?.focus(),100); },
  closeSearch() { $('ex-search')?.classList.add('hidden'); },
  searchEx(q) {
    const filt=document.querySelector('.mf.active')?.dataset.m||'all';
    let r=EX_DB; if(filt!=='all') r=r.filter(e=>e.muscle===filt); if(q) r=r.filter(e=>e.name.toLowerCase().includes(q.toLowerCase()));
    this.renderExRes(r,'ex-res');
  },
  buildMFilters() {
    const c=$('mfilters'); if(!c) return;
    c.innerHTML=MUSCLES.map(m=>`<button class="mf${m==='all'?' active':''}" data-m="${m}" onclick="App.fMuscle('${m}')">${ML[m]}</button>`).join('');
  },
  fMuscle(m) { document.querySelectorAll('.mf').forEach(b=>b.classList.remove('active')); document.querySelector(`.mf[data-m="${m}"]`)?.classList.add('active'); this.searchEx($('ex-q')?.value||''); },
  renderExRes(list,cid) {
    const c=$(cid); if(!c) return;
    c.innerHTML=list.length===0?'<p style="color:var(--wdim);padding:12px;text-align:center;font-size:12px">Sin resultados</p>':list.map(ex=>`<div class="ex-item" onclick="App.openExModal('${ex.id}')"><div class="ex-item-i">${ex.emoji}</div><div><div class="ex-item-nm">${ex.name}</div><div class="ex-item-tags">${ML[ex.muscle]} · ${EQL[ex.equip]||ex.equip} · ${DFL[ex.diff]}</div></div></div>`).join('');
  },
  openExModal(id) {
    const pickerOpen=!$('modal-expicker')?.classList.contains('hidden');
    const ex=EX_DB.find(e=>e.id===id); if(!ex) return;
    if (pickerOpen) {
      S.pickerSelEx=ex; $('picker-sel-name').textContent=`${ex.emoji} ${ex.name}`;
      $('picker-selected')?.classList.remove('hidden'); $('picker-results').innerHTML=''; $('picker-q').value=ex.name;
    } else {
      S.curEx=ex; S.modalSets=[];
      $('ex-m-name').textContent=ex.name.toUpperCase();
      $('ex-tags').innerHTML=`<span class="ex-tag">${ML[ex.muscle]}</span><span class="ex-tag">${EQL[ex.equip]||ex.equip}</span><span class="ex-tag">${DFL[ex.diff]}</span>`;
      $('ex-inst').textContent=ex.inst; $('ex-media').innerHTML=`<span id="ex-media-ph">${ex.emoji}</span>`;
      $('sets-done').innerHTML=''; $('sw').value=''; $('sr').value='';
      this.fetchGif(ex); this.openModal('modal-ex');
    }
  },
  async fetchGif(ex) {
    const mm={chest:'chest',back:'back',shoulders:'shoulders',biceps:'upper%20arms',triceps:'upper%20arms',legs:'upper%20legs',core:'waist'};
    try { const res=await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${mm[ex.muscle]||ex.muscle}?limit=80`,{headers:{'X-RapidAPI-Key':'DEMO_KEY','X-RapidAPI-Host':'exercisedb.p.rapidapi.com'}}); if(res.ok){const data=await res.json();const q=ex.name.toLowerCase().split(' ')[0];const m=data.find(d=>d.name.toLowerCase().includes(q));if(m?.gifUrl)$('ex-media').innerHTML=`<img src="${m.gifUrl}" alt="${ex.name}" onerror="this.parentElement.innerHTML='<span style=font-size:52px;opacity:.3>${ex.emoji}</span>'">`; } } catch(e){}
  },
  logSet() { const w=parseFloat($('sw').value)||0,r=parseInt($('sr').value); if(!r) return toast('Ingresa las repeticiones'); S.modalSets.push({weight:w,reps:r}); this.renderModalSets(); $('sr').value=''; },
  renderModalSets() { $('sets-done').innerHTML=S.modalSets.map((s,i)=>`<div class="sdr"><span class="sdr-n">SET ${i+1}</span><span class="sdr-d">${s.weight?s.weight+' kg':'PC'} × ${s.reps} reps</span></div>`).join(''); },
  confirmEx() {
    if(!S.curEx) return; if(S.modalSets.length===0) return toast('Agrega al menos una serie');
    const i=S.workLog.findIndex(e=>e.id===S.curEx.id);
    if(i!==-1) S.workLog[i].sets.push(...S.modalSets); else S.workLog.push({...S.curEx,sets:[...S.modalSets]});
    this.closeModal('modal-ex'); this.closeSearch(); this.renderLog();
    toast(`✅ ${S.curEx.name} · ${S.modalSets.length} series`); S.modalSets=[];
  },
  renderLog() {
    const c=$('ex-log'); if(!c) return;
    if(S.workLog.length===0){c.innerHTML='<div class="empty-log">Agrega ejercicios para registrar tu sesión 💪</div>';return;}
    let cn=0;
    c.innerHTML=S.workLog.map((ex,xi)=>{
      if(ex.type==='circuit_break'){cn++;return`<div class="circuit-divider">🔄 CIRCUITO ${cn} · ${ex.restSec}s desc.</div>`;}
      const sets=(ex.sets||[]).map((s,i)=>`<div class="log-set"><span class="sn">${i+1}</span><span class="sw">${s.weight?s.weight+' kg':'PC'}</span><span class="srp">${s.reps} reps</span><span class="sv">${s.weight?Math.round(s.weight*s.reps)+' kg':''}</span></div>`).join('');
      const detail=[ex.plannedSets&&`${ex.plannedSets}×${ex.plannedReps}`,ex.weight&&`${ex.weight}kg`,ex.restSec&&`${ex.restSec}s desc.`].filter(Boolean).join(' · ');
      const thumb=ex.imageData?`<img src="${ex.imageData}" alt="">`:ex.emoji;
      return`<div class="ex-log-item"><div class="log-head"><div class="log-ico">${thumb}</div><div style="flex:1;min-width:0"><div class="log-nm">${ex.name}</div><div class="log-mu">${ML[ex.muscle]||ex.muscle}</div>${detail?`<div class="log-detail">${detail}</div>`:''}</div></div>${sets}<div class="inline-add"><input type="number" placeholder="kg" id="iw${xi}" step="0.5"><input type="number" placeholder="reps" id="ir${xi}"><button class="btn-sm" onclick="App.inlineSet(${xi})">+ SET</button></div></div>`;
    }).join('');
    $('circuit-banner')?.classList.toggle('hidden',!S.workLog.some(i=>i.type==='circuit_break'));
  },
  inlineSet(xi) { const w=parseFloat($(`iw${xi}`)?.value)||0,r=parseInt($(`ir${xi}`)?.value); if(!r) return; if(!S.workLog[xi].sets) S.workLog[xi].sets=[]; S.workLog[xi].sets.push({weight:w,reps:r}); this.renderLog(); },

  // ── ROUTINES ──
  async renderTodayR() {
    const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today=days[new Date().getDay()];
    const rts=await DB.getRoutines();
    const r=rts.find(x=>(x.day_of_week||x.day)===today||(x.day_of_week||x.day)==='any');
    const c=$('today-r'); if(!c) return;
    if(!r){c.innerHTML=`<div class="no-r"><div>📋</div><p>Sin rutina para hoy</p><button class="btn-ghost" onclick="App.goTo('routines')" style="margin-top:8px;max-width:180px">Ver rutinas</button></div>`;return;}
    const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');
    c.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap"><div><div style="font-family:var(--fd);font-size:18px;letter-spacing:2px">${r.name}</div><div style="font-size:11px;color:var(--wdim)">${exs.length} ejercicios · ${DAL[r.day_of_week||r.day]}</div></div><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button></div><div style="display:flex;flex-wrap:wrap;gap:4px">${exs.slice(0,5).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}</div>`;
  },
  async renderRoutines() {
    const rts=await DB.getRoutines(); const c=$('routines-list'); if(!c) return;
    if(rts.length===0){c.innerHTML=`<div class="empty-log" style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:10px">📋</div><p>No tienes rutinas aún</p><button class="btn-ghost" onclick="App.openCreateRoutine()" style="margin-top:10px;max-width:200px">+ Crear primera rutina</button></div>`;return;}
    const tl={strength:'🏋️ Fuerza',hypertrophy:'💪 Hipertrofia',cardio:'🏃 Cardio',fullbody:'🔥 Full Body',ppl:'⚡ PPL',hiit:'💥 HIIT'};
    c.innerHTML=rts.map(r=>{const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');return`<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day_of_week||r.day]||r.day_of_week||r.day}</div></div><div class="rc-type">${tl[r.type]||r.type}</div><div class="rc-pills">${exs.slice(0,4).map(e=>`<span class="pill">${e.emoji||'💪'} ${e.name}</span>`).join('')}${exs.length>4?`<span class="pill">+${exs.length-4}</span>`:''}</div><div class="rc-actions"><button class="btn-sm" onclick="App.startRoutine('${r.id}')">▶ INICIAR</button><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️</button></div></div>`;}).join('');
  },
  openCreateRoutine() { S.rnExs=[]; S.pickerSelEx=null; S.pickerGenImg=null; $('rn-name').value=''; $('rn-exlist').innerHTML=''; this.openModal('modal-routine'); },
  addCircuitBreak() { const sec=parseInt($('rn-circuit-rest')?.value)||90; S.rnExs.push({type:'circuit_break',restSec:sec}); this.renderRnExList(); toast(`🔄 Separador de circuito (${sec}s desc.)`); },
  openExPicker() { S.pickerSelEx=null; S.pickerGenImg=null; $('picker-q').value=''; $('picker-selected')?.classList.add('hidden'); $('pex-weight').value=''; $('pex-sets').value='3'; $('pex-reps').value='10'; $('pex-rest').value='60'; $('pex-img-desc').value=''; $('pex-img-preview')?.classList.add('hidden'); this.renderExRes(EX_DB.slice(0,15),'picker-results'); this.openModal('modal-expicker'); },
  pickerSearch(q) { this.renderExRes((q?EX_DB.filter(e=>e.name.toLowerCase().includes(q.toLowerCase())):EX_DB).slice(0,12),'picker-results'); },
  clearPickerSel() { S.pickerSelEx=null; $('picker-selected')?.classList.add('hidden'); $('picker-q').value=''; this.renderExRes(EX_DB.slice(0,15),'picker-results'); },
  async genExerciseImage() {
    const desc=$('pex-img-desc')?.value?.trim(); if(!desc) return toast('Describe la imagen primero');
    const btn=$('pex-gen-btn'); btn.textContent='⏳ Generando...'; btn.disabled=true;
    const prev=$('pex-img-preview'); prev?.classList.remove('hidden');
    prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON IA...</span></div>';
    const url=await generateAIImage(desc,S.pickerSelEx?.name,S.pickerSelEx?.emoji);
    S.pickerGenImg=url; prev.innerHTML=`<img src="${url}" alt="Imagen ejercicio"><button class="btn-sm" onclick="App.genExerciseImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent='🎨 REGENERAR'; btn.disabled=false;
  },
  async confirmPickerEx() {
    const exBase=S.pickerSelEx; if(!exBase) return toast('Selecciona un ejercicio de la lista');
    S.rnExs.push({...exBase,plannedSets:parseInt($('pex-sets')?.value)||3,plannedReps:parseInt($('pex-reps')?.value)||10,restSec:parseInt($('pex-rest')?.value)||60,weight:parseFloat($('pex-weight')?.value)||null,imageData:S.pickerGenImg||null,sets:[]});
    this.renderRnExList(); this.closeModal('modal-expicker'); toast(`✅ ${exBase.name} agregado`); S.pickerSelEx=null; S.pickerGenImg=null;
  },
  renderRnExList() {
    const c=$('rn-exlist'); if(!c) return; let cn=0;
    c.innerHTML=S.rnExs.map((ex,i)=>{
      if(ex.type==='circuit_break'){cn++;return`<div class="rn-circuit-break"><span class="rn-cb-label">🔄 CIRCUITO ${cn} · ${ex.restSec}s desc.</span><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div>`;}
      const thumb=ex.imageData?`<img src="${ex.imageData}" alt="">`:ex.emoji;
      const detail=[ex.plannedSets&&`${ex.plannedSets}×${ex.plannedReps}`,ex.weight&&`${ex.weight}kg`,ex.restSec&&`${ex.restSec}s desc.`].filter(Boolean).join(' · ');
      return`<div class="rn-ex"><div class="rn-ex-head"><div class="rn-ex-ico">${thumb}</div><div style="flex:1;min-width:0"><div class="rn-ex-nm">${ex.name}</div>${detail?`<div class="rn-ex-detail">${detail}</div>`:''}</div><button class="rn-rm" onclick="App.rmRnEx(${i})">✕</button></div></div>`;
    }).join('');
  },
  rmRnEx(i) { S.rnExs.splice(i,1); this.renderRnExList(); },
  async saveRoutine() {
    const name=v('rn-name'); if(!name) return toast('Dale un nombre a la rutina');
    if(S.rnExs.filter(e=>e.type!=='circuit_break').length===0) return toast('Agrega al menos un ejercicio');
    const routine={name,type:$('rn-type')?.value,day:$('rn-day')?.value,exercises:S.rnExs,circuitRest:parseInt($('rn-circuit-rest')?.value)||90};
    await DB.saveRoutine(routine);
    this.closeModal('modal-routine'); await this.renderRoutines();
    toast(`✅ Rutina "${name}" guardada`); await this.addXP(50);
  },
  async delRoutine(id) { if(!confirm('¿Eliminar esta rutina?')) return; await DB.deleteRoutine(id); await this.renderRoutines(); },
  async startRoutine(id) {
    const rts=await DB.getRoutines(); const r=rts.find(x=>x.id===id); if(!r) return;
    S.workLog=(r.exercises||[]).map(ex=>ex.type==='circuit_break'?{...ex}:{...ex,sets:[]});
    this.startWorkout();
    setTimeout(()=>{ this.renderLog(); const f=S.workLog.find(e=>e.type!=='circuit_break'); if(f?.restSec) this.setRest(f.restSec,document.querySelector('.pre.active')); toast(`🏋️ "${r.name}" cargada`); },300);
  },

  // ── CHALLENGES ──
  async renderChallenges() {
    const chs=await DB.getChallenges(); const c=$('challenges'); if(!c) return;
    if(chs.length===0){c.innerHTML='<div style="text-align:center;padding:20px;color:var(--wdim);font-size:13px">El coach no ha creado retos todavía</div>';return;}
    c.innerHTML=chs.map(ch=>{
      const pct=Math.min(((ch.progress||0)/(ch.target_value||ch.target||1))*100,100);
      const img=ch.image_data?`<div class="ch-img"><img src="${ch.image_data}" alt="${ch.name}"></div>`:`<div class="ch-img"><span>${ch.icon||'🎯'}</span></div>`;
      return`<div class="ch-card">${img}<div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.description||ch.desc||''}</div><div class="ch-prog"><div class="ch-bar" style="width:${pct}%"></div></div><div class="ch-info-row"><span class="ch-nums">${Math.round(ch.progress||0).toLocaleString()} / ${(ch.target_value||ch.target||0).toLocaleString()}</span><span class="ch-reward">${ch.reward}</span></div></div></div>`;
    }).join('');
  },
  async openCreateChallenge(editId) {
    S.editingChId=editId||null; S.chGenImg=null;
    const chs=editId?await DB.getChallenges():[];
    const existing=editId?chs.find(c=>c.id==editId):null;
    $('ch-modal-title').textContent=editId?'EDITAR RETO':'CREAR RETO';
    $('ch-name').value=existing?.name||''; $('ch-desc').value=existing?.description||existing?.desc||'';
    $('ch-reward').value=existing?.reward||''; $('ch-target').value=existing?.target_value||existing?.target||'';
    $('ch-img-desc').value=''; const prev=$('ch-img-preview'); prev?.classList.add('hidden');
    S.chGenImg=existing?.image_data||null;
    if(S.chGenImg){prev?.classList.remove('hidden');prev.innerHTML=`<img src="${S.chGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)">`;}
    this.openModal('modal-challenge');
  },
  async genChallengeImage() {
    const desc=$('ch-img-desc')?.value?.trim()||`Imagen épica para el reto "${$('ch-name')?.value||'fitness'}"`;
    const btn=$('ch-gen-btn'); btn.textContent='⏳ Generando...'; btn.disabled=true;
    const prev=$('ch-img-preview'); prev?.classList.remove('hidden');
    prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON IA...</span></div>';
    const url=await generateAIImage(desc,$('ch-name')?.value,null);
    S.chGenImg=url; prev.innerHTML=`<img src="${url}" alt="Reto" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)"><button class="btn-sm" onclick="App.genChallengeImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent='🎨 REGENERAR'; btn.disabled=false;
  },
  async saveChallenge() {
    const name=v('ch-name'); if(!name) return toast('Dale un nombre al reto');
    const ch={id:S.editingChId||null,name,desc:v('ch-desc'),reward:v('ch-reward')||'XP',type:$('ch-type')?.value||'custom',target:parseInt($('ch-target')?.value)||10,progress:0,imageData:S.chGenImg||null,icon:'🎯'};
    await DB.saveChallenge(ch); this.closeModal('modal-challenge'); await this.renderChallenges();
    if(S.isCoach) await this.renderCoachChallenges();
    toast(`✅ Reto "${name}" ${S.editingChId?'actualizado':'creado'}`); S.chGenImg=null; S.editingChId=null;
  },
  async renderCoachChallenges() {
    const chs=await DB.getChallenges(); const c=$('coach-challenges-list'); if(!c) return;
    if(chs.length===0){c.innerHTML='<div class="empty-log">No has creado retos aún</div>';return;}
    c.innerHTML=chs.map(ch=>{const img=ch.image_data?`<img src="${ch.image_data}" alt="" style="width:100%;height:100%;object-fit:cover">`:ch.icon||'🎯';return`<div class="ch-card"><div class="ch-img">${img}</div><div class="ch-body"><div class="ch-name">${ch.name}</div><div class="ch-desc">${ch.description||ch.desc||''}</div><div class="ch-reward">${ch.reward}</div></div><div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0"><button class="btn-sm" onclick="App.openCreateChallenge('${ch.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delChallenge('${ch.id}')">🗑️</button></div></div>`;}).join('');
  },
  async delChallenge(id) { if(!confirm('¿Eliminar este reto?')) return; await DB.deleteChallenge(id); await this.renderCoachChallenges(); await this.renderChallenges(); },

  // ── ACHIEVEMENTS ──
  buildAchFilters() {
    const c=$('ach-filters'); if(!c) return;
    c.innerHTML=ACH_CATS.map(cat=>`<button class="ach-f${cat==='all'?' active':''}" onclick="App.filterAch('${cat}')">${ACH_CAT_L[cat]}</button>`).join('');
  },
  async filterAch(cat) { S.achFilter=cat; document.querySelectorAll('.ach-f').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); await this.renderAchs(); },
  async renderAchs() {
    const ul=S.user?.achievements||[], allAchs=await DB.getAchs();
    const list=S.achFilter==='all'?allAchs:allAchs.filter(a=>(a.cat||a.category)===S.achFilter);
    $('ach-grid').innerHTML=list.map(a=>{
      const u=ul.includes(a.id);
      const imgEl=u&&a.image_data?`<img class="ag-img" src="${a.image_data}" alt="${a.name}">`:`<div class="ag-ico">${u?a.icon:'🔒'}</div>`;
      return`<div class="ag ${u?'on':'off'}">${u?'<span class="ag-badge">✅</span>':''}${imgEl}<div class="ag-nm">${a.name}</div><div class="ag-desc">${a.description||a.desc||''}</div><div class="ag-xp" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP</div></div>`;
    }).join('');
  },
  async renderRecentAchs() {
    const ul=S.user?.achievements||[]; const c=$('recent-ach'); if(!c) return;
    if(ul.length===0){c.innerHTML='<div class="ach-mini"><div class="ach-mini-i">🔒</div><div class="ach-mini-n">???</div></div>'.repeat(3);return;}
    const allAchs=await DB.getAchs();
    c.innerHTML=ul.slice(-5).reverse().map(id=>{const a=allAchs.find(x=>x.id===id);return a?`<div class="ach-mini on">${a.image_data?`<img src="${a.image_data}" style="width:32px;height:32px;border-radius:7px;object-fit:cover">`:`<div class="ach-mini-i">${a.icon}</div>`}<div class="ach-mini-n">${a.name}</div></div>`:'';}).join('');
  },
  async openCreateAchievement(editId) {
    S.editingAchId=editId||null; S.achGenImg=null;
    const allAchs=editId?await DB.getAchs():[];
    const existing=editId?allAchs.find(a=>a.id===editId):null;
    $('ach-modal-title').textContent=editId?'EDITAR LOGRO':'CREAR LOGRO';
    $('ach-name').value=existing?.name||''; $('ach-desc').value=existing?.description||existing?.desc||'';
    $('ach-xp').value=existing?.xp||''; $('ach-rarity').value=existing?.rarity||'common';
    $('ach-cat').value=existing?.cat||existing?.category||'special'; $('ach-icon').value=existing?.icon||'';
    $('ach-edit-id').value=editId||''; $('ach-img-desc').value='';
    const prev=$('ach-img-preview'); prev?.classList.add('hidden');
    S.achGenImg=existing?.image_data||null;
    if(S.achGenImg){prev?.classList.remove('hidden');prev.innerHTML=`<img src="${S.achGenImg}" alt="" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)">`;}
    this.openModal('modal-achievement');
  },
  async genAchievementImage() {
    const desc=$('ach-img-desc')?.value?.trim()||`Imagen para el logro "${$('ach-name')?.value||'fitness'}"`;
    const btn=$('ach-gen-btn'); btn.textContent='⏳ Generando...'; btn.disabled=true;
    const prev=$('ach-img-preview'); prev?.classList.remove('hidden');
    prev.innerHTML='<div class="ai-loading"><span style="font-size:32px">🎨</span><span class="ai-loading-txt">GENERANDO CON IA...</span></div>';
    const url=await generateAIImage(desc,$('ach-name')?.value,$('ach-icon')?.value);
    S.achGenImg=url; prev.innerHTML=`<img src="${url}" alt="Logro" style="width:150px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--borderb)"><button class="btn-sm" onclick="App.genAchievementImage()" style="margin-top:6px">↺ REGENERAR</button>`;
    btn.textContent='🎨 REGENERAR'; btn.disabled=false;
  },
  async saveAchievement() {
    const name=v('ach-name'); if(!name) return toast('Dale un nombre al logro');
    const editId=v('ach-edit-id');
    const ach={id:editId||('custom_'+Date.now()),name,desc:v('ach-desc'),description:v('ach-desc'),xp:parseInt($('ach-xp')?.value)||100,rarity:$('ach-rarity')?.value||'common',cat:$('ach-cat')?.value||'special',category:$('ach-cat')?.value||'special',icon:v('ach-icon')||'🏆',image_data:S.achGenImg||null};
    await DB.saveAch(ach); this.closeModal('modal-achievement'); await this.renderCoachAchievements(); await this.renderAchs();
    toast(`✅ Logro "${name}" ${editId?'actualizado':'creado'}`); S.achGenImg=null; S.editingAchId=null;
  },
  async renderCoachAchievements() {
    const achs=await DB.getAchs(); const c=$('coach-achievements-list'); if(!c) return;
    c.innerHTML=achs.map(a=>{const img=a.image_data?`<img src="${a.image_data}" alt="" style="width:100%;height:100%;object-fit:cover">`:a.icon;return`<div class="coach-ach-item"><div class="cai-img">${img}</div><div class="cai-info"><div class="cai-name">${a.name}</div><div class="cai-meta" style="color:${RC[a.rarity]}">${RL[a.rarity]} · +${a.xp} XP · ${ACH_CAT_L[a.cat||a.category]||a.cat||a.category}</div></div><div class="cai-actions"><button class="btn-sm" onclick="App.openCreateAchievement('${a.id}')">✏️</button><button class="btn-danger-sm" onclick="App.delAchievement('${a.id}')">🗑️</button></div></div>`;}).join('');
  },
  async delAchievement(id) {
    const def=DEFAULT_ACHS.find(a=>a.id===id);
    if(def&&!confirm(`"${def.name}" es un logro predeterminado. ¿Eliminarlo?`)) return;
    if(!def&&!confirm('¿Eliminar este logro?')) return;
    await DB.deleteAch(id); await this.renderCoachAchievements(); await this.renderAchs(); toast('🗑️ Logro eliminado');
  },
  async tryUnlock(id, vals) {
    if(!S.user) return;
    if(!S.user.achievements) S.user.achievements=[];
    if(S.user.achievements.includes(id)) return;
    const allAchs=await DB.getAchs();
    const a=allAchs.find(x=>x.id===id); if(!a) return;
    const checks={first_session:()=>vals.sessions>=1,ten_sessions:()=>vals.sessions>=10,fifty_sessions:()=>vals.sessions>=50,hundred_sessions:()=>vals.sessions>=100,streak_7:()=>vals.streak>=7,streak_30:()=>vals.streak>=30,bench_100:()=>vals.bench_press>=100,bench_140:()=>vals.bench_press>=140,squat_100:()=>vals.squat>=100,deadlift_100:()=>vals.deadlift>=100,deadlift_200:()=>vals.deadlift>=200,curl_40:()=>vals.bicep_curl>=40,pullups_15:()=>vals.pullups>=15,cardio_30:()=>vals.cardio_minutes>=30,volume_10k:()=>vals.session_volume>=10000,early_bird:()=>true,night_owl:()=>true,level_5:()=>vals.level>=5,level_10:()=>vals.level>=10};
    if(checks[id]&&checks[id]()) { S.user.achievements.push(id); setTimeout(()=>{this.showAchPopup(a);playRoar();},800); }
  },
  showAchPopup(a) {
    $('pop-ico').textContent=a.icon; $('pop-name').textContent=a.name; $('pop-desc').textContent=a.description||a.desc||''; $('pop-xp').textContent=`+${a.xp} XP`;
    const ci=$('pop-ch-img'); ci?.classList.add('hidden');
    if(a.image_data){ci.innerHTML=`<img src="${a.image_data}" alt="${a.name}">`;ci?.classList.remove('hidden');}
    $('ach-popup')?.classList.remove('hidden'); if(navigator.vibrate) navigator.vibrate([100,50,100,50,300]);
  },
  closeAchPopup() { $('ach-popup')?.classList.add('hidden'); this.updateUI(); },

  // ── XP ──
  async addXP(amt) {
    if(!S.user) return;
    const prev=Math.floor((S.user.xp||0)/1000)+1;
    S.user.xp=(S.user.xp||0)+amt;
    const nw=Math.floor(S.user.xp/1000)+1;
    if(nw>prev){await this.tryUnlock('level_5',{level:nw});await this.tryUnlock('level_10',{level:nw});setTimeout(()=>{this.showAchPopup({icon:'⬆️',name:`¡NIVEL ${nw}!`,description:TITLES[Math.min(nw-1,TITLES.length-1)],xp:0,image_data:null});playRoar();},1200);}
    await DB.saveUser(S.user);
  },

  // ── LEADERBOARD ──
  async renderLeaderboardMini() {
    const c=$('leaderboard-mini'); if(!c) return;
    const users=await DB.getAllUsers();
    const sorted=[...users].sort((a,b)=>(b.total_volume||0)-(a.total_volume||0)).slice(0,3);
    if(sorted.length===0){c.innerHTML='<p style="color:var(--wdim);font-size:12px;text-align:center;padding:12px">Completa sesiones para aparecer en el ranking</p>';return;}
    const medals=['🥇','🥈','🥉'];
    c.innerHTML=sorted.map((u,i)=>`<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i===0?' gold-rank':''}">${medals[i]}</div><div class="lb-name">${u.name}</div><div class="lb-val">${Math.round((u.total_volume||0)/1000)}t vol.</div></div>`).join('');
  },
  async renderLeaderboard() {
    const c=$('leaderboard-full'); if(!c) return;
    const users=await DB.getAllUsers();
    let sorted;
    if(S.lbMode==='weekly') sorted=[...users].sort((a,b)=>this.weekVol(b)-this.weekVol(a));
    else if(S.lbMode==='total') sorted=[...users].sort((a,b)=>(b.total_volume||0)-(a.total_volume||0));
    else sorted=[...users].sort((a,b)=>(b.streak||0)-(a.streak||0));
    const medals=['🥇','🥈','🥉'];
    c.innerHTML=sorted.map((u,i)=>{const val=S.lbMode==='weekly'?`${Math.round(this.weekVol(u)/1000)}t sem.`:S.lbMode==='total'?`${Math.round((u.total_volume||0)/1000)}t total`:`${u.streak||0}d racha`;return`<div class="lb-item${u.id===S.user?.id?' me':''}"><div class="lb-rank${i<3?' gold-rank':''}">${i<3?medals[i]:i+1}</div><div class="lb-name">${u.name} <span style="color:var(--wdim);font-size:11px">@${u.username}</span></div><div class="lb-val">${val}</div></div>`;}).join('')||'<p style="color:var(--wdim);padding:20px;text-align:center">No hay atletas aún</p>';
  },
  weekVol(u) { const now=Date.now(),week=7*24*3600*1000; return(u.workout_history_summary||[]).filter(w=>now-new Date(w.date||w.created_at).getTime()<week).reduce((s,w)=>s+(w.volume||w.total_volume||0),0); },
  async lbTab(mode,btn) { S.lbMode=mode; document.querySelectorAll('.lb-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); await this.renderLeaderboard(); },

  // ── ACTIVITY CAL ──
  renderActCal() {
    const hist=(S.user?.workout_history||[]).map(w=>new Date(w.date||w.created_at).toDateString());
    const today=new Date(); let dots='';
    for(let i=27;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const ds=d.toDateString();dots+=`<div class="cal-dot${hist.includes(ds)?' on':''}${ds===today.toDateString()?' today':''}" title="${d.toLocaleDateString()}"></div>`;}
    $('act-cal').innerHTML=dots;
  },

  // ── CHARTS ──
  buildChartSel() { $('chart-sel').innerHTML=EX_DB.filter(e=>e.track).map(e=>`<button class="csel-btn${e.track===S.selChartEx?' active':''}" onclick="App.selChart('${e.track}')">${e.emoji} ${e.name}</button>`).join(''); },
  async selChart(t) { S.selChartEx=t; document.querySelectorAll('.csel-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); await this.renderCharts(); },
  async renderCharts() {
    const hist=await DB.getWorkoutHistory();
    const exData=[];
    hist.forEach(sess=>{const dbEx=EX_DB.find(d=>d.track===S.selChartEx);const exS=(sess.exercises||[]).find(e=>dbEx&&e.name===dbEx.name);if(exS?.sets?.length>0){const mw=Math.max(...exS.sets.map(s=>s.weight||0));if(mw>0)exData.push({date:new Date(sess.created_at||sess.date).toLocaleDateString('es',{month:'short',day:'numeric'}),weight:mw});}});
    const co={responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:'#f0eaff',font:{family:'Orbitron',size:9}}}},scales:{x:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9},maxRotation:0},grid:{color:'rgba(255,255,255,.03)'}},y:{ticks:{color:'rgba(240,234,255,.45)',font:{size:9}},grid:{color:'rgba(255,255,255,.05)'},beginAtZero:false}}};
    const c1=$('prog-chart')?.getContext('2d'); if(!c1) return;
    if(S.progChart) S.progChart.destroy();
    S.progChart=new Chart(c1,{type:'line',data:{labels:exData.slice(-8).map(d=>d.date),datasets:[{label:'Peso máx (kg)',data:exData.slice(-8).map(d=>d.weight),borderColor:'#f5c518',backgroundColor:'rgba(245,197,24,.08)',pointBackgroundColor:'#f5c518',pointRadius:4,tension:.4,fill:true}]},options:co});
    const wv=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toDateString();const s=hist.find(h=>new Date(h.created_at||h.date).toDateString()===ds);wv.push({day:d.toLocaleDateString('es',{weekday:'short'}),vol:s?.total_volume||s?.volume||0});}
    const c2=$('vol-chart')?.getContext('2d'); if(!c2) return;
    if(S.volChart) S.volChart.destroy();
    S.volChart=new Chart(c2,{type:'bar',data:{labels:wv.map(d=>d.day),datasets:[{label:'Volumen (kg)',data:wv.map(d=>d.vol),backgroundColor:'rgba(245,197,24,.55)',borderColor:'#f5c518',borderWidth:1,borderRadius:5}]},options:{...co,scales:{...co.scales,y:{...co.scales.y,beginAtZero:true}}}});
  },
  renderRecords() {
    const r=S.user?.records||{},tracked=EX_DB.filter(e=>e.track&&r[e.track]);
    $('records').innerHTML=tracked.length===0?'<div class="empty-log" style="grid-column:1/-1">Completa sesiones para ver tus récords</div>':tracked.map(ex=>`<div class="rec-card"><div class="rec-ico">${ex.emoji}</div><div class="rec-ex">${ex.name.toUpperCase()}</div><div class="rec-val">${r[ex.track]}</div><div class="rec-unit">kg · Récord Personal</div></div>`).join('');
  },

  // ── PHOTOS ──
  addPhoto() {
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.capture='user';
    inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=async ev=>{const compressed=await compressImage(ev.target.result,600,0.75);const ph=JSON.parse(localStorage.getItem('cl_ph_'+S.user.id)||'[]');ph.push({date:new Date().toISOString(),src:compressed});localStorage.setItem('cl_ph_'+S.user.id,JSON.stringify(ph));await this.renderPhotos();toast('📸 Foto guardada y comprimida');};rd.readAsDataURL(f);};
    inp.click();
  },
  async renderPhotos() {
    const ph=JSON.parse(localStorage.getItem('cl_ph_'+(S.user?.id||''))||'[]');
    $('photos').innerHTML=[...ph.slice(-9).reverse().map(p=>`<div class="photo-c"><img src="${p.src}"><div class="photo-date">${new Date(p.date).toLocaleDateString('es',{month:'short',day:'numeric'})}</div></div>`),`<div class="photo-c" onclick="App.addPhoto()" style="border-style:dashed;cursor:pointer"><span>📷</span></div>`].join('');
  },

  // ── CALCULATORS ──
  openCalc(t) {
    const titles={'1rm':'🏋️ CALCULADORA 1RM',cal:'🔥 CALORÍAS QUEMADAS',macros:'🥩 MACROS DIARIOS',bmi:'📊 ÍNDICE DE MASA CORPORAL'};
    $('calc-title').textContent=titles[t];
    const w=S.user?.weight||'',h=S.user?.height||'',age=S.user?.age||'';
    const b={'1rm':`<div class="calc-sec"><p style="font-size:11px;color:var(--wdim)">Fórmula de Epley: peso × (1 + reps/30)</p><div class="field"><span>⚖️</span><input id="c-w" type="number" placeholder="Peso usado (kg)"></div><div class="field"><span>🔢</span><input id="c-r" type="number" placeholder="Repeticiones"></div><button class="btn-gold" onclick="App.c1rm()">CALCULAR</button><div id="calc-out"></div></div>`,cal:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw" type="number" placeholder="Tu peso (kg)" value="${w}"></div><div class="field"><span>⏱️</span><input id="c-min" type="number" placeholder="Duración (min)"></div><div class="field"><span>🏃</span><select id="c-act"><option value="3.5">Pesas moderado</option><option value="5">Pesas intenso</option><option value="7">Cardio moderado</option><option value="10">HIIT</option><option value="12">Correr rápido</option></select></div><button class="btn-gold" onclick="App.cCal()">CALCULAR</button><div id="calc-out"></div></div>`,macros:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-mw" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-mh" type="number" placeholder="Altura (cm)" value="${h}"></div><div class="field"><span>🎂</span><input id="c-ma" type="number" placeholder="Edad" value="${age}"></div><div class="field"><span>⚧️</span><select id="c-mg"><option value="m">Masculino</option><option value="f">Femenino</option></select></div><div class="field"><span>📅</span><select id="c-act2"><option value="1.375">Ligero (1-3/sem)</option><option value="1.55">Moderado (3-5/sem)</option><option value="1.725">Activo (6-7/sem)</option></select></div><button class="btn-gold" onclick="App.cMacros()">CALCULAR</button><div id="calc-out"></div></div>`,bmi:`<div class="calc-sec"><div class="field"><span>⚖️</span><input id="c-bw2" type="number" placeholder="Peso (kg)" value="${w}"></div><div class="field"><span>📏</span><input id="c-bh" type="number" placeholder="Altura (cm)" value="${h}"></div><button class="btn-gold" onclick="App.cBMI()">CALCULAR</button><div id="calc-out"></div></div>`};
    $('calc-body').innerHTML=b[t]||''; this.openModal('modal-calc');
  },
  c1rm(){const w=parseFloat($('c-w')?.value),r=parseInt($('c-r')?.value);if(!w||!r)return toast('Completa los campos');const rm=(w*(1+r/30)).toFixed(1);$('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${rm} kg</div><div class="calc-lbl">1RM estimado · ${Math.round(rm*0.85)} kg × 3 reps · ${Math.round(rm*0.75)} kg × 8 reps</div></div>`;},
  cCal(){const bw=parseFloat($('c-bw')?.value),min=parseInt($('c-min')?.value),met=parseFloat($('c-act')?.value)||3.5;if(!bw||!min)return toast('Completa los campos');const cal=Math.round(met*bw*min/60*3.5/200*bw);$('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${cal} kcal</div><div class="calc-lbl">Estimado en ${min} min</div></div>`;},
  cMacros(){const w=parseFloat($('c-mw')?.value),h=parseFloat($('c-mh')?.value),a=parseInt($('c-ma')?.value),g=$('c-mg')?.value,act=parseFloat($('c-act2')?.value)||1.55;if(!w||!h||!a)return toast('Completa los campos');const bmr=g==='m'?(10*w)+(6.25*h)-(5*a)+5:(10*w)+(6.25*h)-(5*a)-161;const tdee=Math.round(bmr*act);const goal=S.user?.goal||'hypertrophy';const kcal=goal==='weightloss'?tdee-400:['strength','hypertrophy'].includes(goal)?tdee+200:tdee;const prot=Math.round(w*2.2),fat=Math.round(kcal*0.25/9),carbs=Math.round((kcal-prot*4-fat*9)/4);$('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val">${kcal} kcal</div><div class="calc-lbl">Calorías diarias</div></div><div class="macro-g"><div class="macro-i"><div class="macro-v">${prot}g</div><div class="macro-l">🥩 PROTEÍNA</div></div><div class="macro-i"><div class="macro-v">${carbs}g</div><div class="macro-l">🍚 CARBOS</div></div><div class="macro-i"><div class="macro-v">${fat}g</div><div class="macro-l">🥑 GRASA</div></div></div>`;},
  async cBMI(){const w=parseFloat($('c-bw2')?.value),h=parseFloat($('c-bh')?.value);if(!w||!h)return toast('Completa los campos');const bmi=(w/Math.pow(h/100,2)).toFixed(1);const cat=bmi<18.5?'Bajo peso':bmi<25?'Peso saludable ✅':bmi<30?'Sobrepeso':bmi<35?'Obesidad I':'Obesidad II+';const col=bmi<18.5?'#00e5ff':bmi<25?'#76ff03':bmi<30?'#f5c518':bmi<35?'#ff9800':'#e53935';if(S.user){S.user.bmi=bmi;await DB.saveUser(S.user);}$('calc-out').innerHTML=`<div class="calc-res"><div class="calc-val" style="color:${col}">${bmi}</div><div class="calc-lbl">${cat}</div></div>`;},

  // ── COACH ──
  async renderCoach() {
    const users=await DB.getAllUsers();
    const c=$('athletes-list'); if(!c) return;
    c.innerHTML=users.length===0?'<div class="empty-log">No hay atletas registrados aún</div>':users.map(u=>`<div class="ath-card"><div class="ath-ico">🦁</div><div class="ath-info"><div class="ath-name">${u.name} <span style="color:var(--gold);font-size:11px">@${u.username}</span></div><div class="ath-stats">⚡ ${u.xp||0} XP · 💪 ${u.sessions||0} ses · 🔥 ${u.streak||0}d racha</div><div class="ath-goal">${GL[u.goal]||'Sin objetivo'} · ${u.weight||'?'}kg · Nv.${Math.floor((u.xp||0)/1000)+1}</div></div></div>`).join('');
    const opts=users.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('');
    if($('assign-user')) $('assign-user').innerHTML='<option value="">Atleta...</option>'+opts;
    if($('msg-user')) $('msg-user').innerHTML='<option value="">Atleta...</option>'+opts;
    const rts=await DB.getRoutines();
    if($('assign-routine')) $('assign-routine').innerHTML='<option value="">Rutina...</option>'+rts.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    await this.renderCoachRoutines(); await this.renderCoachChallenges(); await this.renderCoachAchievements(); await this.renderSentMsgs();
  },
  async renderCoachRoutines() {
    const rts=await DB.getRoutines(); const c=$('coach-routines-list'); if(!c) return;
    if(rts.length===0){c.innerHTML='<div class="empty-log">Crea tu primera rutina</div>';return;}
    const tl={strength:'🏋️ Fuerza',hypertrophy:'💪 Hipertrofia',cardio:'🏃 Cardio',fullbody:'🔥 Full Body',ppl:'⚡ PPL',hiit:'💥 HIIT'};
    c.innerHTML=rts.map(r=>{const exs=(r.exercises||[]).filter(e=>e.type!=='circuit_break');return`<div class="rc"><div class="rc-head"><div class="rc-name">${r.name}</div><div class="rc-day">${DAL[r.day_of_week||r.day]||r.day_of_week}</div></div><div class="rc-type">${tl[r.type]||r.type} · ${exs.length} ejercicios</div><div class="rc-actions"><button class="btn-danger-sm" onclick="App.delRoutine('${r.id}')">🗑️ Borrar</button></div></div>`;}).join('');
  },
  async assignRoutine() {
    const uid=$('assign-user')?.value,rid=$('assign-routine')?.value;
    if(!uid||!rid) return toast('Selecciona atleta y rutina');
    const rts=await DB.getRoutines(); const r=rts.find(x=>x.id===rid); if(!r) return;
    await DB.saveRoutine({...r,id:null},uid);
    toast(`✅ Rutina asignada`);
  },
  async sendMsg() {
    const uid=$('msg-user')?.value,txt=$('msg-text')?.value?.trim();
    if(!uid||!txt) return toast('Selecciona atleta y escribe el mensaje');
    await DB.sendMessage(uid,txt,S.user.name);
    $('msg-text').value=''; await this.renderSentMsgs(); toast(`💬 Mensaje enviado`);
  },
  async renderSentMsgs() {
    const c=$('sent-msgs'); if(!c) return;
    c.innerHTML='<div class="empty-log">Cargando...</div>';
    const msgs=await DB.getSentMessages(S.user?.id);
    c.innerHTML=msgs.length===0?'<div class="empty-log">No has enviado mensajes aún</div>':msgs.map(m=>`<div class="sent-msg"><div class="sm-to">PARA: ${m.to_user_id}</div><div class="sm-txt">${m.message}</div><div class="sm-date">${new Date(m.created_at).toLocaleDateString('es',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div></div>`).join('');
  },
  async checkCoachMsg() {
    if(!S.user) return;
    try {
      const msgs=await DB.getUnreadMessages(S.user.id);
      if(msgs.length>0){
        const latest=msgs[msgs.length-1];
        setTimeout(()=>{ $('coach-msg-txt').textContent=`"${latest.message}" — ${latest.from_name}`; $('coach-popup')?.classList.remove('hidden'); DB.markMessagesRead(S.user.id); },2000);
      }
    } catch(e){}
  },
  closeCoachPopup(){$('coach-popup')?.classList.add('hidden');},

  // ── MODALS ──
  openModal(id){$(id)?.classList.remove('hidden');},
  closeModal(id){$(id)?.classList.add('hidden');},

  // ── NOTIFS ──
  checkNotif(){if('Notification' in window&&Notification.permission==='default')setTimeout(()=>$('notif-bar')?.classList.remove('hidden'),3000);},
  reqNotif(){Notification.requestPermission().then(()=>this.dimNotif());toast('🔔 Notificaciones activadas');},
  dimNotif(){$('notif-bar')?.classList.add('hidden');},

  // ── MISC ──
  async updateWeight(){const w=prompt('Nuevo peso (kg):',S.user?.weight||'');if(!w)return;S.user.weight=parseFloat(w);if(S.user.height)S.user.bmi=(S.user.weight/Math.pow(S.user.height/100,2)).toFixed(1);await DB.saveUser(S.user);await this.updateUI();toast(`⚖️ ${w} kg guardado`);},
  exportData(){const b=new Blob([JSON.stringify(S.user,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`coach-lion-${S.user.username}-${new Date().toISOString().split('T')[0]}.json`;a.click();URL.revokeObjectURL(a.href);toast('📤 Datos exportados');},
  async reqWL(){try{if('wakeLock' in navigator)await navigator.wakeLock.request('screen');}catch(e){}},
};

// Add supabase CDN to index.html before app loads
document.addEventListener('DOMContentLoaded',()=>App.init());
