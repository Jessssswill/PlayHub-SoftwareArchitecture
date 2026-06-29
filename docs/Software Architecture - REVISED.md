# Laporan Final Project — Software Architecture

**Nama:** Vabregass
**NIM:** 2802393913
**Mata Kuliah:** Software Architecture (COSC6093001)
**Semester:** Even 2025/2026
**Github:** https://github.com/Jessssswill/PlayHub-SoftwareArchitecture

---

## 1. Deskripsi Proyek

Game Session Manager (PlayHub) itu intinya platform buat main game papan (TicTacToe, Chess, Connect Four) bareng orang lain lewat browser. Semuanya real-time — pas satu orang gerak, pemain lain langsung lihat perubahannya tanpa perlu refresh. Ini bisa karena pakai WebSocket.

Ada juga fitur Spectator — pengguna bisa masuk ke ruangan dan nonton pertandingan yang lagi jalan.

### Target Pengguna

- **Casual Players** — Pemain yang mau main TicTacToe, Catur, atau Connect Four bareng teman secara online tanpa proses registrasi yang ribet.
- **Spectators (Penonton)** — Pengguna yang mau nonton pertandingan yang sedang jalan secara real-time.
- **Developers / Mahasiswa** — Yang ingin melihat contoh implementasi arsitektur berlapis dan design pattern di proyek nyata.

### Keuntungan

- **Bagi pengguna:** Ringan, tinggal buka browser, langsung main.
- **Bagi tim pengembang:** Bisa jadi contoh cara pisah-pisah concern di tiap layer dan cara nambah game baru tanpa ubah kode lama.

---

## 2. Teknologi yang Digunakan

### Backend
| Teknologi | Keterangan |
|---|---|
| NestJS 11 | Framework utama, dipilih karena DI + module system yang cocok untuk Layered Architecture |
| TypeScript 5.7 | Static typing untuk domain model |
| TypeORM + SQLite | Persistence layer |
| Socket.io | WebSocket untuk real-time sync |
| Swagger/OpenAPI | API documentation otomatis di `/api/docs` |

### Frontend
| Teknologi | Keterangan |
|---|---|
| Next.js (App Router) | Server/Client component, SSR |
| Zustand | State management ringan |
| Tailwind CSS | Styling |
| socket.io-client | Koneksi WebSocket ke backend |

---

## 3. Software Architecture: Closed Layered Architecture

Sistem ini pakai **Closed Layered Architecture**. Aturannya simpel: setiap layer cuma boleh manggil layer yang tepat di bawahnya, ga boleh loncat.

### Kenapa Layered Architecture?

- **Tim kecil (5 orang) + deadline ketat** — monolith jauh lebih praktis dibanding microservices yang butuh setup deployment, service discovery, dsb.
- **Bounded context-nya jelas** — aturan game (domain) terpisah dari penanganan HTTP (presentation).
- **Testability** — domain logic bisa ditest tanpa perlu HTTP context atau database.

### Kenapa Bukan Arsitektur Lain?

| Alternatif | Alasan Ditolak |
|---|---|
| Microservices | Overhead deployment dan service mesh tidak sepadan untuk scope 2 minggu dengan 5 orang |
| Hexagonal / Ports & Adapters | Over-engineered untuk game monolith ini; Layered sudah cukup dan punya migration path ke Hexagonal kalau nanti perlu |
| Pipeline Architecture | Tidak cocok untuk domain game session yang lebih berbasis state management daripada data pipeline |

### Struktur Layer

```
backend/src/
├── presentation/          → Terima HTTP/WS request, validasi DTO
│   ├── controllers/       → SessionController (REST API)
│   ├── gateways/          → GameGateway (WebSocket)
│   └── dto/               → Data Transfer Objects
├── business/              → Orkestrasi use-case, validasi, domain logic
│   ├── facades/           → GameEngineFacade (pintu masuk tunggal)
│   ├── factories/         → Abstract Factory per game type
│   ├── builders/          → GameSessionBuilder
│   ├── domain/
│   │   ├── games/         → Abstract Game, TicTacToe, Chess, Connect Four
│   │   ├── states/        → State machine (4 lifecycle states)
│   │   └── events/        → Event emitter per-session
│   ├── events/            → GameEventBus (global bridge ke WebSocket)
│   └── services/          → MoveValidationService
├── infrastructure/        → Registry, AI adapters, config
│   ├── registry/          → GameRegistry (Singleton)
│   ├── adapters/          → AI engines (Random, Minimax, External)
│   └── config/
└── persistence/           → Proxy, storage adapters
    ├── proxies/           → Authorization Proxy, Cache Proxy
    ├── adapters/
    └── entities/
```

