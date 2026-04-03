import { useState, useEffect } from 'react';
import type { Bus, BusCompany } from '@/types/bus';

// Córdoba center coordinates
const CBA_CENTER = { lat: -31.4201, lng: -64.1888 };

function randomBus(id: number): Bus {
  const companies: BusCompany[] = ['ERSA', 'TAMSE', 'Coniferal'];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const lines: Record<BusCompany, string[]> = {
    ERSA: ['B', 'C', 'D', 'E1', 'F', 'G', 'H'],
    TAMSE: ['T1', 'T2', 'T3', 'T4', 'T5'],
    Coniferal: ['C1', 'C2', 'C3'],
  };
  const line = lines[company][Math.floor(Math.random() * lines[company].length)];

  return {
    id: `bus-${id}`,
    line,
    company,
    lat: CBA_CENTER.lat + (Math.random() - 0.5) * 0.06,
    lng: CBA_CENTER.lng + (Math.random() - 0.5) * 0.08,
    updatedAt: new Date(Date.now() - Math.random() * 300000),
  };
}

export function useMockBuses() {
  const [buses, setBuses] = useState<Bus[]>(() =>
    Array.from({ length: 18 }, (_, i) => randomBus(i))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prev =>
        prev.map(bus => ({
          ...bus,
          lat: bus.lat + (Math.random() - 0.5) * 0.002,
          lng: bus.lng + (Math.random() - 0.5) * 0.002,
          updatedAt: new Date(),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return { buses, activeUsers: buses.length + Math.floor(Math.random() * 5) + 3 };
}
