
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun } from 'lucide-react';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import MetricsGrid from './MetricsGrid';
import TopOpportunities from './TopOpportunities';
import SolarDashboard from '@/components/solar/SolarDashboard';
import ExpandedAnalysis from './ExpandedAnalysis';
import ManualAdjustmentControls from './ManualAdjustmentControls';

interface AnalysisTabsProps {
  localAnalysis: PropertyAnalysis;
  setLocalAnalysis: (analysis: PropertyAnalysis) => void;
  showManualAdjustment: boolean;
  setShowManualAdjustment: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  coordinates?: google.maps.LatLngLiteral;
  address?: string;
}

const AnalysisTabs = ({ 
  localAnalysis, 
  setLocalAnalysis, 
  showManualAdjustment, 
  setShowManualAdjustment,
  activeTab,
  setActiveTab,
  coordinates,
  address 
}: AnalysisTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-3 bg-black/40">
        <TabsTrigger value="overview" className="text-white data-[state=active]:bg-tiptop-purple">Overview</TabsTrigger>
        <TabsTrigger value="solar" className="text-white data-[state=active]:bg-tiptop-purple">
          <Sun className="h-4 w-4 mr-1" />
          Solar Analysis
        </TabsTrigger>
        <TabsTrigger value="opportunities" className="text-white data-[state=active]:bg-tiptop-purple">All Assets</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        {/* Property Type and Summary */}
        <PropertyTypeDisplay analysisResults={localAnalysis} />
        
        {/* Manual Adjustment Controls */}
        <ManualAdjustmentControls 
          localAnalysis={localAnalysis}
          setLocalAnalysis={setLocalAnalysis}
          showManualAdjustment={showManualAdjustment}
          setShowManualAdjustment={setShowManualAdjustment}
          coordinates={coordinates}
        />
        
        {/* Key Metrics */}
        <MetricsGrid analysisResults={localAnalysis} />
        
        {/* Top Opportunities Section */}
        <TopOpportunities analysisResults={localAnalysis} />
      </TabsContent>
      
      <TabsContent value="solar">
        <SolarDashboard 
          analysisResults={localAnalysis} 
          address={address}
        />
      </TabsContent>
      
      <TabsContent value="opportunities">
        {/* Expanded Analysis Section */}
        <ExpandedAnalysis 
          analysisResults={localAnalysis} 
          showFullAnalysis={true}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
