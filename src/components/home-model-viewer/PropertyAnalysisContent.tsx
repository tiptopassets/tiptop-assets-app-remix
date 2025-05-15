
import React from 'react';
import { PropertyAnalysis } from '@/types/analysis';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import MetricsGrid from './MetricsGrid';
import ExpandedAnalysis from './ExpandedAnalysis';
import TopOpportunities from './TopOpportunities';

interface PropertyAnalysisContentProps {
  analysisResults: PropertyAnalysis;
  showFullAnalysis: boolean;
}

const PropertyAnalysisContent = ({ 
  analysisResults, 
  showFullAnalysis 
}: PropertyAnalysisContentProps) => {
  return (
    <div className="p-4 md:p-6">
      {/* Property Type and Summary */}
      <PropertyTypeDisplay analysisResults={analysisResults} />
      
      {/* Key Metrics */}
      <MetricsGrid analysisResults={analysisResults} />
      
      {/* Expanded Analysis Section (conditionally rendered) */}
      <ExpandedAnalysis 
        analysisResults={analysisResults} 
        showFullAnalysis={showFullAnalysis} 
      />
      
      {/* Top Opportunities Section */}
      <TopOpportunities analysisResults={analysisResults} />
    </div>
  );
};

export default PropertyAnalysisContent;
