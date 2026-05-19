# GSLC Slide Content

> Game Session Manager — Software Architecture Final Project
> Text-only slide content. Design dan layout dilakukan secara terpisah di PowerPoint.

---

## Slide 1 — Title

**Judul:** Game Session Manager API

**Subtitle:** Real-time Multiplayer Game Backend dengan Layered Architecture + 11 Design Patterns

**Keterangan:**
- Mata Kuliah: Software Architecture
- [Nama Tim / Kelompok]
- [Tanggal Presentasi]

---

## Slide 2 — Project Problem

**Judul:** Tantangan yang Diselesaikan

**Poin-poin:**

1. **Extensibility** — Bagaimana mendukung multiple game types (TicTacToe, Chess, dan seterusnya) tanpa modifikasi kode existing setiap kali game baru ditambahkan?

2. **Real-time State Sync** — Dua pemain di browser berbeda harus melihat papan yang sama secara instan setelah setiap move, tanpa polling manual.

3. **Lifecycle Complexity** — Sesi game memiliki transisi status yang ketat (WAITING → IN_PROGRESS → PAUSED → FINISHED). Bagaimana mencegah transisi ilegal tanpa kode if-else yang sulit di-maintain?

4. **Authorization** — Hanya player terdaftar yang boleh mengirim move. Bagaimana memisahkan logika auth dari business logic game?

5. **Maintainability** — Tim 4 orang, timeline 2 minggu. Arsitektur harus cukup terstruktur untuk kolaborasi paralel tanpa konflik.

---

## Slide 3 — Project Objective

**Judul:** Tujuan Proyek

**Poin-poin:**

1. Membangun backend API yang menghosting multiple game types dengan satu codebase yang extensible

2. Mendemonstrasikan **Layered Architecture (Closed)** sebagai architectural style yang menjawab kebutuhan tim kecil

3. Mengimplementasikan **11 GoF Design Patterns** dari mata kuliah Software Architecture dalam konteks sistem nyata

4. Memenuhi target kualitas **ISO/IEC 25010** — khususnya Maintainability, Reliability, dan Security

5. Memberikan pengalaman multiplayer real-time melalui WebSocket dengan latency <100ms

---

## Slide 4 — Selecting Project Architecture

**Judul:** Pemilihan Arsitektur

**Style yang Dipilih:** Layered Architecture (Closed Layers)

**Analisis dari 4 Perspektif:**

| Perspektif | Analisis | Keputusan |
|-----------|---------|-----------|
| **User Needs** | Real-time low-latency, API-first untuk multi-platform client | Monolith dengan WebSocket — tidak perlu service mesh |
| **Business / Domain** | Game rules terpisah dari API handling; bounded context jelas | Layer Domain terpisah dari Presentation |
| **System Analysis** | Tim 4 orang, 2 minggu → deployment complexity harus minimal | Monolith > Microservices untuk scope ini |
| **ISO 25010** | Prioritas: Maintainability + Modifiability + Security | Closed layers enforce dependency direction |

**Alternatif yang Ditolak:**
- **Microservices** — overhead deployment, service discovery, dan distributed tracing tidak sebanding dengan scope 2 minggu
- **Hexagonal/Ports & Adapters** — lebih tepat untuk domain yang sangat kompleks; Layered sudah cukup untuk game engine ini dan memiliki migration path ke Hexagonal jika diperlukan

---

## Slide 5 — Design Patterns: Creational

**Judul:** Design Patterns — Creational (4 Patterns)

| Pattern | Implementasi | Role dalam Proyek |
|---------|-------------|------------------|
| **Singleton** | `GameRegistry` (NestJS DI default scope) | Satu registry menyimpan semua sesi aktif — tidak ada duplikasi state |
| **Prototype** | `GameState.clone()` implements `Cloneable<T>` | Deep copy board sebelum mutasi — preview move tanpa merusak state asli |
| **Builder** | `GameSessionBuilder` dengan fluent API | Konstruksi GameSession dengan validasi terpusat di `build()` — tidak ada telescoping constructor |
| **Abstract Factory** | `IGameFactory` → `TicTacToeFactory`, `ChessFactory` | Tiap factory produksi board + rules + initial state yang kompatibel — tambah game type tanpa ubah kode existing |

---

## Slide 6 — Design Patterns: Structural

**Judul:** Design Patterns — Structural (4 Patterns)

| Pattern | Implementasi | Role dalam Proyek |
|---------|-------------|------------------|
| **Facade** | `GameEngineFacade` | Satu API untuk semua operasi game — sembunyikan koordinasi 6 subsystem dari controller |
| **Proxy (Protection)** | `GameEngineAuthorizationProxy` | Validasi keanggotaan player sebelum operasi apapun — auth terpisah dari business logic |
| **Proxy (Cache)** | `CachedGameStateProxy` | Cache getState() 1 detik + auto-invalidate via event — kurangi registry lookup berulang |
| **Adapter** | `IAIEngine` ← `RandomAiAdapter`, `MinimaxAiAdapter`, `ExternalEngineAdapter` | Swap implementasi AI tanpa ubah facade — pluggable AI engine |

