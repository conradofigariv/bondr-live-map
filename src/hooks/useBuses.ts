import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { REPORT_TTL_MS, POLL_INTERVAL_MS, PRUNE_INTERVAL_MS } from '@/lib/constants';
import type { Bus, BusCompany } from '@/types/bus';

interface BusReport {
  id: string;
  user_id: string;
  line: string;
  company: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  reported_at: string;
}

function reportToBus(r: BusReport, currentUserId?: string): Bus {
  return {
    id: r.user_id,
    line: r.line,
    company: r.company as BusCompany,
    lat: r.lat,
    lng: r.lng,
    updatedAt: new Date(r.reported_at),
    isCurrentUser: r.user_id === currentUserId,
  };
}

export function useBuses(currentUserId?: string) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [connected, setConnected] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pruneRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBuses = useCallback(async () => {
    if (!supabase) return;

    const cutoff = new Date(Date.now() - REPORT_TTL_MS).toISOString();
    const { data, error } = await supabase
      .from('bus_reports')
      .select('*')
      .gte('reported_at', cutoff)
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('[Bondr] fetch buses error:', error);
      return;
    }

    if (data) {
      // Deduplicate by user_id, keeping most recent
      const byUser = new Map<string, BusReport>();
      for (const report of data as BusReport[]) {
        if (!byUser.has(report.user_id) ||
            new Date(report.reported_at) > new Date(byUser.get(report.user_id)!.reported_at)) {
          byUser.set(report.user_id, report);
        }
      }
      setBuses(Array.from(byUser.values()).map(r => reportToBus(r, currentUserId)));
    }
  }, [currentUserId]);

  // Prune stale reports locally
  const pruneStale = useCallback(() => {
    const cutoff = Date.now() - REPORT_TTL_MS;
    setBuses(prev => prev.filter(b => b.updatedAt.getTime() > cutoff));
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchBuses();

    if (!supabase) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('bus_reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bus_reports' },
        () => {
          // Re-fetch on any change for simplicity
          fetchBuses();
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    // Polling fallback
    pollRef.current = setInterval(fetchBuses, POLL_INTERVAL_MS);

    // Local prune
    pruneRef.current = setInterval(pruneStale, PRUNE_INTERVAL_MS);

    return () => {
      channel.unsubscribe();
      if (pollRef.current) clearInterval(pollRef.current);
      if (pruneRef.current) clearInterval(pruneRef.current);
    };
  }, [fetchBuses, pruneStale]);

  return {
    buses,
    connected,
    activeUsers: buses.length,
  };
}
