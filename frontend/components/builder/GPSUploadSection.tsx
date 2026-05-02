/**
 * GPSUploadSection — GPS-verified progress upload form.
 */
import React, { useState, useCallback, memo } from 'react';
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
    <div className="glass-card p-6 space-y-4">
      <div>
        <h4 className="section-title text-base">GPS-Verified Upload</h4>
        <p className="section-subtitle">Submit daily progress with location verification</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gps-lat" className="text-xs text-nyaya-400/50 block mb-1">Latitude</label>
          <input id="gps-lat" value={lat} onChange={(e) => setLat(e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor="gps-lon" className="text-xs text-nyaya-400/50 block mb-1">Longitude</label>
          <input id="gps-lon" value={lon} onChange={(e) => setLon(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="p-3 rounded-lg bg-nyaya-800/30 text-xs text-nyaya-400/50">
        <p>Registered Site: 20.2961°N, 85.8245°E (CRPF Camp Bhubaneswar)</p>
        <p>Threshold: 100 meters</p>
      </div>
      <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full">
        {uploading ? 'Verifying GPS & Uploading...' : 'Submit Progress Upload'}
      </button>
      {result && (
        <div className={`p-4 rounded-xl text-sm animate-slide-up ${
          result.accepted
            ? 'bg-verdict-green/10 border border-verdict-green/20 text-verdict-green'
            : 'bg-verdict-red/10 border border-verdict-red/20 text-verdict-red'
        }`}>
          {result.accepted ? (
            <div>
              <p className="font-bold mb-1">Upload Accepted</p>
              <p className="text-xs opacity-70">Distance: {result.distance_meters}m from site</p>
              {result.audit_hash && <p className="text-xs opacity-50 mt-1 font-mono">Audit: {result.audit_hash.slice(0, 24)}...</p>}
            </div>
          ) : (
            <div>
              <p className="font-bold mb-1">Upload Rejected</p>
              <p className="text-xs opacity-70">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const GPSUploadSection = memo(GPSUploadSectionInner);
