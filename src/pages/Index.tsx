import { useState, useMemo, useCallback } from 'react';
import { BondrHeader } from '@/components/BondrHeader';
import { TravelerPanel } from '@/components/TravelerPanel';
import { MapPanel } from '@/components/MapPanel';
import { BusMap } from '@/components/BusMap';
import { useTracking } from '@/hooks/useTracking';
import { useBuses } from '@/hooks/useBuses';
import { useMockBuses } from '@/hooks/useMockBuses';
import { supabase } from '@/lib/supabase';
import type { AppMode, Bus, BusCompany } from '@/types/bus';

const Index = () => {
  const [mode, setMode] = useState<AppMode>('map');
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const tracking = useTracking();

  // Use real Supabase data when configured, otherwise fall back to mock
  const realBuses = useBuses(tracking.sessionId);
  const mockBuses = useMockBuses();
  const isLive = !!supabase;

  const { buses, activeUsers } = isLive ? realBuses : mockBuses;

  // Merge current user's position into bus list when tracking
  const allBuses = useMemo(() => {
    if (!tracking.isTracking || !tracking.lat || !tracking.lng || !tracking.currentLine || !tracking.currentCompany) {
      return buses;
    }

    const currentBus: Bus = {
      id: tracking.sessionId,
      line: tracking.currentLine,
      company: tracking.currentCompany,
      lat: tracking.lat,
      lng: tracking.lng,
      updatedAt: new Date(),
      isCurrentUser: true,
    };

    const filtered = buses.filter(b => b.id !== tracking.sessionId);
    return [currentBus, ...filtered];
  }, [buses, tracking]);

  // Fly to bus when clicked in sidebar
  const handleBusClick = useCallback((bus: Bus) => {
    setFlyTarget([bus.lat, bus.lng]);
  }, []);

  // Fly to user when tracking starts
  const trackingFlyTarget = useMemo<[number, number] | null>(() => {
    if (tracking.isTracking && tracking.lat && tracking.lng) {
      return [tracking.lat, tracking.lng];
    }
    return null;
  }, [tracking.isTracking, tracking.lat, tracking.lng]);

  const handleStartTrip = (company: BusCompany, line: string) => {
    tracking.start(line, company);
  };

  const handleStopTrip = () => {
    tracking.stop();
    setFlyTarget(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0c0f]">
      <BondrHeader mode={mode} onModeChange={setMode} activeUsers={activeUsers} />

      {/* Map fills entire screen behind everything */}
      <div className="absolute inset-0 pt-14">
        <BusMap buses={allBuses} flyTarget={flyTarget || trackingFlyTarget} />
      </div>

      {/* Panels render as bottom sheets on mobile, sidebars on desktop */}
      {mode === 'traveler' && (
        <TravelerPanel
          isTracking={tracking.isTracking}
          onStartTrip={handleStartTrip}
          onStopTrip={handleStopTrip}
        />
      )}

      {mode === 'map' && <MapPanel buses={allBuses} onBusClick={handleBusClick} />}

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] h-7 bg-[#1a1a22]/90 backdrop-blur-sm border-t border-white/[0.04] flex items-center justify-between px-4 text-[10px] font-mono text-white/30">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? (realBuses.connected ? 'bg-[#22c55e]' : 'bg-yellow-500') : 'bg-yellow-500'}`} />
          {isLive ? (realBuses.connected ? 'Conectado' : 'Reconectando...') : 'Demo (sin Supabase)'}
        </div>
        <span>{allBuses.length} bondis activos</span>
      </div>

      {/* Tracking error toast */}
      {tracking.error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1100] bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-sm">
          {tracking.error}
        </div>
      )}
    </div>
  );
};

export default Index;
