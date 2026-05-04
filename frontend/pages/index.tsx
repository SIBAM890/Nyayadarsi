import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, ShieldCheck, HardHat, Scale } from 'lucide-react';

/* ─── Boot Sequence Terminal ─── */
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootLines = useMemo(() => [
    '> NYAYADARSI v2.0 — CLASSIFIED OVERSIGHT SYSTEM',
    '> Establishing secure connection...',
    '> Loading Gemini 2.5 Flash AI Engine............ OK',
    '> Collusion Detection Matrix................... ARMED',
    '> SHA-256 Audit Chain.......................... VERIFIED',
    '> GPS Geofence Module.......................... ACTIVE',
    '> Scanning ₹37,370 Cr in pending bills.........',
    '> 52,000+ tenders under surveillance...........',
    '> SYSTEM READY — CLEARANCE GRANTED',
  ], []);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(onComplete, 600);
      }
    }, 180);
    return () => clearInterval(timer);
  }, [bootLines, onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] bg-[#020408] flex items-center justify-center"
    >
      <div className="w-full max-w-2xl px-8">
        <div className="font-mono text-[13px] leading-7 text-green-400/90">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={i === lines.length - 1 ? 'text-white font-bold' : ''}
            >
              {line}
              {i === lines.length - 1 && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-1">█</motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
    </motion.div>
  );
};

/* ─── Corruption Network SVG ─── */
const NetworkGraph = () => {
  const nodes = useMemo(() => [
    { x: 120, y: 80, r: 6, label: 'Bidder A', flagged: true },
    { x: 280, y: 60, r: 5, label: 'Bidder B', flagged: true },
    { x: 200, y: 180, r: 7, label: 'Shell Co.', flagged: true },
    { x: 350, y: 150, r: 5, label: 'Bidder C', flagged: false },
    { x: 80, y: 200, r: 4, label: 'Director X', flagged: true },
    { x: 320, y: 250, r: 4, label: 'CA Firm', flagged: false },
    { x: 180, y: 290, r: 5, label: 'Bidder D', flagged: false },
    { x: 420, y: 80, r: 4, label: 'Bidder E', flagged: false },
  ], []);

  const edges = useMemo(() => [
    [0, 1], [0, 2], [1, 2], [2, 4], [1, 3], [3, 5], [2, 6], [3, 7], [5, 6],
  ], []);

  const [activeEdge, setActiveEdge] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveEdge(p => (p + 1) % edges.length), 800);
    return () => clearInterval(timer);
  }, [edges.length]);

  return (
    <svg viewBox="0 0 500 340" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.1))' }}>
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={i === activeEdge ? '#ef4444' : 'rgba(255,255,255,0.06)'}
          strokeWidth={i === activeEdge ? 2 : 1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: i * 0.1 }}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.flagged && (
            <motion.circle cx={n.x} cy={n.y} r={n.r + 12} fill="none" stroke="#ef4444" strokeWidth={1}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity }} />
          )}
          <motion.circle
            cx={n.x} cy={n.y} r={n.r}
            fill={n.flagged ? '#ef4444' : '#3b82f6'}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, type: 'spring' }}
          />
          <text x={n.x} y={n.y + n.r + 14} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="monospace">
            {n.label}
          </text>
        </g>
      ))}
      <text x="250" y="335" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace" letterSpacing="3">
        LIVE COLLUSION NETWORK ANALYSIS
      </text>
    </svg>
  );
};

/* ─── Live Data Feed ─── */
const feedData = [
  { time: '09:41:02', msg: 'Bid cluster CV 3.2% detected — FLAGGED', type: 'red' },
  { time: '09:41:08', msg: 'Tender #NIT-2026-4471 uploaded', type: 'blue' },
  { time: '09:41:15', msg: 'GPS verification: 47m from site — PASSED', type: 'green' },
  { time: '09:41:23', msg: 'SHA-256 hash appended to audit chain', type: 'blue' },
  { time: '09:41:31', msg: 'Shared address detected: 2 bidders — ALERT', type: 'red' },
  { time: '09:41:38', msg: 'Evaluation criteria extracted (12 params)', type: 'green' },
  { time: '09:41:45', msg: 'Financial consistency check — 3 anomalies', type: 'yellow' },
  { time: '09:41:52', msg: 'Builder milestone 4/6 verified', type: 'green' },
  { time: '09:42:01', msg: 'Tender #PWD-KA-2026-882 integrity OK', type: 'green' },
  { time: '09:42:09', msg: 'Document fingerprint match 94% — COLLUSION', type: 'red' },
];

