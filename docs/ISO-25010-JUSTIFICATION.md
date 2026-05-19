# ISO/IEC 25010 Quality Attributes Justification

> Game Session Manager Software Architecture Final Project

Dokumen ini menghubungkan setiap keputusan arsitektur dengan kualitas produk yang ditargetkan berdasarkan standar **ISO/IEC 25010:2011** (System and Software Quality Model).

---

## Ringkasan Mapping

| Quality Attribute (ISO 25010) | Sub-characteristic | Keputusan Arsitektur | Evidence |
|-------------------------------|-------------------|---------------------|---------|
| Maintainability | Modularity | Layered Architecture (Closed) | Folder `presentation/`, `business/`, `persistence/` tidak ada cross-layer import |
| Maintainability | Reusability | Interface-first design | `IGameFactory`, `IAIEngine`, `IGameLifecycleState`, `Cloneable<T>` |
| Maintainability | Modifiability | Abstract Factory + Template Method | Menambah game type baru = 1 Factory + 1 Game subclass, tanpa ubah kode existing |
| Maintainability | Testability | Dependency Injection (NestJS) | Semua dependency di-inject, bisa di-mock di unit test |
| Functional Suitability | Correctness | State Pattern untuk lifecycle | Transisi ilegal (move di FINISHED) ditolak oleh state object, bukan ad-hoc if |
| Functional Suitability | Correctness | Template Method untuk game turn | Urutan validate→apply→checkEnd tidak bisa di-skip subclass |
| Reliability | Fault Tolerance | Validation layer sebelum mutasi | `MoveValidationService` + `AuthorizationProxy` menolak move invalid sebelum state berubah |
| Reliability | Recoverability | Builder validation di `build()` | Session tidak bisa dibuat dengan konfigurasi invalid |
| Performance Efficiency | Resource Utilization | Cache Proxy | `CachedGameStateProxy` mengurangi registry lookup berulang dengan TTL 1 s |
| Security | Authorization | Protection Proxy | `GameEngineAuthorizationProxy` memblokir non-member sebelum operasi apapun |
| Usability | User Assistance | Real-time update via Observer | WebSocket push, pemain tidak perlu refresh manual |
| Compatibility | Interoperability | REST + WebSocket standard | OpenAPI/Swagger di `/api/docs`, Socket.io protokol standar |
| Portability | Adaptability | Adapter pattern untuk AI engine | Implementasi AI bisa diganti runtime via DI token tanpa ubah business logic |

---

## 1. Maintainability

### 1.1 Modularity

**Keputusan:** Closed Layered Architecture, setiap layer hanya boleh import dari layer di bawahnya.

**Implementasi:**
- `presentation/` hanya import dari `business/`
- `business/` hanya import dari `domain/` dan `persistence/`
- `domain/` tidak bergantung pada framework (no `@nestjs/common` import di game logic)

**Evidence:**
```
backend/src/
├── presentation/     # HTTP + WS, tidak ada import ke business/domain langsung
├── business/
│   ├── domain/       # Pure game logic, tidak tahu NestJS, tidak tahu HTTP
│   ├── facades/      # Koordinasi antar subsystem
│   └── services/
├── infrastructure/   # Registry, AI adapters, knows business interfaces, not reverse
└── persistence/      # Storage + proxy, hanya import dari business
```

Struktur ini memungkinkan pengujian `domain/` secara murni tanpa dependency ke NestJS atau database.

### 1.2 Reusability

**Keputusan:** Semua komponen utama diekspresikan sebagai interface, bukan concrete class.

**Interface yang didefinisikan:**
- `IGameFactory`, abstraksi factory per game type
- `IAIEngine`, abstraksi AI move generator
- `IGameLifecycleState`, abstraksi lifecycle state
- `Cloneable<T>`, abstraksi prototype cloning
- `IStorage<T>`, abstraksi storage layer

