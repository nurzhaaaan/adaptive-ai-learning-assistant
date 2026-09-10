# Architecture

```text
Student Browser
     |
     v
React Frontend
     |
     | REST + JWT
     v
Spring Boot Backend
  |       |        |
  |       |        +--> AI Tutor Service --> Optional LLM API
  |       +-----------> Adaptive Learning Engine
  +-------------------> Analytics Service
     |
     v
PostgreSQL
```

## Backend layers

- controller: HTTP endpoints
- service: business logic
- repository: persistence
- entity: database models
- dto: API contracts
- security: JWT filter and Spring Security configuration
- config: seed data

## Adaptive flow

```text
Student completes quiz
        |
        v
Quiz score calculated
        |
        v
AdaptiveLearningService
   <50       50-79       >=80
   EASY      MEDIUM      HARD
   review    practice    advance
        |
        v
TopicProgress updated
        |
        v
Recommendation generated
        |
        v
Dashboard + AI tutor context updated
```
