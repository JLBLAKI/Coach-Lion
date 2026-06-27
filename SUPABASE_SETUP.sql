-- ═══════════════════════════════════════════════════
-- COACH LION v6 — GUÍA SQL COMPLETA PARA SUPABASE
-- Ejecuta este script completo en:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════


-- ══════════════════════════════
-- 1. TABLA DE USUARIOS
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY,  -- viene de Supabase Auth
  name          TEXT NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  weight        DECIMAL(5,2),
  height        DECIMAL(5,2),
  age           INTEGER,
  days_per_week INTEGER,
  goal          TEXT,
  level         TEXT,
  bmi           DECIMAL(4,1),
  xp            INTEGER DEFAULT 0,
  sessions      INTEGER DEFAULT 0,
  streak        INTEGER DEFAULT 0,
  last_session  TIMESTAMPTZ,
  achievements  JSONB DEFAULT '[]'::jsonb,
  records       JSONB DEFAULT '{}'::jsonb,
  total_volume  DECIMAL DEFAULT 0,
  coach_messages JSONB DEFAULT '[]'::jsonb,
  -- resumen liviano del historial para el leaderboard
  workout_history_summary JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 2. TABLA DE RUTINAS
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.routines (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT,
  day_of_week  TEXT,
  exercises    JSONB DEFAULT '[]'::jsonb,
  circuit_rest INTEGER DEFAULT 90,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 3. TABLA DE SESIONES DE ENTRENAMIENTO
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exercises        JSONB DEFAULT '[]'::jsonb,
  total_volume     DECIMAL DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 4. TABLA DE RETOS (creados por el coach)
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.challenges (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  reward           TEXT,
  challenge_type   TEXT DEFAULT 'custom',
  target_value     DECIMAL DEFAULT 0,
  image_data       TEXT,  -- base64 o URL de imagen
  icon             TEXT DEFAULT '🎯',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 5. TABLA DE DEFINICIONES DE LOGROS (editables por el coach)
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id          TEXT PRIMARY KEY,  -- ej: 'bench_100', 'custom_123'
  name        TEXT NOT NULL,
  description TEXT,
  xp          INTEGER DEFAULT 100,
  rarity      TEXT DEFAULT 'common',
  category    TEXT DEFAULT 'special',
  icon        TEXT DEFAULT '🏆',
  image_data  TEXT,  -- base64 o URL
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 6. TABLA DE MENSAJES DEL COACH
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_user_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  from_name   TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════
-- 7. TABLA DE FOTOS DE PROGRESO
-- (opcional - las fotos también se pueden guardar en localStorage)
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  photo_data TEXT NOT NULL,  -- base64 comprimida
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;


-- ── POLÍTICAS DE USUARIOS ──
-- Cada usuario puede ver y modificar solo su propio perfil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (true);  -- todos pueden ver (para leaderboard)

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);


-- ── POLÍTICAS DE RUTINAS ──
-- Cada usuario solo ve sus rutinas
CREATE POLICY "routines_select_own" ON public.routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "routines_insert_own" ON public.routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_update_own" ON public.routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "routines_delete_own" ON public.routines
  FOR DELETE USING (auth.uid() = user_id);


-- ── POLÍTICAS DE SESIONES ──
CREATE POLICY "workouts_own" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);


-- ── POLÍTICAS DE RETOS ──
-- Todos pueden ver los retos, solo el coach puede crear/editar
CREATE POLICY "challenges_select_all" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "challenges_modify_coach" ON public.challenges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND username = 'coach')
  );


-- ── POLÍTICAS DE LOGROS ──
-- Todos pueden ver, solo el coach puede editar
CREATE POLICY "achdefs_select_all" ON public.achievement_definitions
  FOR SELECT USING (true);

CREATE POLICY "achdefs_modify_coach" ON public.achievement_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND username = 'coach')
  );


-- ── POLÍTICAS DE MENSAJES ──
CREATE POLICY "messages_select" ON public.coach_messages
  FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "messages_insert_coach" ON public.coach_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND username = 'coach')
  );

CREATE POLICY "messages_update_own" ON public.coach_messages
  FOR UPDATE USING (auth.uid() = to_user_id);


-- ── POLÍTICAS DE FOTOS ──
CREATE POLICY "photos_own" ON public.progress_photos
  FOR ALL USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ═══════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_routines_user ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON public.workout_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_to ON public.coach_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.coach_messages(to_user_id, read);
CREATE INDEX IF NOT EXISTS idx_photos_user ON public.progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_xp ON public.users(xp DESC);


-- ═══════════════════════════════════════════════════
-- FUNCIÓN: Auto-actualizar updated_at
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER achdefs_updated_at
  BEFORE UPDATE ON public.achievement_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ═══════════════════════════════════════════════════
