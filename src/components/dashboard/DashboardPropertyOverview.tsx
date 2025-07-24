
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Settings, TrendingUp, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardPropertyOverviewProps {
  analysis: any;
  address?: string;
  assetSelections?: any[];
  hasUserSelections?: boolean;
}

const DashboardPropertyOverview: React.FC<DashboardPropertyOverviewProps> = ({ 
  analysis, 
  address,
  assetSelections = [],
  hasUserSelections = false
}) => {
  if (!analysis) return null;

  const analysisResults = analysis.analysis_results;
  const createdAt = new Date(analysis.created_at);
  
  // Get filtered assets based on user selections
  const getFilteredAssets = () => {
    if (!hasUserSelections || !analysisResults) return [];
    
    const assets = [];
    
    // Check each asset type and include if selected
    assetSelections.forEach(selection => {
      const assetType = selection.asset_type.toLowerCase();
      
      if (assetType.includes('parking') && analysisResults.parking?.revenue > 0) {
        assets.push({
          type: 'parking',
          title: 'Parking Spaces',
          revenue: selection.monthly_revenue,
          setupCost: selection.setup_cost || 0,
          description: `${analysisResults.parking.spaces || 2} spaces available`,
          icon: '🚗'
        });
      }
      
      if (assetType.includes('pool') && analysisResults.pool?.revenue > 0) {
        assets.push({
          type: 'pool',
          title: 'Swimming Pool',
          revenue: selection.monthly_revenue,
          setupCost: selection.setup_cost || 0,
          description: 'Pool area available for events',
          icon: '🏊'
        });
      }
      
      if ((assetType.includes('garden') || assetType.includes('yard')) && analysisResults.garden?.revenue > 0) {
        assets.push({
          type: 'garden',
          title: 'Garden Space',
          revenue: selection.monthly_revenue,
          setupCost: selection.setup_cost || 0,
          description: 'Outdoor space for activities',
          icon: '🌿'
        });
      }
      
      if ((assetType.includes('rooftop') || assetType.includes('solar')) && analysisResults.rooftop?.revenue > 0) {
        assets.push({
          type: 'rooftop',
          title: 'Rooftop Solar',
          revenue: selection.monthly_revenue,
          setupCost: selection.setup_cost || 0,
          description: 'Solar panel installation',
          icon: '☀️'
        });
      }
      
      if ((assetType.includes('bandwidth') || assetType.includes('internet')) && analysisResults.bandwidth?.revenue > 0) {
        assets.push({
          type: 'bandwidth',
          title: 'Internet Bandwidth',
          revenue: selection.monthly_revenue,
          setupCost: selection.setup_cost || 0,
          description: 'Share unused internet capacity',
          icon: '📡'
        });
      }
    });
    
    return assets;
  };

  const filteredAssets = getFilteredAssets();
  const totalSetupCost = filteredAssets.reduce((sum, asset) => sum + (asset.setupCost || 0), 0);
  const totalMonthlyRevenue = filteredAssets.reduce((sum, asset) => sum + asset.revenue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Property Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Property Overview
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Analyzed {formatDistanceToNow(createdAt, { addSuffix: true })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {hasUserSelections ? `${filteredAssets.length} Assets Selected` : 'Analysis Complete'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h3 className="font-semibold text-foreground mb-1">Property Address</h3>
            <p className="text-muted-foreground">{address || 'Address not available'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Selected Assets</h3>
          
          {filteredAssets.length > 0 ? (
            <div className="grid gap-4">
              {filteredAssets.map((asset, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{asset.icon}</span>
                      <div>
                        <h4 className="font-medium">{asset.title}</h4>
                        <p className="text-sm text-muted-foreground">{asset.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-medium text-green-600">
                            ${asset.revenue}/month
                          </span>
                          {asset.setupCost > 0 && (
                            <span className="text-sm text-muted-foreground">
                              Setup: ${asset.setupCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No assets selected for this property</p>
            </Card>
          )}
        </div>

        {/* Satellite View */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Satellite View</h3>
          <Card className="overflow-hidden">
            <div className="h-64 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Satellite view loading...</p>
            </div>
          </Card>
          
          {/* Revenue Summary */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-green-600">${totalMonthlyRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annual Potential</span>
                <span className="font-semibold">${totalMonthlyRevenue * 12}</span>
              </div>
              {totalSetupCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Setup Investment</span>
                  <span className="font-medium text-orange-600">${totalSetupCost}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Setup Costs Chart */}
      {totalSetupCost > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Setup Investment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssets.filter(asset => asset.setupCost > 0).map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{asset.icon}</span>
                    <span className="font-medium">{asset.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${asset.setupCost}</div>
                    <div className="text-sm text-muted-foreground">
                      ROI: {Math.round(asset.setupCost / asset.revenue)} months
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 flex items-center justify-between font-semibold">
                <span>Total Investment</span>
                <span className="text-lg">${totalSetupCost}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default DashboardPropertyOverview;
