/**
 * LocationStore — Professional geospatial state management for Nyayadarsi.
 * Implements a Zustand-like store pattern using React 18's useSyncExternalStore.
 * 
 * Centralizes:
 * - Real-time GPS tracking status
 * - Coordinate synchronization with the backend
 * - Geofence violation flagging
 * - Reverse-geocoded address caching
 */
import { useSyncExternalStore, useMemo } from 'react';
import type { LocationState, LocationVerification } from '@/types/location';

// ── Types ──────────────────────────────────────────────────────────────────

type Listener = () => void;

interface LocationStore {
  /** The current state of the geospatial system. */
  state: LocationState;
  /** Subscribe to state changes. */
  subscribe: (listener: Listener) => () => void;
  /** Get current snapshot. */
  getSnapshot: () => LocationState;
  /** Notify listeners of state changes. */
  emitChange: () => void;
  
  // Actions
  startTracking: () => void;
  stopTracking: () => void;
  updatePosition: (lat: number, lng: number, accuracy: number) => void;
  setVerification: (v: LocationVerification, requestId?: number) => void;
  setError: (msg: string) => void;
}

// ── Default State ──────────────────────────────────────────────────────────

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

// ── Store Implementation ───────────────────────────────────────────────────

let currentState = initialState;
let listeners: Listener[] = [];
let watchId: number | null = null;

const store: LocationStore = {
  state: initialState,
  
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  getSnapshot() {
    return currentState;
  },

  emitChange() {
    for (const listener of listeners) {
      listener();
    }
  },

  startTracking() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.setError('Geolocation is not supported by this browser.');
      return;
    }

    if (watchId !== null) return;

    currentState = { ...currentState, isTracking: true, error: null };
    this.emitChange();

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.updatePosition(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
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
        this.setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  },

  stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    currentState = { ...currentState, isTracking: false };
    this.emitChange();
  },

  updatePosition(lat: number, lng: number, accuracy: number) {
    currentState = {
      ...currentState,
      coordinates: { lat, lng },
      accuracy,
      error: null,
    };
    this.emitChange();
  },

  setVerification(v: LocationVerification, requestId?: number) {
    // Prevent race condition: only update if this is the response for the LATEST request
    if (requestId !== undefined && requestId < lastVerificationRequestId) {
      console.warn('[LocationStore] Ignoring stale verification response');
      return;
    }

    currentState = {
      ...currentState,
      distanceMeters: v.distance_meters,
      isOnsite: v.accepted,
      isFlagged: v.flagged,
      address: v.reverse_geocoded_address,
      siteCoordinates: { lat: v.site_coordinates.lat, lng: v.site_coordinates.lon },
      verification: v,
    };
    this.emitChange();
  },

  setError(msg: string) {
    currentState = { ...currentState, error: msg, isTracking: false };
    this.emitChange();
  }
};

/** Track request IDs to prevent race conditions. */
let lastVerificationRequestId = 0;

/** Generate a new unique request ID. */
export const getNextLocationRequestId = () => ++lastVerificationRequestId;

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useLocationStore — Professional hook for accessing geospatial state.
 * Uses useSyncExternalStore for tear-free, high-performance state access.
 */
export function useLocationStore() {
  const state = useSyncExternalStore(
    store.subscribe, 
    store.getSnapshot,
    () => initialState // Server snapshot for SSR
  );
  
  // Truly stable action references (independent of state) to prevent re-render loops
  const actions = useMemo(() => ({
    startTracking: () => store.startTracking(),
    stopTracking: () => store.stopTracking(),
    updatePosition: (lat: number, lng: number, acc: number) => store.updatePosition(lat, lng, acc),
    setVerification: (v: LocationVerification) => store.setVerification(v),
  }), []);

  return {
    location: state,
    ...actions
  };
}
