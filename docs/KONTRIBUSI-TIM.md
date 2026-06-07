# Kontribusi Tim: Penjelasan Lengkap

> PlayHub | Game Session Manager API
> Dokumen ini menjelaskan apa yang dikerjakan setiap anggota tim, kenapa pekerjaan itu penting, dan di mana kodenya berada.

---

## Cara Membaca Dokumen Ini

Setiap section menjelaskan satu anggota tim dengan format:
- **Apa yang dikerjakan** - gambaran besar
- **Kenapa penting** - kontribusi ini solve masalah apa
- **Detail teknis** - pattern, file, cara kerja
- **Analogi simpel** - kalau dosen nanya "ini ngapain", bisa jawab dengan ini

---

## Jessen William (2802391605)
### Frontend-Backend Lead: Domain Layer, State Machine, Next.js

#### Apa yang dikerjakan

Jessen membangun dua hal besar: **inti logika permainan di backend** (domain layer) dan **seluruh frontend aplikasi**. Ini adalah bagian paling kompleks karena semua sistem lain bergantung padanya.

Di backend, Jessen membuat kerangka dasar yang dipakai semua game: abstract class `Game`, state machine lifecycle sesi, observer/event system, dan integrasi WebSocket real-time. Di frontend, Jessen membangun semua halaman (lobby, game board, architecture page), design system, dan koneksi WebSocket ke backend.

#### Kenapa Penting

Tanpa domain layer yang solid, tidak ada game yang bisa berjalan. State machine memastikan lifecycle sesi (WAITING → IN_PROGRESS → PAUSED → FINISHED) tidak bisa di-skip atau dimanipulasi. Tanpa frontend, tidak ada yang bisa memainkan gamenya.

#### Detail Teknis

**Template Method Pattern** (`backend/src/business/domain/games/game.abstract.ts`)

Abstract class `Game` mendefinisikan urutan satu giliran yang tidak bisa diubah:
```
validateMove() → applyMove() → checkEndCondition() → emit event
```
TicTacToe, Chess, dan Connect Four semuanya extend class ini. Mereka boleh punya logika `validateMove` yang berbeda (misalnya Chess lebih kompleks), tapi urutannya selalu sama. Ini Template Method pattern.

**State Pattern** (`backend/src/business/domain/states/`)

4 file state yang masing-masing handle operasi berbeda:
- `waiting-for-players.state.ts` - bisa `startGame()`, tidak bisa `makeMove()`
- `in-progress.state.ts` - bisa `makeMove()`, `pause()`, `finish()`
- `paused.state.ts` - bisa `resume()`, `finish()`, tidak bisa `makeMove()`
- `finished.state.ts` - tidak bisa operasi apapun

Tanpa pattern ini, kode akan penuh `if (status === 'IN_PROGRESS') { ... } else if (status === 'PAUSED') { ... }` di setiap method. State pattern membuat tiap state self-contained dan mudah ditambah.

**Observer Pattern** (`backend/src/business/domain/events/game-event-emitter.ts`, `backend/src/business/events/game-event-bus.ts`)

Dua level observer:
1. `GameEventEmitter` - per sesi, emit event lokal (misalnya `move.applied`)
2. `GameEventBus` - global, forward event ke WebSocket gateway

Game engine tidak tahu ada WebSocket. Ia cuma emit event, dan WebSocket gateway yang subscribe dan forward ke browser.

**Frontend** (`frontend/src/`)

Semua halaman Next.js:
- `/` - Lobby, daftar sesi aktif, tombol Demo Mode
- `/lobby` - Form buat sesi baru (pilih game type, input nama)
- `/game/[sessionId]` - Board game, player list, move history, real-time sync
- `/architecture` - Showcase Mermaid diagram + 11 pattern accordion (untuk presentasi)

Design system (`frontend/src/lib/design-tokens.ts`) - semua warna, spacing, button style ada di satu file, dipakai konsisten di seluruh UI.

WebSocket hook (`frontend/src/hooks/useGameSocket.ts`) - subscribe ke room Socket.io, listen event `move`/`state`/`finished`, update Zustand store secara real-time.

