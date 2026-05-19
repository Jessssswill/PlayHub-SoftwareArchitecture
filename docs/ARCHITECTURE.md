# Architecture Documentation

> Game Session Manager — Software Architecture Final Project

---

## 1. System Overview

**Game Session Manager** adalah sistem backend yang memungkinkan dua pemain bermain TicTacToe atau Chess secara real-time melalui browser. Sistem menerima permintaan melalui REST API dan WebSocket, mengelola lifecycle sesi permainan melalui state machine, dan mendistribusikan update ke semua subscriber secara push (Observer).

**Pengguna utama:**
- **Player** — membuat sesi, bergabung, dan mengirim move
- **Spectator** — menonton sesi aktif secara real-time
- **Frontend App** — mengkonsumsi REST API dan WebSocket

**Scope saat ini:** Monolith tunggal, single-process, single-machine. Data persisted di SQLite; state aktif disimpan in-memory di GameRegistry.

---

## 2. Architecture Style — Layered Architecture (Closed)

Sistem menggunakan **Closed Layered Architecture**: setiap lapisan hanya boleh berkomunikasi dengan lapisan langsung di bawahnya. Lapisan tidak boleh di-bypass.

```mermaid
graph TD
    A["Presentation Layer<br/>SessionController · GameGateway"]
    B["Business Layer<br/>GameEngineFacade · Proxies · MoveValidationService"]
    C["Domain Layer<br/>GameSession · Games · State Machine · Events"]
    D["Persistence Layer<br/>GameRegistry · InMemoryStorage · TypeOrmStorage"]

    A -->|"calls via Proxy"| B
    B -->|"orchestrates"| C
    B -->|"reads/writes"| D
    C -.->|"emits events upward via bus"| B
```

**Justifikasi pemilihan Layered Architecture:**
- Tim kecil (4 orang) + timeline 2 minggu → monolith optimal vs microservices
- Bounded context jelas: game rules terpisah dari API handling
- Testability per-layer: domain logic tidak bergantung HTTP atau database
- Migration path: dapat berevolusi ke Hexagonal/Clean tanpa rewrite total

---

## 3. Layer Responsibilities

| Layer | Responsibility | Komponen Utama | Patterns Used |
|-------|---------------|----------------|--------------|
| **Presentation** | Terima HTTP/WS request, serialize/deserialize DTO, route ke business | `SessionController`, `GameGateway` | — |
| **Business** | Orkestrasikan use-case, enforce authorization, validasi move, emit events | `GameEngineFacade`, `AuthorizationProxy`, `CachedStateProxy`, `MoveValidationService` | Facade, Proxy ×2 |
| **Domain** | Aturan game murni, lifecycle state machine, event emission | `GameSession`, `TicTacToeGame`, `ChessGame`, `GameEventEmitter`, concrete states | Template Method, State, Observer, Prototype |
| **Persistence** | Simpan dan ambil session objects, provide in-memory cache | `GameRegistry`, `InMemoryStorage`, `TypeOrmStorage` | Singleton |
| **Infrastructure** | AI adapters, configuration, factory + builder | `IAIEngine`, `GameSessionBuilder`, `TicTacToeFactory`, `ChessFactory` | Abstract Factory, Builder, Adapter |

---

## 4. Component Diagram

```mermaid
graph TD
  subgraph Client["Client (Next.js 16)"]
    UI[Next.js Pages + Zustand]
    SIO[socket.io-client]
  end

  subgraph Presentation["Presentation Layer"]
    SC["SessionController\n(REST /sessions)"]
    GG["GameGateway\n(WebSocket)"]
  end

  subgraph Business["Business Layer"]
    AP["GameEngineAuthorizationProxy\n(Protection Proxy)"]
    CP["CachedGameStateProxy\n(Cache Proxy)"]
    FE["GameEngineFacade\n(Facade)"]
    VS["MoveValidationService"]
    GEB["GameEventBus\n(Global Observer Bridge)"]
  end

  subgraph Domain["Domain Layer"]
    GS["GameSession\n(State Machine Context)"]
    TG["TicTacToeGame\n(Template Method)"]
    CG["ChessGame\n(Template Method)"]
    GEE["GameEventEmitter\n(Per-session Observer)"]
    GST["GameState\n(Prototype)"]
  end

  subgraph Persistence["Persistence Layer"]
    GR["GameRegistry\n(Singleton)"]
    IMS["InMemoryStorage"]
    TOS["TypeOrmStorage (SQLite)"]
  end

  subgraph Infra["Infrastructure"]
    AI["IAIEngine\n(Adapter Target)"]
    FACS["TicTacToeFactory / ChessFactory\n(Abstract Factory)"]
    BSB["GameSessionBuilder\n(Builder)"]
  end

  UI -->|"HTTP /api (proxied by Next.js)"| SC
  SIO -->|"ws://localhost:3001"| GG
  SC --> AP --> CP --> FE
  GG --> FE
  FE --> VS
  FE --> GR
  FE --> FACS
  FE --> BSB
  FE --> GS
  GS --> TG & CG
  GS --> GEE --> GEB --> GG
  GS --> GST
  GR --> IMS & TOS
  FE -.->|"optional AI move"| AI
```

