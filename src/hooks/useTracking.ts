import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GPS_SEND_INTERVAL_MS } from '@/lib/constants';
import type { BusCompany } from '@/types/bus';

const SESSION_ID = `anon_${Math.random().toString(36).slice(2, 10)}`;

interface TrackingState {
  isTracking: boolean;
  sessionId: string;
  currentLine: string | null;
  currentCompany: BusCompany | null;
  lat: number | null;
  lng: number | null;
  error: string | null;
}

export function useTracking() {
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    sessionId: SESSION_ID,
    currentLine: null,
    currentCompany: null,
    lat: null,
    lng: null,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const sendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number; accuracy: number; heading: number | null; speed: number | null } | null>(null);
  const lineRef = useRef<string | null>(null);
  const companyRef = useRef<BusCompany | null>(null);

  const upsertReport = useCallback(async () => {
    const pos = latestPositionRef.current;
    const line = lineRef.current;
    const company = companyRef.current;
    if (!pos || !line || !company || !supabase) return;

    const { error } = await supabase
      .from('bus_reports')
      .upsert(
        {
          user_id: SESSION_ID,
          line,
          company,
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          heading: pos.heading,
          speed: pos.speed,
          reported_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );

    if (error) {
      console.error('[Bondr] upsert error:', error);
    }
  }, []);

  const deleteReport = useCallback(async () => {
    if (!supabase) return;
    await supabase
      .from('bus_reports')
      .delete()
      .eq('user_id', SESSION_ID);
  }, []);

  const start = useCallback((line: string, company: BusCompany) => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Tu navegador no soporta geolocalización' }));
      return;
    }

    lineRef.current = line;
    companyRef.current = company;

    setState(s => ({
      ...s,
      isTracking: true,
      currentLine: line,
      currentCompany: company,
      error: null,
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        latestPositionRef.current = {
          lat: latitude,
          lng: longitude,
          accuracy,
          heading,
          speed,
        };
        setState(s => ({ ...s, lat: latitude, lng: longitude }));
      },
      (err) => {
        console.error('[Bondr] GPS error:', err);
        setState(s => ({ ...s, error: `Error GPS: ${err.message}` }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Send position to Supabase every GPS_SEND_INTERVAL_MS
    upsertReport(); // send immediately
    sendIntervalRef.current = setInterval(upsertReport, GPS_SEND_INTERVAL_MS);
  }, [upsertReport]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }
    latestPositionRef.current = null;
    lineRef.current = null;
    companyRef.current = null;

    deleteReport();

    setState(s => ({
      ...s,
      isTracking: false,
      currentLine: null,
      currentCompany: null,
      lat: null,
      lng: null,
    }));
  }, [deleteReport]);

  // Cleanup on unmount and beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      // Use sendBeacon for reliable cleanup
      if (supabase && lineRef.current) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bus_reports?user_id=eq.${SESSION_ID}`;
        navigator.sendBeacon?.(url); // best-effort
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
      }
      deleteReport();
    };
  }, [deleteReport]);

  return { ...state, start, stop };
}
