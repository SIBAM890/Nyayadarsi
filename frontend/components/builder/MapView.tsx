/**
 * MapView — React-Leaflet map component for builder GPS visualization.
 *
 * Features:
 * - Builder marker with pulsing blue dot for current GPS position
 * - Site marker with red pin for the registered project site
 * - Geofence circle (500m radius) with color coding (green/red)
 * - Dashed polyline connecting builder to site center
 * - Info popup with reverse-geocoded address and distance
 *
 * This component is lazy-loaded via next/dynamic with ssr: false
 * because Leaflet requires the `window` object.
 */
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoCoordinates } from '@/types/location';

// ── Custom Icon Definitions ────────────────────────────────────────────────

/** Pulsing blue dot for builder's live position. */
const builderIcon = L.divIcon({
  className: 'builder-marker',
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/** Red pin for the registered project site. */
const siteIcon = L.divIcon({
  className: 'site-marker',
  html: `
    <div style="position:relative;width:28px;height:36px;">
      <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:36px;">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#ef4444"/>
        <circle cx="14" cy="14" r="6" fill="#fff"/>
      </svg>
    </div>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

// ── Map Auto-Fit ───────────────────────────────────────────────────────────

interface FitBoundsProps {
  builderPos: GeoCoordinates | null;
  sitePos: GeoCoordinates;
}

/** Automatically fits the map bounds to include both markers. */
function FitBounds({ builderPos, sitePos }: FitBoundsProps) {
  const map = useMap();

  React.useEffect(() => {
    if (builderPos) {
      const bounds = L.latLngBounds(
        [builderPos.lat, builderPos.lng],
        [sitePos.lat, sitePos.lng],
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      map.setView([sitePos.lat, sitePos.lng], 15);
    }
  }, [map, builderPos, sitePos]);

  return null;
}

// ── MapView Component ──────────────────────────────────────────────────────

export interface MapViewProps {
  /** Builder's current GPS coordinates (null if not yet acquired). */
  builderPosition: GeoCoordinates | null;
  /** Registered project site coordinates. */
  sitePosition: GeoCoordinates;
  /** Distance from builder to site in metres. */
  distanceMeters: number | null;
  /** Whether the builder is within the hard threshold. */
  isOnsite: boolean | null;
  /** Whether the builder is flagged (>500m). */
  isFlagged: boolean | null;
  /** Reverse-geocoded address string. */
  address: string | null;
  /** GPS accuracy in metres. */
  accuracy: number | null;
  /** Flag threshold radius in metres (default 500). */
  flagThreshold?: number;
}

export default function MapView({
  builderPosition,
  sitePosition,
  distanceMeters,
  isOnsite,
  isFlagged,
  address,
  accuracy,
  flagThreshold = 500,
}: MapViewProps) {
  // Geofence circle color based on builder proximity
  const geofenceColor = useMemo(() => {
    if (isOnsite === null) return { fill: 'rgba(59,130,246,0.08)', stroke: '#3b82f6' }; // Unknown — blue
    if (isFlagged) return { fill: 'rgba(239,68,68,0.08)', stroke: '#ef4444' }; // Flagged — red
    return { fill: 'rgba(16,185,129,0.08)', stroke: '#10b981' }; // Onsite — green
  }, [isOnsite, isFlagged]);

  // Dashed line between builder and site
  const connectionLine = useMemo(() => {
    if (!builderPosition) return null;
    return [
      [builderPosition.lat, builderPosition.lng] as [number, number],
      [sitePosition.lat, sitePosition.lng] as [number, number],
    ];
  }, [builderPosition, sitePosition]);

  const center: [number, number] = [sitePosition.lat, sitePosition.lng];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/[0.06]">
      {/* CSS for marker animations */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        .builder-marker, .site-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #e8e4d8 !important;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          color: #202124 !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 7px 1px rgba(0,0,0,0.3) !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
          border: none !important;
        }
        .leaflet-popup-close-button {
          color: #5f6368 !important;
        }
        .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #666666 !important;
          border-color: #e0e0e0 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f5f5 !important;
          color: #333333 !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          color: #666666 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #1a73e8 !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={15}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Google Maps-style tile layer */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
          maxZoom={20}
        />

        {/* Auto-fit bounds */}
        <FitBounds builderPos={builderPosition} sitePos={sitePosition} />

        {/* Geofence circle — 500m radius around site */}
        <Circle
          center={center}
          radius={flagThreshold}
          pathOptions={{
            color: geofenceColor.stroke,
            fillColor: geofenceColor.fill,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '8 4',
          }}
        />

        {/* Site marker */}
        <Marker position={center} icon={siteIcon}>
          <Popup>
            <div style={{ padding: '4px 0' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: '#202124' }}>
                Registered Project Site
              </p>
              <p style={{ fontSize: '11px', color: '#5f6368', fontFamily: 'JetBrains Mono, monospace' }}>
                {sitePosition.lat.toFixed(4)}°N, {sitePosition.lng.toFixed(4)}°E
              </p>
              <p style={{ fontSize: '10px', color: '#80868b', marginTop: '4px' }}>
                Geofence: {flagThreshold}m radius
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Builder marker */}
        {builderPosition && (
          <Marker position={[builderPosition.lat, builderPosition.lng]} icon={builderIcon}>
            <Popup>
              <div style={{ padding: '4px 0', minWidth: '180px' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#202124' }}>
                  Builder Position
                </p>
                <p style={{ fontSize: '11px', color: '#5f6368', fontFamily: 'JetBrains Mono, monospace' }}>
                  {builderPosition.lat.toFixed(4)}°N, {builderPosition.lng.toFixed(4)}°E
                </p>
                {accuracy !== null && (
                  <p style={{ fontSize: '10px', color: '#80868b', marginTop: '2px' }}>
                    Accuracy: ±{accuracy.toFixed(0)}m
                  </p>
                )}
                {address && (
                  <p style={{ fontSize: '11px', color: '#3c4043', marginTop: '6px', lineHeight: '1.4' }}>
                    {address}
                  </p>
                )}
                {distanceMeters !== null && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: isFlagged ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                    color: isFlagged ? '#ef4444' : '#10b981',
                    border: `1px solid ${isFlagged ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  }}>
                    {distanceMeters.toFixed(1)}m from site
                    {isFlagged && ' — FLAGGED'}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dashed connection line */}
        {connectionLine && (
          <Polyline
            positions={connectionLine}
            pathOptions={{
              color: isFlagged ? '#ef4444' : '#3b82f6',
              weight: 2,
              dashArray: '6 6',
              opacity: 0.6,
            }}
          />
        )}
      </MapContainer>

      {/* Distance overlay badge */}
      {distanceMeters !== null && (
        <div
          className="absolute top-3 right-3 z-[1000] px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase"
          style={{
            background: isFlagged
              ? 'rgba(239,68,68,0.15)'
              : isOnsite
              ? 'rgba(16,185,129,0.15)'
              : 'rgba(59,130,246,0.15)',
            color: isFlagged ? '#ef4444' : isOnsite ? '#10b981' : '#3b82f6',
            border: `1px solid ${isFlagged ? 'rgba(239,68,68,0.25)' : isOnsite ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.25)'}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          {distanceMeters.toFixed(0)}m {isFlagged ? '⚠ Flagged' : isOnsite ? '✓ Onsite' : '— Checking'}
        </div>
      )}
    </div>
  );
}
