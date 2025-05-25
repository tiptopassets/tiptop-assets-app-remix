
import React from 'react';
import { Building, Home, TreePine } from 'lucide-react';

interface PropertyTypeDisplayProps {
  type: string;
  amenities?: string[];
}

const PropertyTypeDisplay: React.FC<PropertyTypeDisplayProps> = ({ type, amenities = [] }) => {
  const getPropertyIcon = () => {
    switch (type?.toLowerCase()) {
      case 'single-family':
      case 'single family':
        return <Home className="h-6 w-6 text-tiptop-purple" />;
      case 'multi-family':
      case 'apartment':
      case 'condo':
        return <Building className="h-6 w-6 text-tiptop-purple" />;
      case 'commercial':
        return <Building className="h-6 w-6 text-tiptop-purple" />;
      default:
        return <Home className="h-6 w-6 text-tiptop-purple" />;
    }
  };

  const formatPropertyType = (type: string) => {
    if (!type) return 'Unknown Property';
    
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
      {getPropertyIcon()}
      <div>
        <h3 className="text-white font-semibold text-lg">
          {formatPropertyType(type)}
        </h3>
        {amenities && amenities.length > 0 && (
          <p className="text-gray-300 text-sm">
            {amenities.join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PropertyTypeDisplay;
