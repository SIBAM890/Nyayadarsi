/**
 * LocationContext — Centralized GPS state management for the Builder Dashboard.
 * Uses React Context + useReducer for predictable state transitions.
 *
 * Manages:
 * - Browser Geolocation API tracking lifecycle
 * - Real-time coordinate updates
 * - Backend verification results (distance, address, flags)
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { LocationState, LocationAction, LocationVerification } from '@/types/location';

// ── Default registered site coordinates (CRPF Camp Bhubaneswar) ────────────
const DEFAULT_SITE = { lat: 20.2961, lng: 85.8245 };

const initialState: LocationState = {
  coordinates: null,
  accuracy: null,
  address: null,
  siteCoordinates: DEFAULT_SITE,
  distanceMeters: null,
  isOnsite: null,
  isFlagged: null,
  isTracking: false,
  error: null,
  verification: null,
};

// ── Reducer ────────────────────────────────────────────────────────────────
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'START_TRACKING':
      return { ...state, isTracking: true, error: null };

    case 'UPDATE_POSITION':
      return {
        ...state,
        coordinates: { lat: action.payload.lat, lng: action.payload.lng },
        accuracy: action.payload.accuracy,
        error: null,
      };

    case 'SET_VERIFICATION_RESULT': {
      const v = action.payload;
      return {
        ...state,
        distanceMeters: v.distance_meters,
        isOnsite: v.accepted,
        isFlagged: v.flagged,
        address: v.reverse_geocoded_address,
        siteCoordinates: { lat: v.site_coordinates.lat, lng: v.site_coordinates.lon },
        verification: v,
      };
    }

    case 'STOP_TRACKING':
      return { ...state, isTracking: false };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isTracking: false };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
interface LocationContextValue {
  state: LocationState;
  startTracking: () => void;
  stopTracking: () => void;
  setVerificationResult: (result: LocationVerification) => void;
  updatePosition: (lat: number, lng: number, accuracy: number) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────
interface LocationProviderProps {
  children: ReactNode;
  /** Override default site coordinates for different projects. */
  siteCoordinates?: { lat: number; lng: number };
}

export function LocationProvider({ children, siteCoordinates }: LocationProviderProps) {
  const [state, dispatch] = useReducer(locationReducer, {
    ...initialState,
    siteCoordinates: siteCoordinates || DEFAULT_SITE,
  });

  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({ type: 'SET_ERROR', payload: 'Geolocation is not supported by this browser.' });
      return;
    }

    dispatch({ type: 'START_TRACKING' });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        dispatch({
          type: 'UPDATE_POSITION',
          payload: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        let message = 'Location access denied.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable GPS access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        dispatch({ type: 'SET_ERROR', payload: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    dispatch({ type: 'STOP_TRACKING' });
  }, []);

  const setVerificationResult = useCallback((result: LocationVerification) => {
    dispatch({ type: 'SET_VERIFICATION_RESULT', payload: result });
  }, []);

  const updatePosition = useCallback((lat: number, lng: number, accuracy: number) => {
    dispatch({ type: 'UPDATE_POSITION', payload: { lat, lng, accuracy } });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{ state, startTracking, stopTracking, setVerificationResult, updatePosition }}
    >
      {children}
    </LocationContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
