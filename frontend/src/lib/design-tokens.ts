export const tokens = {
  bg: "bg-background",
  bgCard: "bg-card",
  text: "text-foreground",
  textMuted: "text-muted",
  border: "border-border",
  accent: "bg-blue-600 hover:bg-blue-700 text-white",
  accentText: "text-blue-600 dark:text-blue-400",
  player1: "text-red-500 dark:text-red-400",
  player2: "text-blue-500 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

export const transitions = {
  default: "transition-colors duration-150",
  scale:
    "transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]",
} as const;

export const btn = {
  primary:
    `${tokens.accent} ${transitions.scale} px-4 py-2 rounded-xl font-medium shadow-sm shadow-blue-900/40` +
    " disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2" +
    " focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  secondary:
    `${tokens.bgCard} border ${tokens.border} hover:bg-zinc-100 dark:hover:bg-zinc-800 ${transitions.default}` +
    " px-4 py-2 rounded-lg font-medium focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
} as const;

export const card =
  `${tokens.bgCard} border ${tokens.border} rounded-lg p-4 ${transitions.default} hover:border-zinc-300 dark:hover:border-zinc-700` as const;
