
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TrendingUp, DollarSign } from 'lucide-react';
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
  
  // Calculate totals from filtered results (only selected assets)
  const calculateTotalRevenue = () => {
    if (!hasUserSelections || !analysisResults) return 0;
    
    let total = 0;
    if (analysisResults.rooftop?.revenue) total += analysisResults.rooftop.revenue;
    if (analysisResults.garden?.revenue) total += analysisResults.garden.revenue;
    if (analysisResults.parking?.revenue) total += analysisResults.parking.revenue;
    if (analysisResults.pool?.revenue) total += analysisResults.pool.revenue;
    if (analysisResults.bandwidth?.revenue) total += analysisResults.bandwidth.revenue;
    
    return total;
  };

  const totalRevenue = calculateTotalRevenue();
  const opportunitiesCount = hasUserSelections ? assetSelections.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
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
              {hasUserSelections ? 'Assets Selected' : 'Analysis Complete'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Property Address */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">Property Address</h3>
            <p className="text-muted-foreground">{address || 'Address not available'}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">${totalRevenue}</p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{opportunitiesCount}</p>
              <p className="text-sm text-muted-foreground">Selected Assets</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg col-span-2 md:col-span-1">
              <div className="h-6 w-6 bg-purple-600 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${totalRevenue * 12}</p>
              <p className="text-sm text-muted-foreground">Annual Potential</p>
            </div>
          </div>

          {/* Selected Assets Summary */}
          {hasUserSelections && assetSelections.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Selected Assets:</h4>
              <div className="flex flex-wrap gap-2">
                {assetSelections.map((selection, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10">
                    {selection.asset_type} - ${selection.monthly_revenue}/mo
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analysis Status:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {hasUserSelections ? `${assetSelections.length} Assets Selected` : 'Ready for Selection'}
              </Badge>
            </div>
            
            {analysisResults?.usingRealSolarData && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Solar Data:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Google Solar API Verified
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardPropertyOverview;