-- DATOS INICIALES: Logros predeterminados
-- (Si ya tienes logros en localStorage, estos se
--  sincronizarán automáticamente la primera vez)
-- ═══════════════════════════════════════════════════
INSERT INTO public.achievement_definitions (id, name, description, xp, rarity, category, icon) VALUES
  ('first_session', 'PRIMER GOLPE', 'Completa tu primera sesión', 100, 'common', 'sessions', '⚡'),
  ('ten_sessions', 'EN LLAMAS', '10 sesiones completadas', 250, 'uncommon', 'sessions', '🔥'),
  ('fifty_sessions', 'DIAMANTE NEGRO', '50 sesiones completadas', 1000, 'epic', 'sessions', '💎'),
  ('hundred_sessions', 'REY DEL DOJO', '100 sesiones completadas', 3000, 'legendary', 'sessions', '👑'),
  ('streak_7', 'SAMURAI SEMANAL', '7 días seguidos', 300, 'uncommon', 'streaks', '🗡️'),
  ('streak_30', 'DEMONIO DEL MES', '30 días seguidos', 1500, 'legendary', 'streaks', '👹'),
  ('bench_100', 'THANOS JUNIOR', 'Press de banca 100 kg', 500, 'epic', 'strength', '😈'),
  ('bench_140', 'MODO BESTIA', 'Press de banca 140 kg', 1000, 'legendary', 'strength', '🦁'),
  ('squat_100', 'GUERRERO DRAGÓN', 'Sentadilla 100 kg', 500, 'epic', 'strength', '🏋️'),
  ('deadlift_100', 'COLOSO', 'Peso muerto 100 kg', 500, 'epic', 'strength', '⚔️'),
  ('deadlift_200', 'TITÁN ABSOLUTO', 'Peso muerto 200 kg', 2000, 'legendary', 'strength', '🌠'),
  ('curl_40', 'BRAZO DE ACERO', 'Curl bíceps 40 kg', 400, 'epic', 'strength', '💪'),
  ('pullups_15', 'ÁGUILA REAL', '15 dominadas seguidas', 350, 'epic', 'strength', '🦅'),
  ('cardio_30', 'CORAZÓN DE FUEGO', '30 min de cardio', 200, 'uncommon', 'cardio', '🎽'),
  ('volume_10k', 'REY DEL VOLUMEN', '10,000 kg en una sesión', 600, 'epic', 'volume', '📦'),
  ('early_bird', 'MADRUGADOR BESTIAL', 'Entrena antes de las 6am', 200, 'uncommon', 'special', '🌅'),
  ('night_owl', 'LOBO NOCTURNO', 'Entrena después de las 10pm', 200, 'uncommon', 'special', '🦉'),
  ('level_5', 'GUERRERO LV5', 'Alcanza el nivel 5', 500, 'uncommon', 'progression', '⬆️'),
  ('level_10', 'MAESTRO LV10', 'Alcanza el nivel 10', 1000, 'epic', 'progression', '🔱')
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════
-- 8. TABLA DE RECETAS (creadas por el coach)
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.recipes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT DEFAULT 'almuerzo',
  description TEXT,
  prep_time   INTEGER DEFAULT 15,
  difficulty  TEXT DEFAULT 'easy',
  calories    INTEGER,
  protein     DECIMAL(6,1),
  carbs       DECIMAL(6,1),
  fat         DECIMAL(6,1),
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps       JSONB DEFAULT '[]'::jsonb,
  tags        JSONB DEFAULT '[]'::jsonb,
  image_data  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios pueden VER recetas
CREATE POLICY "recipes_select_all" ON public.recipes
  FOR SELECT USING (true);

-- Solo el coach puede crear/editar/eliminar recetas
CREATE POLICY "recipes_modify_coach" ON public.recipes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND username = 'coach')
  );

CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_created ON public.recipes(created_at DESC);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();



-- ══════════════════════════════
-- 9. PROGRESO DE RETOS POR USUARIO
-- ══════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress     DECIMAL(10,2) DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own" ON public.user_challenge_progress FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_challenge_progress(user_id);

-- ══════════════════════════════
-- 10. SUPABASE STORAGE — Fotos de progreso
-- ══════════════════════════════
-- Ejecuta esto en Storage > New bucket:
-- Nombre: progress-photos
-- Public: true
-- O via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true) ON CONFLICT DO NOTHING;
CREATE POLICY "photos_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_read" ON storage.objects FOR SELECT USING (bucket_id = 'progress-photos');


-- ═══════════════════════════════════════════════════
-- VERIFICACIÓN FINAL
-- ═══════════════════════════════════════════════════
SELECT
  'users' as tabla, COUNT(*) as registros FROM public.users
UNION ALL SELECT 'routines', COUNT(*) FROM public.routines
UNION ALL SELECT 'workout_sessions', COUNT(*) FROM public.workout_sessions
UNION ALL SELECT 'challenges', COUNT(*) FROM public.challenges
UNION ALL SELECT 'achievement_definitions', COUNT(*) FROM public.achievement_definitions
UNION ALL SELECT 'coach_messages', COUNT(*) FROM public.coach_messages
UNION ALL SELECT 'progress_photos', COUNT(*) FROM public.progress_photos
UNION ALL SELECT 'recipes', COUNT(*) FROM public.recipes;

-- Si ves 8 filas en el resultado = ¡Éxito!
-- La tabla achievement_definitions debe mostrar 19 registros
