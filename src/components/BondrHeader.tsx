import { Bus, MapPin, Users, Info } from 'lucide-react';
import type { AppMode } from '@/types/bus';

interface BondrHeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activeUsers: number;
}

export function BondrHeader({ mode, onModeChange, activeUsers }: BondrHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] h-14 flex items-center justify-between px-4 bg-[#1a1a22]/95 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Left: mode toggle */}
      <div className="flex items-center gap-1 bg-white/[0.06] rounded-full p-1">
        <button
          onClick={() => onModeChange('traveler')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            mode === 'traveler'
              ? 'bg-[#22c55e] text-black'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Bus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Viajero</span>
        </button>
        <button
          onClick={() => onModeChange('map')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            mode === 'map'
              ? 'bg-[#22c55e] text-black'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mapa</span>
        </button>
      </div>

      {/* Center: logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center">
          <Bus className="h-4 w-4 text-black" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Bondr
        </span>
      </div>

      {/* Right: live count + info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-marker-pulse" />
          <Users className="h-3.5 w-3.5 text-white/50" />
          <span className="text-xs font-mono font-semibold text-white/70">
            {activeUsers}
          </span>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
          <Info className="h-4 w-4 text-white/50" />
        </button>
      </div>
    </header>
  );
}
