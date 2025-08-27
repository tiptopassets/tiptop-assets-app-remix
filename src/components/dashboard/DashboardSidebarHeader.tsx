
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import { useUserProperties } from '@/hooks/useUserProperties';
import { ChevronDown, MapPin, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardSidebarHeader = () => {
  const { journeyData } = useDashboardJourneyData();
  const { properties, selectedProperty, selectProperty, loading } = useUserProperties();
  
  // Use multi-property system if available, fallback to single journey data
  const hasMultipleProperties = properties.length > 1;
  const currentAddress = selectedProperty?.address || journeyData?.propertyAddress;
  const currentRevenue = selectedProperty?.totalMonthlyRevenue || journeyData?.totalMonthlyRevenue;

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="text-2xl font-bold text-tiptop-purple hover:scale-105 transition-transform">
          tiptop
        </Link>
        <p className="text-gray-400 text-sm mt-1">Property Dashboard</p>
      </div>

      {/* Property Navigation & Switcher */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        {/* Navigation Options */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Quick Actions</div>
          <div className="space-y-2">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start h-auto p-2 text-left text-white hover:bg-gray-800"
            >
              <Link to="/">
                <Plus className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">Analyze New Property</span>
              </Link>
            </Button>
            {properties.length > 0 && (
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-left text-white hover:bg-gray-800"
                onClick={() => {}} // Could open a property management modal
              >
                <Settings className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">Manage Properties</span>
              </Button>
            )}
          </div>
        </div>

        {/* Current Property Info */}
        {(currentAddress || loading) && (
          <div>
            <div className="text-sm text-gray-400 mb-1">
              {hasMultipleProperties ? 'Selected Property' : 'Current Property'}
            </div>
            
            {hasMultipleProperties ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-auto p-2 text-left text-white hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium truncate" title={currentAddress}>
                        {currentAddress}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-background border z-50">
                  {properties.map((property) => (
                    <DropdownMenuItem
                      key={property.id}
                      onClick={() => selectProperty(property.id)}
                      className={selectedProperty?.id === property.id ? 'bg-muted' : ''}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="text-sm font-medium truncate" title={property.address}>
                          {property.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${property.totalMonthlyRevenue}/mo • {property.totalOpportunities} opportunities
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/">
                      <Plus className="h-4 w-4 mr-2" />
                      Analyze New Property
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="text-white font-medium text-sm truncate" title={currentAddress}>
                {currentAddress}
              </div>
            )}
            
            {currentRevenue && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">
                  ${currentRevenue}/mo potential
                </Badge>
                {hasMultipleProperties && (
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50">
                    {properties.length} properties
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardSidebarHeader;
