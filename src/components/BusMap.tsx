import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bus, BusCompany } from '@/types/bus';

const CBA_CENTER: [number, number] = [-31.4201, -64.1888];
const DEFAULT_ZOOM = 13;

const COMPANY_COLORS: Record<BusCompany, { bg: string; text: string }> = {
  ERSA: { bg: 'hsl(25, 95%, 53%)', text: '#000' },
  TAMSE: { bg: 'hsl(185, 80%, 50%)', text: '#000' },
  Coniferal: { bg: 'hsl(50, 90%, 50%)', text: '#000' },
};

function createIcon(line: string, company: BusCompany, isCurrent: boolean) {
  const cfg = COMPANY_COLORS[company];
  const size = isCurrent ? 44 : 38;
  const border = isCurrent
    ? '3px solid white'
    : '2px solid rgba(255,255,255,0.2)';
  const fontSize = line.length > 2 ? '10px' : '13px';

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${cfg.bg};
      border:${border};border-radius:10px;
      display:flex;align-items:center;justify-content:center;
      font-family:'JetBrains Mono',monospace;font-size:${fontSize};font-weight:700;
      color:${cfg.text};
      box-shadow:0 0 0 4px ${cfg.bg}40;
      ${isCurrent ? 'animation:marker-pulse 2s ease-in-out infinite;' : ''}
    ">${line}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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
    });

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
        m.bindPopup(
          `<div style="font-size:13px;font-family:'JetBrains Mono',monospace">
            <strong>${bus.line}</strong> · <span style="opacity:0.7">${bus.company}</span>
          </div>`
        );
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
