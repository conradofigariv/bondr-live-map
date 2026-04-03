import { useState, useMemo } from 'react';
import { MapPin, Clock, Search, Bus } from 'lucide-react';
import type { Bus as BusType, BusCompany } from '@/types/bus';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BottomSheet } from '@/components/BottomSheet';

interface MapPanelProps {
  buses: BusType[];
  onBusClick?: (bus: BusType) => void;
}

const COMPANY_ICON_COLORS: Record<BusCompany, { bg: string; border: string }> = {
  ERSA: { bg: '#FF5F1F', border: '#FF5F1F' },
  TAMSE: { bg: '#06B6D4', border: '#06B6D4' },
  Coniferal: { bg: '#EAB308', border: '#EAB308' },
};

export function MapPanel({ buses, onBusClick }: MapPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const filtered = search
      ? buses.filter(b =>
          b.line.toLowerCase().includes(search.toLowerCase()) ||
          b.company.toLowerCase().includes(search.toLowerCase())
        )
      : buses;
    return [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [buses, search]);

  const handleClick = (bus: BusType) => {
    setSelectedId(bus.id);
    onBusClick?.(bus);
  };

  const busItem = (bus: BusType) => {
    const colors = COMPANY_ICON_COLORS[bus.company];
    const isSelected = bus.id === selectedId;

    return (
      <div
        key={bus.id}
        onClick={() => handleClick(bus)}
        className={`flex items-center gap-3 px-3 py-3 mx-3 mb-1.5 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-white/[0.08] ring-1 ring-[#22c55e]/50'
            : 'hover:bg-white/[0.04]'
        }`}
      >
        {/* Icon circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono font-bold text-sm"
          style={{
            backgroundColor: `${colors.bg}20`,
            border: `2px solid ${colors.border}`,
            color: colors.bg,
          }}
        >
          {bus.line}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">{bus.company}</span>
            <span className="text-xs font-mono text-white/40">Linea {bus.line}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-white/40">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(bus.updatedAt, { addSuffix: true, locale: es })}
          </div>
        </div>

        {/* Live indicator */}
        {bus.isCurrentUser && (
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-marker-pulse shrink-0" />
        )}
      </div>
    );
  };

  const listContent = (
    <>
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar linea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/50 focus:border-[#22c55e]/30 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-[#22c55e]" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Bondis activos</span>
        </div>
        <span className="font-mono text-xs font-bold text-white/40">{sorted.length}</span>
      </div>

      {/* List */}
      <div className="pb-4">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-white/30">
            {search ? 'Sin resultados' : 'No hay bondis activos'}
          </div>
        ) : (
          sorted.map(bus => busItem(bus))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <div className="md:hidden">
        <BottomSheet peekHeight={72}>
          {listContent}
        </BottomSheet>
      </div>

      {/* Desktop: left sidebar */}
      <div className="hidden md:flex fixed top-14 left-0 z-[999] w-80 bg-[#1a1a22]/95 backdrop-blur-xl border-r border-white/[0.06] h-[calc(100vh-3.5rem)] flex-col rounded-tr-2xl">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {listContent}
        </div>
      </div>
    </>
  );
}
