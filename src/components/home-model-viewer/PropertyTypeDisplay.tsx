
import React from 'react';
import { Building2, Home, TreePine, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyTypeDisplayProps {
  propertyType: string;
  buildingTypeRestrictions?: any;
}

const PropertyTypeDisplay: React.FC<PropertyTypeDisplayProps> = ({ 
  propertyType, 
  buildingTypeRestrictions 
}) => {
  const getPropertyTypeInfo = () => {
    switch (propertyType) {
      case 'single_family':
        return {
          icon: <Home className="w-5 h-5" />,
          label: 'Single Family Home',
          description: 'Residential Property',
          color: 'text-purple-400'
        };
      case 'apartment':
        return {
          icon: <Building2 className="w-5 h-5" />,
          label: 'Apartment',
          description: 'Multi-Unit Residential Building',
          color: 'text-blue-400'
        };
      case 'vacant_land':
        return {
          icon: <TreePine className="w-5 h-5" />,
          label: 'Vacant Land',
          description: 'Development Opportunity',
          color: 'text-green-400'
        };
      case 'commercial':
        return {
          icon: <Store className="w-5 h-5" />,
          label: 'Commercial Property',
          description: 'Business/Retail Space',
          color: 'text-orange-400'
        };
      default:
        return {
          icon: <Building2 className="w-5 h-5" />,
          label: 'Property',
          description: 'Real Estate Asset',
          color: 'text-white'
        };
    }
  };

  const typeInfo = getPropertyTypeInfo();

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={typeInfo.color}>
          {typeInfo.icon}
        </div>
        <span className="text-white font-medium">{typeInfo.label}</span>
        <span className="text-white text-sm">• {typeInfo.description}</span>
      </div>
      
      {buildingTypeRestrictions?.restrictionExplanation && (
        <div className="mt-2">
          <Badge variant="outline" className="text-white border-white/20">
            {buildingTypeRestrictions.restrictionExplanation}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PropertyTypeDisplay;
