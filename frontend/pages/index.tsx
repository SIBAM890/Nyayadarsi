/**
 * Landing page — clean, professional entry point with role selection.
 */
import Head from 'next/head';
import Link from 'next/link';
import { Scale, FileText, ShieldCheck, HardHat, ArrowRight, Fingerprint, BarChart3, Lock } from 'lucide-react';
import { APP_NAME, APP_DEVANAGARI, APP_TAGLINE, NAV_ITEMS } from '@/constants';

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/gov': <FileText className="w-5 h-5" />,
  '/evaluation': <ShieldCheck className="w-5 h-5" />,
  '/builder': <HardHat className="w-5 h-5" />,
};

const FEATURES = [
  { icon: <Fingerprint className="w-5 h-5 text-nyaya-400" />, title: 'Collusion Detection', desc: 'Statistical bid clustering & document fingerprinting' },
  { icon: <BarChart3 className="w-5 h-5 text-nyaya-400" />, title: 'AI Evaluation', desc: 'Gemini-powered criteria extraction & analysis' },
  { icon: <Lock className="w-5 h-5 text-nyaya-400" />, title: 'Audit Trail', desc: 'SHA-256 hashed, court-admissible records' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Nyayadarsi — AI-Powered Procurement Accountability</title>
        <meta name="description" content="AI-driven tender evaluation, collusion detection, and procurement accountability for Indian government agencies." />
      </Head>
      <div className="min-h-screen flex flex-col">
        {/* Nav bar */}
        <header className="border-b border-white/[0.06] px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-nyaya-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-display font-bold text-white tracking-tight">{APP_NAME}</span>
                <span className="text-xs text-nyaya-400 ml-2">{APP_DEVANAGARI}</span>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-nyaya-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nyaya-600/15 border border-nyaya-500/20 text-xs text-nyaya-300 font-medium mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-verdict-green" />
              PAN IIT AI for Bharat — Grand Finale 2026
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-3">
              {APP_NAME}
            </h1>
            <p className="text-lg text-nyaya-400 mb-2 font-display">{APP_DEVANAGARI}</p>
            <p className="text-lg text-nyaya-300/70 max-w-xl mx-auto leading-relaxed">
              {APP_TAGLINE} — AI-powered procurement accountability for CRPF construction tenders
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full mb-16">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-card-hover p-6 group animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-nyaya-600/15 border border-nyaya-500/15 flex items-center justify-center text-nyaya-300 group-hover:bg-nyaya-600/25 group-hover:text-white transition-all">
                    {NAV_ICONS[item.href]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                    <p className="text-xs text-nyaya-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-nyaya-400 group-hover:text-nyaya-200 transition-colors">
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mb-16">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-2 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{f.title}</p>
                  <p className="text-xs text-nyaya-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-nyaya-500">
            <span>Team Coding Aghoris — Theme 3: AI-Based Tender Evaluation for CRPF</span>
            <span>© 2026 Nyayadarsi</span>
          </div>
        </footer>
      </div>
    </>
  );
}
