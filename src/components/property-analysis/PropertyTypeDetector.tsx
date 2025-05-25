
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building, Home, Hotel } from 'lucide-react';

interface PropertyTypeDetectorProps {
  propertyType: string;
  confidence?: number;
}

const PropertyTypeDetector = ({ propertyType, confidence }: PropertyTypeDetectorProps) => {
  const getIcon = () => {
    if (propertyType.toLowerCase().includes('apartment') || propertyType.toLowerCase().includes('condo')) {
      return <Building className="h-4 w-4" />;
    }
    if (propertyType.toLowerCase().includes('hotel') || propertyType.toLowerCase().includes('lodging')) {
      return <Hotel className="h-4 w-4" />;
    }
    return <Home className="h-4 w-4" />;
  };

  const getVariant = () => {
    if (propertyType.toLowerCase().includes('apartment') || propertyType.toLowerCase().includes('condo')) {
      return 'secondary';
    }
    if (propertyType.toLowerCase().includes('commercial')) {
      return 'destructive';
    }
    return 'default';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        {propertyType}
      </Badge>
      {confidence && (
        <span className="text-xs text-gray-500">
          {Math.round(confidence * 100)}% confidence
        </span>
      )}
    </div>
  );
};

export default PropertyTypeDetector;
