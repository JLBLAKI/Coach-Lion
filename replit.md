# Coach Lion - Fitness App

A mobile-style fitness coaching app built with React + TypeScript + Vite.

## Project Overview

Coach Lion is a fitness tracking app with a dark theme and orange accent colors, designed as a mobile-first web application.

## Features

- **Home** - Dashboard with hero banner, stats (workouts done, minutes, streak), featured workout, and weekly goal progress bar
- **Workouts** - Filterable list of workouts by category (Strength, Cardio, Flexibility) with completion tracking
- **Progress** - Stats overview and list of completed workouts with calorie estimates
- **Profile** - User profile, achievements/badges, and settings list

## Tech Stack

- React 19 + TypeScript
- Vite 8 (dev server on port 5000)
- CSS custom styles (no external UI library)

## Architecture

- Single-page app with tab navigation (`home`, `workouts`, `progress`, `profile`)
- All state managed locally in `App.tsx` with React hooks
- Mobile-first layout (max-width 480px centered)

## Development

```bash
npm install
npm run dev   # starts on http://0.0.0.0:5000
```

## Deployment

Configured as a static site deployment:
- Build: `npm run build`
- Public directory: `dist`

## File Structure

```
src/
  App.tsx       - Main app component with all pages and state
  App.css       - All component styles
  index.css     - Global reset and body styles
  main.tsx      - React entry point
```
