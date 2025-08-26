import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PropertyStatsCardProps {
  analysesCount: number;
  properties?: Array<{ id: string; address: string; }>;
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
}

export const PropertyStatsCard: React.FC<PropertyStatsCardProps> = ({
  analysesCount,
  properties = [],
  selectedPropertyId,
  onPropertySelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const hasMultipleProperties = properties.length > 1;

  const getTrendValue = () => {
    if (analysesCount === 0) return "Get started";
    if (analysesCount === 1) return "First property";
    if (hasMultipleProperties && selectedProperty) {
      const shortAddress = selectedProperty.address.length > 30 
        ? selectedProperty.address.substring(0, 30) + "..."
        : selectedProperty.address;
      return shortAddress;
    }
    return `${analysesCount} properties`;
  };

  const handlePropertySelect = (propertyId: string) => {
    onPropertySelect?.(propertyId);
    setIsOpen(false);
  };

  if (!hasMultipleProperties) {
    // Show regular stats card for single property
    return (
      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Properties Analyzed</h3>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{analysesCount}</div>
          <div className="flex items-center text-xs text-emerald-600 mt-1">
            <span className="font-medium">{getTrendValue()}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show interactive dropdown for multiple properties
  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Properties Analyzed</h3>
        <Home className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{analysesCount}</div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-emerald-600 hover:text-emerald-700 justify-start font-medium mt-1"
            >
              <span className="truncate max-w-[120px]">{getTrendValue()}</span>
              <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {properties.map((property) => (
              <DropdownMenuItem
                key={property.id}
                onClick={() => handlePropertySelect(property.id)}
                className={`cursor-pointer ${
                  property.id === selectedPropertyId ? 'bg-accent' : ''
                }`}
              >
                <div className="flex flex-col items-start w-full">
                  <span className="font-medium">
                    {property.address.length > 40 
                      ? property.address.substring(0, 40) + "..."
                      : property.address
                    }
                  </span>
                  {property.id === selectedPropertyId && (
                    <span className="text-xs text-muted-foreground">Currently viewing</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};