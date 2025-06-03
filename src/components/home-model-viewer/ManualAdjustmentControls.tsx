
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { getMarketData } from '@/utils/marketDataService';
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
}

const ManualAdjustmentControls = ({ 
  localAnalysis, 
  setLocalAnalysis, 
  showManualAdjustment, 
  setShowManualAdjustment,
  coordinates 
}: ManualAdjustmentControlsProps) => {
  
  // Calculate parking revenue based on spaces and market rate
  const calculateParkingRevenue = (spaces: number, rate: number) => {
    // Assuming average occupancy of 67% (20 days out of 30 days per month)
    return Math.round(spaces * rate * 20);
  };
  
  // Handle adjustments to values like parking spaces
  const handleParkingSpacesChange = (value: number[]) => {
    const newSpaces = value[0];
    
    // Get market-based parking rate for consistent calculation
    let marketParkingRate = 10; // Default fallback
    if (coordinates) {
      const marketData = getMarketData(coordinates);
      marketParkingRate = marketData.parkingRates;
      console.log("🅿️ Using market parking rate:", marketParkingRate);
    }
    
    // Update the parking spaces and recalculate the revenue using market rate
    const updatedRevenue = calculateParkingRevenue(newSpaces, marketParkingRate);
    
    const updatedAnalysis = {
      ...localAnalysis,
      parking: {
        ...localAnalysis.parking,
        spaces: newSpaces,
        rate: marketParkingRate, // Update rate to market rate
        revenue: updatedRevenue
      }
    };
    
    // Update any related top opportunities
    const parkingOpportunityIndex = updatedAnalysis.topOpportunities.findIndex(
      opp => opp.title.toLowerCase().includes('parking')
    );
    
    if (parkingOpportunityIndex >= 0) {
      updatedAnalysis.topOpportunities[parkingOpportunityIndex] = {
        ...updatedAnalysis.topOpportunities[parkingOpportunityIndex],
        monthlyRevenue: updatedRevenue,
        description: `Rent out ${newSpaces} parking spaces at $${marketParkingRate}/day when not in use.`
      };
    }
    
    console.log("📊 Updated parking analysis:", {
      spaces: newSpaces,
      rate: marketParkingRate,
      revenue: updatedRevenue
    });
    
    setLocalAnalysis(updatedAnalysis);
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
                Adjust values here to get more accurate monetization estimates.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Manual Adjustment Controls - Collapsed by default */}
      {showManualAdjustment && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-medium mb-4">Adjust Property Values</h3>
          
          {/* Parking Spaces Adjustment */}
          <div className="mb-4">
            <div className="flex justify-between">
              <Label className="text-sm">Parking Spaces: {localAnalysis.parking.spaces}</Label>
              <span className="text-xs text-gray-400">
                ${calculateParkingRevenue(localAnalysis.parking.spaces, localAnalysis.parking.rate || 10)}/mo
              </span>
            </div>
            <Slider
              defaultValue={[localAnalysis.parking.spaces]}
              max={10}
              min={0}
              step={1}
              onValueChange={handleParkingSpacesChange}
              className="mt-2"
            />
          </div>
          
          {/* Property Type Info */}
          <div className="text-xs text-gray-400 mt-3">
            <p>
              <strong>Detected Property Type:</strong> {localAnalysis.propertyType}
            </p>
            <p className="mt-1">
              Adjust values to match your property's actual features for more accurate estimates.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualAdjustmentControls;
