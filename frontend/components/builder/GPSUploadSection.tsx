/**
 * GPS Upload Section — GPS-verified progress upload form.
 */
import React, { useState, useCallback, memo } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { uploadBuilderPhoto } from '@/services/builderService';
import { CONTRACT_ID } from '@/constants';
import type { BuilderUploadResponse } from '@/types/builder';

interface UploadResult {
  accepted: boolean;
  message?: string;
  distance_meters?: number;
  audit_hash?: string;
}

function GPSUploadSectionInner() {
  const [lat, setLat] = useState('20.2965');
  const [lon, setLon] = useState('85.8240');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    setResult(null);
    const { data, error } = await uploadBuilderPhoto({
      contract_id: CONTRACT_ID,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    });
    setUploading(false);
    if (error) {
      setResult({ accepted: false, message: error });
    } else if (data) {
      setResult({ accepted: true, distance_meters: data.distance_meters, audit_hash: data.audit_hash });
    }
  }, [lat, lon]);

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h4 className="section-title">GPS-Verified Upload</h4>
        <p className="section-subtitle text-xs">Submit daily progress with location verification</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="gps-lat" className="text-[11px] text-nyaya-500 font-medium block mb-1">Latitude</label>
          <input id="gps-lat" value={lat} onChange={(e) => setLat(e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor="gps-lon" className="text-[11px] text-nyaya-500 font-medium block mb-1">Longitude</label>
          <input id="gps-lon" value={lon} onChange={(e) => setLon(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-surface-3 text-xs text-nyaya-500 flex items-start gap-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <div>
          <p>Registered Site: 20.2961°N, 85.8245°E (CRPF Camp Bhubaneswar)</p>
          <p>Threshold: 100 meters</p>
        </div>
      </div>
      <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
        {uploading ? 'Verifying GPS & Uploading...' : 'Submit Progress Upload'}
      </button>
      {result && (
        <div className={`p-3 rounded-lg text-sm animate-slide-up ${
          result.accepted
            ? 'bg-verdict-green/10 border border-verdict-green/15 text-verdict-green'
            : 'bg-verdict-red/10 border border-verdict-red/15 text-verdict-red'
        }`}>
          {result.accepted ? (
            <div>
              <p className="font-semibold mb-0.5">Upload Accepted</p>
              <p className="text-xs opacity-70">Distance: {result.distance_meters}m from site</p>
              {result.audit_hash && <p className="text-xs opacity-50 mt-1 font-mono">Audit: {result.audit_hash.slice(0, 24)}...</p>}
            </div>
          ) : (
            <div>
              <p className="font-semibold mb-0.5">Upload Rejected</p>
              <p className="text-xs opacity-70">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const GPSUploadSection = memo(GPSUploadSectionInner);
