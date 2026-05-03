/**
 * useLocation — Custom hook wrapping LocationContext for ergonomic access.
 * Handles geolocation tracking lifecycle and auto-verification against the backend.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useLocationContext } from '@/store/LocationContext';
import { verifyLocation } from '@/services/builderService';
import type { LocationState, LocationVerification } from '@/types/location';

interface UseLocationReturn {
  /** Current location tracking state. */
  location: LocationState;
  /** Start browser geolocation tracking. */
  startTracking: () => void;
  /** Stop browser geolocation tracking. */
  stopTracking: () => void;
  /** Manually trigger a verification against the backend. */
  triggerVerification: (lat: number, lng: number) => Promise<LocationVerification | null>;
}

export function useLocation(): UseLocationReturn {
  const { state, startTracking, stopTracking, setVerificationResult } = useLocationContext();
  const lastVerifiedRef = useRef<string | null>(null);
  const verifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Manually verify a specific lat/lng against the backend.
   */
  const triggerVerification = useCallback(
    async (lat: number, lng: number): Promise<LocationVerification | null> => {
      const { data } = await verifyLocation({ latitude: lat, longitude: lng });
      if (data) {
        setVerificationResult(data);
        return data;
      }
      return null;
    },
    [setVerificationResult],
  );

  /**
   * Auto-verify when position changes (debounced to 2s to respect rate limits).
   */
  useEffect(() => {
    if (!state.coordinates) return;

    const key = `${state.coordinates.lat.toFixed(5)},${state.coordinates.lng.toFixed(5)}`;
    if (key === lastVerifiedRef.current) return;

    // Debounce verification calls
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
    }

    verifyTimeoutRef.current = setTimeout(async () => {
      if (!state.coordinates) return;
      lastVerifiedRef.current = key;
      await triggerVerification(state.coordinates.lat, state.coordinates.lng);
    }, 2000);

    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current);
      }
    };
  }, [state.coordinates, triggerVerification]);

  return {
    location: state,
    startTracking,
    stopTracking,
    triggerVerification,
  };
}
