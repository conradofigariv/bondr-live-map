import { MapPin, Clock } from 'lucide-react';
import type { Bus } from '@/types/bus';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BottomSheet } from '@/components/BottomSheet';

interface MapPanelProps {
  buses: Bus[];
}

export function MapPanel({ buses }: MapPanelProps) {
  const sorted = [...buses].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  const badgeClass = (company: string) =>
    company === 'ERSA' ? 'bondr-badge-ersa' : company === 'TAMSE' ? 'bondr-badge-tamse' : 'bondr-badge-coniferal';

  const listContent = (
    <>
      <div className="px-4 py-2 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Bondis activos</h2>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{buses.length}</span>
      </div>
      <div>
        {sorted.map(bus => (
          <div
            key={bus.id}
            className="px-4 py-3 border-b border-border hover:bg-secondary/50 active:bg-secondary/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm">{bus.line}</span>
              <span className={`bondr-badge ${badgeClass(bus.company)}`}>
                {bus.company}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(bus.updatedAt, { addSuffix: true, locale: es })}
            </div>
          </div>
        ))}
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

      {/* Desktop: right sidebar */}
      <div className="hidden md:flex fixed top-14 right-0 z-[999] w-72 bondr-glass border-l border-border h-[calc(100vh-3.5rem)] flex-col animate-fade-in">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Bondis activos</h2>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{buses.length}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.map(bus => (
            <div
              key={bus.id}
              className="px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{bus.line}</span>
                <span className={`bondr-badge ${badgeClass(bus.company)}`}>
                  {bus.company}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(bus.updatedAt, { addSuffix: true, locale: es })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
