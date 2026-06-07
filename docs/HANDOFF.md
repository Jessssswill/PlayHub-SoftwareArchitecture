# Team Handoff Notes

> Game Session Manager | Software Architecture Final Project

---

## What's Done

- 11 design patterns implemented (Proxy diterapkan 2 konteks: Protection + Cache, lihat PATTERNS.md)
- Layered Architecture enforced (no cross-layer imports)
- REST API: 7 endpoints (GET/POST /sessions, GET/:id, POST/:id/move, DELETE/:id, POST/:id/join, POST /demo)
- WebSocket Gateway: real-time move broadcast ke session room
- Frontend: design tokens konsisten, Demo Mode, /architecture page
- TicTacToe: fully playable end-to-end
- Chess: basic moves working (no check/checkmate detection)
- Connect Four: fully playable end-to-end (gravity, 4-in-a-row win detection, draw)
- Documentation: README, ARCHITECTURE.md, PATTERNS.md, ISO-25010-JUSTIFICATION.md, GSLC-SLIDE-CONTENT.md
- Unit tests: 180 tests passing (facade, proxy-authorization, connect-four, validation, E2E session flow)
- Swagger at `/api/docs`
- Team member names: sudah diisi semua di README dan GSLC slides

---

## What's Pending

- Chess: implement true check/checkmate detection (saat ini win = king captured, belum checkmate logic di `ChessRules.ts`)
- Increase test coverage target >70%. Yang belum: state machine transitions, event emitter, builder edge cases
- Cross-browser testing: verify on Chrome, Firefox, Edge
- Mobile UX: verify board sizing on small phones (<375px). TicTacToe cells may overflow
- PowerPoint design: content sudah ada di `docs/GSLC-SLIDE-CONTENT.md`, tinggal styling visual
- Screenshot UI untuk slide 9: ambil saat system running, capture lobby, game boards, architecture page
- Practice presentation flow, terutama live demo (2 tab untuk real-time)

---

## How to Run Locally

```bash
# Prerequisites: Node.js 20+

# Clone
git clone [repo-url]
cd game-session-manager

# Install all
npm run install:all

# Run both services
npm run dev

# Backend:  http://localhost:3001
# Frontend: http://localhost:3000
# Swagger:  http://localhost:3001/api/docs

# Verify dengan Demo Mode
# Buka http://localhost:3000, klik "Demo Mode"
```

---

## How to Add a New Game Type

Zero changes to existing code:

1. **Domain**: Create `business/domain/games/checkers/checkers.game.ts extends Game`
   - Implement `validateMove()`, throw if move illegal
   - Implement `applyMove()`, return new GameState with updated board
   - Implement `checkEndCondition()`, return `EndCondition`

2. **Rules**: Create `checkers.rules.ts` with static validation helpers

3. **Factory**: Create `business/factories/checkers.factory.ts implements IGameFactory`
   - `createBoard()`, `createRules()`, `createInitialState(playerIds)`

4. **Registration**: Add to `GameFactoryProvider.getFactory()` map

5. **Enum**: Add `CHECKERS = 'CHECKERS'` to `GameType` enum

6. **Frontend board**: Create `frontend/src/components/CheckersBoard.tsx`

Facade, Controller, Gateway, Builder, Registry, dan Proxy semua tidak perlu diubah.

---

## Architecture Decision Log

| Decision | Chosen | Rejected | Reason |
|---------|--------|---------|--------|
| Architecture style | Layered (Closed) | Microservices | Tim 5 orang + 2 minggu, monolith optimal. Microservices punya deployment overhead tidak sebanding scope |
| Architecture style | Layered (Closed) | Hexagonal/Ports & Adapters | Hexagonal over-engineered untuk game monolith ini, migration path ada jika perlu |
| Framework | NestJS | Express | DI + module system enforce Layered Architecture; decorators membuat patterns eksplisit |
| Database | SQLite + TypeORM | PostgreSQL | Demo scope, SQLite zero-config. TypeORM memungkinkan swap ke PostgreSQL tanpa ubah kode |
| Caching | In-process Proxy | Redis | Redis over-engineered untuk single-instance demo |
| AI move gen | Adapter pattern | Direct switch-case | Adapter memungkinkan swap AI engine tanpa ubah Facade |

---

## Pattern Assignment for Presentation

