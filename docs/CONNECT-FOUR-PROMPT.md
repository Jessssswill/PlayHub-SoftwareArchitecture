# Prompt: Implement Connect Four

> Paste isi file ini ke Claude Code untuk mengimplementasikan game Connect Four.
> File ini adalah instruksi teknis lengkap — baca dulu dari atas ke bawah sebelum mulai.

---

## INSTRUKSI UNTUK CLAUDE CODE

Kamu diminta implement game **Connect Four** ke dalam codebase PlayHub (Game Session Manager API).

Codebase ini sudah punya dua game yang berfungsi: **TicTacToe** dan **Chess**. Connect Four harus mengikuti **pola arsitektur yang persis sama** — jangan re-invent the wheel, ikuti struktur yang sudah ada.

Penting: codebase ini punya strict **Layered Architecture** dan menggunakan **GoF Design Patterns**. Setiap keputusan desain harus konsisten dengan pola yang ada. Baca referensi file di bawah sebelum menulis kode apapun.

---

## ATURAN WAJIB

1. **Baca file referensi dulu** — jangan langsung nulis kode. Pahami pattern yang ada.
2. **Ikuti persis struktur yang sama dengan TicTacToe** — naming convention, folder structure, class hierarchy, semua harus konsisten.
3. **Zero perubahan pada file yang tidak berkaitan** — jangan ubah TicTacToe, Chess, atau file infrastruktur yang sudah jalan, kecuali file yang disebutkan di bagian "Files to Modify".
4. **Semua tests harus tetap passing** — jalankan `npm test` sebelum selesai dan verifikasi 0 failed.
5. **Jangan pakai `any` type** — pakai type yang tepat atau `unknown`.

---

## REFERENSI FILE (Baca Sebelum Mulai)

Baca file-file ini untuk memahami pola yang harus diikuti:

### Game Implementation Reference
```
backend/src/business/domain/games/game.abstract.ts       ← Abstract base class (Template Method)
backend/src/business/domain/games/game-state.ts          ← GameState dengan Prototype pattern
backend/src/business/domain/games/tic-tac-toe/           ← Referensi utama, ikuti ini
  ├── tic-tac-toe.game.ts                                 ← Implementasi konkret game
  └── tic-tac-toe.rules.ts                               ← Validasi rules
```

### Factory Reference
```
backend/src/business/factories/
  ├── i-game-factory.interface.ts                        ← Interface yang harus diimplementasikan
  ├── tic-tac-toe.factory.ts                             ← Referensi factory TicTacToe
  └── game-factory-provider.ts                           ← Registry factory (perlu dimodifikasi)
```

### Type Reference
```
backend/src/business/domain/                             ← Cari GameType enum di sini
backend/src/presentation/dto/                            ← DTO shapes
```

### Test Reference
```
backend/test/                                            ← Lihat struktur test TicTacToe sebagai referensi
```

---

## SPESIFIKASI CONNECT FOUR

### Aturan Game

- **Board**: 6 baris × 7 kolom (rows × cols)
- **Pemain**: 2 orang. Player 1 = `'R'` (Red), Player 2 = `'Y'` (Yellow)
- **Move**: Pemain memilih kolom (0–6). Biji jatuh ke baris paling bawah yang kosong di kolom tersebut (gravity).
- **Win condition**: Salah satu pemain berhasil membuat **4 biji berjajar** — bisa horizontal, vertikal, atau diagonal (kedua arah).
- **Draw**: Board penuh (42 cell terisi) dan tidak ada yang menang.
- **Move format** yang dikirim dari frontend: `{ col: number }` — hanya perlu kolom, baris dihitung otomatis oleh backend.

### State Representation

Board direpresentasikan sebagai `string[][]` — array of rows, setiap cell berisi `''` (kosong), `'R'` (Red), atau `'Y'` (Yellow).

```
Row 0: ['', '', '', '', '', '', '']   ← baris paling atas
Row 1: ['', '', '', '', '', '', '']
Row 2: ['', '', '', '', '', '', '']
Row 3: ['', '', '', '', '', '', '']
Row 4: ['', '', '', '', '', '', '']
Row 5: ['R', 'Y', '', '', '', '', ''] ← baris paling bawah
```

---

## FILES YANG HARUS DIBUAT

### 1. `backend/src/business/domain/games/connect-four/connect-four.game.ts`

