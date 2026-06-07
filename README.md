# Game Session Manager

Real-time multiplayer game session backend + frontend. Final project Software Architecture.

## Team

| Nama | NIM | Peran |
|------|-----|-------|
| Jessen William | 2802391605 | Frontend-Backend Lead (Domain Layer, State Machine, Next.js) |
| Vabregass | 2802393913 | Backend (Creational Patterns, Abstract Factory, Builder) |
| Yupriando | 2802392204 | Backend Infrastructure (Adapter, Facade, AI Engine) |
| Jeremy Felix | 2802429794 | Frontend (Next.js, Zustand, WebSocket client) |
| Marco Andrean | 2802424250 | Testing, Documentation, Proxy, ISO 25010 |

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Backend | NestJS 11 + TypeScript |
| Database | SQLite via TypeORM |
| WebSocket | Socket.io |
| Frontend | Next.js 16 (App Router) |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |

## Design Patterns (11 GoF)

Singleton, Prototype, Builder, Abstract Factory, Template Method, State, Observer, Facade, Proxy (Protection), Proxy (Cache), Adapter.

## Setup

```bash
# Install semua dependencies
npm run install:all

# Jalankan backend (:3001) + frontend (:3000) bersamaan
npm run dev
```

## Endpoint API

| Method | Path | Keterangan |
|--------|------|-----------|
| `POST` | `/sessions` | Buat sesi baru |
| `POST` | `/sessions/demo` | Buat sesi demo instan |
| `GET` | `/sessions` | List semua sesi |
| `GET` | `/sessions/:id` | Ambil game state |
| `POST` | `/sessions/:id/join` | Bergabung ke sesi |
| `DELETE` | `/sessions/:id` | Akhiri sesi |
| `POST` | `/sessions/:id/move` | Kirim move |
| `WS` | `ws://localhost:3001` | Koneksi Socket.io |

Swagger docs: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Testing

```bash
cd backend
npm test
npm run test:e2e
npm run test:cov
```

## Dokumentasi

| File | Isi |
|------|-----|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered architecture, diagram, sequence flow |
| [docs/PATTERNS.md](docs/PATTERNS.md) | 11 pattern: intent, lokasi, code snippet |
| [docs/ISO-25010-JUSTIFICATION.md](docs/ISO-25010-JUSTIFICATION.md) | Mapping quality attributes |
| [docs/GSLC-SLIDE-CONTENT.md](docs/GSLC-SLIDE-CONTENT.md) | Konten slide presentasi |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Q&A prep, ADR, known issues |
| [docs/KONTRIBUSI-TIM.md](docs/KONTRIBUSI-TIM.md) | Penjelasan kontribusi per anggota |