#### File Utama

```
backend/src/business/domain/
  ├── game-session.ts                    ← context state machine
  ├── games/
  │   ├── game.abstract.ts              ← Template Method (abstract base)
  │   ├── game-state.ts                 ← Prototype (clone untuk immutability)
  │   ├── tic-tac-toe/                  ← TicTacToe implementation
  │   ├── chess/                        ← Chess implementation
  │   └── connect-four/                 ← Connect Four implementation
  ├── states/                           ← State Pattern (4 state classes)
  └── events/game-event-emitter.ts      ← Observer per-session

backend/src/business/events/
  └── game-event-bus.ts                 ← Observer global bridge ke WebSocket

frontend/src/
  ├── app/                              ← Semua halaman Next.js
  ├── components/                       ← Board components, UI states
  ├── hooks/useGameSocket.ts            ← Real-time WebSocket hook
  └── lib/design-tokens.ts             ← Design system tokens
```

#### Analogi Simpel untuk Dosen

"Domain layer itu kayak rules of the game yang terpisah dari siapa yang main dan gimana cara mainnya. Jessen bikin rules-nya dulu, baru orang lain bisa implement game-nya masing-masing. State machine-nya kayak referee: kalau game sudah FINISHED, tidak ada yang bisa kirim move lagi apapun yang terjadi."

---

## Vabregass (2802393913)
### Backend: Creational Patterns, Factory, Builder

#### Apa yang dikerjakan

Vabregass bertanggung jawab atas **bagaimana objek-objek game dibuat**. Ini mencakup tiga creational patterns: Abstract Factory (buat komponen game per game type), Builder (buat session dengan parameter kompleks), dan Singleton (satu registry untuk semua sesi aktif).

#### Kenapa Penting

Kalau tidak ada Abstract Factory, setiap kali mau tambah game baru (misalnya Checkers), harus ubah banyak file. Dengan factory, cukup tambah satu class baru dan daftarkan. Kalau tidak ada Builder, constructor `GameSession` akan punya 8+ parameter yang membingungkan. Builder memastikan objek hanya dibuat kalau semua kondisi valid.

#### Detail Teknis

**Abstract Factory Pattern** (`backend/src/business/factories/`)

Interface `IGameFactory` mendefinisikan kontrak: setiap factory harus bisa buat Board, Rules, dan InitialState yang kompatibel satu sama lain.

```
IGameFactory (interface)
  ├── TicTacToeFactory  → board 3×3, TicTacToe rules, state awal
  ├── ChessFactory      → board 8×8, Chess rules, state awal dengan pieces
  └── ConnectFourFactory → board 6×7, Connect Four rules, state awal
```

`GameFactoryProvider` (`game-factory.provider.ts`) adalah direktori factory: diberikan `GameType`, kembalikan factory yang tepat. Saat runtime, ini hanya O(1) Map lookup.

**Builder Pattern** (`backend/src/business/builders/game-session.builder.ts`)

`GameSessionBuilder` pakai fluent API:
```typescript
builder
  .reset()
  .forGame(GameType.CHESS)
  .addPlayer({ id: 'p1', name: 'Alice' })
  .addPlayer({ id: 'p2', name: 'Bob' })
  .build(); // validasi: minimal 2 player, gameType harus diset
```
Method `build()` lempar exception kalau kondisi tidak terpenuhi. Ini memastikan tidak ada `GameSession` yang terbuat dalam kondisi invalid.

**Singleton Pattern** (`backend/src/infrastructure/registry/game-registry.service.ts`)

`GameRegistry` adalah satu-satunya tempat penyimpanan semua sesi aktif. Karena NestJS default scope adalah singleton, hanya ada satu instance `GameRegistry` yang running - semua request baca/tulis dari registry yang sama. Ini bukan `getInstance()` anti-pattern; ini DI-managed singleton yang bisa di-mock saat testing.

**Prototype Pattern** (`backend/src/business/domain/games/game-state.ts`)

