
import React from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface LocationVerificationBadgeProps {
  serviceAvailability?: {
    verified: boolean;
    location: string;
    coverage: string;
  };
  locationInfo?: {
    country: string;
    state?: string;
    city?: string;
    zipCode?: string;
  };
}

const LocationVerificationBadge: React.FC<LocationVerificationBadgeProps> = ({
  serviceAvailability,
  locationInfo
}) => {
  if (!serviceAvailability && !locationInfo) return null;

  const isVerified = serviceAvailability?.verified || false;
  const location = serviceAvailability?.location || 
    `${locationInfo?.city || 'Unknown'}, ${locationInfo?.state || locationInfo?.country || ''}`;

  return (
    <div className="bg-white/10 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-4 w-4 text-tiptop-purple" />
        <span className="text-sm font-medium text-white">Location Verified</span>
        {isVerified ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
      <div className="text-xs text-gray-300 mb-1">{location}</div>
      <div className="text-xs text-gray-400">
        {serviceAvailability?.coverage || 'Service availability verified for your location'}
      </div>
    </div>
  );
};

export default LocationVerificationBadge;
