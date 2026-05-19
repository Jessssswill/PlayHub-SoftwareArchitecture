export const tokens = {
  bg: 'bg-slate-950',
  bgCard: 'bg-slate-800',
  text: 'text-slate-100',
  textMuted: 'text-slate-400',
  border: 'border-slate-700',
  accent: 'bg-blue-600 hover:bg-blue-500 text-white',
  accentText: 'text-blue-400',
  player1: 'text-red-400',
  player2: 'text-blue-400',
  success: 'text-emerald-400',
  danger: 'text-red-400',
} as const;

export const transitions = {
  default: 'transition-colors duration-150',
  scale: 'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]',
} as const;

export const btn = {
  primary:
    `${tokens.accent} ${transitions.scale} px-4 py-2 rounded-xl font-medium shadow-sm shadow-blue-900/40` +
    ' disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2' +
    ' focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  secondary:
    `bg-slate-700 border ${tokens.border} hover:bg-slate-600 text-slate-100 ${transitions.default}` +
    ' px-4 py-2 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-slate-500' +
    ' focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
} as const;

export const card =
  `${tokens.bgCard} border ${tokens.border} rounded-xl p-4 ${transitions.default} hover:border-slate-500 shadow-sm shadow-black/30` as const;
