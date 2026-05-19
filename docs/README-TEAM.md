# PlayHub Panduan Tim

> Game Session Manager API | Software Architecture Final Project
> Dibaca pertama kali oleh setiap anggota tim baru.

---

## Pembagian Tugas

Dokumentasi utama untuk project **PlayHub** API backend + frontend untuk multiplayer game session (TicTacToe, Chess, dan Connect Four yang lagi on progress).

Foundation sudah 100% selesai. Backend berjalan, frontend sudah polished, 142 tests passing, dokumentasi sudah lengkap. Yang tersisa sekarang adalah polish, 1 fitur tambahan (Connect Four), dan persiapan presentasi. Estimasi total effort tersisa: **6–10 jam per orang**, tergantung track yang dipilih.

---

## Apa Yang Sudah Jadi

### Backend

| Kategori | Detail |
|---------|--------|
| Framework | NestJS 11 + TypeScript strict |
| Database | SQLite via TypeORM |
| Real-time | Socket.io (WebSocket gateway) |
| API | REST + Swagger di `/api/docs` |
| Tests | 142 tests passing (unit + e2e) |
| Design Patterns | 10 pattern terimplementasi (lihat tabel di bawah) |

**10 Design Patterns:**

| # | Pattern | Lokasi |
|---|---------|--------|
| 1 | Abstract Factory | `backend/src/business/factories/` |
| 2 | Builder | `backend/src/business/builders/game-session.builder.ts` |
| 3 | Prototype | `backend/src/business/domain/games/game-state.ts` |
| 4 | Singleton | `backend/src/infrastructure/registry/game-registry.service.ts` |
| 5 | Adapter | `backend/src/infrastructure/adapters/` |
| 6 | Facade | `backend/src/business/facades/game-engine.facade.ts` |
| 7 | Proxy (Authorization) | `backend/src/persistence/proxies/authorization.proxy.ts` |
| 8 | Proxy (Cache) | `backend/src/persistence/proxies/cached-game-state.proxy.ts` |
| 9 | State | `backend/src/business/domain/states/` |
| 10 | Observer + Template Method | `backend/src/business/domain/events/` + `games/game.abstract.ts` |

### Frontend

| Halaman | URL | Status |
|---------|-----|--------|
| Lobby / Landing | `/` | Done |
| Create Session | `/lobby` | Done |
| Game Board | `/game/[sessionId]` | Done |
| Architecture Showcase | `/architecture` | Done (killer feature buat presentasi!) |

Fitur frontend:
- Design tokens consistent (`frontend/src/lib/design-tokens.ts`) dark theme polished
- Toast notifications via react-hot-toast no `alert()` popup jadul
- Real-time WebSocket integration dengan Zustand state management
- LoadingState, EmptyState, ErrorState components

### Game Support

| Game | Status | Catatan |
|------|--------|---------|
| TicTacToe | Fully playable end-to-end | |
| Chess | Basic moves working | Check/checkmate belum, win = king captured |
| Connect Four | Pending | Factory/enum ada, implementasi belum |

### Dokumentasi di `docs/`

| File | Isi |
|------|-----|
| `ARCHITECTURE.md` | Diagram sistem + penjelasan tiap layer |
| `PATTERNS.md` | Detail 10 pattern: intent, code snippet, UML |
| `ISO-25010-JUSTIFICATION.md` | Mapping quality attributes ke pattern |
| `GSLC-SLIDE-CONTENT.md` | Content slide 10 halaman, siap didesain |
| `HANDOFF.md` | Q&A preparation + ADR (Architecture Decision Record) |
| `CONNECT-FOUR-PROMPT.md` | Prompt Claude Code untuk implement Connect Four |
| `README-TEAM.md` | File ini panduan tim |

---

## Tech Stack & Kenapa Pilih Itu

### Backend

