import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, FileText, ShieldCheck, HardHat, Scale, Upload, Brain, Lock, MapPin, AlertTriangle, ShieldAlert, Shield } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1588416936097-41850ab3d86d' +
  '?w=920&q=85&auto=format&fit=crop';

const Navbar = () => (
  <div style={{
    position: 'fixed', top: 0, width: '100%', zIndex: 50,
    background: 'rgba(253,243,241,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(217,64,64,0.08)',
    height: 56
  }}>
    <div style={{
      maxWidth: 1152, margin: '0 auto', padding: '0 48px',
      height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      {/* Left - Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #D94040, #a82020)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Scale size={16} color="white" />
        </div>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', letterSpacing: '0.08em' }}>
          NYAYADARSI
        </span>
      </div>

      {/* Center - Links */}
      <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
        <a href="#how-it-works" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: '#666', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D94040'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
          How it Works
        </a>
        <a href="#why-it-matters" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: '#666', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D94040'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
          Why it Matters
        </a>
      </div>

      {/* Empty right area for flex spacing */}
      <div style={{ width: 100 }} />
    </div>
  </div>
);

export default function LandingPage() {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 400], [0, -30]);

  return (
    <>
      <Head>
        <title>NYAYADARSI — AI Procurement Accountability · CRPF</title>
        <meta name="description" content="India's AI-powered procurement accountability infrastructure for CRPF." />
      </Head>

      <style dangerouslySetInnerHTML={{
        __html: `
        .nav-links { display: none !important; }
        .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        .bento-grid { grid-template-columns: 1fr !important; }
        .why-grid { grid-template-columns: 1fr !important; }
        .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        
        @media (min-width: 768px) {
          .nav-links { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr 0.82fr !important; gap: 64px !important; }
          .bento-grid { grid-template-columns: 1.4fr 1fr !important; }
          .why-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1.8fr 1fr 1fr 1fr !important; gap: 48px !important; }
        }
      `}} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Navbar />
        </motion.div>

        {/* ══════════════════════════════════════
            SECTION 2 — HERO
        ══════════════════════════════════════ */}
        <section style={{ paddingTop: 104, paddingBottom: 80 }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 48px' }}>
            <div className="hero-grid" style={{ display: 'grid', alignItems: 'center' }}>

              {/* LEFT COLUMN */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', background: 'rgba(217,64,64,0.07)',
                    border: '1px solid rgba(217,64,64,0.15)', borderRadius: 20,
                    marginBottom: 24
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, background: '#D94040', borderRadius: '50%' }}
                  />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Built for CRPF · AI Procurement Accountability
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6 }}
                  style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
                    fontSize: 'clamp(36px, 4.2vw, 58px)', lineHeight: 1.06,
                    letterSpacing: '-0.022em', marginBottom: 20,
                  }}
                >
                  <span style={{ color: '#1A1A1A' }}>Transparent procurement.</span>
                  <br />
                  <span style={{ color: '#D94040' }}>Accountable outcomes.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.5 }}
                  style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 16,
                    color: '#666', lineHeight: 1.70, maxWidth: 480, marginBottom: 16
                  }}
                >
                  India's first end-to-end AI evaluation layer for government procurement — built to protect honest CRPF officers with documented evidence trails, not just automation.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.30, duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 40 }}
                >
                  <ShieldCheck size={13} color="#D94040" />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#999' }}>
                    Evaluated under Theme 3 — CRPF Hackathon 2026
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.5 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
                >
                  {[
                    { href: '/gov', label: 'Government Officer', sub: 'Upload & manage tenders', icon: FileText, accent: '#D94040', bg: 'rgba(217,64,64,0.09)', border: 'rgba(217,64,64,0.18)' },
                    { href: '/evaluation', label: 'Evaluation Officer', sub: 'Review bids & analysis', icon: ShieldCheck, accent: '#B5460F', bg: 'rgba(181,70,15,0.09)', border: 'rgba(181,70,15,0.18)' },
                    { href: '/builder', label: 'Contractor / Builder', sub: 'Track milestones & GPS', icon: HardHat, accent: '#92400E', bg: 'rgba(146,64,14,0.09)', border: 'rgba(146,64,14,0.18)' },
                  ].map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link key={role.href} href={role.href} style={{ textDecoration: 'none' }}>
                        <motion.div
                          whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(217,64,64,0.11)' }}
                          transition={{ duration: 0.2 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 11,
                            padding: '12px 18px', background: 'white',
                            border: '1px solid rgba(217,64,64,0.12)',
                            borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: role.bg, border: `1px solid ${role.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={16} color={role.accent} />
                          </div>
                          <div>
                            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{role.label}</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 11, color: '#999', marginTop: 1 }}>{role.sub}</div>
                          </div>
                          <ArrowRight size={13} color="#ddd" style={{ marginLeft: 'auto', paddingLeft: 8 }} />
                        </motion.div>
                      </Link>
                    );
                  })}
                </motion.div>
              </div>

              {/* RIGHT IMAGE CARD */}
              <div style={{ position: 'relative' }}>
                {/* Decorative dot cluster */}
                <div style={{ position: 'absolute', top: -12, right: -12, display: 'flex', gap: 7, zIndex: 0 }}>
                  {[1, 2, 3].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(217,64,64,0.25)' }} />)}
                </div>

                {/* Vertical accent line */}
                <div style={{ position: 'absolute', left: -18, top: '28%', width: 2, height: 72, background: 'rgba(217,64,64,0.20)', borderRadius: 2 }} />

                <motion.div
                  initial={{ opacity: 0, y: 20, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  whileHover={{ rotate: 0, y: -6 }}
                  transition={{ delay: 0.20, duration: 0.6, ease: 'easeOut' }}
                  style={{
                    width: '100%', aspectRatio: '8 / 9', borderRadius: 28, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 28px 72px rgba(217,64,64,0.11), 0 4px 18px rgba(0,0,0,0.07)',
                    position: 'relative', zIndex: 10,
                    y: imageY
                  }}
                >
                  <Image src={HERO_IMAGE} alt="New Parliament Building" fill style={{ objectFit: 'cover' }} priority />

                  {/* Overlays */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,6,4,0.62) 0%, rgba(20,6,4,0.12) 40%, transparent 65%)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(245,240,232,0.12) 0%, transparent 30%)' }} />

                  {/* Caption badge */}
                  <div style={{
                    position: 'absolute', bottom: 18, left: 18, display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 13px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)',
                    borderRadius: 20, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)'
                  }}>
                    <Scale size={11} color="rgba(255,255,255,0.75)" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.82)' }}>
                      New Parliament Building · Sansad Marg
                    </span>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 3 — HOW IT WORKS
        ══════════════════════════════════════ */}
        <section id="how-it-works" style={{ padding: '80px 0 88px', position: 'relative', background: '#FDF3F1', overflow: 'hidden' }}>
          {/* Decorative mesh blobs */}
          <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,64,64,0.04) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,64,64,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(217,64,64,0.07)', border: '1px solid rgba(217,64,64,0.15)', borderRadius: 20, marginBottom: 16 }}
            >
              <div style={{ width: 6, height: 6, background: '#D94040', borderRadius: '50%' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                How It Works
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 'clamp(26px, 3vw, 40px)', color: '#1A1A1A', letterSpacing: '-0.015em', marginBottom: 40 }}
            >
              From upload to verdict — in minutes.
            </motion.h2>

            {/* Bento Grid */}
            <div className="bento-grid" style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: 16 }}>

              {/* Card 01 */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                style={{
                  gridRow: 'span 2', borderRadius: 24, padding: '40px 42px',
                  background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.80)', boxShadow: '0 8px 40px rgba(217,64,64,0.07)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 96, color: 'rgba(217,64,64,0.055)', lineHeight: 1 }}>01</div>

                <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg, #D94040, #b83030)', boxShadow: '0 6px 22px rgba(217,64,64,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <Upload size={24} color="white" />
                </div>

                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22, color: '#1A1A1A', marginBottom: 12 }}>Upload Tender</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: '#666', lineHeight: 1.68, marginBottom: 28, position: 'relative', zIndex: 2 }}>
                  Officers upload raw tender documents. The system instantly parses complex tables, standardizes text, and prepares the data for AI evaluation without any manual data entry.
                </p>

                {/* YELLOW Queue callout strip */}
                <div style={{ marginTop: 24, marginBottom: 20, padding: '14px 16px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={15} color="#D97706" />
                  <div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 12, color: '#92400E' }}>YELLOW Queue</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 11, color: '#B5460F' }}>Ambiguous bids routed to human review with AI reasoning</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative', zIndex: 2 }}>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(217,64,64,0.08)', border: '1px solid rgba(217,64,64,0.18)', color: '#D94040', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Scope of Work</span>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Eligibility Criteria</span>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Financial Terms</span>
                </div>
              </motion.div>

              {/* Card 02 */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                style={{
                  borderRadius: 22, padding: '28px 30px', background: 'rgba(255,255,255,0.54)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.74)', boxShadow: '0 8px 40px rgba(217,64,64,0.06)', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 62, color: 'rgba(217,64,64,0.052)', lineHeight: 1 }}>02</div>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg, #D94040, #b83030)', boxShadow: '0 5px 18px rgba(217,64,64,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Brain size={20} color="white" />
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>AI Evaluation</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: '#666', lineHeight: 1.62, position: 'relative', zIndex: 2 }}>
                  Nyayadarsi AI analyses every bid against parsed criteria, flags anomalies, and surfaces collusion signals with a GREEN / YELLOW / RED confidence score.
                </p>
                <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
                  <span style={{ padding: '3px 9px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.04em' }}>GREEN 85–100%</span>
                  <span style={{ padding: '3px 9px', borderRadius: 10, background: '#fef9c3', color: '#854d0e', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.04em' }}>YELLOW &lt;85%</span>
                  <span style={{ padding: '3px 9px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.04em' }}>RED 85–100%</span>
                </div>
              </motion.div>

              {/* Card 03 */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                style={{
                  borderRadius: 22, padding: '28px 30px', background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.68)', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 62, color: 'rgba(217,64,64,0.052)', lineHeight: 1 }}>03</div>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg, #B5460F, #8a3209)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <ShieldAlert size={20} color="white" />
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Collusion Detection</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: '#666', lineHeight: 1.62, position: 'relative', zIndex: 2 }}>
                  Cross-document analysis flags shared addresses, financial clustering, and metadata patterns across the entire bidder cohort.
                </p>
                <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Shared Address</span>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Bid Clustering</span>
                  <span style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11 }}>Doc Fingerprint</span>
                </div>
              </motion.div>

              {/* Card 04 */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                style={{
                  borderRadius: 22, padding: '28px 30px', background: 'rgba(255,255,255,0.44)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.64)', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 62, color: 'rgba(217,64,64,0.052)', lineHeight: 1 }}>04</div>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg, #92400E, #6b2d07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Lock size={20} color="white" />
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Immutable Audit Trail</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: '#666', lineHeight: 1.62, position: 'relative', zIndex: 2 }}>
                  Every action SHA-256 hashed with microsecond timestamps. Officer digital signatures on every human override. Legally defensible by design.
                </p>
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: 8, fontFamily: 'monospace', fontSize: 10, color: '#aaa', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  3a7f2c...d94040  ·  verified
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 4 — WHY IT MATTERS
        ══════════════════════════════════════ */}
        <section id="why-it-matters" style={{ padding: '80px 0 88px', background: '#F5F0E8' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 48px' }}>
            <div className="why-grid" style={{ display: 'grid', gap: 72, alignItems: 'stretch' }}>

              {/* LEFT - Text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55 }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(217,64,64,0.07)', border: '1px solid rgba(217,64,64,0.15)', borderRadius: 20, marginBottom: 22, alignSelf: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, background: '#D94040', borderRadius: '50%' }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Why It Matters
                  </span>
                </div>

                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 3.2vw, 42px)', lineHeight: 1.18, letterSpacing: '-0.018em', color: '#1A1A1A', marginBottom: 22, textWrap: 'balance' }}>
                  Millions of tenders.<br />
                  Zero accountability.<br />
                  <span style={{ color: '#D94040' }}>Until now.</span>
                </h3>

                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: '#555', lineHeight: 1.75, marginBottom: 14 }}>
                  Government procurement in India spans millions of tenders annually across infrastructure, healthcare, and defence — sectors where irregularities directly affect citizens and national security.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: '#555', lineHeight: 1.75 }}>
                  NYAYADARSI gives the honest evaluation officer something no system has before: a documented, cryptographically signed evidence trail that defends every decision against legal challenge.
                </p>

                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(217,64,64,0.05)', border: '1px solid rgba(217,64,64,0.12)', borderRadius: 12, maxWidth: 380 }}>
                  <Shield size={14} color="#D94040" />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, color: '#D94040' }}>
                    Designed for CRPF Theme 3 — Hackathon 2026
                  </span>
                </div>
              </motion.div>

              {/* RIGHT - Bento Grid */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 14 }}
              >
                {[
                  { icon: FileText, title: 'AI-Parsed Criteria', desc: 'Evaluation parameters extracted automatically, preserving table structure via LayoutLMv3.' },
                  { icon: Brain, title: 'Collusion Detection', desc: 'Shared addresses, financial clustering, and document fingerprints flagged.' },
                  { icon: MapPin, title: 'GPS Milestones', desc: 'Contractors log verified site progress. Location-locked milestone payments.' },
                  { icon: Lock, title: 'L1 Integrity Lock', desc: 'Financial bids stay masked until full eligibility is verified.' }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4, boxShadow: '0 10px 32px rgba(217,64,64,0.09)' }}
                      transition={{ duration: 0.2 }}
                      style={{
                        padding: '22px 20px', background: 'white', border: '1px solid rgba(217,64,64,0.08)',
                        borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', cursor: 'default'
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, background: 'rgba(217,64,64,0.08)',
                        border: '1px solid rgba(217,64,64,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
                      }}>
                        <Icon size={16} color="#D94040" />
                      </div>
                      <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginBottom: 6 }}>
                        {feature.title}
                      </h4>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 12, color: '#888', lineHeight: 1.55 }}>
                        {feature.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 5 — FOOTER
        ══════════════════════════════════════ */}
        <footer style={{ background: '#FDF3F1', padding: '64px 0 0' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 48px' }}>
            <div className="footer-grid" style={{ display: 'grid', paddingBottom: 48 }}>

              {/* Brand */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #D94040, #a82020)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={14} color="white" />
                  </div>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>NYAYADARSI</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: '#666', lineHeight: 1.65, maxWidth: 260, marginBottom: 20 }}>
                  India's AI-powered procurement accountability platform.
                </p>
                <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', padding: '5px 11px', background: '#D94040', border: '1px solid rgba(217,64,64,0.4)', borderRadius: 14, alignSelf: 'flex-start' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, color: 'white' }}>CRPF Hackathon 2026</span>
                </div>
              </div>

              {/* PLATFORM */}
              <div>
                <h5 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Platform</h5>
                {[{ label: 'How it Works', href: '#how-it-works' }, { label: 'Bento Features', href: '#how-it-works' }, { label: 'Audit Trail', href: '/audit' }, { label: 'GPS Verify', href: '/builder' }].map((link, i) => (
                  <Link key={i} href={link.href} style={{ display: 'block', marginBottom: 12, textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: '#666', transition: 'color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* ROLES */}
              <div>
                <h5 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Roles</h5>
                {[{ label: 'Gov Officer', href: '/gov' }, { label: 'Eval Officer', href: '/evaluation' }, { label: 'Builder', href: '/builder' }].map((link, i) => (
                  <Link key={i} href={link.href} style={{ display: 'block', marginBottom: 12, textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: '#666', transition: 'color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* CONNECT */}
              <div>
                <h5 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, color: '#D94040', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Connect</h5>
                {[{ label: 'GitHub', href: '#' }, { label: 'Twitter', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Contact', href: 'mailto:team@nyayadarsi.in' }].map((link, i) => (
                  <Link key={i} href={link.href} style={{ display: 'block', marginBottom: 12, textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: '#666', transition: 'color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>

            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(217,64,64,0.1)' }} />

          <div style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#888' }}>© 2026 NYAYADARSI</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#888' }}>All rights reserved</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>🇮🇳</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, color: '#666' }}>Made in India</span>
            </div>
          </div>
        </footer>

      </motion.div>
    </>
  );
}