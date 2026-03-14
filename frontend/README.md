# QueueLess Frontend

QueueLess frontend is a React + Vite + TypeScript application designed to work with the Spring Boot backend in the root project.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Three.js with `@react-three/fiber`

## Main frontend features

- motion-heavy landing page with a lazy-loaded 3D hero
- patient registration and login
- JWT-based protected dashboard
- role-aware patient, doctor, and admin views
- patient appointment booking and queue tracking
- doctor queue actions
- admin department and doctor management
- analytics and notification panels
- realtime notification stream support

## Run locally

1. Create `frontend/.env` if you want to override the default backend URL.
2. Set:

```env
VITE_API_BASE_URL=http://localhost:8082
```

3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

5. Open:

`http://localhost:5173`

## Production build

```bash
npm run build
```

## Important note

The 3D landing scene is lazy-loaded so it does not block the rest of the application. That keeps the main app routes smaller while preserving the visual design.
