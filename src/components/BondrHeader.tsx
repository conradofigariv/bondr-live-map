import { Bus, MapPin, Users } from 'lucide-react';
import type { AppMode } from '@/types/bus';

interface BondrHeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activeUsers: number;
}

export function BondrHeader({ mode, onModeChange, activeUsers }: BondrHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bondr-glass h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            Bondr
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2 py-1 rounded-sm bg-secondary">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {activeUsers}
          </span>
          <span className="text-xs text-muted-foreground">en viaje</span>
        </div>
      </div>

      <div className="flex items-center bg-secondary rounded-md p-0.5">
        <button
          onClick={() => onModeChange('traveler')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-all ${
            mode === 'traveler'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Viajero</span>
        </button>
        <button
          onClick={() => onModeChange('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-all ${
            mode === 'map'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mapa</span>
        </button>
      </div>
    </header>
  );
}