`GameState.clone()` melakukan deep copy board sebelum mutasi. Ini dipanggil di `applyMove()` setiap game: buat dulu copy-nya, modifikasi copy-nya, return copy yang sudah dimodifikasi. Kalau move gagal di tengah jalan, state asli tidak rusak.

#### File Utama

```
backend/src/business/factories/
  ├── game-factory.interface.ts         ← Interface Abstract Factory
  ├── tic-tac-toe.factory.ts           ← Concrete Factory TicTacToe
  ├── chess.factory.ts                 ← Concrete Factory Chess
  ├── connect-four.factory.ts          ← Concrete Factory Connect Four
  └── game-factory.provider.ts         ← Map GameType → Factory

backend/src/business/builders/
  └── game-session.builder.ts          ← Fluent Builder

backend/src/infrastructure/registry/
  └── game-registry.service.ts         ← Singleton registry

backend/src/business/domain/games/
  └── game-state.ts                    ← Prototype (clone method)
```

#### Analogi Simpel untuk Dosen

"Abstract Factory itu kayak pabrik yang beda lini produksinya per game. Mau produksi TicTacToe? Pakai lini TicTacToe - dapat papan 3×3, aturan TicTacToe, dan setup awal yang sesuai. Semua kompatibel satu sama lain. Mau tambah Checkers? Buka lini baru, tidak perlu ubah lini yang sudah ada."

---

## Yupriando (2802392204)
### Backend Infrastructure: Adapter, Facade, AI Engine

#### Apa yang dikerjakan

Yupriando membangun **lapisan infrastruktur** yang menghubungkan berbagai komponen dan menyederhanakan cara mereka berinteraksi. Ini mencakup Facade (satu pintu masuk untuk semua operasi game), Adapter (standarisasi AI engine yang berbeda-beda), dan implementasi AI engine.

#### Kenapa Penting

Tanpa Facade, controller harus tahu dan koordinasikan 6+ subsystem (registry, factory, builder, state machine, event emitter, validator) setiap kali ada request. Dengan Facade, controller cukup panggil satu method. Tanpa Adapter, setiap AI engine butuh kode khusus di mana-mana.

#### Detail Teknis

**Facade Pattern** (`backend/src/business/facades/game-engine.facade.ts`)

`GameEngineFacade` adalah satu-satunya class yang dipakai oleh controller dan gateway. Di baliknya, Facade mengkoordinasikan:

| Method Facade | Yang Terjadi di Dalam |
|---|---|
| `createSession()` | panggil factory → builder → simpan ke registry |
| `makeMove()` | validasi → ambil game engine → executeTurn → broadcast event |
| `getState()` | ambil dari registry → return board state |
| `joinSession()` | validasi → tambah player → emit joined event |

Controller tidak perlu tahu ada registry, factory, atau builder. Semuanya tersembunyi di dalam Facade.

**Adapter Pattern** (`backend/src/infrastructure/adapters/`)

Interface `IAIEngine` mendefinisikan satu method: `getNextMove(state, gameType): Move`.

Tiga implementasi dengan strategi berbeda:
- `RandomAiAdapter` - pilih move valid secara acak (untuk demo)
- `MinimaxAiAdapter` - AI dengan algoritma Minimax (lebih pintar)
- `ExternalEngineAdapter` - wrapper ke AI engine eksternal via HTTP (Adapter klasik: ubah interface eksternal jadi interface kita)

Semua AI engine bisa di-swap tanpa ubah satu baris pun di Facade atau Controller. Ini adalah kekuatan Adapter pattern.

**AI Engine Implementation**

Random AI untuk TicTacToe: scan semua cell kosong, pilih satu secara acak.
Random AI untuk Chess: coba posisi acak sampai menemukan move yang valid menurut `ChessRules`.
Minimax untuk TicTacToe: evaluasi semua possible game tree, pilih move yang paling menguntungkan (tidak bisa kalah kalau dimainin optimal).

#### File Utama

