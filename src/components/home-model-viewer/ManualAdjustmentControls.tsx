
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { validateParkingRevenue } from '@/utils/revenueValidator';
import { ensureCoordinates, getValidatedMarketData } from '@/contexts/GoogleMapContext/coordinateService';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ManualAdjustmentControlsProps {
  localAnalysis: PropertyAnalysis;
  setLocalAnalysis: (analysis: PropertyAnalysis) => void;
  showManualAdjustment: boolean;
  setShowManualAdjustment: (show: boolean) => void;
  coordinates?: google.maps.LatLngLiteral;
  address?: string;
}

const ManualAdjustmentControls = ({ 
  localAnalysis, 
  setLocalAnalysis, 
  showManualAdjustment, 
  setShowManualAdjustment,
  coordinates,
  address = ''
}: ManualAdjustmentControlsProps) => {
  
  // Handle adjustments to parking spaces with centralized validation
  const handleParkingSpacesChange = async (value: number[]) => {
    const newSpaces = value[0];
    
    console.log('🔧 Manual adjustment: parking spaces changed to', newSpaces);
    
    // Ensure coordinates are available for market data
    const coordinateResult = await ensureCoordinates(address, coordinates);
    const marketData = getValidatedMarketData(coordinateResult);
    
    console.log('📊 Using market data for adjustment:', {
      coordinates: coordinateResult.coordinates,
      source: coordinateResult.source,
      parkingRate: marketData.parkingRates
    });
    
    // Use centralized parking validation
    const validationResult = validateParkingRevenue(
      newSpaces,
      marketData.parkingRates,
      localAnalysis.propertyType,
      20 // 20 days per month
    );
    
    const updatedAnalysis = {
      ...localAnalysis,
      parking: {
        ...localAnalysis.parking,
        spaces: newSpaces,
        rate: marketData.parkingRates,
        revenue: validationResult.validatedRevenue
      }
    };
    
    // Update related top opportunities with consistent data
    const parkingOpportunityIndex = updatedAnalysis.topOpportunities.findIndex(
      opp => opp.title.toLowerCase().includes('parking')
    );
    
    if (parkingOpportunityIndex >= 0) {
      updatedAnalysis.topOpportunities[parkingOpportunityIndex] = {
        ...updatedAnalysis.topOpportunities[parkingOpportunityIndex],
        monthlyRevenue: validationResult.validatedRevenue,
        description: `Rent out ${newSpaces} parking spaces at $${marketData.parkingRates}/day when not in use.`
      };
    }
    
    console.log('✅ Manual adjustment complete:', {
      spaces: newSpaces,
      rate: marketData.parkingRates,
      revenue: validationResult.validatedRevenue,
      wasAdjusted: validationResult.wasAdjusted,
      reason: validationResult.reason
    });
    
    setLocalAnalysis(updatedAnalysis);
  };

  // Get current market rate for display with coordinate fallback
  const getCurrentMarketRate = async () => {
    try {
      const coordinateResult = await ensureCoordinates(address, coordinates);
      const marketData = getValidatedMarketData(coordinateResult);
      return marketData.parkingRates;
    } catch (error) {
      console.error('Error getting market rate:', error);
      return localAnalysis.parking.rate || 10;
    }
  };

  // Calculate current expected revenue
  const calculateExpectedRevenue = async (spaces: number) => {
    const marketRate = await getCurrentMarketRate();
    const validationResult = validateParkingRevenue(
      spaces,
      marketRate,
      localAnalysis.propertyType,
      20
    );
    return validationResult.validatedRevenue;
  };

  return (
    <>
      {/* Manual Adjustment Option */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowManualAdjustment(!showManualAdjustment)}
          className="text-sm flex items-center gap-1 text-tiptop-purple hover:underline"
        >
          <Info size={14} />
          {showManualAdjustment ? 'Hide adjustments' : 'Adjust property values'}
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-400 cursor-help">Why adjust?</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Our AI sometimes misinterprets property features from satellite imagery. 
                Adjust values here to get more accurate monetization estimates using real market data.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Manual Adjustment Controls */}
      {showManualAdjustment && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-medium mb-4">Adjust Property Values</h3>
          
          {/* Parking Spaces Adjustment */}
          <div className="mb-4">
            <div className="flex justify-between">
              <Label className="text-sm">Parking Spaces: {localAnalysis.parking.spaces}</Label>
              <span className="text-xs text-gray-400">
                ${localAnalysis.parking.revenue}/mo (validated)
              </span>
            </div>
            <Slider
              defaultValue={[localAnalysis.parking.spaces]}
              max={20}
              min={0}
              step={1}
              onValueChange={handleParkingSpacesChange}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">
              Rate: ${localAnalysis.parking.rate}/day ({localAnalysis.propertyType} market rate) × 20 days/month
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Revenue automatically validated using market data and property type
            </div>
          </div>
          
          {/* Coordinate Status Info */}
          <div className="text-xs text-gray-400 mt-3 p-2 bg-white/5 rounded">
            <p>
              <strong>Market Data Source:</strong> {coordinates ? 'Precise coordinates' : 'Estimated location'}
            </p>
            <p className="mt-1">
              <strong>Property Type:</strong> {localAnalysis.propertyType}
            </p>
            <p className="mt-1">
              Rates are automatically calculated using validated market data for your location and property type.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualAdjustmentControls;
