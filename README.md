# Game Session Manager

Multiplayer game lobby & session backend supporting TicTacToe and Chess.  
Built with NestJS + Next.js as a Software Architecture course project.

## Team

| Name | Role |
|------|------|
| (Member 1) | Backend Lead |
| (Member 2) | Backend / Patterns |
| (Member 3) | Frontend |
| (Member 4) | Docs / Testing |

## Tech Stack

- **Backend**: NestJS 10 + TypeScript + SQLite (TypeORM)
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Real-time**: Socket.io via NestJS WebSocket Gateway
- **Docs**: Swagger at `/api/docs`

## Setup

### Prerequisites

- Node.js 20+
- npm 9+

### Install

```bash
# Install all dependencies
npm run install:all
```

### Run (development)

```bash
# Run backend + frontend concurrently
npm run dev

# Or individually
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

### API Documentation

Swagger UI: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Project Structure

```
game-session-manager/
├── backend/    # NestJS API
├── frontend/   # Next.js UI
└── docs/       # Architecture docs, pattern justifications
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture overview.
