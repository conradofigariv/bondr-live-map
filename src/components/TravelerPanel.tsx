import { useState } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { COMPANY_LINES, type BusCompany } from '@/types/bus';
import { BottomSheet } from '@/components/BottomSheet';

interface TravelerPanelProps {
  isTracking: boolean;
  onStartTrip: (company: BusCompany, line: string) => void;
  onStopTrip: () => void;
}

const COMPANY_DOT_COLORS: Record<BusCompany, string> = {
  ERSA: '#FF5F1F',
  TAMSE: '#06B6D4',
  Coniferal: '#EAB308',
};

export function TravelerPanel({ isTracking, onStartTrip, onStopTrip }: TravelerPanelProps) {
  const [company, setCompany] = useState<BusCompany>('ERSA');
  const [line, setLine] = useState(COMPANY_LINES.ERSA[0]);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);

  const companies: BusCompany[] = ['ERSA', 'TAMSE', 'Coniferal'];

  const content = (
    <>
      {/* Company selector */}
      <div className="px-4 pb-3">
        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">
          Empresa
        </label>
        <div className="relative">
          <button
            onClick={() => { setCompanyOpen(!companyOpen); setLineOpen(false); }}
            disabled={isTracking}
            className="w-full flex items-center justify-between px-3.5 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-white/[0.08] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COMPANY_DOT_COLORS[company] }}
              />
              <span className="text-white">{company}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
          </button>
          {companyOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a22] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-10">
              {companies.map(c => (
                <button
                  key={c}
                  onClick={() => { setCompany(c); setLine(COMPANY_LINES[c][0]); setCompanyOpen(false); }}
                  className="w-full px-3.5 py-3 text-left text-sm hover:bg-white/[0.06] transition-colors flex items-center gap-2.5"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COMPANY_DOT_COLORS[c] }}
                  />
                  <span className="text-white font-medium">{c}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Line selector */}
      <div className="px-4 pb-3">
        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">
          Linea
        </label>
        <div className="relative">
          <button
            onClick={() => { setLineOpen(!lineOpen); setCompanyOpen(false); }}
            disabled={isTracking}
            className="w-full flex items-center justify-between px-3.5 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm font-mono font-bold disabled:opacity-40 hover:bg-white/[0.08] transition-all"
          >
            <span className="text-white">{line}</span>
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${lineOpen ? 'rotate-180' : ''}`} />
          </button>
          {lineOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a22] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto z-10">
              {COMPANY_LINES[company].map(l => (
                <button
                  key={l}
                  onClick={() => { setLine(l); setLineOpen(false); }}
                  className="w-full px-3.5 py-2.5 text-left text-sm font-mono font-bold hover:bg-white/[0.06] transition-colors text-white"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="px-4 pt-2 pb-4">
        {!isTracking ? (
          <button
            onClick={() => onStartTrip(company, line)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#22c55e] text-black rounded-xl font-bold text-sm hover:bg-[#16a34a] active:scale-[0.98] transition-all"
          >
            <Play className="h-4 w-4" />
            Empezar viaje
          </button>
        ) : (
          <button
            onClick={onStopTrip}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 active:scale-[0.98] transition-all"
          >
            <Square className="h-4 w-4" />
            Terminar viaje
          </button>
        )}

        {isTracking && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-marker-pulse" />
            Compartiendo ubicacion...
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
          <div className="px-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COMPANY_DOT_COLORS[company] }}
              />
              <span className="font-semibold text-sm text-white">{company}</span>
              <span className="font-mono font-bold text-sm text-white/60">{line}</span>
            </div>
            {isTracking && (
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-marker-pulse" />
                En viaje
              </div>
            )}
          </div>
          {content}
        </BottomSheet>
      </div>

      {/* Desktop: left sidebar */}
      <div className="hidden md:flex fixed top-14 left-0 z-[999] w-80 bg-[#1a1a22]/95 backdrop-blur-xl border-r border-white/[0.06] h-[calc(100vh-3.5rem)] flex-col rounded-tr-2xl py-4">
        <div className="px-4 pb-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Iniciar viaje</h2>
        </div>
        {content}
      </div>
    </>
  );
}
