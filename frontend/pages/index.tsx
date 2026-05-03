import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, FileText, ShieldCheck, HardHat } from 'lucide-react';

const AnimatedStat = ({ value, label, valueColor = 'text-white', delay = 0, suffix = '', prefix = '' }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="flex flex-col"
    >
      <span className={`text-4xl font-display font-light ${valueColor} tracking-tight`}>
        {prefix}{value}{suffix}
      </span>
      <span className="text-xs text-nyaya-500 uppercase tracking-widest mt-2">{label}</span>
    </motion.div>
  );
};

const PipelineNode = ({ label, active, index }: any) => {
  return (
    <div className="flex flex-col items-center relative z-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: active ? 1.1 : 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className={`w-3 h-3 rounded-full mb-3 shadow-lg ${
          active 
            ? 'bg-nyaya-600 shadow-nyaya-600/50' 
            : 'bg-surface-3 border border-white/[0.1]'
        }`}
      />
      <span className={`text-[10px] font-mono tracking-widest ${active ? 'text-nyaya-100 font-bold' : 'text-nyaya-500'}`}>
        {label}
      </span>
    </div>
  );
};

export default function LandingPage() {
  const [closedWindows, setClosedWindows] = useState(0);
  const [activeNode, setActiveNode] = useState(0);
  const pipelineNodes = ['TENDER', 'AI SCAN', 'EVALUATE', 'VERIFY', 'AWARD', 'EXECUTE'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosedWindows(5);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % pipelineNodes.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [pipelineNodes.length]);

  return (
    <>
      <Head>
        <title>Nyayadarsi — AI that sees justice</title>
      </Head>

      <div className="min-h-screen bg-surface-0 text-white flex overflow-hidden">
        {/* LEFT ZONE - 40% */}
        <div className="w-[40%] relative flex flex-col justify-center px-16 border-r border-white/[0.06] bg-surface-1/50 backdrop-blur-xl z-10">
          
          {/* Background Devanagari */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 pointer-events-none opacity-[0.03] select-none">
            <h1 className="text-[180px] font-display font-extralight tracking-tighter whitespace-nowrap text-white leading-none">
              न्यायदर्शी
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-nyaya-500 font-semibold mb-4 block">
              Nyayadarsi Platform
            </span>
            <h2 className="text-5xl font-display font-light text-white mb-4 tracking-tight leading-tight">
              AI that sees <br/><span className="text-accent-500 font-normal">justice</span>
            </h2>
            <p className="text-lg text-nyaya-400 font-light max-w-md">
              India's procurement accountability infrastructure.
            </p>
          </motion.div>

          <div className="space-y-4 max-w-md relative z-10">
            {[
              { href: '/gov', label: 'Government Officer', color: 'bg-nyaya-600', border: 'border-nyaya-600/50', icon: FileText },
              { href: '/evaluation', label: 'Evaluation Officer', color: 'bg-accent-500', border: 'border-accent-500/50', icon: ShieldCheck },
              { href: '/builder', label: 'Contractor / Builder', color: 'bg-verdict-green', border: 'border-verdict-green/50', icon: HardHat }
            ].map((persona, i) => {
              const Icon = persona.icon;
              return (
                <motion.div
                  key={persona.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                >
                  <Link href={persona.href} className="group block relative overflow-hidden bg-surface-1 border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-nyaya-600/10">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${persona.color} opacity-80`} />
                    <div className="px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon className="w-5 h-5 text-nyaya-400 group-hover:text-white transition-colors" />
                        <span className="text-sm font-semibold tracking-wide text-nyaya-100 group-hover:text-white">{persona.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-nyaya-500 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT ZONE - 60% */}
        <div className="w-[60%] relative flex flex-col justify-center px-24">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none -z-10" />
          
          <div className="grid grid-cols-2 gap-y-16 gap-x-12 mb-32">
            <AnimatedStat 
              value="37,370" prefix="₹" suffix=" Cr" 
              label="Pending Contractor Bills" 
              valueColor="text-verdict-red" 
              delay={0.6} 
            />
            <AnimatedStat 
              value="52,000+" 
              label="Tenders Issued Annually" 
              delay={0.8} 
            />
            <AnimatedStat 
              value="80/20" 
              label="Bills vs Actual Work Done" 
              valueColor="text-verdict-red" 
              delay={1.0} 
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col"
            >
              <span className={`text-4xl font-display font-light tracking-tight transition-colors duration-1000 ${closedWindows > 0 ? 'text-verdict-green' : 'text-verdict-red'}`}>
                {closedWindows}
              </span>
              <span className="text-xs text-nyaya-500 uppercase tracking-widest mt-2">
                Corruption Windows Closed
              </span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="w-full relative"
          >
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-nyaya-500 font-semibold mb-8">Live Accountability Pipeline</h4>
            
            <div className="relative flex justify-between items-center w-full px-4">
              {/* Connecting Line */}
              <div className="absolute top-1.5 left-8 right-8 h-[2px] bg-white/[0.04] -z-0">
                <motion.div 
                  className="h-full bg-nyaya-600/50"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(activeNode / (pipelineNodes.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {pipelineNodes.map((node, i) => (
                <PipelineNode key={node} label={node} index={i} active={i <= activeNode} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