**Benefit:** `TicTacToeFactory` dan `ChessFactory` bisa diganti dengan implementasi testing (mock factory) tanpa mengubah `GameEngineFacade`. Sama untuk `IAIEngine` swap antara RandomAI dan MinimaxAI tidak memerlukan perubahan facade.

### 1.3 Modifiability Open/Closed Principle

**Keputusan:** Abstract Factory + Template Method mewujudkan OCP di game engine.

**Skenario:** Tambahkan game type baru (misalnya Checkers):
1. Buat `CheckersGame extends Game` → implement 3 protected methods
2. Buat `CheckersFactory implements IGameFactory` → implement 3 factory methods
3. Register di `GameFactoryProvider`
4. Tambah ke `GameType` enum

**Tidak ada perubahan** pada: `GameEngineFacade`, `SessionController`, `GameGateway`, `GameRegistry`, atau state machine. Ini adalah OCP dalam praktik.

### 1.4 Testability

**Keputusan:** Semua dependency di-inject via NestJS DI container.

**Evidence:**
```typescript
// Unit test tanpa HTTP context
const registry = new GameRegistry();
const facade = new GameEngineFacade(registry, mockFactory, builder, tttGame, chessGame, validator, eventBus);
// Test langsung pada business logic
```

E2E test menggunakan `TestingModule` dengan `InMemoryStorage` (bukan TypeORM) sehingga tidak perlu database untuk tes.

---

## 2. Functional Suitability

### 2.1 Correctness State Machine

**Keputusan:** State Pattern untuk lifecycle session.

**Masalah yang diselesaikan:** Tanpa State pattern, setiap operasi di `GameSession` memerlukan branching berdasarkan status:
```typescript
// Tanpa State pattern rawan bug
makeMove() {
  if (this.status === 'WAITING') throw ...
  if (this.status === 'PAUSED') throw ...
  if (this.status === 'FINISHED') throw ...
  // proceed ...
}
```

4 state × 6 operasi = 24 branch, dan setiap tambahan state memerlukan modifikasi di semua 6 operasi.

**Dengan State Pattern:**
```typescript
// GameSession mendelegasikan ke state object
canAcceptMove(move: Move): void {
  this.state.canAcceptMove(this, move);  // throw atau tidak keputusan state object
}
```

Transisi yang tidak valid (misal: `pause()` saat `FINISHED`) ditangani oleh `FinishedState.pause()` yang melempar exception, tidak ada logika di session class sendiri.

### 2.2 Correctness Template Method

**Keputusan:** `executeTurn()` sebagai template method di `Game`.

Urutan `validate → apply → checkEnd → emit` tidak bisa dilewati oleh subclass. Ini menjamin:
- Setiap move telah divalidasi sebelum diterapkan
- Game over detection selalu terjadi setelah apply
- Event selalu di-emit setelah state berubah

---

## 3. Reliability

### 3.1 Fault Tolerance Layered Validation

**Keputusan:** Validasi berlapis sebelum state mutation.

Lapisan validasi:
1. **HTTP layer:** `class-validator` DTOs, format data harus valid
2. **Authorization Proxy:** playerId harus terdaftar di session
3. **State Machine:** lifecycle state harus mengizinkan operasi
4. **MoveValidationService:** giliran benar, move dalam batas board, cell tidak terisi
5. **Game Engine:** `validateMove()`, aturan game spesifik

State baru hanya dibuat jika semua lapisan lolos. Tidak ada partial state corruption.

### 3.2 Recoverability Builder Validation

**Keputusan:** `GameSessionBuilder.build()` memvalidasi dan throw sebelum object dicreate.

```typescript
build(): GameSession {
  if (!this.gameType) throw new BadRequestException('Game type wajib.');
  if (this.players.length < 2) throw new BadRequestException('Min 2 player.');
  // session hanya dibuat jika valid
}
```

Tidak ada `GameSession` dengan konfigurasi invalid yang masuk ke registry.

---

## 4. Performance Efficiency