### Diagram Layer

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer                             │
│  SessionController (REST) · GameGateway (WS)    │
├─────────────────────────────────────────────────┤
│  Business Layer                                 │
│  GameEngineFacade · MoveValidationService       │
│  Factories · Builders · Domain Logic            │
├─────────────────────────────────────────────────┤
│  Infrastructure Layer                           │
│  GameRegistry · AI Adapters · Config            │
├─────────────────────────────────────────────────┤
│  Persistence Layer                              │
│  Authorization Proxy · Cache Proxy · Storage    │
└─────────────────────────────────────────────────┘
        ↕ setiap layer hanya akses layer bawahnya
```

---

## 4. State Machine: Lifecycle Sesi Game

Sesi game punya 4 status yang dikelola lewat State Pattern:

```
          createSession()
               ↓
  ┌──────────────────────┐
  │      WAITING         │ ← bisa joinPlayer(), startGame()
  │ (tunggu player cukup)│   TIDAK bisa makeMove()
  └──────────┬───────────┘
             │ startGame() [players >= 2]
             ↓
  ┌──────────────────────┐
  │    IN_PROGRESS       │ ← bisa makeMove(), pause(), finish()
  │ (game sedang jalan)  │   TIDAK bisa joinPlayer()
  └──────┬───────┬───────┘
         │       │ pause()
         │       ↓
         │  ┌─────────────┐
         │  │   PAUSED    │ ← bisa resume(), finish()
         │  │             │   TIDAK bisa makeMove()
         │  └──────┬──────┘
         │         │ resume() → kembali ke IN_PROGRESS
         │         │ finish() ↓
         ↓         ↓
  ┌──────────────────────┐
  │     FINISHED         │ ← TIDAK bisa operasi apapun
  │ (game selesai)       │
  └──────────────────────┘
```

| State | makeMove | joinPlayer | pause | resume | finish |
|---|---|---|---|---|---|
| WAITING | ❌ throws | ✅ allowed | ❌ throws | ❌ throws | ✅ allowed |
| IN_PROGRESS | ✅ allowed | ❌ throws | ✅ allowed | ❌ throws | ✅ allowed |
| PAUSED | ❌ throws | ❌ throws | ❌ throws | ✅ allowed | ✅ allowed |
| FINISHED | ❌ throws | ❌ throws | ❌ throws | ❌ throws | ❌ throws |

---

## 5. Design Patterns (11 GoF)

### Creational Patterns

#### 5.1 Singleton — GameRegistry

Satu-satunya tempat nyimpen semua sesi yang lagi aktif. NestJS default scope-nya sudah singleton, jadi cukup pakai `@Injectable()` — ga perlu bikin `getInstance()` sendiri. Semua request akses registry yang sama.

**Lokasi:** `backend/src/infrastructure/registry/game-registry.service.ts`

```typescript
@Injectable() // NestJS otomatis bikin ini singleton di DI Container
export class GameRegistry {
  private readonly sessions = new Map<string, GameSession>();