---

## Slide 7 — Design Patterns: Behavioral

**Judul:** Design Patterns — Behavioral (3 Patterns)

| Pattern | Implementasi | Role dalam Proyek |
|---------|-------------|------------------|
| **Template Method** | `Game.executeTurn()` di abstract class | Skeleton satu giliran: validate→apply→checkEnd→emit; urutan tidak bisa di-skip subclass |
| **State** | `IGameLifecycleState` → 4 concrete states | 4 state × 6 operasi dikelola oleh state objects — tidak ada 24 branch if-else di session class |
| **Observer** | `GameEventEmitter` (per-session) + `GameEventBus` (global) | Decoupling domain events dari WebSocket — game engine tidak tahu siapa subscriber-nya |

---

## Slide 8 — Tech Stack

**Judul:** Technology Stack

**Backend:**
- **NestJS 11** — dipilih karena DI + module system menegakkan Layered Architecture secara idiomatik; decorators membuat patterns (Injectable, Controller) eksplisit di kode
- **TypeScript 5.7** — static typing untuk domain model yang kompleks; interface enforcement
- **TypeORM + SQLite** — persistence layer yang dapat diganti PostgreSQL untuk produksi
- **Socket.io** — WebSocket dengan fallback, room broadcasting untuk session sync

**Frontend:**
- **Next.js 16 (App Router)** — Server/Client component split; SSR untuk initial load
- **Zustand** — lightweight state management; single source of truth untuk game state
- **Tailwind CSS 4** — utility-first styling dengan design token consistency

**Tooling:**
- **Jest** — unit + E2E testing; custom TestingModule tanpa TypeORM untuk isolation
- **Swagger/OpenAPI** — auto-generated API docs dari decorators

**Justifikasi NestJS:**
NestJS dipilih secara spesifik karena framework ini natively mendukung pattern yang kami implementasikan:
`@Injectable()` = Singleton, `@Controller()` = separation of concerns, Module system = layer isolation.

---

## Slide 9 — Project Demo / Mockup

**Judul:** Demo Aplikasi

**Screenshot yang perlu disertakan:**
1. **Lobby Page** (`localhost:3000`) — daftar sesi aktif, tombol "New Session" dan "Try Demo Mode"
2. **Create Session Form** (`/lobby`) — pilih game type (TicTacToe/Chess), input nama player
3. **TicTacToe Game Board** — papan 3×3, move history, player list, real-time turn indicator
4. **Chess Game Board** — papan 8×8, piece Unicode, two-click selection, captured piece display
5. **Architecture Page** (`/architecture`) — component diagram, 11 pattern accordion, ISO 25010 table

**Flow Demo (untuk presenter):**
1. Buka `localhost:3000`
2. Klik "Try Demo Mode" → sesi TicTacToe terbuat otomatis
3. Klik cell di papan → move terkirim via WebSocket
4. Buka tab kedua di URL yang sama → pilih player lain → giliran berganti real-time
5. Navigasi ke `/architecture` → tunjukkan Mermaid diagram dan pattern accordion

---

## Slide 10 — GitHub & Team

**Judul:** Repository & Tim

**Repository:** [GitHub URL]

**Dokumentasi:**
- `README.md` — setup instructions
- `docs/ARCHITECTURE.md` — full system architecture
- `docs/PATTERNS.md` — 11 pattern justification (grading artifact)
- `docs/ISO-25010-JUSTIFICATION.md` — quality attribute mapping
- `localhost:3001/api/docs` — Swagger API documentation

**Anggota Tim:**

| Nama | NIM | Kontribusi Utama |
|------|-----|-----------------|
| [Member 1] | [NIM] | Backend Lead — Domain Layer, State Machine, Template Method |
| [Member 2] | [NIM] | Backend — Factory, Builder, Proxy, Adapter |
| [Member 3] | [NIM] | Frontend — Next.js, Zustand, WebSocket client |
| [Member 4] | [NIM] | Testing, Documentation, ISO 25010 Mapping |

**Pattern per orang (untuk presentasi):**
- Orang 1: Singleton, Prototype, Template Method, State
- Orang 2: Abstract Factory, Builder, Adapter
- Orang 3: Observer (frontend side), Facade
- Orang 4: Proxy (Protection + Cache), ISO 25010

---

## Catatan untuk Presenter

1. **Demo berjalan dulu** sebelum presentasi — jalankan `npm run dev` dari root folder dan verifikasi `/architecture` page load
2. **Siapkan 2 tab browser** untuk demo real-time multiplayer
3. **Jika backend mati** — fallback ke screenshot di slide 9
4. **Pertanyaan yang sering ditanya** → lihat `docs/HANDOFF.md` section "Anticipated Professor Questions"
