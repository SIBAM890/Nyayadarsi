import { useState, useCallback, useEffect, useRef, ChangeEvent } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Video, UploadCloud, CheckCircle2,
  AlertTriangle, Clock, Target, Wallet, Calendar,
  Navigation, Crosshair, Radar
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMilestones } from '@/hooks/useBuilder';
import { useLocationStore } from '@/store/LocationStore';
import { verifyLocation, uploadBuilderPhoto } from '@/services/builderService';
import CameraView from '@/components/builder/CameraView';
import { CONTRACT_ID } from '@/constants';
import type { MapViewProps } from '@/components/builder/MapView';

// ── Lazy-loaded Map Component (Leaflet requires `window`) ──────────────────
const MapView = dynamic<MapViewProps>(
  () => import('@/components/builder/MapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] rounded-xl bg-theme-bg-card border border-theme-border flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Radar className="w-8 h-8 text-theme-brand animate-spin" />
          <span className="text-xs text-theme-text-muted uppercase tracking-widest font-bold">
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
    setVerification,
    updatePosition,
  } = useLocationStore();

  const [showCamera, setShowCamera] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<'idle' | 'uploading' | 'verifying' | 'accepted' | 'rejected'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start GPS tracking on mount
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // Auto-verify position when it changes
  useEffect(() => {
    if (!location.coordinates) return;
    
    const verify = async () => {
      if (!location.coordinates) return;
      const { data } = await verifyLocation({ 
        latitude: location.coordinates.lat, 
        longitude: location.coordinates.lng 
      });
      if (data) setVerification(data);
    };

    const timer = setTimeout(verify, 2000);
    return () => clearTimeout(timer);
  }, [location.coordinates, setVerification]);

  // If geolocation is denied or unavailable, use demo coordinates (matching site exactly)
  useEffect(() => {
    if (location.error) {
      updatePosition(20.2961, 85.8245, 10);
    }
  }, [location.error, updatePosition]);

  // Derive GPS state from location context
  const gpsState: 'verifying' | 'verified' | 'offsite' | 'flagged' = (() => {
    if (location.isOnsite === null) return 'verifying';
    if (location.isFlagged) return 'flagged';
    if (!location.isOnsite) return 'offsite';
    return 'verified';
  })();

  const handlePhotoUpload = () => {
    if (photos.length < 3 && submitState === 'idle') {
      setShowCamera(true);
    }
  };

  const handleCapture = (imageData: string) => {
    setPhotos(prev => [...prev, imageData]);
    setShowCamera(false);
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

  const handleSubmit = async () => {
    if (!location.coordinates) {
      alert("GPS coordinates not acquired yet.");
      return;
    }

    setSubmitState('uploading');
    try {
      // Convert base64 photos to Blobs for upload
      const photoBlobs = await Promise.all(
        photos.map(async (p) => {
          const res = await fetch(p);
          return res.blob();
        })
      );

      const response = await uploadBuilderPhoto({
        contract_id: CONTRACT_ID,
        latitude: location.coordinates!.lat,
        longitude: location.coordinates!.lng,
        photos: photoBlobs.map((b, i) => new File([b], `site_photo_${i}.jpg`, { type: 'image/jpeg' })),
      });

      if (response.error) {
        setSubmitState('rejected');
        alert(response.error || "Upload failed verification.");
      } else {
        setSubmitState('verifying');
        setTimeout(() => {
          setSubmitState('accepted');
        }, 1000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitState('rejected');
      alert("An error occurred during submission.");
    }
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
        <AnimatePresence>
          {showCamera && (
            <CameraView 
              onCapture={handleCapture} 
              onClose={() => setShowCamera(false)} 
            />
          )}
        </AnimatePresence>
        <div className="flex h-screen overflow-hidden">

          {/* LEFT SIDEBAR (320px) */}
          <div className="w-[320px] flex-shrink-0 border-r border-theme-border bg-theme-bg-footer flex flex-col z-10">
            <div className="p-5 border-b border-theme-border bg-theme-bg-card/50">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-theme-text-muted flex items-center gap-2">
                <Target className="w-4 h-4" /> My Contracts
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { id: CONTRACT_ID, name: 'Border Outpost - Sector 4', status: 'On Track', progress: 45, days: 120, textClass: 'text-theme-status-green-text', bgClass: 'bg-theme-status-green-text' },
                { id: 'CRPF-2025-MED-042', name: 'Field Hospital Wing B', status: 'At Risk', progress: 60, days: 15, textClass: 'text-theme-status-yellow-text', bgClass: 'bg-theme-status-yellow-text' },
                { id: 'CRPF-2024-HQ-001', name: 'HQ Perimeter Wall', status: 'Delayed', progress: 85, days: -12, textClass: 'text-theme-brand', bgClass: 'bg-theme-brand' }
              ].map((c) => {
                const isActive = c.id === CONTRACT_ID;
                return (
                  <div key={c.id} className={`p-4 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md ${isActive ? 'bg-theme-bg-active border-y border-r border-theme-border border-l-[3px] border-l-theme-brand' : 'bg-theme-bg-card border border-theme-border hover:bg-theme-bg-active'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-mono text-theme-text-muted">{c.id}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.textClass} ${c.bgClass}/10 px-2 py-0.5 rounded`}>
                        {c.status}
                      </span>
                    </div>
                    <h4 className={`text-sm font-medium mb-3 transition-colors ${isActive ? 'text-theme-text-heading' : 'text-theme-text-body group-hover:text-theme-text-heading'}`}>{c.name}</h4>
                    <div className="w-full bg-theme-border h-1.5 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${c.bgClass}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-theme-text-muted font-medium">{c.progress}% Complete</span>
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${c.days <= 0 ? 'text-theme-status-red-text bg-theme-status-red-bg border-theme-status-red-text/20 font-semibold' : 'text-theme-text-muted bg-theme-bg-card border-theme-border'}`}>
                        <Calendar className="w-3 h-3" /> {c.days > 0 ? `${c.days} days left` : `OVERDUE: ${Math.abs(c.days)} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 overflow-y-auto bg-theme-bg-primary relative">
            <div className="max-w-4xl mx-auto p-8 space-y-8">

              {/* TOP SECTION - TODAY'S UPLOAD */}
              <section className="bg-theme-bg-card border border-theme-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)]" />

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-theme-text-muted mb-0.5 uppercase tracking-wider">Showing report for: Border Outpost - Sector 4</p>
                    <h3 className="text-base font-display font-semibold text-theme-text-heading mb-1">Today&apos;s Site Report</h3>
                    <p className="text-xs text-theme-text-muted">Cryptographically signed geospatial upload.</p>
                  </div>
                </div>

                {/* Verification Bar */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className={`mb-4 px-3 py-2.5 rounded-lg border flex items-center gap-2 ${
                    gpsState === 'verifying' ? 'bg-theme-bg-footer border-theme-border text-theme-text-muted' :
                    gpsState === 'verified' ? 'bg-theme-status-green-bg border-theme-status-green-text/20 text-theme-status-green-text' :
                    'bg-theme-status-red-bg border-theme-status-red-text/20 text-theme-status-red-text'
                  }`}
                >
                  {gpsState === 'verifying' ? (
                    <>
                      <Target className="w-4 h-4 animate-spin shrink-0" />
                      <p className="text-xs font-medium">Acquiring GPS signatures...</p>
                    </>
                  ) : gpsState === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-medium">Location verified</p>
                      <span className="text-[10px] opacity-70 ml-auto font-mono">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-medium">GPS verification failed: Site deviation detected</p>
                    </>
                  )}
                </motion.div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Hidden real file input */}
                  <input
                    id="site-photo-upload"
                    name="site-photo-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* Photo Slots */}
                  <div className="col-span-2 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        onClick={handlePhotoUpload}
                        className={`h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden group ${photos.length > i
                            ? 'border-theme-status-green-text/30 bg-theme-status-green-bg/50'
                            : submitState === 'idle'
                              ? 'border-theme-border hover:border-theme-brand/50 bg-theme-bg-footer hover:bg-theme-bg-active cursor-pointer'
                              : 'border-theme-border bg-theme-bg-footer opacity-50 cursor-not-allowed'
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
                              <span className="text-[10px] text-nyaya-100 uppercase tracking-widest font-bold drop-shadow-md">Captured</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-nyaya-500 mb-1" />
                            <span className="text-[9px] text-nyaya-500 uppercase tracking-widest px-1 text-center">Tap to Photo</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button disabled={submitState !== 'idle'} className="col-span-1 h-28 rounded-lg border border-theme-border bg-theme-brand/5 hover:bg-theme-brand/10 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center transition-colors">
                    <Video className="w-7 h-7 mb-1.5 text-theme-brand" />
                    <span className="text-xs uppercase tracking-widest text-center px-1 font-bold text-theme-brand mb-1">Record Walkthrough</span>
                    <span className="text-[9px] text-theme-text-muted px-2 text-center leading-tight">GPS-locked • 60 seconds • court-admissible</span>
                  </button>
                </div>

                <div className="flex justify-end relative">
                  <AnimatePresence>
                    {submitState !== 'idle' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-md ${submitState === 'accepted' ? 'bg-verdict-green/20 text-verdict-green border border-verdict-green/30' :
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
                    className="bg-theme-brand hover:bg-theme-brand-hover text-white flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Submit Evidence
                  </button>
                </div>
              </section>

              {/* MAP SECTION — Live GPS Tracker */}
              <section className="relative">
                {/* ⚠ DEMO MODE BANNER */}
                {location.error && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-theme-status-yellow-bg text-theme-status-yellow-text text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border-2 border-theme-bg-card">
                    <AlertTriangle className="w-3.5 h-3.5" /> DEMO MODE — data is simulated
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-wider flex items-center gap-2">
                    <Navigation className="w-4 h-4" /> Live GPS Tracker
                  </h4>
                  <div className="flex items-center gap-3">
                    {location.accuracy !== null && (
                      <span className="text-[10px] text-nyaya-500 font-mono bg-surface-2 px-2 py-0.5 rounded border border-[#E8E8E8]">
                        GPS Accuracy: ±{location.accuracy.toFixed(0)}m
                      </span>
                    )}
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${location.isTracking
                        ? 'bg-verdict-green/10 text-verdict-green border border-verdict-green/20'
                        : 'bg-surface-2 text-nyaya-500 border border-[#E8E8E8]'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${location.isTracking ? 'bg-verdict-green animate-pulse' : 'bg-nyaya-500'}`} />
                      {location.isTracking ? 'Tracking' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="h-[340px] relative">
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
                  {/* Map Legend */}
                  <div className="absolute bottom-4 right-4 z-10 bg-surface-0/90 backdrop-blur px-3 py-2 rounded shadow-sm border border-[#E8E8E8] flex items-center gap-2 pointer-events-none">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-verdict-green bg-verdict-green/10" />
                    <span className="text-[10px] font-semibold text-nyaya-500 uppercase tracking-wider">Approved work radius</span>
                  </div>
                </div>
              </section>

              {/* MIDDLE SECTION - MILESTONE TRACKER */}
              <section>
                <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-wider mb-6">Milestone Trajectory</h4>
                <div className="relative pt-4 pb-12 overflow-x-auto">
                  {/* Connecting Line */}
                  <div className="absolute top-7 left-8 right-8 h-1 bg-surface-1 -z-10" />
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
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-3 shadow-lg ${isComplete ? 'bg-verdict-green text-surface-0 shadow-verdict-green/50' :
                              isCurrent ? 'bg-nyaya-600-white shadow-nyaya-600/50 animate-pulse' :
                                'bg-surface-2 border-2 border-[#E8E8E8] text-nyaya-500'
                            }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>

                          <div className="text-center">
                            <p className={`text-xs font-semibold mb-1 ${isComplete || isCurrent ? 'text-nyaya-100' : 'text-nyaya-400'}`}>
                              {ms.title}
                            </p>
                            <p className="text-[10px] font-mono text-nyaya-500 mb-2">₹{(ms.payment_amount / 100000).toFixed(1)}L</p>

                            {isCurrent && submitState === 'accepted' && (
                              <motion.button
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => onTriggerPayment(ms.id)}
                                className="px-3 py-1 bg-accent-500-white text-[10px] uppercase tracking-wider font-bold rounded shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
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
                    <p className="text-3xl font-display font-light text-nyaya-100">₹{(releasedPayment / 100000).toFixed(1)}<span className="text-lg text-verdict-green/70">L</span></p>
                  </div>

                  <div className="bg-verdict-yellow/10 border border-verdict-yellow/20 rounded-xl p-5 relative overflow-hidden">
                    <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-verdict-yellow/5" />
                    <p className="text-[10px] font-bold text-verdict-yellow uppercase tracking-widest mb-1">Pending Approval</p>
                    <p className="text-3xl font-display font-light text-nyaya-100">₹{((milestones[currentMsIndex]?.payment_amount || 0) / 100000).toFixed(1)}<span className="text-lg text-verdict-yellow/70">L</span></p>
                  </div>

                  <div className="bg-surface-1 border border-[#E8E8E8] rounded-xl p-5 flex flex-col justify-center">
                    <p className="text-xs text-nyaya-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-nyaya-500" /> Next Auto-Release
                    </p>
                    <p className="text-sm text-nyaya-100 font-medium">72 hours after milestone verification</p>
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
    <BuilderDashboardInner />
  );
}