| Tech | Version | Buat Apa | Kenapa Pilih |
|------|---------|---------|--------------|
| NestJS | 11 | Backend framework | Native support dependency injection + decorator. Bikin Layered Architecture jadi natural enforce gak perlu manual setup folder convention. `@Injectable()` itu literally Singleton pattern. |
| TypeScript | 5.7 | Bahasa pemrograman | Static typing untuk domain model yang kompleks. Interface enforcement memastikan tiap pattern diimplementasi dengan benar. Kalau salah, langsung error saat compile, bukan saat runtime. |
| TypeORM | 0.3 | ORM (database access) | Abstraksi database kalau mau ganti dari SQLite ke PostgreSQL untuk production, cukup ubah 1 baris config. Tidak ada perubahan di business logic. |
| SQLite | - | Database | File-based, zero config, cocok untuk demo akademik. Tidak perlu install MySQL/PostgreSQL. Database otomatis terbuat saat app dijalankan pertama kali. |
| Socket.io | 4 | Real-time WebSocket | Room broadcasting bawaan tiap game session punya "room"-nya sendiri. Kalau player A move, semua yang join room yang sama langsung dapat update tanpa polling. |

### Frontend

| Tech | Version | Buat Apa | Kenapa Pilih |
|------|---------|---------|--------------|
| Next.js | 16 | Frontend framework | App Router + Server/Client component split. SSR untuk initial load cepat, Client component untuk interaktivitas game. |
| Tailwind CSS | 4 | Styling | Utility-first, gak perlu nulis CSS manual. Design tokens di satu file (`design-tokens.ts`) membuat seluruh UI konsisten tanpa effort. |
| Zustand | 5 | State management | Lightweight, jauh lebih simpel dari Redux. Single source of truth untuk game state yang diupdate via WebSocket. |
| react-hot-toast | 2 | Notifikasi | Loading/success/error toast yang accessible. Pengganti `alert()` yang jadul dan tidak bisa di-style. |
| socket.io-client | 4 | WebSocket client | Pair dengan backend Socket.io. Auto-reconnect, event-based, mudah di-integrate dengan Zustand. |

---

## Setup Lokal

### Pre-requisites

