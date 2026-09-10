# Adaptive AI deployment

## Frontend — Vercel
1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Set Root Directory to `frontend`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variable `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`.

## Backend + PostgreSQL — Render
1. Push the project to GitHub.
2. Create a Blueprint in Render using the root `render.yaml`.
3. Render creates the PostgreSQL database and Spring Boot service.
4. Add optional AI variables: `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`.

## Custom domain
After both services work, connect your own domain in Vercel. Example: `adaptiveai.kz`.
