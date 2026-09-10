# AI-Based Adaptive Learning Assistant for University Students

A full-stack university project that demonstrates adaptive learning, AI-assisted tutoring, analytics, quizzes, progress tracking and personalized recommendations.

## Stack

- Frontend: React + Vite + Chart.js
- Backend: Java 21 + Spring Boot 3 + Spring Security + JWT
- Database: PostgreSQL
- Analytics: backend aggregation + Chart.js dashboards
- AI tutor: optional OpenAI-compatible API, with a built-in rule-based fallback so the project still works without an API key
- Deployment: Docker Compose files are included

## Core features

1. Registration and login with JWT authentication.
2. Student dashboard with overall progress, average score, weak topics and recommendations.
3. Course list and topic navigation.
4. Diagnostic/adaptive quizzes with Easy, Medium and Hard levels.
5. Adaptive engine:
   - score < 50% -> EASY + review recommendation
   - score 50-79% -> MEDIUM + practice recommendation
   - score >= 80% -> HARD + next-topic recommendation
6. Topic mastery tracking.
7. Personalized recommendations.
8. Analytics charts for score history and topic mastery.
9. AI Tutor that receives the current course/topic/level/score context.
10. Seeded Java Programming course with topics and quiz questions.

## Quick start with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

Demo account seeded automatically:

- Email: `student@demo.kz`
- Password: `Demo123!`

## Local development

### Backend

Requirements: Java 21 and Maven 3.9+

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Optional AI configuration

The application works without an external AI provider. To enable a real LLM, configure an OpenAI-compatible chat completions endpoint in `.env`:

```env
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your_key_here
AI_MODEL=gpt-5-mini
```

If these values are empty, `AiTutorService` uses the built-in contextual fallback.

## Main API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/courses`
- `GET /api/courses/{id}`
- `GET /api/diagnostic/course/{courseId}`
- `POST /api/diagnostic/course/{courseId}/submit`
- `GET /api/quizzes/topic/{topicId}`
- `POST /api/quizzes/{quizId}/submit`
- `GET /api/analytics/overview`
- `POST /api/ai/chat`

## Project structure

```text
adaptive-learning-assistant/
├── backend/
├── frontend/
├── database/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Academic project idea

The distinguishing feature is not simply an AI chatbot. The system continuously uses student quiz results and topic mastery to adapt difficulty, detect weak topics and recommend the next learning action. The AI tutor then receives that learning context and explains the topic at an appropriate level.
