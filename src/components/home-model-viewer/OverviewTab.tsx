
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import MetricsGrid from './MetricsGrid';
import TopOpportunities from './TopOpportunities';
import ManualAdjustmentControls from './ManualAdjustmentControls';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';

interface OverviewTabProps {
  localAnalysis: PropertyAnalysis;
  showManualAdjustment: boolean;
  setShowManualAdjustment: (show: boolean) => void;
  handleParkingSpacesChange: (value: number[]) => void;
  calculateParkingRevenue: (spaces: number, rate: number) => number;
}

const OverviewTab = ({
  localAnalysis,
  showManualAdjustment,
  setShowManualAdjustment,
  handleParkingSpacesChange,
  calculateParkingRevenue
}: OverviewTabProps) => {
  return (
    <TabsContent value="overview" className="space-y-6">
      {/* Property Type and Summary */}
      <PropertyTypeDisplay analysisResults={localAnalysis} />
      
      {/* Manual Adjustment Controls */}
      <ManualAdjustmentControls
        showManualAdjustment={showManualAdjustment}
        setShowManualAdjustment={setShowManualAdjustment}
        localAnalysis={localAnalysis}
        handleParkingSpacesChange={handleParkingSpacesChange}
        calculateParkingRevenue={calculateParkingRevenue}
      />
      
      {/* Key Metrics */}
      <MetricsGrid analysisResults={localAnalysis} />
      
      {/* Top Opportunities Section */}
      <TopOpportunities analysisResults={localAnalysis} />
    </TabsContent>
  );
};

export default OverviewTab;
