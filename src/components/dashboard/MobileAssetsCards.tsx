import React from 'react';
import { AnalysisResults } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MobileAssetsCardsProps {
  analysisResults: AnalysisResults;
  isAssetConfigured?: (assetType: string) => boolean;
}

export const MobileAssetsCards = ({ analysisResults, isAssetConfigured }: MobileAssetsCardsProps) => {
  const navigate = useNavigate();

  const handleStartConfiguration = (assetType: string) => {
    navigate(`/dashboard/onboarding?asset=${encodeURIComponent(assetType.toLowerCase())}`);
  };

  const handleExploreMoreAssets = () => {
    navigate('/dashboard/add-asset');
  };

  const assets = [
    {
      name: 'Rooftop Solar',
      type: 'rooftop',
      potential: analysisResults.rooftop?.revenue > 0,
      area: `${analysisResults.rooftop?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.rooftop?.revenue || 0}`,
      setupCost: `$${analysisResults.rooftop?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Garden/Yard Space',
      type: 'garden',
      potential: analysisResults.garden?.opportunity !== 'Low',
      area: `${analysisResults.garden?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.garden?.revenue || 0}`,
      setupCost: `$${analysisResults.garden?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Parking Spaces',
      type: 'parking',
      potential: analysisResults.parking?.spaces > 0,
      area: `${analysisResults.parking?.spaces || 0} spaces`,
      monthlyRevenue: `$${analysisResults.parking?.revenue || 0}`,
      setupCost: `$${analysisResults.parking?.providers?.[0]?.setupCost || 'N/A'}`,
    }
  ];

  // Add additional assets based on analysis results
  if (analysisResults.pool && analysisResults.pool.present) {
    assets.push({
      name: 'Swimming Pool',
      type: 'pool',
      potential: true,
      area: `${analysisResults.pool.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.pool.revenue || 0}`,
      setupCost: `$${analysisResults.pool.providers?.[0]?.setupCost || 'N/A'}`,
    });
  }

  if (analysisResults.bandwidth && analysisResults.bandwidth.available > 0) {
    assets.push({
      name: 'Internet Bandwidth',
      type: 'bandwidth',
      potential: true,
      area: `${analysisResults.bandwidth.available} Mbps`,
      monthlyRevenue: `$${analysisResults.bandwidth.revenue || 0}`,
      setupCost: 'Minimal',
    });
  }

  if (analysisResults.parking?.evChargerPotential) {
    assets.push({
      name: 'EV Charging',
      type: 'ev_charging',
      potential: true,
      area: 'Available',
      monthlyRevenue: `$${Math.round(analysisResults.parking.revenue * 1.5) || 0}`,
      setupCost: '$1,200-$2,000',
    });
  }

  const totalMonthlyRevenue = assets.reduce((sum, asset) => {
    const revenue = parseFloat(asset.monthlyRevenue.replace('$', '')) || 0;
    return sum + revenue;
  }, 0);

  return (
    <div className="space-y-4">
      {assets.map((asset, index) => {
        const isConfigured = isAssetConfigured ? isAssetConfigured(asset.type) : false;
        
        return (
          <Card key={index} className="bg-white shadow-sm border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{asset.name}</CardTitle>
                <div className="flex items-center">
                  {asset.potential ? 
                    <Check className="h-5 w-5 text-green-500" /> : 
                    <X className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Size/Quantity:</span>
                  <p className="font-medium">{asset.area}</p>
                </div>
                <div>
                  <span className="text-gray-500">Monthly Revenue:</span>
                  <p className="font-medium text-green-600">{asset.monthlyRevenue}</p>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">Setup Cost:</span>
                <p className="font-medium">{asset.setupCost}</p>
              </div>

              <div className="pt-2">
                {!asset.potential ? (
                  <Badge variant="secondary" className="w-full justify-center">Not Available</Badge>
                ) : isConfigured ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 w-full justify-center">
                    Configured
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-tiptop-purple hover:bg-purple-600 text-white"
                    onClick={() => handleStartConfiguration(asset.type)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Start Configuration
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Total Revenue Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Monthly Potential</p>
            <p className="text-2xl font-bold text-green-600">${totalMonthlyRevenue}</p>
          </div>
        </CardContent>
      </Card>

      {/* Explore More Button */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="pt-6 text-center">
          <Button
            onClick={handleExploreMoreAssets}
            className="bg-tiptop-purple hover:bg-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Explore More Assets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};