  register(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  get(id: string): GameSession {
    const session = this.sessions.get(id);
    if (!session)
      throw new NotFoundException(`Session '${id}' tidak ditemukan di registry.`);
    return session;
  }

  getAll(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  has(id: string): boolean {
    return this.sessions.has(id);
  }
}
```

---

#### 5.2 Prototype — GameState

Tiap kali mau proses move, board state di-clone dulu. Kalau ada error di tengah jalan, state aslinya ga ikut rusak. Board itu array 2D, jadi ga bisa cuma `{ ...state }` — itu shallow copy, nanti array dalamnya masih nunjuk ke referensi yang sama.

**Lokasi:** `backend/src/business/domain/games/game-state.ts`

```typescript
export class GameState implements Cloneable<GameState> {
  boardState: string[][];
  currentPlayerId: string;
  moveCount: number;
  lastMoveTimestamp: number | null;
  capturedPieces: string[];
  playerOrder: string[];

  clone(): GameState {
    return new GameState({
      boardState: this.boardState.map((row) => [...row]), // deep copy tiap baris
      currentPlayerId: this.currentPlayerId,
      moveCount: this.moveCount,
      lastMoveTimestamp: this.lastMoveTimestamp,
      capturedPieces: [...this.capturedPieces],
      playerOrder: [...this.playerOrder],
    });
  }
}
```

---

#### 5.3 Builder — GameSessionBuilder

GameSession parameternya banyak (game type, players, time control, private/public, spectators). Daripada constructor-nya panjang banget, mending pakai builder dengan fluent API. Validasi jalan di `build()` — kalau ada yang kurang, langsung error sebelum objek dibuat.

**Lokasi:** `backend/src/business/builders/game-session.builder.ts`

```typescript
@Injectable()
export class GameSessionBuilder {
  private gameType: GameType | null = null;
  private players: Player[] = [];
  private timeControlSeconds = 0;
  private isPrivateFlag = false;

  forGame(type: GameType): this { this.gameType = type; return this; }
  addPlayer(player: Player): this { this.players.push(player); return this; }
  withTimeControl(seconds: number): this { this.timeControlSeconds = seconds; return this; }
  asPrivate(): this { this.isPrivateFlag = true; return this; }
  withSpectators(max = 0): this { /* ... */ return this; }

  build(): GameSession {
    if (!this.gameType)
      throw new BadRequestException('Game type harus ditentukan sebelum build().');
    if (this.players.length < 1)
      throw new BadRequestException(`Session butuh minimal 1 player.`);
    if (this.timeControlSeconds < 0)
      throw new BadRequestException('Time control tidak boleh negatif.');

    const session = new GameSession({
      id: randomUUID(),
      gameType: this.gameType,
      players: [...this.players],
      status: GameStatus.WAITING,
      currentState: null,
      createdAt: new Date(),
      timeControlSeconds: this.timeControlSeconds,
      isPrivate: this.isPrivateFlag,
      // ...
    });
    this.reset();
    return session;
  }
}
```

**Catatan:** Validasi minimal 1 player (bukan 2) karena player kedua bisa join belakangan lewat `joinSession()`.

---

#### 5.4 Abstract Factory — IGameFactory

Tiap game type punya factory-nya sendiri yang bikin Board, Rules, sama InitialState yang pasti cocok satu sama lain. Mau nambah game baru? Tinggal bikin satu factory lagi, kode yang udah ada ga perlu diubah.

**Lokasi:** `backend/src/business/factories/`
- `game-factory.interface.ts` — interface
- `tic-tac-toe.factory.ts` — factory TicTacToe
- `chess.factory.ts` — factory Chess
- `connect-four.factory.ts` — factory Connect Four
- `game-factory.provider.ts` — pemetaan GameType ke factory

```typescript
// Interface (Abstract Factory)
export interface IGameFactory {
  createBoard(): Board<string>;
  createRules(): GameRules;
  createInitialState(playerIds: [string, string]): GameState;
}

// Concrete Factory — TicTacToe
@Injectable()
export class TicTacToeFactory implements IGameFactory {
  createBoard(): Board<string> {
    return {
      width: 3, height: 3,
      cells: Array.from({ length: 3 }, () => Array(3).fill('')),
    };
  }
  createRules(): GameRules { return new TicTacToeRules(); }
  createInitialState(playerIds: [string, string]): GameState {
    return new GameState({
      boardState: this.createBoard().cells,
      currentPlayerId: playerIds[0],
      playerOrder: [playerIds[0], playerIds[1]],
    });
  }
}
```

---

### Structural Patterns

#### 5.5 Facade — GameEngineFacade

Controller ga perlu tau ada registry, factory, builder, game engine, validator, event bus di belakangnya. Tinggal panggil satu method di Facade, sisanya Facade yang urus.

**Lokasi:** `backend/src/business/facades/game-engine.facade.ts`

```typescript
@Injectable()
export class GameEngineFacade {
  private readonly engines: Map<GameType, Game>;

  constructor(
    private readonly registry: GameRegistry,
    private readonly factoryProvider: GameFactoryProvider,
    private readonly tttGame: TicTacToeGame,
    private readonly chessGame: ChessGame,
    private readonly connectFourGame: ConnectFourGame,
    private readonly validationService: MoveValidationService,
    private readonly eventBus: GameEventBus,
  ) {
    this.engines = new Map<GameType, Game>([
      [GameType.TIC_TAC_TOE, this.tttGame],
      [GameType.CHESS, this.chessGame],
      [GameType.CONNECT_FOUR, this.connectFourGame],
    ]);
  }

  async makeMove(sessionId: string, playerId: string, move: Move): Promise<TurnResult> {
    const session = this.registry.get(sessionId);
    session.canAcceptMove(move);

    const engine = this.engines.get(session.gameType);
    if (!engine) throw new NotFoundException(`Game engine tidak ditemukan.`);

    this.validationService.validate(session, playerId, move, engine);
    const result = engine.executeTurn(session.currentState, move, session.emitter);
    session.currentState = result.newState;

    if (result.endResult.isOver) session.finish();
    return result;
  }
}
```

---

#### 5.6 Protection Proxy — GameEngineAuthorizationProxy

Sebelum request `makeMove` atau `endSession` sampai ke Facade, proxy ini cek dulu — si pengirim beneran player yang terdaftar di sesi itu ga? Kalau bukan, langsung 403 Forbidden. Auth logic-nya jadi kepisah dari business logic.

**Lokasi:** `backend/src/persistence/proxies/authorization.proxy.ts`

```typescript
@Injectable()
export class GameEngineAuthorizationProxy {
  constructor(
    private readonly real: GameEngineFacade,
    private readonly registry: GameRegistry,
  ) {}

  async makeMove(sessionId: string, playerId: string, move: Move): Promise<TurnResult> {
    const session = this.registry.get(sessionId);
    const isRegistered = session.players.some((p) => p.id === playerId);
    if (!isRegistered) {
      throw new ForbiddenException(
        `Player '${playerId}' bukan anggota sesi '${sessionId}'.`,
      );
    }
    return this.real.makeMove(sessionId, playerId, move);
  }

  async endSession(sessionId: string, requesterId: string): Promise<void> {
    const session = this.registry.get(sessionId);
    const isMember = session.players.some((p) => p.id === requesterId);
    if (!isMember) {
      throw new ForbiddenException('Hanya player dalam sesi yang bisa mengakhiri game.');
    }
    return this.real.endSession(sessionId);
  }
}
```

**Kenapa pakai Proxy, bukan NestJS Guard?** Guard cuma jalan di HTTP layer dan susah ditest tanpa HTTP context. Proxy ini class TypeScript biasa yang bisa ditest pakai unit test dan jalan untuk semua transport (REST + WebSocket).

---

#### 5.7 Cache Proxy — CachedGameStateProxy

Nyimpen hasil `getState()` selama 1 detik. Kalau ada 10 spectator yang poll state barengan, ga perlu lookup registry 10 kali — cukup sekali, sisanya dari cache. Cache-nya auto-hapus begitu ada move baru atau game selesai.

**Lokasi:** `backend/src/persistence/proxies/cached-game-state.proxy.ts`

```typescript
@Injectable()
export class CachedGameStateProxy {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly subscribed = new Map<string, { move: () => void; finish: () => void }>();
  private readonly TTL_MS = 1000; // 1 detik

  constructor(private readonly facade: GameEngineFacade) {}

  async getState(sessionId: string): Promise<GameState> {
    const cached = this.cache.get(sessionId);
    if (cached && Date.now() - cached.ts < this.TTL_MS) {
      return cached.state; // ambil dari cache
    }

    const state = await this.facade.getState(sessionId);

    if (!this.subscribed.has(sessionId)) {
      const session = this.facade.getSession(sessionId);
      const moveListener = () => this.invalidate(sessionId);
      const finishListener = () => {
        this.invalidate(sessionId);
        session.emitter.off('move.applied', moveListener);
        session.emitter.off('game.finished', finishListener);
        this.subscribed.delete(sessionId);
      };
      session.emitter.on('move.applied', moveListener);
      session.emitter.on('game.finished', finishListener);
      this.subscribed.set(sessionId, { move: moveListener, finish: finishListener });
    }

    this.cache.set(sessionId, { state, ts: Date.now() });
    return state;
  }

  invalidate(sessionId: string): void { this.cache.delete(sessionId); }
}
```

---

#### 5.8 Adapter — IAIEngine

Ada 3 jenis AI engine yang cara kerjanya beda-beda (random, minimax, panggil API luar). Adapter bikin semuanya punya interface yang sama (`IAIEngine`), jadi Facade ga peduli di baliknya pakai AI yang mana — tinggal tuker.

**Lokasi:** `backend/src/infrastructure/adapters/`
- `ai-engine.interface.ts` — target interface
- `random-ai.adapter.ts` — AI random
- `minimax-ai.adapter.ts` — AI minimax
- `external-engine.adapter.ts` — wrapper ke engine eksternal via HTTP

```typescript
// Interface target
export interface IAIEngine {
  getNextMove(state: GameState, gameType: GameType): Promise<Move>;
}

// Concrete Adapter — Random
@Injectable()
export class RandomAiAdapter implements IAIEngine {
  async getNextMove(state: GameState, gameType: GameType): Promise<Move> {
    switch (gameType) {
      case GameType.TIC_TAC_TOE: return this.randomTicTacToeMove(state);
      case GameType.CHESS:       return this.randomChessMove(state);
    }
  }

  private randomTicTacToeMove(state: GameState): TicTacToeMove {
    const emptyCells = state.boardState.flatMap((row, r) =>
      row.map((cell, c) => (cell === '' ? [r, c] : null)).filter(Boolean),
    );
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return { gameType: GameType.TIC_TAC_TOE, playerId: state.currentPlayerId, row, col };
  }
}
```

---

### Behavioral Patterns

#### 5.9 Template Method — Game

Urutan satu giliran itu fix: validate → apply → checkEnd → emit event. Subclass ga bisa skip atau ubah urutan ini. Yang boleh beda cuma isi tiap langkahnya — validasi TicTacToe jelas beda dari Chess, tapi urutan manggilnya selalu sama.

**Lokasi:** `backend/src/business/domain/games/game.abstract.ts`

```typescript
export abstract class Game {
  // Template method — urutan ini final, subclass tidak bisa ubah
  executeTurn(state: GameState, move: Move, emitter: GameEventEmitter): TurnResult {
    this.validateMove(state, move);                    // langkah 1: validasi
    const newState = this.applyMove(state, move);      // langkah 2: terapkan move
    const endResult = this.checkEndCondition(newState); // langkah 3: cek menang/seri

    emitter.emit('move.applied', { newState, move, endResult });
    if (endResult.isOver) emitter.emit('game.finished', { endResult });
    return { newState, endResult };
  }

  // 3 method abstract ini yang wajib diimplementasi tiap game
  protected abstract validateMove(state: GameState, move: Move): void;
  protected abstract applyMove(state: GameState, move: Move): GameState;
  protected abstract checkEndCondition(state: GameState): EndCondition;
}
```

Subclass: `TicTacToeGame`, `ChessGame`, `ConnectFourGame` — masing-masing implement 3 method abstract di atas dengan logika spesifik game-nya.

---

#### 5.10 State — IGameLifecycleState

Daripada if-else numpuk di GameSession (4 state × 6 operasi = 24 branch, males banget), mending pecah jadi class per state. Tiap state tau sendiri operasi mana yang boleh dan mana yang harus di-throw.

**Lokasi:** `backend/src/business/domain/states/`
- `game-lifecycle-state.interface.ts`
- `waiting-for-players.state.ts`
- `in-progress.state.ts`
- `paused.state.ts`
- `finished.state.ts`

```typescript
// State saat menunggu player — move ditolak, join diizinkan
export class WaitingForPlayersState implements IGameLifecycleState {
  canAcceptMove(session: ISessionContext, move: Move): void {
    throw new BadRequestException('Game belum dimulai. Tunggu hingga pemain penuh.');
  }

  startGame(session: ISessionContext): void {
    if (session.players.length < 2)
      throw new BadRequestException('Butuh minimal 2 pemain.');
    session.transitionTo(new InProgressState());
  }
}

// State saat game jalan — move diizinkan, join ditolak
export class InProgressState implements IGameLifecycleState {
  canAcceptMove(session: ISessionContext, move: Move): void { /* OK, lanjut */ }

  joinPlayer(session: ISessionContext, player: Player): void {
    throw new BadRequestException('Game sudah berjalan.');
  }
}
```

GameSession sendiri cuma mendelegasikan semua operasi ke state object yang sedang aktif — tidak ada if-else di session class:

```typescript
// Di GameSession
canAcceptMove(move: Move): void {
  this.lifecycleState.canAcceptMove(this, move);
}
```

---

#### 5.11 Observer — GameEventEmitter & GameEventBus

Game engine ga perlu tau soal WebSocket sama sekali. Dia cuma emit event (`move.applied` dll), terus WebSocket Gateway yang dengerin dan forward ke browser. Decoupled.

Ada dua level:
1. **GameEventEmitter** (per-session) — tiap sesi punya emitter sendiri
2. **GameEventBus** (global) — Facade menjembatani per-session emitter ke bus global, lalu GameGateway subscribe ke bus ini

**Lokasi:**
- `backend/src/business/domain/events/game-event-emitter.ts`
- `backend/src/business/events/game-event-bus.ts`

```typescript
// Per-session event emitter (strongly-typed)
export class GameEventEmitter {
  private readonly emitter = new EventEmitter();

  on<K extends keyof GameEventPayloads>(
    event: K, listener: (payload: GameEventPayloads[K]) => void
  ): this {
    this.emitter.on(event, listener as (arg: unknown) => void);
    return this;
  }

  emit<K extends keyof GameEventPayloads>(event: K, payload: GameEventPayloads[K]): void {
    this.emitter.emit(event, payload);
  }
}
```

Facade menjembatani per-session emitter ke global bus:
```typescript
// Di GameEngineFacade.bridgeToEventBus()
session.emitter.on('move.applied', (p) =>
  this.eventBus.emit('move.applied', { ...p, sessionId: session.id }),
);
```

---

## 6. REST API Endpoints

Semua endpoint tersedia di `SessionController` dan didokumentasikan otomatis di Swagger (`http://localhost:3001/api/docs`).

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/sessions` | Buat sesi game baru |
| `POST` | `/sessions/demo` | Buat sesi demo TicTacToe dengan 3 move pre-played |
| `GET` | `/sessions` | List semua sesi (bisa filter by status) |
| `GET` | `/sessions/:id` | Ambil game state via caching proxy |
| `POST` | `/sessions/:id/join` | Join ke sesi sebagai player |
| `POST` | `/sessions/:id/move` | Kirim move (lewat Authorization Proxy) |
| `DELETE` | `/sessions/:id` | Akhiri sesi (hanya member yang bisa) |

Controller meng-inject **Authorization Proxy** (bukan Facade langsung):
```typescript
constructor(
  private readonly proxy: GameEngineAuthorizationProxy,
  private readonly cacheProxy: CachedGameStateProxy,
) {}
```

---

## 7. Frontend

Frontend dibangun pakai **Next.js** dengan App Router dan di-deploy di port 3000. Koneksi ke backend via:
- **REST API** — HTTP request ke port 3001, di-proxy oleh Next.js
- **WebSocket** — Koneksi langsung ke `ws://localhost:3001` pakai socket.io-client

### Halaman Utama

| Route | Fungsi |
|---|---|
| `/` | Lobby — daftar sesi aktif, tombol New Session dan Demo Mode |
| `/lobby` | Form buat sesi baru (pilih game type, input nama) |
| `/game/[sessionId]` | Board game + player list + move history + real-time sync |
| `/architecture` | Showcase diagram arsitektur dan 11 pattern (untuk presentasi) |

### State Management
Pakai **Zustand** — store-nya nyimpen `currentSession`, `gameState`, `moveHistory`, `myPlayerId`, `endResult`. Hook `useGameSocket.ts` subscribe ke room Socket.io dan update store tiap ada event masuk.

---

## 8. Ringkasan Design Patterns

| # | Pattern | Kategori | File Utama |
|---|---|---|---|
| 1 | Singleton | Creational | `infrastructure/registry/game-registry.service.ts` |
| 2 | Prototype | Creational | `business/domain/games/game-state.ts` |
| 3 | Builder | Creational | `business/builders/game-session.builder.ts` |
| 4 | Abstract Factory | Creational | `business/factories/` (3 concrete factories) |
| 5 | Facade | Structural | `business/facades/game-engine.facade.ts` |
| 6 | Proxy (Protection) | Structural | `persistence/proxies/authorization.proxy.ts` |
| 7 | Proxy (Cache) | Structural | `persistence/proxies/cached-game-state.proxy.ts` |
| 8 | Adapter | Structural | `infrastructure/adapters/` (3 concrete adapters) |
| 9 | Template Method | Behavioral | `business/domain/games/game.abstract.ts` |
| 10 | State | Behavioral | `business/domain/states/` (4 concrete states) |
| 11 | Observer | Behavioral | `business/domain/events/game-event-emitter.ts` + `business/events/game-event-bus.ts` |

---

## 9. Mapping ke Learning Outcomes

| LO | Deskripsi | Pemenuhan |
|---|---|---|
| LO1 (C2) | Menjelaskan software architecture dan design pattern modern | Laporan ini menjelaskan Layered Architecture dan 11 GoF patterns |
| LO2 (C3) | Menggambar dan menyelesaikan masalah arsitektur | Diagram layer, state machine, dan struktur folder |
| LO3 (C4) | Menganalisis software architecture dan design pattern | Justifikasi pemilihan tiap pattern vs alternatifnya |
| LO4 (C5) | Membuat back-end API services dengan arsitektur modern | Backend NestJS + TypeScript dengan 7 endpoints, WebSocket, dan 11 patterns |

---

## 10. Middleware / Authentication

Sesuai instruksi LAB, proyek ini menerapkan middleware/authentication lewat **Protection Proxy**:

- `GameEngineAuthorizationProxy` memvalidasi bahwa requester adalah player terdaftar di sesi sebelum meneruskan request ke Facade
- Operasi yang diproteksi: `makeMove()` dan `endSession()`
- Controller tidak pernah memanggil Facade langsung — selalu lewat Proxy

---

## 11. Deliverables

| Deliverable | Status |
|---|---|
| Github Link (backend + frontend) | ✅ https://github.com/Jessssswill/PlayHub-SoftwareArchitecture |
| Project Presentation (PPT/Notion/PDF) | Terlampir terpisah |
| Video Teaser / Demo Aplikasi | Terlampir terpisah |
| Rencana Postingan Sosial Media (LinkedIn & Instagram) | Terlampir terpisah |
| Project Reports | Dokumen ini |
| Exhibition Registration Evidence | Terlampir terpisah |

---

## 12. Cara Menjalankan

```bash
# Prerequisites: Node.js 20+
npm run install:all    # install semua dependencies
npm run dev            # jalankan backend + frontend

# Backend:  http://localhost:3001
# Frontend: http://localhost:3000
# Swagger:  http://localhost:3001/api/docs
```

---

## 13. Anggota Tim

| Nama | NIM | Kontribusi |
|---|---|---|
| Jessen William | 2802391605 | Domain Layer, State Machine, Template Method, Frontend |
| Vabregass | 2802393913 | Factory, Builder, Creational Patterns |
| Yupriando | 2802392204 | Adapter, Facade, AI Engine |
| Jeremy Felix | 2802429794 | Frontend (Next.js, Zustand, WebSocket client) |
| Marco Andrean | 2802424250 | Testing, Documentation, Proxy, ISO 25010 |
