import { Bus, MapPin, Users } from 'lucide-react';
import type { AppMode } from '@/types/bus';

interface BondrHeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activeUsers: number;
}

export function BondrHeader({ mode, onModeChange, activeUsers }: BondrHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bondr-glass h-12 md:h-14 flex items-center justify-between px-3 md:px-4">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 md:gap-2">
          <Bus className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-base md:text-lg font-bold tracking-tight">
            Bondr
          </span>
        </div>

        {/* User count — always visible */}
        <div className="flex items-center gap-1 ml-2 md:ml-4 px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm bg-secondary">
          <Users className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
          <span className="text-[10px] md:text-xs font-mono font-semibold text-muted-foreground">
            {activeUsers}
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground">en viaje</span>
        </div>
      </div>

      <div className="flex items-center bg-secondary rounded-md p-0.5">
        <button
          onClick={() => onModeChange('traveler')}
          className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded text-sm font-semibold transition-all ${
            mode === 'traveler'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bus className="h-3.5 w-3.5" />
          <span className="hidden xs:inline text-xs md:text-sm">Viajero</span>
        </button>
        <button
          onClick={() => onModeChange('map')}
          className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded text-sm font-semibold transition-all ${
            mode === 'map'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span className="hidden xs:inline text-xs md:text-sm">Mapa</span>
        </button>
      </div>
    </header>
  );
}
