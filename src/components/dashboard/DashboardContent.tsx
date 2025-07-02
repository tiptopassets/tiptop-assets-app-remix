
import React from 'react';
import ComprehensiveDashboard from './ComprehensiveDashboard';

interface DashboardContentProps {
  primaryAddress?: string;
  latestAnalysis: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysesCount: number;
  onRefresh: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onRefresh }) => {
  return <ComprehensiveDashboard onRefresh={onRefresh} />;
};

export default DashboardContent;
