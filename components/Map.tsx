import { Map, Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: any[];
}

export const MapComponent = ({ steps }: MapComponentProps) => {
  const longitude = steps.length > 0 && steps[0].lng ? steps[0].lng : 30.5234;
  const latitude = steps.length > 0 && steps[0].lat ? steps[0].lat : 50.4501;

  return (
    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-100 mb-10">
      <Map
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: 12
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        
        {steps.map((step) => (
          step.lat && step.lng && (
            <Marker 
              key={step.id} 
              longitude={step.lng} 
              latitude={step.lat} 
              anchor="bottom"
            >
              <div className="flex flex-col items-center group">
                <div className="bg-white px-2 py-1 rounded-lg shadow-md text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-all">
                  {step.content}
                </div>
                <MapPin className="text-blue-600 fill-blue-100" size={30} />
              </div>
            </Marker>
          )
        ))}
      </Map>
    </div>
  );
};