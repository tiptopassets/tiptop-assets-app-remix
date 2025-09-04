
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, MessageSquare, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  primaryAddress?: string;
  onRefresh: () => void;
  properties?: Array<{ id: string; address: string; }>;
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  primaryAddress, 
  onRefresh,
  properties = [],
  selectedPropertyId,
  onPropertySelect
}) => {
  const hasMultipleProperties = properties.length > 1;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Property Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {primaryAddress || 'Your monetization overview'}
          {hasMultipleProperties && (
            <span className="ml-2 text-xs text-blue-600 font-medium">
              • {properties.length} properties analyzed
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {hasMultipleProperties && onPropertySelect && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto justify-between">
                <MapPin className="h-4 w-4 sm:mr-2" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">
                  {primaryAddress || 'Select property'}
                </span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {properties.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => onPropertySelect(p.id)}
                  className={p.id === selectedPropertyId ? 'bg-muted' : ''}
                >
                  <span className="truncate" title={p.address}>{p.address}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button onClick={onRefresh} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Refresh</span>
        </Button>
        <Button 
          onClick={() => window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAFKAG3Oh5NUN1FBQlBKUzNaQjVGNlBIS1ZXRU8wRTFWRi4u', '_blank')}
          variant="outline" 
          size="sm"
          className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600 w-full sm:w-auto"
        >
          <MessageSquare className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Quick Survey</span>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto" size="sm">
          <Link to="/">
            <MapPin className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Analyze New Property</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
