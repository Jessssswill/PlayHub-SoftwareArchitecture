export interface Pattern {
  id: number;
  category: 'Creational' | 'Structural' | 'Behavioral';
  name: string;
  badge: string;
  intent: string;
  filePath: string;
}

export const patterns: Pattern[] = [
  {
    id: 1,
    category: 'Creational',
    name: 'Singleton',
    badge: 'Coursework',
    intent: 'Satu instance GameRegistry menyimpan semua sesi aktif di memori sepanjang lifetime aplikasi.',
    filePath: 'backend/src/infrastructure/registry/game-registry.service.ts',
  },
  {
    id: 2,
    category: 'Creational',
    name: 'Prototype',
    badge: 'Coursework',
    intent: 'GameState.clone() memungkinkan "preview move" tanpa mutasi state asli.',
    filePath: 'backend/src/business/domain/games/game-state.ts',
  },
  {
    id: 3,
    category: 'Creational',
    name: 'Builder',
    badge: 'Coursework',
    intent: 'GameSessionBuilder merakit GameSession dengan fluent API, memisahkan konstruksi dari representasi.',
    filePath: 'backend/src/business/builders/game-session.builder.ts',
  },
  {
    id: 4,
    category: 'Creational',
    name: 'Abstract Factory',
    badge: 'Coursework',
    intent: 'TicTacToeFactory dan ChessFactory masing-masing memproduksi board, rules, dan initial state yang kompatibel.',
    filePath: 'backend/src/business/factories/',
  },
  {
    id: 5,
    category: 'Behavioral',
    name: 'Template Method',
    badge: 'Coursework',
    intent: 'Game.executeTurn() mendefinisikan urutan validate → apply → checkEnd; subclass hanya mengisi isi tiap langkah.',
    filePath: 'backend/src/business/domain/games/game.abstract.ts',
  },
  {
    id: 6,
    category: 'Behavioral',
    name: 'State',
    badge: 'Coursework',
    intent: 'Lifecycle sesi (WAITING → IN_PROGRESS → PAUSED → FINISHED) dikelola oleh concrete state objects, bukan if-else.',
    filePath: 'backend/src/business/domain/states/',
  },
  {
    id: 7,
    category: 'Behavioral',
    name: 'Observer',
    badge: 'Coursework',
    intent: 'GameEventEmitter (per-sesi) dan GameEventBus (global) meneruskan domain events ke WebSocket Gateway tanpa coupling.',
    filePath: 'backend/src/business/domain/events/game-event-emitter.ts',
  },
  {
    id: 8,
    category: 'Structural',
    name: 'Facade',
    badge: 'Coursework',
    intent: 'GameEngineFacade menyembunyikan koordinasi antara registry, factory, builder, state machine, dan game engine dari presenter.',
    filePath: 'backend/src/business/facades/game-engine.facade.ts',
  },
  {
    id: 9,
    category: 'Structural',
    name: 'Proxy — Protection',
    badge: 'Coursework',
    intent: 'GameEngineAuthorizationProxy menolak operasi dari player yang bukan anggota sesi sebelum meneruskan ke Facade.',
    filePath: 'backend/src/persistence/proxies/authorization.proxy.ts',
  },
  {
    id: 10,
    category: 'Structural',
    name: 'Proxy — Cache',
    badge: 'Coursework',
    intent: 'CachedGameStateProxy meng-cache hasil getState() dengan TTL 1 s dan auto-invalidate saat move.applied diterima.',
    filePath: 'backend/src/persistence/proxies/cached-game-state.proxy.ts',
  },
  {
    id: 11,
    category: 'Structural',
    name: 'Adapter',
    badge: 'Coursework',
    intent: 'IAIEngine menyatukan tiga implementasi AI (Random, Minimax, External) di balik satu interface — swap tanpa ubah kode Facade.',
    filePath: 'backend/src/infrastructure/adapters/',
  },
];

export const categories = ['Creational', 'Structural', 'Behavioral'] as const;
