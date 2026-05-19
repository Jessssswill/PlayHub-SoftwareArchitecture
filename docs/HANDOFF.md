# Team Handoff Notes

> Game Session Manager | Software Architecture Final Project
> Last updated: May 2026

---

## What's Done

- ✅ All 10 design patterns implemented (Proxy applied in 2 contexts: Protection + Cache see [PATTERNS.md](PATTERNS.md))
- ✅ Layered Architecture enforced (no cross-layer imports)
- ✅ REST API: 7 endpoints (GET/POST /sessions, GET/:id/state, POST/:id/move, PATCH/:id/end, POST/:id/join, POST /demo)
- ✅ WebSocket Gateway: real-time move broadcast to session room
- ✅ Frontend with Tier S polish (consistent design tokens, Demo Mode, /architecture page)
- ✅ TicTacToe: fully playable end-to-end
- ✅ Chess: basic moves working (no check/checkmate detection yet)
- ✅ Documentation: README, ARCHITECTURE.md, PATTERNS.md, ISO-25010-JUSTIFICATION.md, GSLC-SLIDE-CONTENT.md
- ✅ Unit tests: facade, proxy-authorization, validation, E2E session flow
- ✅ Swagger at `/api/docs`

---

## What's Pending (for team to complete)

- [ ] **Chess: implement check/checkmate detection** (currently win = king captured, belum true checkmate logic di `ChessRules.ts`)
- [ ] **Increase test coverage** target >70%. Coverage saat ini fokus di facade + proxies. Yang belum: state machine transitions, event emitter, builder edge cases
- [ ] **Cross-browser testing**, verify on Chrome, Firefox, Edge; Safari WebSocket behavior may differ
- [ ] **Mobile UX**, verify board sizing on small phones (<375px viewport). TicTacToe cells may overflow.
- [ ] **PowerPoint design**, content sudah ada di `docs/GSLC-SLIDE-CONTENT.md`, tinggal styling visual
- [ ] **Screenshot UI**, take screenshots for slide 9 while system is running. Capture: lobby, both game boards, architecture page.
- [ ] **Practice presentation flow**, especially the live demo (2 tabs for real-time). Rehearse once before the real thing.
- [ ] **Fill in team member names**, replace `[Member N]` and `[NIM]` placeholders in README + GSLC slides

---

## How to Run Locally

```bash
# Prerequisites: Node.js 20+

# 1. Clone
git clone [repo-url]
cd game-session-manager

# 2. Install all
npm run install:all

# 3. Run both services
npm run dev

# Backend:  http://localhost:3001
# Frontend: http://localhost:3000
# Swagger:  http://localhost:3001/api/docs

# 4. Verify with Demo Mode
# Open http://localhost:3000 → click "Try Demo Mode"
```

---

## How to Add a New Game Type (for future extension)

The system is designed so adding a new game type (e.g., Checkers, Go) requires **zero changes to existing code**:

1. **Domain**: Create `business/domain/games/checkers/checkers.game.ts extends Game`:
   - Implement `validateMove()`, throw if move illegal
   - Implement `applyMove()`, return new GameState with updated board
   - Implement `checkEndCondition()`, return `EndCondition` (isOver, isDraw, winnerId)

2. **Rules**, Create `checkers.rules.ts` with static validation helpers

3. **Factory**, Create `business/factories/checkers.factory.ts implements IGameFactory`:
   - `createBoard()`, return 8×8 board with initial piece positions
   - `createRules()`, return Checkers rules instance
   - `createInitialState(playerIds)`, return GameState with standard setup

4. **Registration**, Add to `GameFactoryProvider.getFactory()` map

5. **Enum**, Add `CHECKERS = 'CHECKERS'` to `GameType` enum

6. **Frontend board**, Create `frontend/src/components/CheckersBoard.tsx`

7. **Frontend patterns page**, Add entry to `frontend/src/lib/patterns-data.ts` if new pattern introduced

That's it. The Facade, Controller, Gateway, Builder, Registry, and Proxy all work without modification.

---

## Architecture Decision Log

| Decision | Chosen | Rejected | Reason |
|---------|--------|---------|--------|
| **Architecture style** | Layered (Closed) | Microservices | Team 4 orang + 2 minggu = monolith optimal. Microservices punya deployment overhead tidak sebanding dengan scope |
| **Architecture style** | Layered (Closed) | Hexagonal/Ports & Adapters | Migration path ada jika perlu. Hexagonal over-engineered untuk game monolith ini |
| **Framework** | NestJS | Express | DI + module system natively enforce Layered Architecture; decorators membuat patterns eksplisit |
| **Database** | SQLite + TypeORM | PostgreSQL | Demo scope, SQLite zero-config. TypeORM abstraction memungkinkan swap ke PostgreSQL tanpa ubah kode |
| **Caching** | In-process Proxy | Redis | Redis over-engineered untuk single-instance demo. Jika scale out, ganti ke Redis di CachedGameStateProxy |
| **AI move gen** | Adapter pattern | Direct switch-case | Adapter memungkinkan swap AI engine tanpa ubah Facade. 3 implementasi sudah dibuat |
| **Bonus patterns** | Tidak diimplementasi | Strategy, Command, CoR | Scope management, 11 coursework patterns sudah comprehensive. Bonus patterns bisa jadi feature Phase 2 |

---

## Pattern Assignment for Presentation

Tiap presenter harus paham **intent + lokasi + justifikasi** pola yang ditugaskan:

