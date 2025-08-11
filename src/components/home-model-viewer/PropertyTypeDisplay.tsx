
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Info, CheckCircle2, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';

interface PropertyTypeDisplayProps {
  analysisResults: PropertyAnalysis;
}

const PropertyTypeDisplay = ({ analysisResults }: PropertyTypeDisplayProps) => {
  const usesRealSolarData = analysisResults.rooftop.usingRealSolarData;
  const { setAnalysisResults } = useGoogleMap();
  const { toast } = useToast();
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
      
      // Recalculate solar potential if we don't have real data
      if (!usesRealSolarData && newSize > 0) {
        // Simple estimation based on roof area: 
        // Average solar production is around 15W per sq ft, at $0.15/kWh
        const usableRoofPercent = 0.7; // Assume 70% of roof can be used for solar
        const wattsPerSqFt = 15;
        const kwhPerMonth = (newSize * usableRoofPercent * wattsPerSqFt * 4 * 0.8) / 1000;
        const ratePerKwh = 0.15;
        
        const newRevenue = Math.round(kwhPerMonth * ratePerKwh);
        
        // Update the revenue in the rooftop section
        updatedResults.rooftop.revenue = newRevenue;
        
        // Also update in top opportunities if solar is one of them
        const solarOpportunityIndex = updatedResults.topOpportunities.findIndex(
          opp => opp.title.toLowerCase().includes('solar')
        );
        
        if (solarOpportunityIndex >= 0) {
          updatedResults.topOpportunities[solarOpportunityIndex] = {
            ...updatedResults.topOpportunities[solarOpportunityIndex],
            monthlyRevenue: newRevenue
          };
        }
      }
      
      setAnalysisResults(updatedResults);
      setEditingRoofSize(false);
      
      toast({
        title: "Roof Size Updated",
        description: `Roof area set to ${newSize} sq ft and revenue calculations updated.`
      });
    }
  };
  
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-2">Property Analysis</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge className="bg-purple-600 text-white hover:bg-purple-700">{analysisResults.propertyType}</Badge>
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
              You can edit the roof size manually.
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
