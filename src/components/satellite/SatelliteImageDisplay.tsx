
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSatelliteImage } from '@/hooks/useSatelliteImage';

interface SatelliteImageDisplayProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  className?: string;
}

export const SatelliteImageDisplay = ({ 
  address, 
  coordinates, 
  className = "" 
}: SatelliteImageDisplayProps) => {
  const { imageUrl, loading, error, refresh } = useSatelliteImage(address, coordinates);

  if (!address.trim()) {
    return (
      <Card className={`bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Enter an address to view satellite imagery</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-gray-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-tiptop-purple" />
            <p className="text-sm text-gray-600">Loading satellite image...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !imageUrl) {
    return (
      <Card className={`bg-red-50 border-red-200 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 mb-2">
              <MapPin className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <p className="text-sm text-red-600 mb-3">
              {error || 'Satellite image unavailable'}
            </p>
            <Button 
              onClick={refresh}
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden shadow-lg ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={imageUrl}
            alt={`Satellite view of ${address}`}
            className="w-full h-64 object-cover"
            style={{ aspectRatio: '16/9' }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium">{address}</p>
            <p className="text-white/80 text-xs">Satellite View</p>
          </div>
          <Button
            onClick={refresh}
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
