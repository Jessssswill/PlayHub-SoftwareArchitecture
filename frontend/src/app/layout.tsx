import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Providers } from '../components/Providers';
import { tokens } from '../lib/design-tokens';

export const metadata: Metadata = {
  title: 'Game Session Manager',
  description: 'Multiplayer game lobby with real-time sync',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${tokens.bg} ${tokens.text} min-h-screen`}>
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-bold text-sm tracking-tight group">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 group-hover:from-blue-300 group-hover:to-blue-100 transition-all duration-200">
                Game Session Manager
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/architecture"
                className={`text-sm ${tokens.textMuted} hover:text-foreground transition-colors duration-150`}
              >
                Architecture
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${tokens.textMuted} hover:text-foreground transition-colors duration-150`}
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
