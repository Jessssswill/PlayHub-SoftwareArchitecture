import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Providers } from '../components/Providers';
import { tokens } from '../lib/design-tokens';

export const metadata: Metadata = {
  title: 'Game Session Manager',
  description: 'Multiplayer game lobby — TicTacToe & Chess with real-time sync',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${tokens.bg} ${tokens.text} min-h-screen`}>
        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-50 ${tokens.bgCard} border-b ${tokens.border} px-6 py-4`}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className={`font-semibold text-base ${tokens.text} hover:${tokens.accentText}`}>
              Game Session Manager
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/architecture"
                className={`text-sm ${tokens.textMuted} hover:${tokens.text} transition-colors duration-150`}
              >
                Architecture
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${tokens.textMuted} hover:${tokens.text} transition-colors duration-150`}
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