Sebelum mulai, pastikan sudah terinstall:
- **Node.js 20+** download di [nodejs.org](https://nodejs.org). Cek versi: `node --version`
- **Git** download di [git-scm.com](https://git-scm.com). Cek versi: `git --version`
- **VSCode** (recommended) extension yang berguna: ESLint, TypeScript, Tailwind IntelliSense

### Clone & Install

```bash
# Clone repo
git clone https://github.com/Jessssswill/PlayHub-SoftwareArchitecture.git
cd PlayHub-SoftwareArchitecture

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Menjalankan Aplikasi

Ada 2 opsi tergantung spec laptop:

#### Opsi A: Development Mode (untuk laptop dengan RAM 16 GB+)

Buka 2 terminal terpisah:

```bash
# Terminal 1 Backend (port 3001)
cd backend
npm run start:dev

# Terminal 2 Frontend (port 3000)
cd frontend
npm run dev
```

#### Opsi B: Lighter Mode (recommended untuk laptop RAM 8 GB)

```bash
# Terminal 1 Backend di production mode (lebih ringan, no hot reload)
cd backend
npm run build
npm run start:prod

# Terminal 2 Frontend (tetap dev mode supaya perubahan UI langsung ke-update)
cd frontend
npm run dev
```

> Pengalaman pribadi: kombinasi full dev mode di backend + frontend Next.js 16 bisa bikin laptop freeze terutama saat hot reload. Opsi B: backend production mode jauh lebih ringan karena gak ada file watcher.

### Verifikasi Setup Berhasil

1. Buka http://localhost:3000 harus muncul Game Lobby (dark theme)
2. Klik **"Demo Mode"** harus redirect ke game page dengan TicTacToe board aktif
3. Buka http://localhost:3001/api/docs harus muncul Swagger UI dengan semua endpoint
4. Di game page, coba klik cell di board harus bisa move

Kalau ada error saat `npm install`, coba:
```bash
npm install --legacy-peer-deps
```

Kalau port 3001 sudah dipakai (error EADDRINUSE):
```bash
# Windows
npx kill-port 3001

# Mac/Linux
lsof -ti:3001 | xargs kill
```

### Menjalankan Tests

```bash
cd backend
npm test
# Output: 142 tests should pass, 0 failed
```

---

## Pembagian Task

Ada **5 track** yang harus dipilih saat meeting tim pertama. Setiap track punya scope yang jelas, deliverable yang terukur, dan estimasi effort yang realistis.

> **Cara assign**: Di meeting pertama, anggota pilih track sesuai preferensi + strength masing-masing. Track 1 sudah di-claim project lead.

---

### Track 1: Project Lead & Integration (Sudah di-claim)

**Scope**: Foundation sudah selesai. Sisa task adalah implement Connect Four dan pastikan semua PR dari tim terintegrasi dengan benar.

**Sisa task:**
- [ ] Implement Connect Four (gunakan prompt di `docs/CONNECT-FOUR-PROMPT.md`)
- [ ] Code review semua PR dari anggota tim lain
- [ ] Final integration testing setelah semua task merge ke `main`

**Estimasi sisa**: 4–5 jam

---

### Track 2: Testing & Quality Assurance

**Goal**: Pastikan aplikasi bekerja sempurna di semua skenario yang mungkin diuji dosen saat demo.

**Task detail:**
- [ ] **Multi-player test**: Buka 2 tab browser yang berbeda (atau 2 device), join session yang sama, mainkan TicTacToe + Chess sampai selesai. Verifikasi state sync real-time benar-benar jalan.
- [ ] **Cross-browser test**: Jalankan flow lengkap di Chrome, Firefox, dan Edge. Catat kalau ada yang berbeda.
- [ ] **Responsive test**: Buka Chrome DevTools (`F12`), toggle device toolbar (`Ctrl+Shift+M`), test di preset "iPhone SE" (375px) dan "iPad" (768px). Cek apakah board game overflow atau tidak.
- [ ] **Bug hunting**: Coba skenario edge case join session yang sudah FINISHED, klik move bukan giliran kamu, refresh halaman saat game berlangsung.
- [ ] **Test Connect Four**: Setelah Track 1 selesai implement, langsung test end-to-end.
- [ ] **Dokumentasi hasil**: Buat file `docs/TESTING-LOG.md` (pakai template di bawah).
- [ ] **Bug reporting**: Buat GitHub Issue untuk setiap bug yang ditemukan, label dengan `bug`.

**Template TESTING-LOG.md:**
```markdown
# Testing Log

## Environment
- OS: [Windows 11 / macOS 14 / dll]
- Browser: [Chrome 124 / dll]

## Test Results

### Scenario: TicTacToe 2-player real-time
- Status: PASS / FAIL
- Notes: ...

### Scenario: [nama skenario]
- Status: PASS / FAIL
- Notes: ...

## Bugs Found
| ID | Deskripsi | Severity | Status |
|---|---|---|---|
| BUG-001 | ... | High/Medium/Low | Open/Fixed |
```

**Estimasi**: 6–8 jam

**Cocok untuk**: Orang yang teliti, sabar, suka coba-coba edge case.

**Pre-requisite**: Tahu cara buka DevTools Chrome (F12). Tidak perlu coding.

---

### Track 3: Documentation & Slide Design

**Goal**: Project terlihat polished dan profesional di mata dosen. Slide yang bagus bisa naikkan kesan keseluruhan secara signifikan.

**Task detail:**
- [ ] **Review docs**: Baca semua file di folder `docs/`, fix typo, improve kalimat yang ambigu. Fokusin ke `PATTERNS.md` dan `GSLC-SLIDE-CONTENT.md`.
- [ ] **PowerPoint**: Buat slide deck dari `docs/GSLC-SLIDE-CONTENT.md` content sudah ready, tinggal design visual. 10 slides minimum.
- [ ] **Export Mermaid diagrams**: Buka [mermaid.live](https://mermaid.live), paste diagram dari `docs/diagrams/README.md`, export PNG, simpan di folder `docs/diagrams/`.
- [ ] **Screenshots UI**: Jalankan app, screenshot 5 halaman berikut dalam kondisi bagus (bukan loading state):
  1. Landing page (kosong, belum ada session)
  2. Lobby dengan beberapa session aktif
  3. TicTacToe game board saat sedang dimainkan
  4. Chess game board saat sedang dimainkan
  5. `/architecture` page scroll ke bagian diagram
- [ ] **Update README.md**: Isi bagian team di root README.md dengan nama asli + NIM.
- [ ] **Q&A cheat sheet**: Buat file `docs/QA-CHEATSHEET.md` satu halaman ringkasan jawaban 5 pertanyaan paling mungkin ditanya dosen (referensi: section "Anticipated Professor Questions" di `docs/HANDOFF.md`).

**Estimasi**: 8–10 jam

**Cocok untuk**: Orang dengan design sense yang bagus, suka rapiin hal visual.

**Pre-requisite**: Bisa pakai PowerPoint atau Google Slides. Tidak perlu coding.

---

### Track 4: Feature & Code Polish

**Goal**: Pastikan code quality terjaga dan gameplay-nya solid.

**Task detail:**
- [ ] **Review Connect Four** (setelah Track 1 selesai): Review code yang dibuat, pastikan consistent dengan pattern yang sudah ada di TicTacToe/Chess.
- [ ] **Tambah unit tests**: Lihat coverage yang belum bagus (state machine transitions, event emitter edge cases), tambahkan test untuk area tersebut. Target: dari 142 tests naik minimal 10–15 tests.
- [ ] **Error messages**: Buka Swagger UI (`localhost:3001/api/docs`), coba trigger error case, pastikan pesan error-nya informatif buat user (bukan raw exception message).
- [ ] **(Optional) Chess check/checkmate**: Kalau ada waktu ekstra, buka `backend/src/business/domain/games/chess/chess-rules.ts` dan implement deteksi check/checkmate yang proper. Hati-hati: ini bisa break existing chess tests kalau tidak hati-hati. **Skip kalau tidak yakin.**

**Estimasi**: 6–8 jam

**Cocok untuk**: Orang yang nyaman coding dan bisa baca TypeScript.

**Pre-requisite**: Familiar dengan konsep OOP dasar. Pernah pakai Node.js sebelumnya.

---

### Track 5: Demo & Presentation

**Goal**: Deliverable presentasi yang smooth dan impressive. Dosen terkesan bukan cuma dari kode, tapi dari cara tim menyampaikannya.

**Task detail:**
- [ ] **Script demo**: Tulis scene-by-scene script untuk live demo 5–7 menit:
  - 0–5s: Buka landing page, tunjukkan dark theme design
  - 5–15s: Klik Demo Mode, redirect ke game, tunjukkan TicTacToe board
  - 15–30s: Buka tab kedua, join sebagai player 2, tunjukkan real-time sync
  - 30–45s: Navigasi ke `/architecture`, tunjukkan Mermaid diagram + pattern accordion
  - 45–60s: Tunjukkan Swagger UI di `localhost:3001/api/docs`
- [ ] **Video rekam** (jika diperlukan): Rekam demo 60 detik pakai OBS Studio atau Windows Game Bar (`Win+G`). Bisa di-embed ke slide sebagai backup kalau live demo gagal.
- [ ] **Dry-run #1**: Koordinasi meeting dengan semua anggota, jalankan simulasi presentasi penuh termasuk live demo. Hitung waktu.
- [ ] **Dry-run #2**: Satu hari sebelum presentasi. Fix timing issues dari dry-run #1.
- [ ] **Latihan Q&A**: Setelah presentasi, randomly tanya satu anggota: "Jelaskan pattern X yang kamu handle." Pastikan semua orang bisa jawab dalam <1 menit.
- [ ] **Persiapan teknis hari-H**: Pastikan laptop presenter sudah jalan, backend + frontend sudah ready, tidak perlu install apa-apa lagi.

**Estimasi**: 6–8 jam

**Cocok untuk**: Orang yang public speaking-nya OK dan mau jadi "manager" persiapan presentasi.

**Pre-requisite**: Punya OBS Studio, atau bisa pakai Windows Game Bar (built-in Windows 10/11).

---

## Pattern Assignment untuk Presentasi

Dosen biasanya tanya random ke presentasi. Semua orang **wajib paham minimal 2 pattern** terutama yang di-assign ke track masing-masing.

| Track | Pattern yang Harus Dikuasai |
|-------|---------------------------|
| Track 1 (Project Lead) | Abstract Factory, Builder, Prototype |
| Track 2 (Testing/QA) | Singleton, State |
| Track 3 (Documentation) | Adapter, Facade |
| Track 4 (Feature Dev) | Proxy (Auth + Cache), Template Method |
| Track 5 (Presentation) | Observer + Layered Architecture overview |

Untuk setiap pattern, kamu harus bisa jawab 4 pertanyaan ini dalam **<1 menit**:

1. **Pattern ini itu apa?** 1 kalimat definisi simpel, bukan definisi buku teks.
2. **Kenapa kami pakai di project ini?** 1 kalimat justifikasi spesifik ke codebase kita.
3. **Di mana lokasinya?** file path konkret.
4. **Apa yang rusak kalau pattern ini dihilangkan?** impact analysis.

**Contoh untuk Facade pattern:**
1. "Facade itu satu class yang nyembunyiin kompleksitas di baliknya, client cukup panggil 1 method, gak perlu tau ada berapa subsystem yang dikoordinasikan."
2. "Kita pakai karena operasi `makeMove` itu sebenarnya koordinasiin 6 subsystem sekaligus: authorization, game state, validator, event emitter, cache invalidation, dan registry. Kalau gak ada Facade, Controller harus tau semua itu melanggar Single Responsibility Principle."
3. "`backend/src/business/facades/game-engine.facade.ts`"
4. "Tanpa Facade, semua logika koordinasi itu harus ada di Controller. Tiap kali ada perubahan workflow (misal: tambah logging), kita harus ubah Controller padahal Controller harusnya cuma handle HTTP, bukan business logic."

**Tips belajar pattern (langkah konkret):**
1. Buka `docs/PATTERNS.md`, temukan section pattern-mu.
2. Buka file code aktual di path yang tertulis.
3. Baca komentar di atasnya ada penjelasan kenapa pattern ini dipilih.
4. Coba buka file test-nya (di `backend/test/`) dari test kelihatan pattern dipakai untuk apa.
5. Coba "modifikasi mental": kalau pattern ini dihapus, aku harus nulis apa untuk replace behavior-nya?

---

## Yang Belum Selesai

### Priority 1 Wajib Selesai Sebelum Submit

**Task 1.1: Implement Connect Four**
- Owner: Track 1 (Project Lead)
- Estimasi: 3–4 jam
- Cara kerja: Jalankan prompt di `docs/CONNECT-FOUR-PROMPT.md` via Claude Code
- Acceptance criteria:
  - [ ] Connect Four bisa dipilih saat create session
  - [ ] Board 7x6 muncul di frontend dan playable
  - [ ] Win condition benar: 4 biji berjajar (horizontal, vertikal, diagonal)
  - [ ] Tests passing

**Task 1.2: Multi-Player Manual Testing**
- Owner: Track 2 (Testing/QA)
- Estimasi: 2–3 jam
- Acceptance criteria:
  - [ ] TicTacToe 2-player real-time sync verified di 2 browser berbeda
  - [ ] Chess 2-player verified
  - [ ] `docs/TESTING-LOG.md` terisi dengan hasil testing

**Task 1.3: PowerPoint Slide Deck**
- Owner: Track 3 (Documentation)
- Estimasi: 4–5 jam
- Acceptance criteria:
  - [ ] 10 slides dari `docs/GSLC-SLIDE-CONTENT.md`
  - [ ] Mermaid diagrams sebagai PNG di-embed
  - [ ] Screenshots UI ter-include
  - [ ] Consistent visual design

**Task 1.4: Dry-Run Presentasi (2x)**
- Owner: Track 5 (Presentation) koordinasikan dengan semua anggota
- Estimasi: 2–3 jam (2 sesi)
- Acceptance criteria:
  - [ ] Setiap anggota bisa jawab 5 pertanyaan tentang pattern-nya
  - [ ] Total durasi presentasi sesuai limit dosen (tanya ke dosen)
  - [ ] Live demo jalan tanpa glitch

### Priority 2 Sangat Direkomendasikan

| Task | Owner | Estimasi |
|------|-------|---------|
| Cross-browser testing (Firefox + Edge) | Track 2 | 1–2 jam |
| Mobile responsive test (375px via DevTools) | Track 2 | 1 jam |
| Demo video 60 detik (backup live demo) | Track 5 | 2–3 jam |
| Screenshots UI berkualitas tinggi (5 screenshots) | Track 3 | 1 jam |
| Export Mermaid diagrams ke PNG | Track 3 | 30 menit |

### Priority 3 Nice to Have (Skip kalau waktu tidak cukup)

| Task | Owner | Estimasi | Catatan |
|------|-------|---------|--------|
| Chess check/checkmate detection | Track 4 | 4–6 jam | Bisa break chess tests, hati-hati |
| Tambah unit test (target +20 tests) | Track 4 | 3–4 jam | |
| Sound effects (click, win fanfare) | Track 4 | 2–3 jam | |

---

## Git Workflow

### Branch Strategy

```
main                    ← branch utama, always deployable, jangan push langsung
  └─ feature/connect-four
  └─ feature/testing-log
  └─ fix/chess-mobile-overflow
  └─ docs/slide-screenshots
```

### Workflow untuk Setiap Task

```bash
# 1. Sebelum mulai: pastikan local kamu up-to-date
git checkout main
git pull origin main

# 2. Buat branch baru
git checkout -b feature/nama-task-kamu
# Contoh: git checkout -b feature/connect-four
#         git checkout -b docs/testing-log
#         git checkout -b fix/board-overflow

# 3. Kerjain task...

# 4. Commit progress
git add .
git commit -m "feat: implement Connect Four board rendering"

# 5. Push ke GitHub
git push -u origin feature/nama-task-kamu

# 6. Buat Pull Request di GitHub, request review ke Project Lead

# 7. Setelah di-approve, merge ke main (Project Lead yang merge)
```

### Commit Message Convention

| Prefix | Dipakai Untuk |
|--------|--------------|
| `feat:` | Fitur baru |
| `fix:` | Bug fix |
| `docs:` | Perubahan dokumentasi |
| `test:` | Tambah atau update test |
| `chore:` | Maintenance (update dependency, config) |
| `refactor:` | Refactoring tanpa ubah behavior |

Contoh yang benar:
```
feat: implement Connect Four win condition detection
fix: chess board overflow on 375px mobile viewport
docs: add testing log for TicTacToe multi-player scenarios
test: add unit tests for WaitingState transitions
```

Contoh yang salah:
```
update stuff          ← terlalu vague
WIP                   ← kasih konteks
asdfgh               ← ini bukan commit message
```

### Code Review Checklist

Sebelum request PR review, pastikan:
- [ ] Code style konsisten dengan file yang sudah ada (indentation, naming)
- [ ] Tidak ada `any` type yang dipaksain (pakai `unknown` atau type yang tepat)
- [ ] Kalau tambah class baru yang merupakan pattern, ada JSDoc di atasnya
- [ ] Tests ditambah atau di-update kalau ada perubahan logic
- [ ] `npm test` passing di local sebelum push
- [ ] Tidak ada `console.log` debug yang ketinggalan

---

## 💬 Komunikasi & Sync

### Daily Check-in (via WA/Discord grup)

Setiap hari kerja (minimal saat ada progress), kirim update singkat dengan format:

```
Done: [apa yang sudah selesai hari ini]
WIP:  [sedang ngerjain apa sekarang]
Blocker: [ada hambatan tidak? kalau iya, butuh bantuan dari siapa?]
ETA:  [estimasi kapan bagian ini selesai]
```

Contoh:
```
Done: Setup lokal berhasil, berhasil jalankan 2-player TicTacToe
WIP:  Testing Chess di Firefox ada visual glitch di coordinate labels
Blocker: Tidak ada
ETA:  Testing selesai besok sore
```

Kalau ada blocker, tag langsung orangnya di grup jangan didiamkan, karena blocker yang tidak diselesaikan bisa delay seluruh tim.

### Meeting Sync

- **Meeting 1 (ASAP)**: Assign track, pastikan semua orang bisa setup lokal
- **Meeting 2 (Mid-sprint)**: Review progress, solve blocker, adjust timeline kalau perlu
- **Dry-run #1**: Presentasi simulasi penuh
- **Dry-run #2**: H-1 presentasi

### Kalau Stuck

Urutan yang disarankan kalau mentok:
1. Coba cari sendiri 15 menit baca error message dengan teliti, Google spesifik error-nya
2. Tanya di grup tim mungkin ada yang sudah nemu masalah yang sama
3. Ping project lead langsung tidak ada pertanyaan yang terlalu "noob"

Untuk pertanyaan teknis tentang codebase, bisa buka Claude Code dan tanya langsung itu yang dipake pas build foundation ini.

### Deadline Estimasi

Sesuaikan dengan deadline aktual dari dosen, tapi sebagai panduan:

| Milestone | Target |
|-----------|--------|
| Semua orang bisa run app lokal | H-7 presentasi |
| Connect Four selesai | H-5 presentasi |
| Slide deck selesai (draft) | H-4 presentasi |
| Testing + bug fix selesai | H-3 presentasi |
| Dry-run #1 | H-2 presentasi |
| Dry-run #2 | H-1 presentasi |

---

## Struktur Folder (Quick Reference)

```
game-session-manager/
├── backend/
│   └── src/
│       ├── presentation/          ← Controller (REST) + Gateway (WebSocket)
│       ├── business/
│       │   ├── domain/            ← Game objects, State machine, Events
│       │   ├── builders/          ← Builder pattern
│       │   ├── factories/         ← Abstract Factory pattern
│       │   └── facades/           ← Facade pattern
│       ├── infrastructure/
│       │   ├── adapters/          ← Adapter pattern (AI engines)
│       │   └── registry/          ← Singleton pattern
│       └── persistence/
│           └── proxies/           ← Proxy pattern (Auth + Cache)
├── frontend/
│   └── src/
│       ├── app/                   ← Next.js pages
│       ├── components/            ← React components
│       ├── lib/
│       │   ├── design-tokens.ts   ← Semua class Tailwind di satu tempat
│       │   ├── store.ts           ← Zustand global state
│       │   └── api.ts             ← API calls ke backend
│       └── hooks/                 ← Custom React hooks
└── docs/                          ← Semua dokumentasi tim
```

---

> **Pro tip**: Kalau ada yang mau nambah fitur atau fix sesuatu yang belum ada di task list, diskusi dulu di grup sebelum mulai biar gak ada duplikasi effort atau conflict sama pekerjaan orang lain.
>
> Semangat! Project ini kalau berhasil di-present dengan baik bisa jadi portfolio yang impressive untuk kalian semua. 
