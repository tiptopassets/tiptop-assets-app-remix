
import React, { useState } from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import MetricsGrid from './MetricsGrid';
import ExpandedAnalysis from './ExpandedAnalysis';
import TopOpportunities from './TopOpportunities';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PropertyAnalysisContentProps {
  analysisResults: PropertyAnalysis;
  showFullAnalysis: boolean;
}

const PropertyAnalysisContent = ({ 
  analysisResults, 
  showFullAnalysis 
}: PropertyAnalysisContentProps) => {
  const [localAnalysis, setLocalAnalysis] = useState<PropertyAnalysis>(analysisResults);
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  
  // Handle adjustments to values like parking spaces
  const handleParkingSpacesChange = (value: number[]) => {
    const newSpaces = value[0];
    
    // Update the parking spaces and recalculate the revenue
    const updatedAnalysis = {
      ...localAnalysis,
      parking: {
        ...localAnalysis.parking,
        spaces: newSpaces,
        revenue: calculateParkingRevenue(newSpaces, localAnalysis.parking.rate || 10)
      }
    };
    
    // Update any related top opportunities
    const parkingOpportunityIndex = updatedAnalysis.topOpportunities.findIndex(
      opp => opp.title.toLowerCase().includes('parking')
    );
    
    if (parkingOpportunityIndex >= 0) {
      updatedAnalysis.topOpportunities[parkingOpportunityIndex] = {
        ...updatedAnalysis.topOpportunities[parkingOpportunityIndex],
        monthlyRevenue: updatedAnalysis.parking.revenue,
        description: `Rent out ${newSpaces} parking spaces at $${localAnalysis.parking.rate} per day.`
      };
    }
    
    setLocalAnalysis(updatedAnalysis);
  };
  
  // Calculate parking revenue based on spaces and rate
  const calculateParkingRevenue = (spaces: number, rate: number) => {
    // Assuming average occupancy of 80% and 30 days per month
    return Math.round(spaces * rate * 0.8 * 30);
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Property Type and Summary */}
      <PropertyTypeDisplay analysisResults={localAnalysis} />
      
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
      
      {/* Manual Adjustment Controls */}
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
      
      {/* Key Metrics */}
      <MetricsGrid analysisResults={localAnalysis} />
      
      {/* Expanded Analysis Section (conditionally rendered) */}
      <ExpandedAnalysis 
        analysisResults={localAnalysis} 
        showFullAnalysis={showFullAnalysis} 
      />
      
      {/* Top Opportunities Section */}
      <TopOpportunities analysisResults={localAnalysis} />
    </div>
  );
};

export default PropertyAnalysisContent;
