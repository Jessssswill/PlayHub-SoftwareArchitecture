"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Cpu,
  Server,
  Database,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import MermaidDiagram from "../../components/MermaidDiagram";
import { patterns, categories, Pattern } from "../../lib/patterns-data";
import { tokens, transitions, card, btn } from "../../lib/design-tokens";

const ARCHITECTURE_DIAGRAM = `
graph TD
  subgraph FE["Frontend (Next.js 16)"]
    NP[Next.js Pages + Zustand]
    SIO[socket.io-client]
  end

  subgraph PR["Presentation Layer"]
    SC["SessionController REST API"]
    GG["GameGateway WebSocket"]
  end

  subgraph BL["Business Layer"]
    AP["AuthorizationProxy Protection Proxy"]
    CP["CachedStateProxy Cache Proxy"]
    FEA["GameEngineFacade"]
    GR["GameRegistry Singleton"]
    GEB["GameEventBus Observer"]
  end

  subgraph DL["Domain Layer"]
    GSM["GameSession State Machine"]
    TG["TicTacToeGame Template Method"]
    CG["ChessGame Template Method"]
    GEE["GameEventEmitter Observer"]
  end

  subgraph PL["Persistence Layer"]
    IMS["InMemoryStorage"]
    TOS["TypeOrmStorage SQLite"]
  end

  NP -->|HTTP /api| SC
  NP -->|WS| SIO
  SIO -->|ws://| GG
  SC --> AP --> CP --> FEA
  GG --> FEA
  FEA --> GR
  FEA --> GSM
  GSM --> TG
  GSM --> CG
  GSM --> GEE --> GEB --> GG
  GR --> IMS
  GR --> TOS
`;

const CATEGORY_STYLES: Record<string, string> = {
  Creational:
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  Structural:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
  Behavioral:
    "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
};

const TECH_STACK = [
  { icon: Server, label: "NestJS", sub: "Backend framework" },
  { icon: Layers, label: "Next.js 16", sub: "Frontend + SSR" },
  { icon: Cpu, label: "Socket.io", sub: "Real-time WS" },
  { icon: Database, label: "SQLite / TypeORM", sub: "Persistence" },
];

const ISO_ROWS = [
  {
    quality: "Functional Suitability",
    mechanism: "Facade + Template Method",
    evidence:
      "GameEngineFacade.makeMove() coordinates all domain logic behind a single call.",
  },
  {
    quality: "Performance Efficiency",
    mechanism: "Cache Proxy",
    evidence:
      "CachedGameStateProxy serves repeated getState() within 1 s from in-process cache.",
  },
  {
    quality: "Reliability",
    mechanism: "State Pattern",
    evidence:
      "Illegal transitions (e.g. move in FINISHED state) are rejected by the state object, not guarded by ad-hoc if-else.",
  },
  {
    quality: "Security",
    mechanism: "Protection Proxy",
    evidence:
      "GameEngineAuthorizationProxy validates player membership before any operation reaches the Facade.",
  },
  {
    quality: "Maintainability",
    mechanism: "Abstract Factory + Builder",
    evidence:
      "Adding a new game type requires one Factory + one Game subclass; no existing code changes.",
  },
  {
    quality: "Portability",
    mechanism: "Adapter",
    evidence:
      "AI engines (Minimax, Random, External) are swapped via AIEngineAdapter without touching business logic.",
  },
];

function PatternCard({ pattern }: { pattern: Pattern }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`${card} cursor-pointer select-none`}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[pattern.category]}`}
          >
            {pattern.category}
          </span>
          <span className={`font-semibold text-sm ${tokens.text}`}>
            {pattern.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs ${tokens.textMuted}`}>#{pattern.id}</span>
          {open ? (
            <ChevronUp className={`w-4 h-4 ${tokens.textMuted}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${tokens.textMuted}`} />
          )}
        </div>
      </div>
      {open && (
        <div className={`mt-3 space-y-2 border-t pt-3 ${tokens.border}`}>
          <p className={`text-sm ${tokens.textMuted}`}>{pattern.intent}</p>
          <p className={`text-xs font-mono ${tokens.textMuted} truncate`}>
            {pattern.filePath}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      <Link
        href="/"
        className={`inline-flex items-center gap-1 text-sm ${tokens.textMuted} hover:text-foreground ${transitions.default}`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lobby
      </Link>

      <section className={`pb-8 border-b ${tokens.border}`}>
        <h1 className={`text-3xl font-bold mb-2 ${tokens.text}`}>
          System Architecture
        </h1>
        <p className={`text-base ${tokens.textMuted} max-w-2xl`}>
          A layered NestJS backend implementing 11 GoF design patterns, paired
          with a Next.js 16 frontend with real-time WebSocket sync.
        </p>
      </section>

      <section>
        <h2
          className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-4`}
        >
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TECH_STACK.map(({ icon: Icon, label, sub }) => (
            <div key={label} className={`${card} flex items-center gap-3`}>
              <Icon className={`w-5 h-5 ${tokens.accentText} shrink-0`} />
              <div>
                <p className={`text-sm font-semibold ${tokens.text}`}>
                  {label}
                </p>
                <p className={`text-xs ${tokens.textMuted}`}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2
          className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-4`}
        >
          Component Diagram
        </h2>
        <div className={`${card} p-6`}>
          <MermaidDiagram chart={ARCHITECTURE_DIAGRAM} />
        </div>
      </section>

      <section>
        <h2
          className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-4`}
        >
          Design Patterns (11 GoF)
        </h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat}>
              <p
                className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-2`}
              >
                {cat}
              </p>
              <div className="space-y-2">
                {patterns
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <PatternCard key={p.id} pattern={p} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2
          className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-4`}
        >
          ISO 25010 Quality Attributes
        </h2>
        <div className={`${card} overflow-hidden p-0`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${tokens.bg} border-b ${tokens.border}`}>
                <th
                  className={`px-4 py-3 text-left font-semibold ${tokens.text} w-1/4`}
                >
                  Quality
                </th>
                <th
                  className={`px-4 py-3 text-left font-semibold ${tokens.text} w-1/4`}
                >
                  Mechanism
                </th>
                <th
                  className={`px-4 py-3 text-left font-semibold ${tokens.text}`}
                >
                  Evidence
                </th>
              </tr>
            </thead>
            <tbody>
              {ISO_ROWS.map((row, i) => (
                <tr
                  key={row.quality}
                  className={`border-b ${tokens.border} last:border-0 ${i % 2 === 1 ? "bg-muted/5" : ""}`}
                >
                  <td className={`px-4 py-3 font-medium ${tokens.text}`}>
                    {row.quality}
                  </td>
                  <td className={`px-4 py-3 ${tokens.accentText} font-medium`}>
                    {row.mechanism}
                  </td>
                  <td className={`px-4 py-3 ${tokens.textMuted}`}>
                    {row.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${card} text-center py-8`}>
        <p className={`text-lg font-semibold ${tokens.text} mb-2`}>
          See it in action
        </p>
        <p className={`text-sm ${tokens.textMuted} mb-4`}>
          Create a session or run Demo Mode to explore all patterns live.
        </p>
        <Link
          href="/"
          className={`${btn.primary} inline-flex items-center gap-2`}
        >
          Open Lobby
        </Link>
      </section>
    </main>
  );
}
