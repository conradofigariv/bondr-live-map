import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bus, BusCompany } from '@/types/bus';

const CBA_CENTER: [number, number] = [-31.4201, -64.1888];
const DEFAULT_ZOOM = 13;

const COMPANY_COLORS: Record<BusCompany, string> = {
  ERSA: '#FF5F1F',
  TAMSE: '#06B6D4',
  Coniferal: '#EAB308',
};

function createIcon(line: string, company: BusCompany, isCurrent: boolean) {
  const color = COMPANY_COLORS[company];
  const size = 48;
  const innerSize = 40;

  return L.divIcon({
    html: `
      <div class="bondr-marker-wrapper" style="width:${size}px;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="
          width:${innerSize}px;height:${innerSize}px;
          background:${color}18;
          border:2px solid ${color};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-family:'JetBrains Mono',monospace;
          font-size:${line.length > 2 ? '10px' : '13px'};
          font-weight:700;
          color:${color};
          ${isCurrent ? `box-shadow:0 0 0 3px ${color}40;animation:marker-pulse 2s ease-in-out infinite;` : ''}
          transition:transform 0.2s;
        ">${line}</div>
      </div>`,
    className: '',
    iconSize: [size, size + 4],
    iconAnchor: [size / 2, (size + 4) / 2],
  });
}

function createPopupContent(bus: Bus): string {
  const color = COMPANY_COLORS[bus.company];
  const ago = getTimeAgo(bus.updatedAt);

  return `
    <div style="
      background:#1a1a22;
      border:1px solid rgba(255,255,255,0.08);
      border-radius:16px;
      padding:16px;
      min-width:200px;
      font-family:'Barlow',sans-serif;
      color:white;
    ">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="
          width:44px;height:44px;
          background:${color}18;
          border:2px solid ${color};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-family:'JetBrains Mono',monospace;
          font-size:14px;font-weight:700;
          color:${color};
        ">${bus.line}</div>
        <div>
          <div style="font-weight:700;font-size:15px;">${bus.company}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4);">Linea ${bus.line}</div>
        </div>
      </div>
      <div style="
        display:flex;gap:8px;
        padding-top:12px;
        border-top:1px solid rgba(255,255,255,0.06);
      ">
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:4px 10px;
          background:rgba(255,255,255,0.06);
          border-radius:20px;
          font-size:11px;
          color:rgba(255,255,255,0.6);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${ago}
        </div>
        ${bus.isCurrentUser ? `
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:4px 10px;
          background:#22c55e20;
          border-radius:20px;
          font-size:11px;
          color:#22c55e;
          font-weight:600;
        ">
          <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></span>
          Tu viaje
        </div>` : ''}
      </div>
    </div>
  `;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace unos segundos';
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'hace 1 min';
  if (minutes < 60) return `hace ${minutes} min`;
  return 'hace más de 1h';
}

interface BusMapProps {
  buses: Bus[];
  className?: string;
  flyTarget?: [number, number] | null;
}

export function BusMap({ buses, className, flyTarget }: BusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: CBA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const seen = new Set<string>();

    buses.forEach((bus) => {
      seen.add(bus.id);
      const icon = createIcon(bus.line, bus.company, !!bus.isCurrentUser);

      if (markersRef.current.has(bus.id)) {
        markersRef.current
          .get(bus.id)!
          .setLatLng([bus.lat, bus.lng])
          .setIcon(icon);
      } else {
        const m = L.marker([bus.lat, bus.lng], { icon }).addTo(map);
        m.bindPopup(createPopupContent(bus), {
          className: 'bondr-popup',
          closeButton: false,
          offset: [0, -8],
        });
        markersRef.current.set(bus.id, m);
      }
    });

    markersRef.current.forEach((m, id) => {
      if (!seen.has(id)) {
        m.remove();
        markersRef.current.delete(id);
      }
    });
  }, [buses]);

  // Fly to target
  useEffect(() => {
    if (flyTarget && mapRef.current) {
      mapRef.current.flyTo(flyTarget, 17, { duration: 0.8 });
    }
  }, [flyTarget]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
