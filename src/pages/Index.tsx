import { useState, useMemo } from 'react';
import { BondrHeader } from '@/components/BondrHeader';
import { TravelerPanel } from '@/components/TravelerPanel';
import { MapPanel } from '@/components/MapPanel';
import { BusMap } from '@/components/BusMap';
import { useTracking } from '@/hooks/useTracking';
import { useBuses } from '@/hooks/useBuses';
import { useMockBuses } from '@/hooks/useMockBuses';
import { supabase } from '@/lib/supabase';
import type { AppMode, BusCompany } from '@/types/bus';

const Index = () => {
  const [mode, setMode] = useState<AppMode>('map');
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

    const currentBus = {
      id: tracking.sessionId,
      line: tracking.currentLine,
      company: tracking.currentCompany,
      lat: tracking.lat,
      lng: tracking.lng,
      updatedAt: new Date(),
      isCurrentUser: true,
    };

    // Replace if already exists, otherwise add
    const filtered = buses.filter(b => b.id !== tracking.sessionId);
    return [currentBus, ...filtered];
  }, [buses, tracking]);

  const flyTarget = useMemo<[number, number] | null>(() => {
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
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <BondrHeader mode={mode} onModeChange={setMode} activeUsers={activeUsers} />

      {/* Map fills entire screen behind everything */}
      <div className="absolute inset-0 pt-12 md:pt-14">
        <BusMap buses={allBuses} flyTarget={flyTarget} />
      </div>

      {/* Panels render as bottom sheets on mobile, sidebars on desktop */}
      {mode === 'traveler' && (
        <TravelerPanel
          isTracking={tracking.isTracking}
          onStartTrip={handleStartTrip}
          onStopTrip={handleStopTrip}
        />
      )}

      {mode === 'map' && <MapPanel buses={allBuses} />}

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] h-6 bg-card/90 backdrop-blur border-t border-border flex items-center justify-between px-3 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? (realBuses.connected ? 'bg-green-500' : 'bg-yellow-500') : 'bg-yellow-500'}`} />
          {isLive ? (realBuses.connected ? 'Conectado' : 'Reconectando…') : 'Demo (sin Supabase)'}
        </div>
        <span>{allBuses.length} bondis activos</span>
      </div>

      {/* Tracking error toast */}
      {tracking.error && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1100] bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium shadow-lg">
          {tracking.error}
        </div>
      )}
    </div>
  );
};

export default Index;