### 4.1 Resource Utilization Cache Proxy

**Keputusan:** `CachedGameStateProxy` dengan TTL 1 detik dan auto-invalidasi.

**Konteks:** Spectator mode dapat memiliki banyak subscriber yang masing-masing memicu `getState()`. Tanpa cache, setiap request memicu `Map.get()` + serialisasi objek.

**Implementasi:**
- Cache hit: O(1) Map lookup
- Cache miss: delegate ke facade + cache result
- Auto-invalidasi: subscribe ke `move.applied` event, cache dihapus tepat setelah move baru

**Trade-off:** State di-cache maksimal 1 detik → client mungkin melihat state lama 1 detik. Diterima karena WebSocket push sudah meng-handle update real-time untuk player aktif; cache hanya relevan untuk HTTP polling.

---

## 5. Security

### 5.1 Authorization Protection Proxy

**Keputusan:** `GameEngineAuthorizationProxy` sebagai mandatory interceptor.

Semua operasi mutasi (`makeMove`, `endSession`) melalui proxy ini sebelum sampai ke facade:

```typescript
// Setiap controller memanggil proxy, bukan facade langsung
constructor(private readonly proxy: GameEngineAuthorizationProxy) {}
```

**Apa yang divalidasi:**
- `makeMove`: playerId harus ada di `session.players`
- `endSession`: requester harus member session

**Kenapa tidak pakai NestJS Guard?**
Guard berjalan di HTTP layer dan tidak bisa diuji tanpa HTTP context. Authorization Proxy adalah pure TypeScript class yang dapat diuji dengan unit test biasa dan dapat di-compose dengan Proxy lain.

---

## 6. Usability

### 6.1 Real-time Update Observer Pattern

**Keputusan:** WebSocket push via Observer + GameEventBus.

Tanpa WebSocket, player harus polling `/sessions/:id/state` setiap beberapa detik, delay lebih tinggi, bandwidth lebih boros, UX lebih buruk.

Dengan Observer:
- Move dikirim → `GameEventEmitter.emit('move.applied')` → `GameEventBus` → `GameGateway` → Socket.io broadcast
- Semua subscriber di room menerima update <50ms setelah move dieksekusi
- Frontend tidak perlu polling state, cukup listen ke WebSocket event

**Impact pada ISO 25010 Usability:** Mengurangi waiting time user (responsiveness) dan menghilangkan kebutuhan refresh manual (learnability).

---

## 7. Compatibility

### 7.1 Interoperability Standard Protocols

**Keputusan:** REST API dengan OpenAPI spec + Socket.io dengan message protocol standar.

- Swagger UI tersedia di `/api/docs`, dokumentasi otomatis untuk client integration
- Socket.io event names terdokumentasi (walaupun Socket.io sendiri bukan standar IETF)
- DTO validation menggunakan `class-validator`, kompatibel dengan berbagai client

---

## 8. Portability

### 8.1 Adaptability Adapter Pattern

**Keputusan:** `IAIEngine` sebagai target interface, dengan tiga implementasi.

Jika di masa depan perlu ganti AI engine (misal: dari random ke model ML external), cukup:
1. Buat adapter baru `implements IAIEngine`
2. Ganti binding di NestJS DI module

Tidak ada perubahan di `GameEngineFacade` atau controller. Ini mewujudkan ISO 25010 Adaptability, sistem mudah diadaptasi ke lingkungan baru.

---

## Kesimpulan

Keputusan arsitektur dalam project ini tidak diambil secara acak, setiap pattern dipilih untuk menjawab kebutuhan kualitas spesifik dari ISO 25010. Closed Layered Architecture memberikan fondasi Modularity dan Testability; behavioral patterns (State, Observer, Template Method) menjamin Correctness dan Reliability; structural patterns (Facade, Proxy, Adapter) menjamin Security, Performance, dan Portability.

Total: 11 pattern dengan justifikasi yang terukur terhadap standar internasional kualitas software.
