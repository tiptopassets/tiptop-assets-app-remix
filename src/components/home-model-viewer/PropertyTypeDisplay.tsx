
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Info, CheckCircle2, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

interface PropertyTypeDisplayProps {
  analysisResults: PropertyAnalysis;
}

const PropertyTypeDisplay = ({ analysisResults }: PropertyTypeDisplayProps) => {
  const usesRealSolarData = analysisResults.rooftop.usingRealSolarData;
  const { setAnalysisResults } = useGoogleMap();
  const [editingRoofSize, setEditingRoofSize] = useState(false);
  const [roofSize, setRoofSize] = useState(analysisResults.rooftop.area.toString());
  
  const handleSaveRoofSize = () => {
    const newSize = parseInt(roofSize);
    if (!isNaN(newSize) && newSize > 0) {
      // Create a new analysis results object with updated roof size
      const updatedResults = {
        ...analysisResults,
        rooftop: {
          ...analysisResults.rooftop,
          area: newSize
        }
      };
      
      setAnalysisResults(updatedResults);
      setEditingRoofSize(false);
    }
  };
  
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-2">Property Analysis</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge className="bg-tiptop-purple/80">{analysisResults.propertyType}</Badge>
        {analysisResults.amenities && analysisResults.amenities.slice(0, 3).map((amenity, i) => (
          <Badge key={i} variant="outline" className="text-gray-300">{amenity}</Badge>
        ))}
      </div>
      
      {/* Roof size editor */}
      <div className="mt-2 mb-2 p-2 bg-white/5 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Roof Size:</span>
          {editingRoofSize ? (
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={roofSize} 
                onChange={(e) => setRoofSize(e.target.value)}
                className="w-24 h-8 bg-black/30 border-white/20 text-white"
              />
              <span className="text-xs text-gray-400">sq ft</span>
              <Button size="sm" variant="outline" onClick={handleSaveRoofSize}>
                <Save size={14} className="mr-1" /> Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{analysisResults.rooftop.area} sq ft</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setEditingRoofSize(true)}
                className="h-6 px-2 text-xs"
              >
                <Edit2 size={12} className="mr-1" /> Edit
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Data source indicator */}
      <div className="flex items-center gap-2 mt-2 mb-2 p-2 bg-white/5 rounded text-xs text-gray-400">
        {usesRealSolarData ? (
          <>
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Using real Google Solar API data for solar calculations.</span>
          </>
        ) : (
          <>
            <Info size={14} className="text-tiptop-purple" />
            <span>
              Using AI-based estimates. Google Solar API may not be available for this region. 
              For precise data, we recommend manual measurement or professional assessment.
            </span>
          </>
        )}
      </div>
      
      {analysisResults.imageAnalysisSummary && (
        <p className="text-gray-300 mt-2 text-sm bg-white/5 p-2 rounded">
          <span className="font-semibold text-tiptop-purple">Analysis Summary:</span> {analysisResults.imageAnalysisSummary}
        </p>
      )}
    </div>
  );
};

export default PropertyTypeDisplay;
