
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ExpandedAnalysis from './ExpandedAnalysis';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';

interface AssetsTabProps {
  localAnalysis: PropertyAnalysis;
}

const AssetsTab = ({ localAnalysis }: AssetsTabProps) => {
  return (
    <TabsContent value="opportunities">
      {/* Expanded Analysis Section */}
      <ExpandedAnalysis 
        analysisResults={localAnalysis} 
        showFullAnalysis={true}
      />
    </TabsContent>
  );
};

export default AssetsTab;
