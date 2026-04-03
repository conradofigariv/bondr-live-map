import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bus, BusCompany } from '@/types/bus';
import { useEffect } from 'react';

const CBA_CENTER: [number, number] = [-31.4201, -64.1888];

function createBusIcon(line: string, company: BusCompany, isCurrent: boolean) {
  const markerClass = company === 'ERSA' ? 'bus-marker-ersa' : company === 'TAMSE' ? 'bus-marker-tamse' : 'bus-marker-coniferal';
  
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `<div class="bus-marker ${markerClass} ${isCurrent ? 'is-current' : ''}">${line}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

interface BusMapProps {
  buses: Bus[];
  className?: string;
}

export function BusMap({ buses, className }: BusMapProps) {
  return (
    <MapContainer
      center={CBA_CENTER}
      zoom={13}
      className={className}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <MapInvalidator />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={createBusIcon(bus.line, bus.company, !!bus.isCurrentUser)}
        >
          <Popup className="bondr-popup">
            <div className="text-sm">
              <span className="font-mono font-bold">{bus.line}</span>
              <span className="mx-1">·</span>
              <span className="text-muted-foreground">{bus.company}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
