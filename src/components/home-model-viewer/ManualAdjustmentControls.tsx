
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';

interface ManualAdjustmentControlsProps {
  showManualAdjustment: boolean;
  setShowManualAdjustment: (show: boolean) => void;
  localAnalysis: PropertyAnalysis;
  handleParkingSpacesChange: (value: number[]) => void;
  calculateParkingRevenue: (spaces: number, rate: number) => number;
}

const ManualAdjustmentControls = ({
  showManualAdjustment,
  setShowManualAdjustment,
  localAnalysis,
  handleParkingSpacesChange,
  calculateParkingRevenue
}: ManualAdjustmentControlsProps) => {
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
    </>
  );
};

export default ManualAdjustmentControls;
