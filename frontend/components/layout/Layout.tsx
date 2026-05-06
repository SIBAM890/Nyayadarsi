/**
 * Layout — application shell with sidebar navigation and top bar.
 */
import React, { type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Scale, FileText, ShieldCheck, HardHat, Activity } from 'lucide-react';
import { APP_NAME, NAV_ITEMS } from '@/constants';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/gov': <FileText className="w-4 h-4" />,
  '/evaluation': <ShieldCheck className="w-4 h-4" />,
  '/builder': <HardHat className="w-4 h-4" />,
  '/audit': <Activity className="w-4 h-4" />,
};

export default function Layout({ children, title }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-theme-bg-footer border-r border-theme-border flex flex-col fixed h-full z-20">
        {/* Brand */}
        <Link href="/" className="block px-5 py-5 border-b border-theme-border group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-brand flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-display font-bold text-theme-text-heading tracking-tight">{APP_NAME}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-3 space-y-6" aria-label="Main navigation">
          {/* Officer Tools Group */}
          <div>
            <h4 className="px-3 mb-2 text-[11px] font-bold tracking-widest text-theme-text-muted uppercase">Officer Tools</h4>
            <div className="space-y-0.5">
              {NAV_ITEMS.slice(0, 2).map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 group border-l-[3px] ${
                      isActive
                        ? 'bg-theme-bg-active border-theme-brand text-theme-brand'
                        : 'border-transparent text-theme-text-body hover:bg-theme-bg-active'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`${isActive ? 'text-theme-brand' : 'text-theme-text-muted'}`}>
                      {NAV_ICONS[item.href]}
                    </span>
                    <div>
                      <div className="text-sm font-medium leading-tight">{item.label}</div>
                      <div className="text-[11px] text-theme-text-muted leading-tight opacity-80">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Monitoring Group */}
          <div>
            <h4 className="px-3 mb-2 text-[11px] font-bold tracking-widest text-theme-text-muted uppercase">Monitoring</h4>
            <div className="space-y-0.5">
              {NAV_ITEMS.slice(2, 4).map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 group border-l-[3px] ${
                      isActive
                        ? 'bg-theme-bg-active border-theme-brand text-theme-brand'
                        : 'border-transparent text-theme-text-body hover:bg-theme-bg-active'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`${isActive ? 'text-theme-brand' : 'text-theme-text-muted'}`}>
                      {NAV_ICONS[item.href]}
                    </span>
                    <div>
                      <div className="text-sm font-medium leading-tight">{item.label}</div>
                      <div className="text-[11px] text-theme-text-muted leading-tight opacity-80">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E8E8] mt-auto">
          <div className="text-[11px] text-nyaya-500 space-y-0.5">
            <p className="font-medium text-nyaya-400">Coding Aghoris</p>
            <p>PAN IIT AI for Bharat</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
