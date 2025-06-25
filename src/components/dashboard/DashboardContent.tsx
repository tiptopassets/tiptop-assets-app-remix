import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from './DashboardStats';
import { DashboardPropertyOverview } from './DashboardPropertyOverview';
import { DashboardCharts } from './DashboardCharts';
import { AssetsTable } from './AssetsTable';
import DashboardHeader from './DashboardHeader';
import { useEffect, useState } from 'react';
import { getUserServiceSelections } from '@/services/availableServicesService';
import { UserServiceSelection } from '@/types/journey';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardContentProps {
  primaryAddress?: string;
  latestAnalysis: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysesCount: number;
  onRefresh: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  primaryAddress,
  latestAnalysis,
  totalMonthlyRevenue,
  totalOpportunities,
  analysesCount,
  onRefresh
}) => {
  const { user } = useAuth();
  const [userSelections, setUserSelections] = useState<UserServiceSelection[]>([]);
  const analysisResults = latestAnalysis?.analysis_results;

  // Load user service selections
  useEffect(() => {
    const loadUserSelections = async () => {
      if (user) {
        try {
          const selections = await getUserServiceSelections(user.id);
          setUserSelections(selections);
        } catch (error) {
          console.error('Failed to load user selections:', error);
        }
      }
    };

    loadUserSelections();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header with Property Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <DashboardHeader 
          primaryAddress={primaryAddress}
          onRefresh={onRefresh}
        />

        {/* Stats Cards */}
        <DashboardStats 
          totalMonthlyRevenue={totalMonthlyRevenue}
          totalOpportunities={totalOpportunities}
          analysesCount={analysesCount}
        />
      </motion.div>

      {/* Property Overview */}
      {latestAnalysis && (
        <DashboardPropertyOverview 
          address={primaryAddress || "Property Address"}
          createdAt={latestAnalysis.created_at}
          totalOpportunities={totalOpportunities}
          totalMonthlyRevenue={totalMonthlyRevenue}
          satelliteImageUrl={latestAnalysis.satellite_image_url}
        />
      )}

      {/* User Service Selections */}
      {userSelections.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Selected Services</CardTitle>
              <CardDescription>
                Services you've shown interest in from your property analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userSelections.map((selection) => (
                  <div key={selection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Service Selected</span>
                      <p className="text-sm text-gray-600">
                        Selection type: {selection.selection_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Selected: {new Date(selection.selected_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assets Table */}
      {analysisResults && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Asset Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your property's monetization potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsTable analysisResults={analysisResults} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Revenue Charts */}
      {analysisResults && (
        <DashboardCharts 
          analysisResults={analysisResults}
          totalMonthlyRevenue={totalMonthlyRevenue}
        />
      )}
    </div>
  );
};

export default DashboardContent;