| Nama | Patterns | File Utama |
|------|---------|-----------|
| **Jessen William** | Singleton, Prototype, Template Method | `registry/game-registry.service.ts`, `games/game-state.ts`, `games/game.abstract.ts` |
| **Vabregass** | Abstract Factory, Builder | `factories/`, `builders/game-session.builder.ts` |
| **Yupriando** | Adapter, Facade | `infrastructure/adapters/`, `facades/game-engine.facade.ts` |
| **Jeremy Felix** | Observer, State | `events/game-event-emitter.ts`, `states/` |
| **Marco Andrean** | Proxy (x2) | `proxies/authorization.proxy.ts`, `proxies/cached-game-state.proxy.ts` |

Baca `docs/PATTERNS.md` untuk intent, lokasi file, code snippet, dan UML per pattern.

---

## Anticipated Professor Questions

**Q1: "Kenapa Layered, bukan Clean Architecture atau Hexagonal?"**

Layered cocok untuk tim kecil dengan timeline pendek. Clean/Hexagonal menambahkan lapisan abstraksi yang memberikan value lebih jika domain sangat kompleks atau perlu swap framework. Untuk game monolith ini, Layered sudah memberikan testability dan modularity yang cukup. Layer Domain sudah tanpa dependency NestJS, yang adalah langkah pertama menuju Hexagonal jika nanti perlu.

**Q2: "Kenapa State pattern, bukan enum + if-else?"**

4 lifecycle state x 6 operasi = 24 branch kondisi. Setiap tambahan state memerlukan modifikasi di semua 6 operasi. State pattern membuat tiap state self-contained: tambah state baru, buat class baru, tidak ada perubahan di class lain. OCP dalam praktik.

**Q3: "Singleton itu anti-pattern, kenapa dipakai?"**

Singleton di sini bukan classical getInstance(). Kami pakai DI-managed singleton (NestJS default scope), yang bisa di-mock di unit test dan bisa di-replace via DI token. Tujuannya satu registry untuk semua request, bukan global mutable state.

**Q4: "Kenapa Proxy (Protection), bukan NestJS Guard?"**

NestJS Guard berjalan di HTTP layer, tidak bisa diuji tanpa HTTP context dan tidak berlaku untuk WebSocket. Authorization Proxy adalah pure TypeScript class yang bisa diuji dengan unit test biasa, berjalan untuk semua transport (REST + WebSocket), dan bisa di-stack dengan Proxy lain.

**Q5: "Kenapa tidak ada Redis untuk WebSocket?"**

Single-instance deployment, Socket.io in-process sudah cukup. Redis diperlukan hanya jika scale out ke multiple NestJS instances. `GameEventBus` sudah di-abstract sehingga implementasinya bisa diganti Redis adapter tanpa ubah consumer.

**Q6: "Builder dan Abstract Factory, apa bedanya?"**

Builder = cara membangun satu objek kompleks langkah demi langkah (GameSession dengan 8+ parameter). Abstract Factory = cara membuat keluarga objek yang saling compatible (Board + Rules + InitialState untuk satu game type).

**Q7: "Prototype dipakai di mana dalam flow aktual?"**

`GameState.clone()` dipanggil di dalam `applyMove()` semua game untuk membuat state baru tanpa mutasi state yang sedang aktif. Jika apply gagal di tengah jalan, state lama tidak rusak.

---

## Known Issues

| Issue | Severity | Status |
|-------|---------|--------|
| Chess win = king captured, bukan checkmate | Medium | Pending |
| No time control logic (field ada, logic belum) | Low | Pending |
| `allowSpectators` belum divalidasi di gateway | Low | Pending |

---

## File Quick Reference

```
game-session-manager/
├── backend/src/
│   ├── presentation/
│   │   ├── controllers/session.controller.ts
│   │   ├── gateways/game.gateway.ts
│   │   └── dto/
│   ├── business/
│   │   ├── builders/game-session.builder.ts     (Builder)
│   │   ├── domain/
│   │   │   ├── game-session.ts                  (State Machine context)
│   │   │   ├── events/game-event-emitter.ts     (Observer per-session)
│   │   │   ├── games/game.abstract.ts           (Template Method)
│   │   │   ├── games/game-state.ts              (Prototype)
│   │   │   ├── games/tic-tac-toe/
│   │   │   ├── games/chess/
│   │   │   ├── games/connect-four/
│   │   │   └── states/                          (State pattern)
│   │   ├── events/game-event-bus.ts             (Observer global)
│   │   ├── facades/game-engine.facade.ts        (Facade)
│   │   └── factories/                           (Abstract Factory)
│   ├── infrastructure/
│   │   ├── adapters/                            (Adapter - AI engines)
│   │   └── registry/game-registry.service.ts   (Singleton)
│   └── persistence/
│       └── proxies/                             (Proxy Protection + Cache)
└── docs/
    ├── ARCHITECTURE.md
    ├── PATTERNS.md
    └── GSLC-SLIDE-CONTENT.md
```