---

## 5. Sequence Diagram — "Make a Move"

Flow lengkap ketika player mengirim move melalui REST API:

```mermaid
sequenceDiagram
    participant Client
    participant SC as SessionController
    participant AP as AuthorizationProxy
    participant FE as GameEngineFacade
    participant VS as MoveValidationService
    participant GS as GameSession
    participant Game as Game (TicTacToe/Chess)
    participant GEE as GameEventEmitter
    participant GEB as GameEventBus
    participant GG as GameGateway

    Client->>SC: POST /sessions/:id/move { playerId, move }
    SC->>AP: makeMove(sessionId, playerId, move)
    AP->>AP: verify playerId ∈ session.players
    alt not a member
      AP-->>Client: 403 ForbiddenException
    end
    AP->>FE: makeMove(sessionId, playerId, move)
    FE->>GS: canAcceptMove(move)
    GS->>GS: state.canAcceptMove() — throws if not IN_PROGRESS
    FE->>VS: validate(session, playerId, move, engine)
    VS->>VS: check turn order + board bounds + occupancy
    alt invalid
      VS-->>Client: 400 BadRequestException
    end
    FE->>Game: executeTurn(currentState, move, emitter)
    Game->>Game: validateMove → applyMove → checkEndCondition
    Game->>GEE: emit('move.applied', payload)
    GEE->>GEB: forward('move.applied', { ...payload, sessionId })
    GEB->>GG: onMoveApplied(payload)
    GG->>GG: server.to(sessionId).emit('move', payload)
    GG-->>Client: WebSocket push to all room subscribers
    Game-->>FE: TurnResult { newState, endResult }
    FE->>GS: currentState = newState
    FE-->>SC: TurnResult
    SC-->>Client: 200 OK { newState, endResult }
    Note over FE: if endResult.isOver → session.finish()
```

---

## 6. State Machine Diagram — Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> WAITING : createSession()

    WAITING --> IN_PROGRESS : startGame()\n[players >= 2]
    WAITING --> FINISHED : finish() [force abort]

    IN_PROGRESS --> PAUSED : pause()
    IN_PROGRESS --> FINISHED : finish()\n[game over / abort]

    PAUSED --> IN_PROGRESS : resume()
    PAUSED --> FINISHED : finish() [force abort]

    FINISHED --> [*]
```

**State actions per state:**

| State | `makeMove` | `joinPlayer` | `pause` | `resume` | `finish` |
|-------|-----------|-------------|---------|---------|---------|
| WAITING | ❌ throws | ✅ allowed | ❌ throws | ❌ throws | ✅ allowed |
| IN_PROGRESS | ✅ allowed | ❌ throws | ✅ allowed | ❌ throws | ✅ allowed |
| PAUSED | ❌ throws | ❌ throws | ❌ throws | ✅ allowed | ✅ allowed |
| FINISHED | ❌ throws | ❌ throws | ❌ throws | ❌ throws | ❌ throws |

**Implementasi:** Tiap state adalah class terpisah (`WaitingForPlayersState`, `InProgressState`, `PausedState`, `FinishedState`) yang meng-implement `IGameLifecycleState`. `GameSession` mendelegasikan semua lifecycle ke state object saat ini — tidak ada `if/switch` di session class.

---

## 7. Deployment View

```mermaid
graph LR
    subgraph Machine["Single Machine (Dev / Demo)"]
        FE_P["Next.js Process :3000"]
        BE_P["NestJS Process :3001"]
        DB[("SQLite\ngame.db")]
    end

    Browser -->|"HTTP :3000"| FE_P
    Browser -->|"WebSocket :3001"| BE_P
    FE_P -->|"HTTP proxy /api → :3001"| BE_P
    BE_P --> DB
```

**Catatan produksi:**
- Gunakan Nginx sebagai reverse proxy untuk kedua proses
- Ganti SQLite dengan PostgreSQL untuk deployment multi-instance
- Tambahkan Redis untuk cross-process WebSocket broadcasting jika scale out

---

## 8. Cross-Cutting Concerns

| Concern | Mechanism | Location |
|---------|-----------|----------|
| **Authorization** | `GameEngineAuthorizationProxy` | `persistence/proxies/authorization.proxy.ts` |
| **Input Validation** | `MoveValidationService` + class-validator DTOs | `business/services/`, `presentation/dto/` |
| **Error Handling** | NestJS built-in exception filters | Global (HttpException hierarchy) |
| **Real-time sync** | Socket.io rooms per `sessionId` + `GameEventBus` | `presentation/gateways/game.gateway.ts` |
| **Configuration** | `AppConfigService` wraps `@nestjs/config` | `infrastructure/config/` |
| **API Docs** | `@nestjs/swagger` decorators | Auto-generated at `/api/docs` |