```
backend/src/business/facades/
  └── game-engine.facade.ts            ← Facade (single API untuk semua operasi)

backend/src/infrastructure/adapters/
  ├── ai-engine.interface.ts           ← Target interface (IAIEngine)
  ├── random-ai.adapter.ts             ← Random move strategy
  ├── minimax-ai.adapter.ts            ← Minimax strategy
  └── external-engine.adapter.ts      ← HTTP wrapper ke engine eksternal
```

#### Analogi Simpel untuk Dosen

"Facade itu kayak resepsionis hotel. Tamu tidak perlu tahu ada berapa departemen di belakang (housekeeping, kitchen, maintenance). Tamu tinggal bilang ke resepsionis, resepsionis yang koordinasikan. Adapter-nya kayak universal power adapter: colokan di mana-mana beda-beda, tapi dengan adapter semua bisa dipakai dari satu port yang sama."

---

## Jeremy Felix (2802429794)
### Frontend: Next.js, Zustand, WebSocket Client

#### Apa yang dikerjakan

Jeremy membangun **semua yang user lihat dan interaksi langsung**: halaman game, board TicTacToe/Chess/Connect Four, real-time state sync, dan integrasi WebSocket ke backend. Juga membangun halaman `/architecture` yang jadi killer feature presentasi.

#### Kenapa Penting

Backend boleh se-canggih apapun, tapi kalau tidak ada frontend yang bagus, dosen tidak akan tahu apa yang sudah dibangun. Jeremy memastikan semua pattern yang diimplementasikan backend terlihat bekerja secara visual di browser.

#### Detail Teknis

**State Management dengan Zustand** (`frontend/src/lib/store.ts`)

Satu store global yang menyimpan:
- `currentSession` - data sesi yang sedang dimainkan
- `gameState` - board state terkini (diupdate via WebSocket)
- `moveHistory` - histori move
- `myPlayerId` - identitas player di tab ini
- `endResult` - hasil akhir kalau game selesai

Kenapa Zustand bukan Redux? Zustand jauh lebih simpel, tidak perlu action, reducer, dispatch. Langsung update state dengan `set()`.

**WebSocket Real-time** (`frontend/src/hooks/useGameSocket.ts`)

Hook yang:
1. Connect ke Socket.io backend (`ws://localhost:3001`)
2. Emit `subscribe` dengan sessionId → masuk ke room Socket.io sesi ini
3. Listen event `move` → update `gameState` di store (board langsung berubah)
4. Listen event `state` → update status sesi
5. Listen event `finished` → tampilkan banner winner/draw

**Board Components**

`TicTacToeBoard.tsx` - grid 3×3, klik cell → emit move via HTTP POST, tunggu WebSocket event balik untuk update board.

`ChessBoard.tsx` - grid 8×8, dua-klik untuk move (klik piece dulu, klik tujuan). Validasi piece milik siapa (putih/hitam) sebelum allow selection.

`ConnectFourBoard.tsx` - grid 6×7, klik kolom → biji jatuh ke baris terbawah yang kosong (gravity). Tampilkan biji merah/kuning.

**Architecture Page** (`frontend/src/app/architecture/page.tsx`)

Halaman khusus untuk presentasi:
- Mermaid diagram interaktif dari sistem architecture
- Accordion untuk 11 design pattern (expand untuk lihat intent + file path)
- ISO 25010 quality attributes table
- Tech stack cards

**Observer Pattern di Frontend**

`GameEventBus` (backend) broadcast event ke semua client di room. Frontend `useGameSocket` hook adalah concrete observer yang listen dan react: saat `move` event diterima, store diupdate, React re-render board secara otomatis. Player 1 move → Player 2's board langsung update tanpa refresh.

#### File Utama

