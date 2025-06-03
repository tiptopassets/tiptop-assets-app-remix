
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import SolarDashboard from '@/components/solar/SolarDashboard';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';

interface SolarTabProps {
  localAnalysis: PropertyAnalysis;
  address?: string;
}

const SolarTab = ({ localAnalysis, address }: SolarTabProps) => {
  return (
    <TabsContent value="solar">
      <SolarDashboard 
        analysisResults={localAnalysis} 
        address={address}
      />
    </TabsContent>
  );
};

export default SolarTab;
