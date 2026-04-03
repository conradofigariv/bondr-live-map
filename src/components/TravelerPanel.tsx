import { useState } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { COMPANY_LINES, type BusCompany } from '@/types/bus';
import { BottomSheet } from '@/components/BottomSheet';

interface TravelerPanelProps {
  isTracking: boolean;
  onStartTrip: (company: BusCompany, line: string) => void;
  onStopTrip: () => void;
}

export function TravelerPanel({ isTracking, onStartTrip, onStopTrip }: TravelerPanelProps) {
  const [company, setCompany] = useState<BusCompany>('ERSA');
  const [line, setLine] = useState(COMPANY_LINES.ERSA[0]);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);

  const companies: BusCompany[] = ['ERSA', 'TAMSE', 'Coniferal'];

  const badgeClass = (c: BusCompany) =>
    c === 'ERSA' ? 'bondr-badge-ersa' : c === 'TAMSE' ? 'bondr-badge-tamse' : 'bondr-badge-coniferal';

  // Desktop sidebar
  const content = (
    <>
      <div className="px-4 pb-2">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
          Empresa
        </label>
        <div className="relative">
          <button
            onClick={() => { setCompanyOpen(!companyOpen); setLineOpen(false); }}
            disabled={isTracking}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary rounded-md text-sm font-semibold disabled:opacity-50"
          >
            <span className={`bondr-badge ${badgeClass(company)}`}>{company}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {companyOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md overflow-hidden shadow-xl z-10">
              {companies.map(c => (
                <button
                  key={c}
                  onClick={() => { setCompany(c); setLine(COMPANY_LINES[c][0]); setCompanyOpen(false); }}
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <span className={`bondr-badge ${badgeClass(c)}`}>{c}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
          Línea
        </label>
        <div className="relative">
          <button
            onClick={() => { setLineOpen(!lineOpen); setCompanyOpen(false); }}
            disabled={isTracking}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary rounded-md text-sm font-mono font-bold disabled:opacity-50"
          >
            {line}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {lineOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md overflow-hidden shadow-xl max-h-48 overflow-y-auto z-10">
              {COMPANY_LINES[company].map(l => (
                <button
                  key={l}
                  onClick={() => { setLine(l); setLineOpen(false); }}
                  className="w-full px-3 py-2.5 text-left text-sm font-mono font-bold hover:bg-secondary transition-colors"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        {!isTracking ? (
          <button
            onClick={() => onStartTrip(company, line)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Play className="h-4 w-4" />
            Empezar viaje
          </button>
        ) : (
          <button
            onClick={onStopTrip}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-md font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Square className="h-4 w-4" />
            Terminar viaje
          </button>
        )}

        {isTracking && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-marker-pulse" />
            Compartiendo ubicación…
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <div className="md:hidden">
        <BottomSheet peekHeight={isTracking ? 80 : 72}>
          {/* Peek content */}
          <div className="px-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`bondr-badge ${badgeClass(company)}`}>{company}</span>
              <span className="font-mono font-bold text-sm">{line}</span>
            </div>
            {isTracking && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-marker-pulse" />
                En viaje
              </div>
            )}
          </div>
          {content}
        </BottomSheet>
      </div>

      {/* Desktop: sidebar */}
      <div className="hidden md:block fixed top-14 left-0 z-[999] w-72 bondr-glass border-r border-border h-[calc(100vh-3.5rem)] py-4 flex flex-col gap-4 animate-fade-in">
        {content}
      </div>
    </>
  );
}