```
frontend/src/
  ├── app/
  │   ├── page.tsx                     ← Lobby (daftar sesi)
  │   ├── lobby/page.tsx              ← Create session form
  │   ├── game/[sessionId]/page.tsx   ← Game page wrapper
  │   └── architecture/page.tsx      ← Architecture showcase
  ├── components/
  │   ├── GamePageClient.tsx          ← Main game UI logic
  │   ├── TicTacToeBoard.tsx         ← TicTacToe board
  │   ├── ChessBoard.tsx             ← Chess board
  │   ├── ConnectFourBoard.tsx       ← Connect Four board
  │   ├── PlayerList.tsx             ← Daftar player + turn indicator
  │   ├── MoveHistory.tsx            ← Histori move
  │   └── MermaidDiagram.tsx         ← Mermaid renderer
  ├── hooks/
  │   ├── useGameSocket.ts           ← WebSocket + real-time sync
  │   └── useGameApi.ts              ← HTTP API hooks (polling)
  └── lib/
      ├── store.ts                    ← Zustand global state
      ├── api.ts                      ← Axios HTTP client
      └── design-tokens.ts           ← Design system
```

#### Analogi Simpel untuk Dosen

"Jeremy bikin semua yang kelihatan di browser. Backend itu kayak mesin di balik panggung, Jeremy yang bikin panggungnya - termasuk papan mainnya, layar skornya, dan lampu sorotnya. WebSocket-nya kayak walkie-talkie antara dua tab: satu orang gerak, yang lain langsung tahu tanpa perlu refresh."

---

## Marco Andrean (2802424250)
### Testing, Documentation, Proxy, ISO 25010

#### Apa yang dikerjakan

Marco mengerjakan **dua hal yang berbeda tapi sama pentingnya**: di backend ia implement dua Proxy pattern (authorization dan caching), dan di luar kode ia bertanggung jawab atas testing menyeluruh, dokumentasi, dan mapping ke standar kualitas ISO 25010.

#### Kenapa Penting

Proxy Authorization memastikan tidak ada yang bisa kirim move pakai nama orang lain. Proxy Cache memastikan ratusan spectator request tidak membebani registry. Tanpa testing yang bagus, tidak ada jaminan semua pattern bekerja benar. Tanpa dokumentasi dan ISO mapping, dosen tidak punya referensi untuk nilai proyek ini.

#### Detail Teknis

**Protection Proxy** (`backend/src/persistence/proxies/authorization.proxy.ts`)

`GameEngineAuthorizationProxy` berdiri di antara Controller dan Facade. Setiap request `makeMove()` yang masuk harus lewat proxy ini dulu.

Cara kerjanya:
1. Terima request `makeMove(sessionId, playerId, move)`
2. Cek: apakah `playerId` terdaftar di sesi `sessionId`?
3. Jika tidak → lempar `ForbiddenException` (HTTP 403)
4. Jika ya → forward ke `GameEngineFacade.makeMove()`

Kenapa tidak pakai NestJS Guard? Guard hanya jalan di HTTP layer, tidak bisa diuji tanpa HTTP context, dan tidak bekerja untuk WebSocket. Proxy ini pure TypeScript - bisa diuji dengan unit test biasa dan bekerja untuk semua transport.

**Caching Proxy** (`backend/src/persistence/proxies/cached-game-state.proxy.ts`)

`CachedGameStateProxy` cache hasil `getState()` selama 1 detik dengan auto-invalidate.

Cara kerjanya:
1. Request `getState(sessionId)` masuk
2. Cek cache: ada entry dan masih segar (< 1 detik)?
3. Jika ya → return dari cache (tanpa registry lookup)
4. Jika tidak → fetch dari Facade, simpan ke cache, return
5. Saat `move.applied` event diterima → hapus cache entry itu (invalidate)

Ini kritis untuk demo dengan spectator: kalau 10 browser buka session yang sama, tanpa cache = 10 registry lookup per detik. Dengan cache = 1 lookup per detik maksimal.

**Testing** (`backend/test/`)

180 tests yang cover:
- Unit test Facade: setiap operasi (createSession, makeMove, getState, dll)
- Unit test Proxy Authorization: valid player vs invalid player
- Unit test Connect Four: gravity, win horizontal/vertikal/diagonal, draw
- Unit test State Machine: setiap transisi (valid dan invalid)
- E2E test: full flow dari create session sampai game finished

**Dokumentasi** (`docs/`)

