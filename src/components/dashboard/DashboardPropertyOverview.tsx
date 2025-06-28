import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import { UserPropertyAnalysis } from '@/types/userData';
import { navigateToChatbot } from '@/utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

interface DashboardPropertyOverviewProps {
  analysis: UserPropertyAnalysis;
  address?: string;
}

const DashboardPropertyOverview: React.FC<DashboardPropertyOverviewProps> = ({
  analysis,
  address
}) => {
  const navigate = useNavigate();

  const handleStartAssetSetup = (assetType?: string) => {
    const chatbotUrl = navigateToChatbot(analysis.id, assetType);
    console.log('🚀 [DASHBOARD] Navigating to chatbot:', { 
      analysisId: analysis.id, 
      assetType, 
      url: chatbotUrl 
    });
    navigate(chatbotUrl);
  };

  const getPropertyAddress = () => {
    // Try to get address from the user_addresses table via the address relationship
    // Since we don't have direct access to the address record here, use the provided address prop
    if (address) {
      return address;
    }
    
    // Fallback to a generic address if none provided
    return 'Property Address';
  };

  const getTopAssets = () => {
    const results = analysis.analysis_results;
    if (!results) return [];

    const assets = [];

    // Add assets with actual revenue potential
    if (results.rooftop?.revenue > 0) {
      assets.push({
        type: 'rooftop',
        name: 'Solar Panels',
        revenue: results.rooftop.revenue,
        area: results.rooftop.area
      });
    }

    if (results.parking?.spaces > 0 && results.parking?.revenue > 0) {
      assets.push({
        type: 'parking',
        name: 'Parking Spaces',
        revenue: results.parking.revenue,
        spaces: results.parking.spaces
      });
    }

    if (results.pool?.present && results.pool?.revenue > 0) {
      assets.push({
        type: 'pool',
        name: 'Swimming Pool',
        revenue: results.pool.revenue,
        area: results.pool.area
      });
    }

    if (results.garden?.area > 0 && results.garden?.revenue > 0) {
      assets.push({
        type: 'garden',
        name: 'Garden Space',
        revenue: results.garden.revenue,
        area: results.garden.area
      });
    }

    if (results.bandwidth?.revenue > 0) {
      assets.push({
        type: 'bandwidth',
        name: 'Internet Bandwidth',
        revenue: results.bandwidth.revenue,
        available: results.bandwidth.available
      });
    }

    if (results.storage?.revenue > 0) {
      assets.push({
        type: 'storage',
        name: 'Storage Space',
        revenue: results.storage.revenue
      });
    }

    // Sort by revenue (highest first)
    return assets.sort((a, b) => b.revenue - a.revenue);
  };

  const topAssets = getTopAssets();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-tiptop-purple" />
          Property Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
            <p className="text-gray-900">{getPropertyAddress()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue Potential
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${analysis.total_monthly_revenue}/month
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Total Opportunities
              </p>
              <p className="text-2xl font-bold text-tiptop-purple">
                {analysis.total_opportunities}
              </p>
            </div>
          </div>

          {topAssets.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Top Assets</p>
              <div className="space-y-2">
                {topAssets.slice(0, 3).map((asset) => (
                  <div key={asset.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-600">
                        ${asset.revenue}/month
                        {asset.area && ` • ${asset.area} sq ft`}
                        {asset.spaces && ` • ${asset.spaces} spaces`}
                        {asset.available && ` • ${asset.available} Mbps`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartAssetSetup(asset.type)}
                      className="bg-tiptop-purple hover:bg-purple-600"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Start Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => handleStartAssetSetup()}
              className="w-full bg-tiptop-purple hover:bg-purple-600"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start AI Assistant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPropertyOverview;
