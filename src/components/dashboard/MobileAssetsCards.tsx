import React from 'react';
import { AnalysisResults } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Check, X, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MobileAssetsCardsProps {
  analysisResults: AnalysisResults;
  isAssetConfigured?: (assetType: string) => boolean;
  analysisId?: string;
}

export const MobileAssetsCards = ({ analysisResults, isAssetConfigured, analysisId }: MobileAssetsCardsProps) => {
  const navigate = useNavigate();

  const handleStartConfiguration = (assetType: string) => {
    // Navigate to the Enhanced Onboarding Chatbot with both analysis ID and asset-specific context
    const params = new URLSearchParams();
    if (analysisId) {
      params.set('analysisId', analysisId);
    }
    params.set('asset', assetType.toLowerCase());
    navigate(`/dashboard/onboarding?${params.toString()}`);
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
    <div className="space-y-6">
      {/* Assets Carousel */}
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="ml-1">
            {assets.map((asset, index) => {
              const isConfigured = isAssetConfigured ? isAssetConfigured(asset.type) : false;
              
              return (
                <CarouselItem key={index} className="pl-3 basis-44">
                  <Card className="bg-white shadow-sm border h-80 flex flex-col">
                    <CardHeader className="pb-2 flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {asset.potential ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">{asset.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between p-3 pt-0">
                      <div className="space-y-3 flex-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Size:</span>
                          <p className="font-medium">{asset.area}</p>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Monthly Revenue:</span>
                          <p className="font-semibold text-green-600">{asset.monthlyRevenue}</p>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Setup Cost:</span>
                          <p className="font-medium">{asset.setupCost}</p>
                        </div>
                      </div>

                      <div className="pt-3 flex-shrink-0">
                        {!asset.potential ? (
                          <Badge variant="secondary" className="w-full justify-center text-xs py-1">Not Detected</Badge>
                        ) : isConfigured ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 w-full justify-center text-xs py-1">
                            Selected
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-tiptop-purple hover:bg-purple-600 text-white text-xs py-2"
                            onClick={() => handleStartConfiguration(asset.type)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
            
            {/* Explore More Card */}
            <CarouselItem className="pl-3 basis-44">
              <Card className="border-dashed border-2 border-gray-300 h-80 flex flex-col items-center justify-center">
                <CardContent className="text-center">
                  <Button
                    onClick={handleExploreMoreAssets}
                    className="bg-tiptop-purple hover:bg-purple-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Explore More
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Monthly Potential</p>
            <p className="text-2xl font-bold text-green-600">${totalMonthlyRevenue}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};