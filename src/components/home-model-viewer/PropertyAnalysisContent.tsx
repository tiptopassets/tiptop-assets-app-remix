
import React, { useState, useEffect } from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import PropertyInsights from './PropertyInsights';
import AnalysisTabs from './AnalysisTabs';
import AnalysisProgressIndicator from '../analysis/AnalysisProgressIndicator';
import { Building2, Search, Zap, Eye } from 'lucide-react';

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
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisSteps, setAnalysisSteps] = useState([
    { id: 'classify', label: 'Classifying property type', icon: <Building2 className="w-4 h-4" />, completed: true, active: false },
    { id: 'gather', label: 'Gathering market data', icon: <Search className="w-4 h-4" />, completed: true, active: false },
    { id: 'analyze', label: 'Analyzing opportunities', icon: <Eye className="w-4 h-4" />, completed: true, active: false },
    { id: 'generate', label: 'Generating recommendations', icon: <Zap className="w-4 h-4" />, completed: true, active: false }
  ]);
  const { trackServices } = useJourneyTracking();

  // Track services when analysis results are viewed
  useEffect(() => {
    if (analysisResults?.topOpportunities && analysisResults.topOpportunities.length > 0) {
      const serviceNames = analysisResults.topOpportunities.map(opp => opp.title);
      trackServices(serviceNames);
      console.log('📊 Tracked services viewed:', serviceNames);
    }
  }, [analysisResults, trackServices]);
  
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
