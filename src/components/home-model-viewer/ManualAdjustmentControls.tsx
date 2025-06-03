
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
  
  // Calculate parking revenue based on spaces and market rate with validation
  const calculateParkingRevenue = (spaces: number, rate: number) => {
    // Assuming average occupancy of 67% (20 days out of 30 days per month)
    const calculated = Math.round(spaces * rate * 20);
    // ADDED: Cap revenue at reasonable amount to prevent unrealistic values
    const maxReasonable = 1000; // $1000/month cap
    return Math.min(calculated, maxReasonable);
  };
  
  // Handle adjustments to values like parking spaces
  const handleParkingSpacesChange = (value: number[]) => {
    const newSpaces = value[0];
    
    // FIXED: Always get fresh market data to ensure consistency
    let marketParkingRate = 10; // Default fallback
    if (coordinates) {
      const marketData = getMarketData(coordinates);
      marketParkingRate = marketData.parkingRates;
      
      // ADDED: Apply property-type specific adjustments
      const isCommercial = localAnalysis.propertyType.toLowerCase().includes('commercial');
      const isHotel = localAnalysis.propertyType.toLowerCase().includes('hotel');
      
      if (isCommercial) {
        marketParkingRate = Math.min(marketParkingRate * 1.5, 25); // Cap at $25/day
      } else if (isHotel) {
        marketParkingRate = Math.min(marketParkingRate * 1.3, 20); // Cap at $20/day
      }
      
      console.log("🅿️ Using fresh market parking rate with property adjustments:", {
        original: marketData.parkingRates,
        adjusted: marketParkingRate,
        propertyType: localAnalysis.propertyType
      });
    } else {
      console.log("⚠️ No coordinates available, using fallback rate");
    }
    
    // Update the parking spaces and recalculate the revenue using fresh market rate
    const updatedRevenue = calculateParkingRevenue(newSpaces, marketParkingRate);
    
    const updatedAnalysis = {
      ...localAnalysis,
      parking: {
        ...localAnalysis.parking,
        spaces: newSpaces,
        rate: marketParkingRate, // Always use fresh market rate
        revenue: updatedRevenue
      }
    };
    
    // Update any related top opportunities with consistent rate
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
      revenue: updatedRevenue,
      calculationUsed: `${newSpaces} spaces × $${marketParkingRate}/day × 20 days = $${updatedRevenue}/month`,
      propertyType: localAnalysis.propertyType
    });
    
    setLocalAnalysis(updatedAnalysis);
  };

  // FIXED: Get current market rate for display purposes with property adjustments
  const getCurrentMarketRate = () => {
    if (coordinates) {
      const marketData = getMarketData(coordinates);
      let rate = marketData.parkingRates;
      
      // Apply property-type specific adjustments
      const isCommercial = localAnalysis.propertyType.toLowerCase().includes('commercial');
      const isHotel = localAnalysis.propertyType.toLowerCase().includes('hotel');
      
      if (isCommercial) {
        rate = Math.min(rate * 1.5, 25); // Cap at $25/day
      } else if (isHotel) {
        rate = Math.min(rate * 1.3, 20); // Cap at $20/day
      }
      
      return rate;
    }
    return localAnalysis.parking.rate || 10;
  };

  const currentMarketRate = getCurrentMarketRate();

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
                ${calculateParkingRevenue(localAnalysis.parking.spaces, currentMarketRate)}/mo
              </span>
            </div>
            <Slider
              defaultValue={[localAnalysis.parking.spaces]}
              max={20} // INCREASED: Allow up to 20 spaces for commercial properties
              min={0}
              step={1}
              onValueChange={handleParkingSpacesChange}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">
              Rate: ${currentMarketRate}/day ({localAnalysis.propertyType} rate) × 20 days/month
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Max revenue capped at $1,000/month for realism
            </div>
          </div>
          
          {/* Property Type Info */}
          <div className="text-xs text-gray-400 mt-3">
            <p>
              <strong>Detected Property Type:</strong> {localAnalysis.propertyType}
            </p>
            <p className="mt-1">
              Rates are automatically adjusted based on property type. Commercial properties have higher base rates.
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
