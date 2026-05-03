import { useState, useCallback, useEffect, useRef, ChangeEvent } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Video, UploadCloud, MapPin, CheckCircle2, 
  AlertTriangle, Clock, Target, Wallet, Calendar,
  Navigation, Crosshair, Radar
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMilestones } from '@/hooks/useBuilder';
import { useLocation } from '@/hooks/useLocation';
import { LocationProvider } from '@/store/LocationContext';
import { CONTRACT_ID } from '@/constants';
import type { MapViewProps } from '@/components/builder/MapView';

// ── Lazy-loaded Map Component (Leaflet requires `window`) ──────────────────
const MapView = dynamic<MapViewProps>(
  () => import('@/components/builder/MapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] rounded-xl bg-surface-2 border border-white/[0.06] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Radar className="w-8 h-8 text-nyaya-500 animate-spin" />
          <span className="text-xs text-nyaya-500 uppercase tracking-widest font-bold">
            Initializing Map...
          </span>
        </div>
      </div>
    ),
  }
);

const DEMO_OFFICER_ID = 'OFF_DEMO_001';

// ── Inner component that uses LocationContext ──────────────────────────────
function BuilderDashboardInner() {
  const {
    milestoneData,
    milestones,
    loading,
    totalPayment,
    releasedPayment,
    handleTriggerPayment,
  } = useMilestones(CONTRACT_ID);

  const {
    location,
    startTracking,
    stopTracking,
    triggerVerification,
  } = useLocation();

  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<'idle' | 'uploading' | 'verifying' | 'accepted' | 'rejected'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start GPS tracking on mount
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // If geolocation is denied or unavailable, use demo coordinates
  useEffect(() => {
    if (location.error) {
      // Fallback: simulate a position near the registered site for demo
      triggerVerification(20.2965, 85.8240);
    }
  }, [location.error, triggerVerification]);

  // Derive GPS state from location context
  const gpsState: 'verifying' | 'verified' | 'offsite' | 'flagged' = (() => {
    if (location.isOnsite === null) return 'verifying';
    if (location.isFlagged) return 'flagged';
    if (!location.isOnsite) return 'offsite';
    return 'verified';
  })();

  const handlePhotoUpload = () => {
    if (photos.length < 3 && submitState === 'idle') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleSubmit = () => {
    setSubmitState('uploading');
    setTimeout(() => {
      setSubmitState('verifying');
      setTimeout(() => {
        setSubmitState('accepted');
      }, 1500);
    }, 1000);
  };

  const onTriggerPayment = useCallback(
    async (milestoneId: string) => {
      const msg = await handleTriggerPayment(milestoneId, DEMO_OFFICER_ID);
      if (msg) setPaymentMsg(msg);
    },
    [handleTriggerPayment]
  );

  if (loading) {
    return (
      <Layout title="Contractor — Live Monitoring">
        <LoadingSpinner message="Loading contract telemetry..." />
      </Layout>
    );
  }

  // Find current milestone index
  const currentMsIndex = milestones.findIndex(m => {
    const s = (m.status as string).toUpperCase();
    return s === 'PENDING' || s === 'IN_PROGRESS';
  });

  return (
    <>
      <Head>
        <title>Builder Dashboard — Nyayadarsi</title>
      </Head>
      <Layout title="Contractor — Live Monitoring">
        <div className="flex h-[calc(100vh-8.5rem)] -m-8 border-t border-white/[0.06] overflow-hidden">
          
          {/* LEFT SIDEBAR (320px) */}
          <div className="w-[320px] flex-shrink-0 border-r border-white/[0.06] bg-surface-1 flex flex-col z-10">
            <div className="p-5 border-b border-white/[0.06] bg-surface-0/50">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-nyaya-300 flex items-center gap-2">
                <Target className="w-4 h-4" /> My Contracts
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { id: CONTRACT_ID, name: 'Border Outpost - Sector 4', status: 'On Track', progress: 45, days: 120, textClass: 'text-verdict-green', bgClass: 'bg-verdict-green' },
                { id: 'CRPF-2025-MED-042', name: 'Field Hospital Wing B', status: 'At Risk', progress: 60, days: 15, textClass: 'text-verdict-yellow', bgClass: 'bg-verdict-yellow' },
                { id: 'CRPF-2024-HQ-001', name: 'HQ Perimeter Wall', status: 'Delayed', progress: 85, days: -12, textClass: 'text-verdict-red', bgClass: 'bg-verdict-red' }
              ].map((c) => (
                <div key={c.id} className={`glass-card-hover p-4 relative overflow-hidden ${c.id === CONTRACT_ID ? 'bg-nyaya-600/5 border-nyaya-500/30' : ''}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bgClass}`} />
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-mono text-nyaya-500">{c.id}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${c.textClass} ${c.bgClass}/10 px-2 py-0.5 rounded`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-white mb-3">{c.name}</h4>
                  <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-nyaya-500" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-nyaya-400">{c.progress}% Complete</span>
                    <span className="flex items-center gap-1 text-nyaya-400 bg-surface-2 px-1.5 py-0.5 rounded border border-white/[0.04]">
                      <Calendar className="w-3 h-3" /> {c.days > 0 ? `${c.days} days left` : `${Math.abs(c.days)} days over`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 overflow-y-auto bg-surface-0 relative">
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              
              {/* TOP SECTION - TODAY'S UPLOAD */}
              <section className="bg-surface-1 border border-white/[0.06] rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)]" />
                
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-base font-display font-semibold text-white mb-1">Today&apos;s Site Report</h3>
                    <p className="text-xs text-nyaya-400">Cryptographically signed geospatial upload.</p>
                  </div>
                  
                  {/* GPS Badge — now driven by live location data */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                    gpsState === 'verifying' ? 'bg-nyaya-600/10 border-nyaya-500/20 text-nyaya-400' :
                    gpsState === 'verified' ? 'bg-verdict-green/10 border-verdict-green/20 text-verdict-green' :
                    gpsState === 'flagged' ? 'bg-verdict-yellow/10 border-verdict-yellow/20 text-verdict-yellow' :
                    'bg-verdict-red/10 border-verdict-red/20 text-verdict-red'
                  }`}>
                    {gpsState === 'verifying' && <div className="w-2 h-2 rounded-full bg-nyaya-400 animate-ping" />}
                    {gpsState === 'verified' && <div className="w-2 h-2 rounded-full bg-verdict-green animate-pulse" />}
                    {gpsState === 'flagged' && <Navigation className="w-3.5 h-3.5" />}
                    {gpsState === 'offsite' && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {gpsState === 'verifying' ? 'Acquiring Satellites...' :
                       gpsState === 'verified' ? `Site Verified ✓ — ${location.distanceMeters?.toFixed(0) ?? '?'}m` :
                       gpsState === 'flagged' ? `Flagged ⚠ — ${location.distanceMeters?.toFixed(0) ?? '?'}m deviation` :
                       `Off-Site ⚠ — ${location.distanceMeters?.toFixed(0) ?? '?'}m deviation`}
                    </span>
                  </div>
                </div>

                {/* Reverse-geocoded address bar */}
                {location.address && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 px-3 py-2 rounded-lg bg-surface-2 border border-white/[0.04] flex items-center gap-2"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-nyaya-500 flex-shrink-0" />
                    <p className="text-[11px] text-nyaya-400 truncate">{location.address}</p>
                  </motion.div>
                )}

                <div className="flex gap-4 mb-6">
                  {/* Hidden real file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* Photo Slots */}
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i}
                      onClick={handlePhotoUpload}
                      className={`h-24 flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                        photos.length > i 
                          ? 'border-verdict-green/30 bg-verdict-green/5' 
                          : submitState === 'idle'
                            ? 'border-white/[0.1] hover:border-nyaya-500/50 bg-surface-2 hover:bg-surface-3 cursor-pointer'
                            : 'border-white/[0.05] bg-surface-2 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {photos.length > i ? (
                        <>
                          <img 
                            src={photos[i]} 
                            alt={`Site Evidence ${i + 1}`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                          />
                          <div className="relative z-10 flex flex-col items-center">
                            <CheckCircle2 className="w-6 h-6 text-verdict-green mb-1 drop-shadow-lg" />
                            <span className="text-[10px] text-white uppercase tracking-widest font-bold drop-shadow-md">Captured</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-nyaya-500 mb-1" />
                          <span className="text-[10px] text-nyaya-500 uppercase tracking-widest">Tap to Photo</span>
                        </>
                      )}
                    </div>
                  ))}
                  <button disabled={submitState !== 'idle'} className="h-24 flex-1 rounded-lg border border-white/[0.06] bg-nyaya-600/10 hover:bg-nyaya-600/20 flex flex-col items-center justify-center transition-all text-nyaya-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <Video className="w-6 h-6 mb-1" />
                    <span className="text-[10px] uppercase tracking-widest text-center px-2">Record 60s Walkthrough</span>
                  </button>
                </div>

                <div className="flex justify-end relative">
                  <AnimatePresence>
                    {submitState !== 'idle' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-md ${
                          submitState === 'accepted' ? 'bg-verdict-green/20 text-verdict-green border border-verdict-green/30' :
                          submitState === 'rejected' ? 'bg-verdict-red/20 text-verdict-red border border-verdict-red/30' :
                          'bg-nyaya-600/20 text-nyaya-300 border border-nyaya-500/30'
                        }`}
                      >
                        {submitState === 'uploading' && <UploadCloud className="w-4 h-4 animate-bounce" />}
                        {submitState === 'verifying' && <Target className="w-4 h-4 animate-spin" />}
                        {submitState === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {submitState === 'uploading' ? 'Uploading...' :
                           submitState === 'verifying' ? 'AI Verifying Evidence...' :
                           submitState === 'accepted' ? 'Upload Accepted ✓' : 'Rejected'}
                        </span>
                        {submitState === 'accepted' && (
                          <span className="ml-2 text-[10px] font-mono text-nyaya-400 border-l border-current pl-2">
                            SHA-256: 8f4e2a...
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={handleSubmit}
                    disabled={photos.length < 3 || gpsState === 'verifying' || gpsState === 'offsite' || submitState !== 'idle'}
                    className="btn-primary flex items-center gap-2 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Submit Evidence
                  </button>
                </div>
              </section>

              {/* MAP SECTION — Live GPS Tracker */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-wider flex items-center gap-2">
                    <Navigation className="w-4 h-4" /> Live GPS Tracker
                  </h4>
                  <div className="flex items-center gap-3">
                    {location.accuracy !== null && (
                      <span className="text-[10px] text-nyaya-500 font-mono bg-surface-2 px-2 py-0.5 rounded border border-white/[0.04]">
                        GPS Accuracy: ±{location.accuracy.toFixed(0)}m
                      </span>
                    )}
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      location.isTracking 
                        ? 'bg-verdict-green/10 text-verdict-green border border-verdict-green/20' 
                        : 'bg-surface-2 text-nyaya-500 border border-white/[0.04]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${location.isTracking ? 'bg-verdict-green animate-pulse' : 'bg-nyaya-500'}`} />
                      {location.isTracking ? 'Tracking' : location.error ? 'Demo Mode' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="h-[340px]">
                  <MapView
                    builderPosition={location.coordinates}
                    sitePosition={location.siteCoordinates}
                    distanceMeters={location.distanceMeters}
                    isOnsite={location.isOnsite}
                    isFlagged={location.isFlagged}
                    address={location.address}
                    accuracy={location.accuracy}
                    flagThreshold={location.verification?.flag_threshold_meters ?? 500}
                  />
                </div>
              </section>

              {/* MIDDLE SECTION - MILESTONE TRACKER */}
              <section>
                <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-wider mb-6">Milestone Trajectory</h4>
                <div className="relative pt-4 pb-12 overflow-x-auto">
                  {/* Connecting Line */}
                  <div className="absolute top-7 left-8 right-8 h-1 bg-white/[0.04] -z-10" />
                  <div 
                    className="absolute top-7 left-8 h-1 bg-verdict-green -z-10 transition-all duration-1000" 
                    style={{ width: `${(Math.max(0, currentMsIndex) / Math.max(1, milestones.length - 1)) * 100}%` }} 
                  />

                  <div className="flex justify-between min-w-[600px] px-4">
                    {milestones.map((ms, i) => {
                      const isComplete = (ms.status as string).toUpperCase() === 'COMPLETED';
                      const isCurrent = i === currentMsIndex;
                      
                      return (
                        <div key={ms.id} className="flex flex-col items-center w-32 relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                            isComplete ? 'bg-verdict-green text-surface-0 shadow-verdict-green/50' :
                            isCurrent ? 'bg-nyaya-600 text-white shadow-nyaya-600/50 animate-pulse' :
                            'bg-surface-2 border-2 border-white/[0.1] text-nyaya-500'
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          
                          <div className="text-center">
                            <p className={`text-xs font-semibold mb-1 ${isComplete || isCurrent ? 'text-white' : 'text-nyaya-400'}`}>
                              {ms.title}
                            </p>
                            <p className="text-[10px] font-mono text-nyaya-500 mb-2">₹{(ms.payment_amount / 100000).toFixed(1)}L</p>
                            
                            {isCurrent && submitState === 'accepted' && (
                              <motion.button 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => onTriggerPayment(ms.id)}
                                className="px-3 py-1 bg-accent-500 hover:bg-accent-600 text-white text-[10px] uppercase tracking-wider font-bold rounded shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                              >
                                Bill Now
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* BOTTOM SECTION - PAYMENT STATUS */}
              <section>
                <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-wider mb-4">Financial Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-verdict-green/10 border border-verdict-green/20 rounded-xl p-5 relative overflow-hidden">
                    <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-verdict-green/5" />
                    <p className="text-[10px] font-bold text-verdict-green uppercase tracking-widest mb-1">Total Released</p>
                    <p className="text-3xl font-display font-light text-white">₹{(releasedPayment / 100000).toFixed(1)}<span className="text-lg text-verdict-green/70">L</span></p>
                  </div>
                  
                  <div className="bg-verdict-yellow/10 border border-verdict-yellow/20 rounded-xl p-5 relative overflow-hidden">
                    <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-verdict-yellow/5" />
                    <p className="text-[10px] font-bold text-verdict-yellow uppercase tracking-widest mb-1">Pending Approval</p>
                    <p className="text-3xl font-display font-light text-white">₹{((milestones[currentMsIndex]?.payment_amount || 0) / 100000).toFixed(1)}<span className="text-lg text-verdict-yellow/70">L</span></p>
                  </div>
                  
                  <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-center">
                    <p className="text-xs text-nyaya-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-nyaya-500" /> Next Auto-Release
                    </p>
                    <p className="text-sm text-white font-medium">72 hours after milestone verification</p>
                    {paymentMsg && <p className="text-[10px] text-verdict-green mt-2 font-mono">{paymentMsg}</p>}
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

// ── Page Export — wraps with LocationProvider ───────────────────────────────
export default function BuilderDashboard() {
  return (
    <LocationProvider>
      <BuilderDashboardInner />
    </LocationProvider>
  );
}
