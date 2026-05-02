/**
 * Layout — application shell with sidebar navigation and top bar.
 */
import React, { type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { APP_NAME, APP_DEVANAGARI, NAV_ITEMS } from '@/constants';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-nyaya-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 fixed h-full z-20">
        <Link href="/" className="block mb-10 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nyaya-500 to-saffron-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-nyaya-500/30 group-hover:shadow-nyaya-400/50 transition-all">
              ⚖️
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-white tracking-tight">{APP_NAME}</h1>
              <p className="text-xs text-nyaya-400/60">{APP_DEVANAGARI}</p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-2" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-nyaya-600/20 text-white border border-nyaya-500/30'
                    : 'text-nyaya-300/60 hover:text-white hover:bg-white/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-nyaya-400 shadow-lg shadow-nyaya-400/50' : 'bg-nyaya-600/30'}`} />
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-50">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="text-xs text-nyaya-400/40 space-y-1">
            <p className="font-medium text-nyaya-300/60">Coding Aghoris</p>
            <p>PAN IIT AI for Bharat</p>
            <p>Grand Finale 2026</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="sticky top-0 z-10 bg-nyaya-950/60 backdrop-blur-xl border-b border-white/5 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-white">{title || 'Dashboard'}</h2>
              <p className="text-xs text-nyaya-400/50 mt-0.5">AI-Powered Procurement Accountability</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-verdict-green/10 border border-verdict-green/20">
                <div className="w-2 h-2 rounded-full bg-verdict-green animate-pulse" />
                <span className="text-xs text-verdict-green font-medium">System Online</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
