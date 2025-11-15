import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
const iconRetinaUrl = '/node_modules/leaflet/dist/images/marker-icon-2x.png';
const iconUrl = '/node_modules/leaflet/dist/images/marker-icon.png';
const shadowUrl = '/node_modules/leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Add heat layer type definition
declare global {
  interface Window {
    L: typeof L;
  }
}

interface HeatLayerProps {
  data: Array<[number, number, number]>;
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

// Add this type declaration at the top of Heatmap.tsx
import 'leaflet.heat';

// Remove the module declaration from the top of the file since we moved it to a separate .d.ts file

const HeatLayer = ({ data, radius = 25, blur = 15, maxZoom = 15 }: HeatLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    // Clean up any existing heat layers
    map.eachLayer((layer: any) => {
      if (layer._heat) {  // Check for heat layer
        map.removeLayer(layer);
      }
    });

    try {
      // Create heat layer with proper typing
      const heat = (L as any).heatLayer(data, {
        radius,
        blur,
        maxZoom,
        gradient: {
          0.1: 'blue',
          0.3: 'cyan',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);

      // Fit bounds to show all points
      if (data.length > 0) {
        const bounds = L.latLngBounds(
          data.map(point => [point[0], point[1]])
        );
        map.fitBounds(bounds.pad(0.1));
      }

      return () => {
        if (map && map.hasLayer(heat)) {
          map.removeLayer(heat);
        }
      };
    } catch (error) {
      console.error('Error creating heat layer:', error);
    }
  }, [data, map, radius, blur, maxZoom]);

  return null;
};
interface HeatmapProps {
  center: [number, number];
  zoom?: number;
  heatmapData: Array<[number, number, number]>;
  className?: string;
}

const Heatmap = ({ 
  center = [20.5937, 78.9629], // Default to India's center
  zoom = 12,
  heatmapData = [],
  className = 'h-[500px] w-full'
}: HeatmapProps) => {
  // Don't render on server-side
  if (typeof window === 'undefined') {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {heatmapData.length > 0 && (
          <HeatLayer 
            data={heatmapData} 
            radius={25}
            blur={15}
            maxZoom={15}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Heatmap;