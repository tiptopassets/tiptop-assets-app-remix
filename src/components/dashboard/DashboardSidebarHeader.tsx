
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import { useUserProperties, UserProperty } from '@/hooks/useUserProperties';
import { ChevronDown, MapPin, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardSidebarHeaderProps {
  properties?: UserProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
  isCollapsed?: boolean;
}

const DashboardSidebarHeader = ({ 
  properties: propProperties, 
  selectedPropertyId: propSelectedPropertyId, 
  onPropertySelect,
  isCollapsed = false
}: DashboardSidebarHeaderProps) => {
  const { journeyData } = useDashboardJourneyData();
  const { properties: hookProperties, selectedProperty: hookSelectedProperty, loading } = useUserProperties();
  
  // Use props if available, fallback to hook data
  const properties = propProperties && propProperties.length > 0 ? propProperties : hookProperties;
  const selectedPropertyId = propSelectedPropertyId || hookSelectedProperty?.id;
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || hookSelectedProperty;
  
  // Use multi-property system if available, fallback to single journey data
  const hasMultipleProperties = properties.length > 1;
  const currentAddress = selectedProperty?.address || journeyData?.propertyAddress;
  const currentRevenue = selectedProperty?.totalMonthlyRevenue || journeyData?.totalMonthlyRevenue;

  if (isCollapsed) {
    return (
      <>
        {/* Collapsed Header - Only show logo icon */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0 flex justify-center">
          <Link to="/" className="text-2xl font-bold text-tiptop-purple hover:scale-105 transition-transform">
            <MapPin className="h-6 w-6" />
          </Link>
        </div>
        
        {/* Collapsed Property Icon */}
        <div className="p-3 border-b border-gray-800 flex-shrink-0 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-tiptop-purple">
                  <MapPin className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{currentAddress || 'No property'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="text-2xl font-bold text-tiptop-purple hover:scale-105 transition-transform">
          tiptop
        </Link>
        <p className="text-gray-400 text-sm mt-1">Property Dashboard</p>
      </div>

      {/* Property Navigation & Switcher */}
      <div className="p-3 border-b border-gray-800 flex-shrink-0">
        {/* Current Property Info */}
        {(currentAddress || loading) && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-400">
                {hasMultipleProperties ? 'Selected Property' : 'Current Property'}
              </div>
              {/* Compact Action Icons */}
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Link to="/">
                          <Plus className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Analyze New Property</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {properties.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                          onClick={() => {}} // Could open property management
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage Properties</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
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
                      onClick={() => onPropertySelect ? onPropertySelect(property.id) : console.log('No onPropertySelect handler')}
                      className={selectedProperty?.id === property.id ? 'bg-muted' : ''}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="text-sm font-medium truncate" title={property.address}>
                          {property.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${property.totalMonthlyRevenue || 0}/mo • {property.totalOpportunities || 0} opportunities
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
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="text-white font-medium text-sm truncate" title={currentAddress}>
                  {currentAddress}
                </div>
              </div>
            )}
            
            {currentRevenue && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-xs text-green-400 border-green-400/50 px-1.5 py-0.5 h-5">
                  ${currentRevenue}/mo potential
                </Badge>
                {hasMultipleProperties && (
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50 px-1.5 py-0.5 h-5">
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
