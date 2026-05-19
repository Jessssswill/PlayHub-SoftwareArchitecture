export const tokens = {
  bg: 'bg-zinc-50',
  bgCard: 'bg-white',
  text: 'text-zinc-900',
  textMuted: 'text-zinc-500',
  border: 'border-zinc-200',
  accent: 'bg-blue-600 hover:bg-blue-700 text-white',
  accentText: 'text-blue-600',
  player1: 'text-red-500',
  player2: 'text-blue-500',
  success: 'text-emerald-600',
  danger: 'text-red-600',
} as const;

export const transitions = {
  default: 'transition-colors duration-150',
  scale: 'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]',
} as const;

export const btn = {
  primary:
    `${tokens.accent} ${transitions.scale} px-4 py-2 rounded-lg font-medium` +
    ' disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2' +
    ' focus-visible:ring-blue-600 focus-visible:ring-offset-2',
  secondary:
    `bg-white border ${tokens.border} hover:bg-zinc-100 ${transitions.default}` +
    ' px-4 py-2 rounded-lg font-medium focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
} as const;

export const card =
  `${tokens.bgCard} border ${tokens.border} rounded-lg p-4 ${transitions.default} hover:border-zinc-300` as const;