Extend `Game` abstract class. Implement 3 abstract methods:
- `validateMove(state, move, playerId)` — validasi: kolom dalam range 0–6, kolom belum penuh
- `applyMove(state, move, playerId)` — clone state, drop biji ke baris terbawah yang kosong di kolom tersebut, update `currentPlayerId` ke player berikutnya
- `checkEndCondition(state)` — cek apakah ada 4 berjajar (horizontal, vertikal, diagonal), atau draw (board penuh)

### 2. `backend/src/business/domain/games/connect-four/connect-four.rules.ts`

Static utility class dengan method:
- `static isValidColumn(board, col)` — cek col dalam range dan masih ada ruang
- `static dropPiece(board, col, piece)` — return row index tempat biji jatuh (baris terbawah yang kosong)
- `static checkWin(board, piece)` — cek apakah `piece` punya 4 berjajar
- `static isBoardFull(board)` — cek apakah semua 42 cell terisi

Untuk `checkWin`, cek 4 arah:
- Horizontal: tiap baris, cek 4 berurutan
- Vertikal: tiap kolom, cek 4 berurutan
- Diagonal kanan-bawah: `↘`
- Diagonal kiri-bawah: `↙`

### 3. `backend/src/business/factories/connect-four.factory.ts`

Implement `IGameFactory` interface:
- `createBoard()` — return 6×7 board kosong: `Array.from({ length: 6 }, () => Array(7).fill(''))`
- `createRules()` — return instance `ConnectFourRules`
- `createInitialState(playerIds)` — return `GameState` dengan board kosong dan `currentPlayerId` = playerIds[0]

### 4. `backend/src/business/domain/games/connect-four/index.ts`

Re-export barrel file:
```typescript
export { ConnectFourGame } from './connect-four.game';
export { ConnectFourRules } from './connect-four.rules';
```

### 5. `backend/test/connect-four.spec.ts`

Unit tests yang harus cover:
- Valid move: drop biji ke kolom kosong
- Gravity: biji jatuh ke baris paling bawah yang kosong
- Invalid move: kolom di luar range (< 0 atau > 6) → throw error
- Invalid move: kolom penuh (6 biji sudah ada di kolom) → throw error
- Win horizontal: 4 biji `'R'` berjajar horizontal
- Win vertikal: 4 biji `'Y'` berjajar vertikal
- Win diagonal: 4 biji berjajar diagonal kanan-bawah
- Win diagonal: 4 biji berjajar diagonal kiri-bawah
- Draw: board penuh tanpa pemenang
- Board state immutability: `applyMove` tidak mutate state asli (clone dulu)

### 6. `frontend/src/components/ConnectFourBoard.tsx`

React component untuk render board Connect Four.

Props interface:
```typescript
interface Props {
  board: string[][];        // 6×7 board
  onColClick: (col: number) => void;
  disabled: boolean;
  currentPiece: 'R' | 'Y' | null;  // piece giliran siapa sekarang
}
```

Requirements UI:
- Render grid 6×7 menggunakan CSS grid atau flexbox
- Tiap cell: lingkaran (menggunakan `rounded-full`) di dalam cell persegi
- Warna lingkaran: merah (`bg-red-500`) untuk `'R'`, kuning-amber (`bg-amber-400`) untuk `'Y'`, abu-abu kosong (`bg-slate-600`) untuk `''`
- Column headers: 7 tombol di atas board — satu per kolom. Klik kolom → panggil `onColClick(colIndex)`. Disabled kalau `disabled === true`.
- Hover effect pada column header: highlight kolom yang di-hover
- Pakai design tokens dari `../../lib/design-tokens` untuk warna background dan border

---

## FILES YANG HARUS DIMODIFIKASI

### 1. `backend/src/business/factories/game-factory-provider.ts`

Tambahkan mapping `GameType.CONNECT_FOUR` ke `ConnectFourFactory`:

```typescript
// Di dalam method getFactory() atau map yang ada:
[GameType.CONNECT_FOUR]: new ConnectFourFactory(),
```

### 2. File enum `GameType` (cari di codebase, kemungkinan di `backend/src/business/domain/` atau `backend/src/lib/`)

Pastikan `CONNECT_FOUR = 'CONNECT_FOUR'` sudah ada. Kalau sudah ada tapi commented out, uncomment saja. Kalau belum ada, tambahkan.

