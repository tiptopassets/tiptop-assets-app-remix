
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';

interface PropertyTypeDisplayProps {
  analysisResults: PropertyAnalysis;
}

const PropertyTypeDisplay = ({ analysisResults }: PropertyTypeDisplayProps) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-2">Property Analysis</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge className="bg-tiptop-purple/80">{analysisResults.propertyType}</Badge>
        {analysisResults.amenities && analysisResults.amenities.slice(0, 3).map((amenity, i) => (
          <Badge key={i} variant="outline" className="text-gray-300">{amenity}</Badge>
        ))}
        {analysisResults.overallReliability && (
          <Badge 
            variant="outline" 
            className={`text-xs ${
              analysisResults.overallReliability >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
              analysisResults.overallReliability >= 60 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
              'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
            }`}
          >
            {analysisResults.overallReliability}% reliable
          </Badge>
        )}
      </div>
      
      {analysisResults.imageAnalysisSummary && (
        <p className="text-gray-300 mt-2 text-sm bg-white/5 p-2 rounded">
          <span className="font-semibold text-tiptop-purple">Image Analysis:</span> {analysisResults.imageAnalysisSummary}
        </p>
      )}
    </div>
  );
};

export default PropertyTypeDisplay;
