import { useState } from 'react';
import { BondrHeader } from '@/components/BondrHeader';
import { TravelerPanel } from '@/components/TravelerPanel';
import { MapPanel } from '@/components/MapPanel';
import { BusMap } from '@/components/BusMap';
import { useMockBuses } from '@/hooks/useMockBuses';
import type { AppMode, BusCompany } from '@/types/bus';

const Index = () => {
  const [mode, setMode] = useState<AppMode>('map');
  const [isTracking, setIsTracking] = useState(false);
  const { buses, activeUsers } = useMockBuses();

  const handleStartTrip = (company: BusCompany, line: string) => {
    setIsTracking(true);
    console.log(`Started trip: ${company} ${line}`);
  };

  const handleStopTrip = () => {
    setIsTracking(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <BondrHeader mode={mode} onModeChange={setMode} activeUsers={activeUsers} />

      {/* Map fills entire screen behind everything */}
      <div className="absolute inset-0 pt-12 md:pt-14">
        <BusMap buses={buses} />
      </div>

      {/* Panels render as bottom sheets on mobile, sidebars on desktop */}
      {mode === 'traveler' && (
        <TravelerPanel
          isTracking={isTracking}
          onStartTrip={handleStartTrip}
          onStopTrip={handleStopTrip}
        />
      )}

      {mode === 'map' && <MapPanel buses={buses} />}
    </div>
  );
};

export default Index;
