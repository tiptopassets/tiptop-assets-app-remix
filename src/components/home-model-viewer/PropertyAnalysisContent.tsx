
import React, { useState } from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import PropertyInsights from './PropertyInsights';
import AnalysisTabs from './AnalysisTabs';

interface PropertyAnalysisContentProps {
  analysisResults: PropertyAnalysis;
  showFullAnalysis: boolean;
  coordinates?: google.maps.LatLngLiteral;
  address?: string;
}

const PropertyAnalysisContent = ({ 
  analysisResults, 
  showFullAnalysis,
  coordinates,
  address 
}: PropertyAnalysisContentProps) => {
  const [localAnalysis, setLocalAnalysis] = useState<PropertyAnalysis>(analysisResults);
  const [showManualAdjustment, setShowManualAdjustment] = useState(false); // Start collapsed by default
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="p-4 md:p-6">
      {/* Property Insights Section */}
      <PropertyInsights 
        localAnalysis={localAnalysis}
        coordinates={coordinates}
        address={address}
      />

      {/* Main Analysis Tabs */}
      <AnalysisTabs 
        localAnalysis={localAnalysis}
        setLocalAnalysis={setLocalAnalysis}
        showManualAdjustment={showManualAdjustment}
        setShowManualAdjustment={setShowManualAdjustment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        coordinates={coordinates}
        address={address}
      />
    </div>
  );
};

export default PropertyAnalysisContent;
