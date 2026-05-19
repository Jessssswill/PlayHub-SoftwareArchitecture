# Game Session Manager

> Software Architecture Final Project | IF [Course Code] | [Semester] [Year]

A real-time multiplayer game lobby and session backend supporting **TicTacToe** and **Chess**, demonstrating a strict **Layered Architecture** with **11 GoF design patterns** from the Software Architecture coursework.

---

## Team

| Name | Student ID | Role |
|------|-----------|------|
| [Member 1] | [NIM] | Backend Lead / Patterns |
| [Member 2] | [NIM] | Backend / Testing |
| [Member 3] | [NIM] | Frontend |
| [Member 4] | [NIM] | Docs / QA |

---

## Description

**Game Session Manager** adalah REST + WebSocket API yang memungkinkan dua pemain bergabung ke sesi permainan, mengirim move secara real-time, dan melihat papan tersinkron tanpa refresh halaman. Setiap sesi dikelola oleh sebuah mesin state machine yang menjamin transisi lifecycle (WAITING → IN_PROGRESS → PAUSED → FINISHED) hanya terjadi dalam urutan yang valid.

Backend dibangun di atas **NestJS 11** dengan TypeScript, menggunakan **SQLite via TypeORM** sebagai persistent store dan **Socket.io** untuk komunikasi dua arah. Frontend menggunakan **Next.js 16** dengan Zustand untuk state management dan polling/WebSocket untuk sinkronisasi real-time.

Arsitektur sistem mengikuti pola **Layered Architecture (Closed Layers)** dengan empat lapisan: Presentation, Business, Domain, dan Persistence, sehingga ketergantungan hanya mengalir ke bawah. Setiap layer terisolasi dan dapat diuji secara independen.

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│  Presentation  │ SessionController (REST)     │
│                │ GameGateway (WebSocket)       │
├──────────────────────────────────────────────┤
│  Business      │ GameEngineFacade (Facade)    │
│                │ Authorization + Cache Proxy  │
│                │ MoveValidationService        │
├──────────────────────────────────────────────┤
│  Domain        │ GameSession (State Machine)  │
│                │ TicTacToeGame, ChessGame     │
│                │ GameEventEmitter (Observer)  │
├──────────────────────────────────────────────┤
│  Persistence   │ GameRegistry (Singleton)     │
│                │ InMemoryStorage, TypeORM     │
└──────────────────────────────────────────────┘
```

**Patterns implemented (11):** Singleton, Prototype, Builder, Abstract Factory, Template Method, State, Observer, Facade, Proxy (Protection), Proxy (Cache), Adapter.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture documentation and [docs/PATTERNS.md](docs/PATTERNS.md) for per-pattern justification.

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend framework | NestJS | 11.x |
| Language | TypeScript | 5.7 |
| Database | SQLite via TypeORM | 0.3.x |
| WebSocket | Socket.io (NestJS adapter) | 11.x |
| Frontend framework | Next.js (App Router) | 16.2 |
| UI state | Zustand | 5.x |
| Styling | Tailwind CSS | 4.x |
| Runtime | Node.js | 20+ |

---

## Setup

### Prerequisites

- **Node.js** 20+
- **npm** 9+

### 1. Clone

```bash
git clone [repo-url]
cd game-session-manager
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Run in development mode

```bash
# Runs backend (:3001) + frontend (:3000) concurrently
npm run dev
```

Or run individually:

```bash
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:3000
```

### 4. Try Demo Mode (quickest verification)

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Try Demo Mode"** button
3. A pre-configured TicTacToe session opens immediately
4. Click any cell to make a move; WebSocket will update both players' views in real-time

### 5. API Documentation (Swagger)

Interactive docs: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sessions` | List all active sessions |
| `POST` | `/sessions` | Create a new session |
| `GET` | `/sessions/:id/state` | Get current game state |
| `POST` | `/sessions/:id/move` | Submit a move |
| `PATCH` | `/sessions/:id/end` | End a session |
| `POST` | `/sessions/demo` | Create a demo session instantly |
| `WS` | `ws://localhost:3001` | Socket.io connection |

---

## Project Structure

```
game-session-manager/
├── backend/
│   ├── src/
│   │   ├── presentation/      # Controllers + WebSocket Gateway
│   │   ├── business/          # Facade, Builder, Factories, Services
│   │   │   ├── builders/
│   │   │   ├── domain/        # GameSession, State Machine, Games, Events
│   │   │   ├── factories/
│   │   │   ├── facades/
│   │   │   └── services/
│   │   ├── infrastructure/    # Registry (Singleton), Adapters, Config
│   │   └── persistence/       # Storage adapters, Proxy wrappers
│   └── test/                  # Unit + E2E tests
├── frontend/
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # React components
│       ├── hooks/             # useGameSocket, useSessionList
│       └── lib/               # API client, Zustand store, design tokens
├── docs/
│   ├── ARCHITECTURE.md        # Full architecture documentation
│   ├── PATTERNS.md            # 11-pattern justification (grading artifact)
│   ├── ISO-25010-JUSTIFICATION.md
│   ├── GSLC-SLIDE-CONTENT.md
│   ├── HANDOFF.md
│   └── diagrams/              # Mermaid source files
└── README.md
```

---

## Testing

```bash
cd backend
npm test           # Unit tests
npm run test:e2e   # End-to-end tests
npm run test:cov   # Coverage report
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered architecture, component/sequence/state diagrams |
| [PATTERNS.md](docs/PATTERNS.md) | All 11 patterns (intent, location, code snippet, UML) |
| [ISO-25010-JUSTIFICATION.md](docs/ISO-25010-JUSTIFICATION.md) | Quality attribute mapping |
| [GSLC-SLIDE-CONTENT.md](docs/GSLC-SLIDE-CONTENT.md) | Slide-by-slide presentation content |
| [HANDOFF.md](docs/HANDOFF.md) | Team notes, decision log, presentation prep |

---

## License

MIT, untuk keperluan akademik.
