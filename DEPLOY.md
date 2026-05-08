# 🦁 COACH LION v2 — GUÍA DE DESPLIEGUE
## GitHub + Supabase + Vercel (PWA)

---

## ¿QUÉ ES ESTA APP?
Coach Lion es una **Progressive Web App (PWA)**.
Eso significa: funciona desde un link en el navegador,
se ve y funciona IGUAL que una app nativa, y se puede
instalar en iPhone/Android con ícono en pantalla de inicio.
**Sin App Store. Sin costo.**

---

## PASO 1 — GITHUB

### 1.1 Crear repositorio
1. Ve a https://github.com → crea cuenta si no tienes
2. Clic en "+" → "New repository"
3. Nombre: `coach-lion`
4. Visibility: **Public**
5. Clic "Create repository"

### 1.2 Subir los archivos
Abre la terminal en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "🦁 Coach Lion v2 - Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/coach-lion.git
git push -u origin main
```

---

## PASO 2 — SUPABASE (Base de datos en la nube)

### 2.1 Crear proyecto
1. Ve a https://supabase.com → crea cuenta
2. "New Project" → nombre: `coach-lion`
3. Elige contraseña fuerte → región US East → espera 2 min

### 2.2 Obtener credenciales
Settings → API → copia:
- **Project URL** → reemplaza `YOUR_SUPABASE_URL` en app.js
- **anon public key** → reemplaza `YOUR_SUPABASE_ANON_KEY` en app.js

### 2.3 Crear tablas (SQL Editor → New Query)

```sql
-- Usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  weight DECIMAL, height DECIMAL, age INTEGER,
  days_per_week INTEGER, goal TEXT, level TEXT, bmi DECIMAL,
  xp INTEGER DEFAULT 0, sessions INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0, last_session DATE,
  achievements JSONB DEFAULT '[]',
  records JSONB DEFAULT '{}',
  total_volume DECIMAL DEFAULT 0,
  coach_messages JSONB DEFAULT '[]',
  workout_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rutinas
CREATE TABLE routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, type TEXT, day_of_week TEXT,
  exercises JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seguridad básica
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON users FOR ALL USING (true);
CREATE POLICY "open" ON routines FOR ALL USING (true);
```

Clic en **Run** → listo.

---

## PASO 3 — VERCEL (Publicar la app)

### 3.1 Conectar con GitHub
1. Ve a https://vercel.com → "Sign up" → **Continuar con GitHub**
2. Autoriza Vercel

### 3.2 Importar proyecto
1. Dashboard → "Add New → Project"
2. Selecciona el repo `coach-lion`
3. Configuración:
   - Framework Preset: **Other**
   - Build Command: (vacío)
   - Output Directory: `.`
4. Clic **Deploy**

### 3.3 ¡Listo! Tu app está en vivo
URL ejemplo: `https://coach-lion.vercel.app`

---

## ACTUALIZAR LA APP (flujo diario)

```bash
# Haces tus cambios en los archivos
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y re-despliega automáticamente en ~30 segundos.

---

## INSTALAR COMO APP EN EL TELÉFONO

**iPhone (Safari):**
1. Abre el link en Safari
2. Toca el botón compartir (cuadrado con flecha)
3. "Añadir a pantalla de inicio"
4. ¡Aparece el ícono de Coach Lion en tu home!

**Android (Chrome):**
1. Abre el link en Chrome
2. Menú (tres puntos) → "Añadir a pantalla de inicio"
3. ¡Listo!

---

## CONFIGURACIÓN COACH

En `app.js` línea 4:
```javascript
const COACH_USERNAME = 'coach'; // Cambia 'coach' por tu usuario
```
Cuando inicies sesión con ese usuario, verás el ⚙️ Panel Coach.

## GIFs DE EJERCICIOS (opcional)
1. https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
2. Crea cuenta gratis (500 req/día)
3. En app.js busca `DEMO_KEY` y reemplaza con tu API Key

---

## ARCHIVOS DEL PROYECTO

```
coach-lion/
├── index.html    ← Estructura completa de la app
├── styles.css    ← Estética anime/dark/gold
├── app.js        ← Toda la lógica
├── manifest.json ← Config PWA
├── sw.js         ← Service Worker (offline + notificaciones)
└── DEPLOY.md     ← Esta guía
```

¿Dudas? Cada paso está diseñado para ser simple. 🦁⚡
