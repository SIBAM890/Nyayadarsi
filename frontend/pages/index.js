import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { APP_NAME, APP_DEVANAGARI, APP_TAGLINE, NAV_ITEMS } from '../lib/constants';

export default function Home() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/gov');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Nyayadarsi — AI that sees justice | न्यायदर्शी</title>
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nyaya-600/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-saffron-500/8 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nyaya-500/5 rounded-full blur-[150px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center animate-fade-in">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-nyaya-600 via-nyaya-500 to-saffron-500 flex items-center justify-center text-5xl shadow-2xl shadow-nyaya-500/30 animate-glow">
              ⚖️
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-3 tracking-tight">
            <span className="gradient-text">{APP_NAME}</span>
          </h1>
          <p className="text-3xl text-nyaya-200/60 font-display mb-2">{APP_DEVANAGARI}</p>
          <p className="text-xl text-nyaya-300/50 font-light mb-12">{APP_TAGLINE}</p>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-card-hover p-8 text-left group animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
                onClick={(e) => {
                  // Cancel auto-redirect
                  setCountdown(0);
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-nyaya-600/30 to-nyaya-500/10 flex items-center justify-center mb-4 group-hover:from-nyaya-500/40 group-hover:to-saffron-500/20 transition-all">
                  <span className="text-2xl">
                    {item.href === '/gov' ? '📋' : item.href === '/evaluation' ? '🛡️' : '🏗️'}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-1">{item.label}</h3>
                <p className="text-sm text-nyaya-300/50">{item.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-nyaya-400/40 group-hover:text-nyaya-300/60 transition-colors">
                  <span>Enter Dashboard</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Auto-redirect notice */}
          {countdown > 0 && (
            <p className="text-sm text-nyaya-400/30 animate-pulse">
              Redirecting to Government Dashboard in {countdown}s...
            </p>
          )}

          {/* Team Credit */}
          <div className="mt-8 text-xs text-nyaya-400/20 space-y-1">
            <p>PAN IIT AI for Bharat Hackathon — Grand Finale 2026</p>
            <p>Team Coding Aghoris | Theme 3: AI-Based Tender Evaluation for CRPF</p>
          </div>
        </div>
      </div>
    </>
  );
}