File yang dibuat/dikelola:
- `ARCHITECTURE.md` - diagram sistem + penjelasan layer
- `PATTERNS.md` - 11 pattern dengan intent, kode, UML, dan justifikasi
- `ISO-25010-JUSTIFICATION.md` - mapping pattern ke 8 quality attribute
- `GSLC-SLIDE-CONTENT.md` - content slide presentasi
- `HANDOFF.md` - Q&A preparation + Architecture Decision Record

**ISO 25010 Mapping**

ISO 25010 adalah standar kualitas software. Marco memetakan setiap pattern ke quality attribute yang relevan:

| Quality Attribute | Pattern yang Berkontribusi | Cara |
|---|---|---|
| Security | Proxy (Protection) | Validasi player sebelum operasi apapun |
| Performance Efficiency | Proxy (Cache) | Cache getState() 1 detik, kurangi registry lookup |
| Reliability | State Pattern | Transisi ilegal diblokir oleh state object |
| Maintainability | Abstract Factory | Tambah game type = satu class baru, zero perubahan existing |
| Functional Suitability | Facade + Template Method | Satu API untuk semua operasi, urutan turn terjamin |

#### File Utama

```
backend/src/persistence/proxies/
  ├── authorization.proxy.ts           ← Protection Proxy (auth guard)
  └── cached-game-state.proxy.ts      ← Caching Proxy (performance)

backend/test/
  ├── game-engine.facade.spec.ts      ← Unit test Facade
  ├── authorization.proxy.spec.ts     ← Unit test Auth Proxy
  ├── connect-four.spec.ts            ← Unit test Connect Four
  ├── session-flow.e2e-spec.ts        ← E2E test full session lifecycle
  └── ...                             ← (12 test file lainnya)

docs/
  ├── PATTERNS.md                     ← Grading artifact utama (868 baris)
  ├── ISO-25010-JUSTIFICATION.md      ← Quality mapping
  └── HANDOFF.md                      ← Tim handoff + Q&A prep
```

#### Analogi Simpel untuk Dosen

"Proxy Authorization itu kayak security di gedung: tidak peduli siapa yang minta masuk, security cek ID dulu. Kalau bukan karyawan yang terdaftar, tidak boleh lewat. Proxy Cache-nya kayak papan pengumuman: daripada setiap orang tanya langsung ke manager (registry), tempel informasi di papan dan update papannya setiap kali ada perubahan. Lebih efisien."

---

## Ringkasan: Siapa Kerjakan Apa

| Komponen Sistem | Penanggung Jawab |
|----------------|-----------------|
| Game logic abstraction (Template Method, State) | Jessen William |
| Event system & WebSocket bridge (Observer) | Jessen William |
| Frontend UI, design system, real-time sync | Jessen William |
| Object creation (Factory, Builder, Prototype, Singleton) | Vabregass |
| Single API untuk semua operasi (Facade) | Yupriando |
| AI engine & pluggable interface (Adapter) | Yupriando |
| Board components, Zustand store, WebSocket hooks | Jeremy Felix |
| Architecture page (showcase untuk presentasi) | Jeremy Felix |
| Authorization & caching layer (Proxy ×2) | Marco Andrean |
| Testing 180 tests | Marco Andrean |
| Dokumentasi & ISO 25010 | Marco Andrean |

---

## Pertanyaan yang Sering Ditanya Dosen

**"Siapa yang implement pattern X?"**

| Pattern | Yang Implement |
|---------|---------------|
| Singleton | Vabregass |
| Prototype | Vabregass |
| Builder | Vabregass |
| Abstract Factory | Vabregass |
| Template Method | Jessen William |
| State | Jessen William |
| Observer | Jessen William |
| Facade | Yupriando |
| Adapter | Yupriando |
| Proxy (Protection) | Marco Andrean |
| Proxy (Cache) | Marco Andrean |

**"Kalau ada bug di X, harus tanya siapa?"**

- Bug di board game / UI → Jeremy Felix
- Bug di aturan game (move validation, win detection) → Jessen William
- Bug di create session / object creation → Vabregass
- Bug di API / AI engine → Yupriando
- Bug di auth / performance → Marco Andrean
