/**
 * Location types — strict TypeScript interfaces for geospatial data.
 * Mirrors backend/schemas/builder.py location models.
 */

/** Raw GPS coordinates. */
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

/** Site coordinates as returned by the backend. */
export interface SiteCoordinates {
  lat: number;
  lon: number;
}

/** Full location verification response from POST /api/builder/verify-location. */
export interface LocationVerification {
  accepted: boolean;
  distance_meters: number;
  hard_threshold_meters: number;
  flag_threshold_meters: number;
  flagged: boolean;
  rejection_reason: string | null;
  reverse_geocoded_address: string | null;
  site_coordinates: SiteCoordinates;
}

/** Payload for the verify-location endpoint. */
export interface LocationVerificationPayload {
  latitude: number;
  longitude: number;
}

/** Location tracking state managed by LocationContext. */
export interface LocationState {
  /** Builder's current coordinates from browser Geolocation API. */
  coordinates: GeoCoordinates | null;
  /** GPS accuracy in metres. */
  accuracy: number | null;
  /** Reverse-geocoded address string from the backend. */
  address: string | null;
  /** Registered project site coordinates. */
  siteCoordinates: GeoCoordinates;
  /** Distance from site in metres. */
  distanceMeters: number | null;
  /** Whether the builder is within the hard threshold. */
  isOnsite: boolean | null;
  /** Whether the builder is flagged (>500m). */
  isFlagged: boolean | null;
  /** Whether geolocation tracking is active. */
  isTracking: boolean;
  /** Last error message. */
  error: string | null;
  /** Full verification result from the backend. */
  verification: LocationVerification | null;
}

/** Actions dispatched to the location reducer. */
export type LocationAction =
  | { type: 'START_TRACKING' }
  | { type: 'UPDATE_POSITION'; payload: { lat: number; lng: number; accuracy: number } }
  | { type: 'SET_VERIFICATION_RESULT'; payload: LocationVerification }
  | { type: 'STOP_TRACKING' }
  | { type: 'SET_ERROR'; payload: string };

/** Strict TypeScript interfaces for Leaflet map event handlers. */
export interface MapEventHandlers {
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerDragEnd?: (latlng: { lat: number; lng: number }) => void;
  onZoomEnd?: (zoom: number) => void;
}