### 3. `frontend/src/components/GameBoard.tsx`

Tambahkan handling untuk `GameType.CONNECT_FOUR`:

```typescript
// Tambah case CONNECT_FOUR yang render ConnectFourBoard
// Lihat bagaimana TicTacToe dan Chess di-handle sebagai referensi
```

Move data yang dikirim untuk Connect Four: `{ gameType: GameType.CONNECT_FOUR, playerId: myPlayerId, col: colIndex }`

### 4. `frontend/src/app/lobby/page.tsx` (Create Session form)

Tambahkan Connect Four sebagai pilihan game type di game type selector. Icon yang sesuai: `'🔴'` atau `'⚫'`.

### 5. `frontend/src/lib/patterns-data.ts` (jika ada)

Kalau file ini ada dan berisi list pattern, tidak perlu diubah — Connect Four tidak menambah pattern baru, hanya memanfaatkan pattern yang sudah ada (Abstract Factory, Template Method, dll).

---

## LANGKAH IMPLEMENTASI (Urutan yang Disarankan)

Ikuti urutan ini supaya bisa test incremental:

```
1. Baca semua file referensi dulu (khususnya tic-tac-toe.game.ts dan tic-tac-toe.factory.ts)
2. Buat connect-four.rules.ts — mulai dari unit yang paling mudah di-isolasi
3. Buat connect-four.game.ts — extend Game abstract class
4. Buat connect-four.factory.ts
5. Modifikasi game-factory-provider.ts — daftarkan factory baru
6. Modifikasi GameType enum — pastikan CONNECT_FOUR ada
7. Jalankan npm test — semua 142 tests lama harus tetap passing
8. Buat connect-four.spec.ts dan jalankan — semua test baru harus passing
9. Buat ConnectFourBoard.tsx di frontend
10. Modifikasi GameBoard.tsx — tambah case CONNECT_FOUR
11. Modifikasi lobby/page.tsx — tambah Connect Four sebagai pilihan
12. Manual test end-to-end: create session Connect Four, play 2 giliran, verifikasi win condition
```

---

## CONTOH IMPLEMENTASI: Bagian `checkWin`

Ini bagian paling kompleks. Referensi algoritma:

```typescript
static checkWin(board: string[][], piece: string): boolean {
  const rows = board.length;      // 6
  const cols = board[0].length;   // 7

  // Horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - 4; c++) {
      if (board[r][c] === piece && board[r][c+1] === piece &&
          board[r][c+2] === piece && board[r][c+3] === piece) {
        return true;
      }
    }
  }

  // Vertikal
  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === piece && board[r+1][c] === piece &&
          board[r+2][c] === piece && board[r+3][c] === piece) {
        return true;
      }
    }
  }

  // Diagonal kanan-bawah (↘)
  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c <= cols - 4; c++) {
      if (board[r][c] === piece && board[r+1][c+1] === piece &&
          board[r+2][c+2] === piece && board[r+3][c+3] === piece) {
        return true;
      }
    }
  }

  // Diagonal kiri-bawah (↙)
  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 3; c < cols; c++) {
      if (board[r][c] === piece && board[r+1][c-1] === piece &&
          board[r+2][c-2] === piece && board[r+3][c-3] === piece) {
        return true;
      }
    }
  }

  return false;
}
```

---

## ACCEPTANCE CRITERIA

Sebelum dianggap selesai, verifikasi semua poin ini:

- [ ] `npm test` di folder `backend/` → semua test passing (142 lama + test baru)
- [ ] Create session dengan game type Connect Four via UI → session terbuat
- [ ] Board 6×7 muncul di frontend
- [ ] Klik kolom → biji jatuh ke baris bawah yang kosong
- [ ] Gravity benar: biji ke-2 di kolom yang sama jatuh di atas biji pertama
- [ ] Win detection: 4 horizontal → game berakhir, winner ditampilkan
- [ ] Win detection: 4 vertikal → game berakhir
- [ ] Win detection: 4 diagonal → game berakhir
- [ ] Draw: board penuh → "Draw!" ditampilkan
- [ ] Real-time sync: 2 browser join session yang sama, move satu browser langsung update di browser lain
- [ ] `npm run build` di folder `frontend/` → compile tanpa error TypeScript