const LiveFeed = () => {
  const idRef = useRef(0);
  const [items, setItems] = useState(() =>
    feedData.slice(0, 3).map(d => ({ ...d, id: ++idRef.current }))
  );
  const feedRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      feedRef.current = (feedRef.current + 1) % feedData.length;
      const newItem = { ...feedData[feedRef.current], id: ++idRef.current };
      setItems(prev => [newItem, ...prev].slice(0, 8));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const colors: Record<string, string> = { red: 'text-red-400', green: 'text-emerald-400', blue: 'text-blue-400', yellow: 'text-yellow-400' };
  const dots: Record<string, string> = { red: 'bg-red-400', green: 'bg-emerald-400', blue: 'bg-blue-400', yellow: 'bg-yellow-400' };

  return (
    <div className="space-y-2 font-mono text-[11px] overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={i === 0 ? { opacity: 0, x: -10 } : false}
          animate={{ opacity: i === 0 ? 1 : 0.4, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-2"
        >
          <span className="text-white/20 shrink-0">{item.time}</span>
          <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${dots[item.type]}`} />
          <span className={colors[item.type]}>{item.msg}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Status Bar ─── */
const StatusBar = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-0 w-full z-50 bg-[#060a14]/90 backdrop-blur border-t border-white/[0.04] px-6 py-2 flex items-center justify-between font-mono text-[10px]">
      <div className="flex items-center gap-6 text-white/30">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SYSTEM OPERATIONAL
        </span>
        <span>CLEARANCE: L4</span>
        <span>ENCRYPTION: AES-256</span>
      </div>
      <div className="flex items-center gap-6 text-white/30">
        <span>TENDERS MONITORED: 52,147</span>
        <span>THREATS NEUTRALIZED: 847</span>
        <span className="text-white/50">{time} IST</span>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  const [booted, setBooted] = useState(false);
  const [skipBoot, setSkipBoot] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('nyaya_booted')) {
      setBooted(true);
      setSkipBoot(true);
    }
  }, []);

  const handleBootComplete = () => {
    setBooted(true);
    sessionStorage.setItem('nyaya_booted', '1');
  };

  return (
    <>
      <Head>
        <title>NYAYADARSI — Classified Oversight System</title>
        <meta name="description" content="India's AI-powered procurement accountability infrastructure. Real-time tender surveillance, collusion detection, and tamper-proof audit trails." />
      </Head>

      <AnimatePresence>
        {!booted && !skipBoot && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>

      {booted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-[#060a14] text-white"
        >
          {/* Scan line overlay */}
          <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.015]"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />

          {/* ━━━ TOP BAR ━━━ */}
          <div className="fixed top-0 w-full z-50 bg-[#060a14]/80 backdrop-blur-xl border-b border-white/[0.04]">
            <div className="max-w-[1400px] mx-auto px-8 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="font-mono text-sm font-bold tracking-wider text-white/90">NYAYADARSI</span>
                <span className="font-mono text-[9px] text-white/20 border border-white/10 px-1.5 py-0.5 rounded">v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] text-emerald-400/80 tracking-wider">LIVE</span>
              </div>
            </div>
          </div>

          {/* ━━━ MAIN GRID ━━━ */}
          <div className="pt-14 pb-10 min-h-screen">
            <div className="max-w-[1400px] mx-auto px-8 pt-8">

              {/* Hero Row */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 mb-8">
                {/* Left: Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative bg-[#0a0f1a] border border-white/[0.04] rounded-2xl p-10 overflow-hidden"
                >
                  {/* Grid bg */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  {/* Glow */}
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/[0.04] blur-[80px] pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 font-mono text-[10px] text-blue-400/60 tracking-[0.3em] uppercase mb-6"
                    >
                      <span className="w-6 h-px bg-blue-400/30" />
                      Classified Oversight System
                    </motion.div>

                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                      <span className="text-white/95">AI that sees</span>
                      <br />
                      <span className="relative">
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                          justice
                        </span>
                        {/* Underline scanner */}
                        <motion.span
                          className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-transparent"
                          animate={{ width: ['0%', '100%', '0%'], left: ['0%', '0%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </span>
                    </h1>

                    <p className="text-base text-white/30 max-w-lg leading-relaxed mb-10 font-light">
                      India's first end-to-end AI surveillance layer for government procurement.
                      Every tender. Every bid. Every rupee. Watched.
                    </p>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { href: '/gov', label: 'Government Officer', icon: FileText, accent: '#3b82f6' },
                        { href: '/evaluation', label: 'Evaluation Officer', icon: ShieldCheck, accent: '#f59e0b' },
                        { href: '/builder', label: 'Contractor / Builder', icon: HardHat, accent: '#10b981' },
                      ].map((p, i) => {
                        const Icon = p.icon;
                        return (
                          <motion.div key={p.href} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                            <Link href={p.href}
                              className="group block bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${p.accent}15`, border: `1px solid ${p.accent}30` }}>
                                  <Icon className="w-4 h-4" style={{ color: p.accent }} />
                                </div>
                                <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/60 ml-auto transition-all group-hover:translate-x-0.5" />
                              </div>
                              <span className="text-xs font-semibold text-white/70 group-hover:text-white/90 transition-colors">{p.label}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Right: Network Graph */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="bg-[#0a0f1a] border border-white/[0.04] rounded-2xl p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">Threat Network</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="font-mono text-[9px] text-red-400/70">3 FLAGGED</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[280px]">
                    <NetworkGraph />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {[
                    { value: '₹37,370 Cr', label: 'Pending Bills', color: 'text-red-400', border: 'border-red-400/10' },
                    { value: '52,000+', label: 'Tenders / Year', color: 'text-white/80', border: 'border-white/[0.04]' },
                    { value: '94.7%', label: 'Detection Rate', color: 'text-emerald-400', border: 'border-emerald-400/10' },
                    { value: '847', label: 'Threats Blocked', color: 'text-amber-400', border: 'border-amber-400/10' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className={`bg-[#0a0f1a] ${stat.border} border rounded-xl p-5 text-center flex flex-col items-center justify-center`}
                    >
                      <div className={`text-2xl font-bold tracking-tight mb-1 ${stat.color}`}>{stat.value}</div>
                      <div className="font-mono text-[9px] text-white/25 tracking-widest uppercase">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Live Feed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-[#0a0f1a] border border-white/[0.04] rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">Live Intelligence Feed</div>
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                      <span className="font-mono text-[9px] text-blue-400/70">STREAMING</span>
                    </div>
                  </div>
                  <LiveFeed />
                </motion.div>
              </div>
            </div>
          </div>

          <StatusBar />
        </motion.div>
      )}
    </>
  );
}