| Orang | Patterns | File Utama |
|-------|---------|-----------|
| **1** | Singleton, Prototype, Template Method | `registry/game-registry.service.ts`, `games/game-state.ts`, `games/game.abstract.ts` |
| **2** | Abstract Factory, Builder, Adapter | `factories/`, `builders/game-session.builder.ts`, `adapters/` |
| **3** | Observer, Facade | `events/game-event-emitter.ts`, `facades/game-engine.facade.ts` |
| **4** | State, Proxy (×2) | `states/`, `proxies/authorization.proxy.ts`, `proxies/cached-game-state.proxy.ts` |

Baca `docs/PATTERNS.md` untuk intent lengkap, lokasi file, code snippet, dan UML per pattern.

---

## Anticipated Professor Questions

**Q1: "Kenapa Layered, bukan Clean Architecture atau Hexagonal?"**

A: Layered cocok untuk tim kecil dengan timeline pendek. Clean/Hexagonal menambahkan lapisan abstraksi (ports, use case interactors) yang memberikan value lebih jika domain sangat kompleks atau perlu swap framework. Untuk game monolith dengan 2 game type, Layered sudah memberikan testability dan modularity yang cukup. Dan Layered punya migration path ke Hexagonal, layer Domain kami sudah tanpa dependency NestJS, yang merupakan langkah pertama menuju Hexagonal.

**Q2: "Kenapa State pattern di session lifecycle, bukan enum + if-else?"**

A: 4 lifecycle state × 6 operasi = 24 branch kondisi. Setiap tambahan state (misalnya ABANDONED, OVERTIME) memerlukan modifikasi di semua 6 operasi sekaligus. State pattern membuat tiap state self-contained: tambah state baru → buat class baru, tidak ada perubahan di class lain. Ini OCP dalam praktik.

**Q3: "Singleton itu anti-pattern, kenapa dipakai?"**

A: Singleton yang dimaksud di sini bukan classical getInstance(), itu memang anti-pattern karena global mutable state sulit ditest. Kami menggunakan DI-managed singleton (NestJS default scope), yang tetap bisa di-mock di unit test dan bisa di-replace via DI token. Tujuannya: satu registry untuk semua request, bukan class variable global.

**Q4: "Kenapa Proxy (Protection), bukan NestJS Guard?"**

A: NestJS Guard berjalan di HTTP layer, tidak bisa diuji tanpa HTTP context dan tidak berlaku untuk WebSocket. Authorization Proxy adalah pure TypeScript class yang bisa diuji dengan unit test biasa, berjalan untuk semua transport (REST + WebSocket), dan bisa di-stack dengan Proxy lain (Cache Proxy). Separation of concerns lebih jelas.

**Q5: "Kenapa tidak ada Redis untuk WebSocket?"**

A: Untuk single-instance deployment (demo scope), Socket.io in-process sudah cukup. Redis diperlukan hanya jika scale out ke multiple NestJS instances yang perlu share WebSocket connections. `GameEventBus` sudah di-abstract sehingga implementasinya bisa diganti Redis adapter tanpa ubah consumer.

**Q6: "Builder dan Abstract Factory, apa bedanya?"**

A: Builder = cara membangun *satu* objek kompleks langkah demi langkah (GameSession dengan 8+ parameter). Abstract Factory = cara membuat *keluarga* objek yang saling compatible (Board + Rules + InitialState untuk satu game type). Builder dipakai di `createSession()` untuk konstruksi. Factory dipakai untuk inisialisasi game-specific components.

**Q7: "Prototype dipakai di mana dalam flow aktual?"**

A: `GameState.clone()` dipanggil di dalam `TicTacToeGame.applyMove()` dan `ChessGame.applyMove()` untuk membuat state baru tanpa mutasi state yang sedang aktif. Ini penting untuk immutability: jika apply gagal di tengah jalan, state lama tidak rusak.

---

## Known Issues

| Issue | Severity | Status |
|-------|---------|--------|
| Chess win condition = king captured (not checkmate) | Medium | Pending |
| No time control implementation (field ada, logic belum) | Low | Pending |
| `allowSpectators` dan `maxSpectators` belum divalidasi di gateway | Low | Pending |

---

## File Quick Reference

```
game-session-manager/
├── backend/src/
│   ├── presentation/
│   │   ├── controllers/session.controller.ts  ← REST endpoints
│   │   ├── gateways/game.gateway.ts           ← WebSocket events
│   │   └── dto/                               ← Request/Response DTOs
│   ├── business/
│   │   ├── builders/game-session.builder.ts   ← Builder
│   │   ├── domain/
│   │   │   ├── game-session.ts                ← State Machine context
│   │   │   ├── events/game-event-emitter.ts   ← Observer (per-session)
│   │   │   ├── games/game.abstract.ts         ← Template Method
│   │   │   ├── games/game-state.ts            ← Prototype
│   │   │   ├── games/tic-tac-toe/             ← TicTacToe concrete
│   │   │   ├── games/chess/                   ← Chess concrete
│   │   │   └── states/                        ← State pattern (4 states)
│   │   ├── events/game-event-bus.ts           ← Observer (global bridge)
│   │   ├── facades/game-engine.facade.ts      ← Facade
│   │   ├── factories/                         ← Abstract Factory
│   │   └── services/move-validation.service.ts
│   ├── infrastructure/
│   │   ├── adapters/                          ← Adapter (AI engines)
│   │   └── registry/game-registry.service.ts ← Singleton
│   └── persistence/
│       └── proxies/                           ← Proxy (Protection + Cache)
└── docs/
    ├── ARCHITECTURE.md   ← Mermaid diagrams
    ├── PATTERNS.md       ← 11 patterns (grading artifact)
    └── GSLC-SLIDE-CONTENT.md
```
