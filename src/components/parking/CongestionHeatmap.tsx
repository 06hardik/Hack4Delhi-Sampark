import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { ParkingLotWithStatus } from '@/types/parking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CongestionHeatmapProps {
  lots: ParkingLotWithStatus[];
  className?: string;
}

export function CongestionHeatmap({ lots, className }: CongestionHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const initMap = async (key: string) => {
    if (!mapRef.current || !key) return;

    try {
      setOptions({ key: key, v: 'weekly', libraries: ['visualization'] });
      
      await importLibrary('maps');
      await importLibrary('visualization');
      
      // Center on Delhi - Light government style map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 28.6406, lng: 77.2200 },
        zoom: 13,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#e0e0e0' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9e4f5' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#e5f5e0' }],
          },
        ],
      });

      setMap(mapInstance);
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      setError('Failed to load Google Maps. Please check your API key.');
      console.error('Google Maps error:', err);
    }
  };

  // Update markers when lots data changes
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers for each lot
    lots.forEach(lot => {
      const utilization = lot.utilization;
      
      // Determine color based on utilization - government style muted colors
      let color: string;
      let scale: number;
      
      if (utilization > 100) {
        color = '#c0392b'; // Muted red - over capacity
        scale = 1.5;
      } else if (utilization > 90) {
        color = '#d68910'; // Muted amber - near capacity
        scale = 1.3;
      } else if (utilization > 70) {
        color = '#1e6091'; // Government blue - moderate
        scale = 1.1;
      } else {
        color = '#27ae60'; // Muted green - low utilization
        scale = 1;
      }

      const marker = new google.maps.Marker({
        position: { lat: lot.latitude, lng: lot.longitude },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.85,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10 * scale,
        },
        title: `${lot.name}: ${utilization.toFixed(0)}%`,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #333; padding: 8px; font-family: 'Noto Sans', sans-serif; font-size: 12px;">
            <strong style="color: #1e6091;">${lot.name}</strong><br/>
            <span>Utilization: ${utilization.toFixed(0)}%</span><br/>
            <span>Current: ${lot.currentCount}/${lot.allowedCapacity}</span><br/>
            <span style="color: ${lot.status === 'violating' ? '#c0392b' : '#27ae60'}; font-weight: 500;">
              Status: ${lot.status === 'violating' ? 'Violating' : 'Compliant'}
            </span>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Create heatmap layer
    const heatmapData = lots.map(lot => ({
      location: new google.maps.LatLng(lot.latitude, lot.longitude),
      weight: Math.min(lot.utilization / 50, 3), // Weight based on utilization
    }));

    new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 50,
      opacity: 0.5,
      gradient: [
        'rgba(39, 174, 96, 0)',
        'rgba(39, 174, 96, 0.4)',
        'rgba(214, 137, 16, 0.6)',
        'rgba(192, 57, 43, 0.8)',
        'rgba(192, 57, 43, 1)',
      ],
    });
  }, [map, lots, isLoaded]);

  const handleLoadMap = () => {
    if (apiKey.trim()) {
      initMap(apiKey.trim());
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="p-3 md:p-6 pb-2">
        <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          Congestion Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        {!isLoaded ? (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-2 p-2 md:p-3 rounded bg-muted border border-border">
              <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-[10px] md:text-xs text-muted-foreground">
                <p className="font-medium mb-0.5 md:mb-1">Google Maps API Key Required</p>
                <p className="leading-relaxed">Enter your Google Maps API key to view the congestion heatmap. You can get one from the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Google Maps API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 h-7 md:h-8 text-xs md:text-sm"
              />
              <Button onClick={handleLoadMap} disabled={!apiKey.trim()} size="sm" className="h-7 md:h-8 text-xs">
                Load Map
              </Button>
            </div>
            {error && (
              <p className="text-[10px] md:text-xs text-destructive">{error}</p>
            )}
          </div>
        ) : (
          <div 
            ref={mapRef} 
            className="w-full h-[250px] md:h-[350px] rounded border border-border overflow-hidden"
          />
        )}
        
        {/* Legend */}
        <div className="mt-2 md:mt-3 flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[9px] md:text-[10px]">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#27ae60' }} />
            <span className="text-muted-foreground whitespace-nowrap">Low (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1e6091' }} />
            <span className="text-muted-foreground whitespace-nowrap">Moderate (70-90%)</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#d68910' }} />
            <span className="text-muted-foreground whitespace-nowrap">High (90-100%)</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#c0392b' }} />
            <span className="text-muted-foreground whitespace-nowrap">Over (&gt;100%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
