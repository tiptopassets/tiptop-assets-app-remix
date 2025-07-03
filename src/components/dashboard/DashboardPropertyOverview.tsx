
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Zap, MessageSquare, Image as ImageIcon, Loader2 } from 'lucide-react';
import { UserPropertyAnalysis } from '@/types/userData';
import { navigateToChatbot } from '@/utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';
import { useSatelliteImage } from '@/hooks/useSatelliteImage';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

interface DashboardPropertyOverviewProps {
  analysis: UserPropertyAnalysis;
  address?: string;
}

const DashboardPropertyOverview: React.FC<DashboardPropertyOverviewProps> = ({
  analysis,
  address
}) => {
  const navigate = useNavigate();
  const [navigatingAsset, setNavigatingAsset] = useState<string | null>(null);
  const [navigatingGeneral, setNavigatingGeneral] = useState(false);
  const { assetSelections, loading: selectionsLoading } = useUserAssetSelections();

  const handleStartAssetSetup = async (assetType?: string) => {
    try {
      if (assetType) {
        setNavigatingAsset(assetType);
        console.log('🚀 [DASHBOARD] Starting asset setup:', { analysisId: analysis.id, assetType });
      } else {
        setNavigatingGeneral(true);
        console.log('🚀 [DASHBOARD] Starting general AI assistant:', { analysisId: analysis.id });
      }

      const chatbotUrl = navigateToChatbot(analysis.id, assetType);
      console.log('🔗 [DASHBOARD] Navigating to:', chatbotUrl);
      
      // Navigate immediately without delay
      navigate(chatbotUrl);
    } catch (error) {
      console.error('❌ [DASHBOARD] Navigation error:', error);
      
      // Clear loading states on error
      setNavigatingAsset(null);
      setNavigatingGeneral(false);
    }
  };

  const getPropertyAddress = () => {
    if (address) {
      return address;
    }
    
    // Fallback to a generic address since AnalysisResults doesn't contain address
    return 'Property Address';
  };

  const propertyAddress = getPropertyAddress();
  const { imageUrl: satelliteImageUrl, loading: imageLoading } = useSatelliteImage(propertyAddress);

  const getSelectedAssets = () => {
    if (!assetSelections.length) return [];

    // Map asset selections to display format
    const assets = assetSelections.map(selection => {
      const assetType = selection.asset_type.toLowerCase();
      
      // Determine display name based on asset type
      let name = selection.asset_type;
      if (assetType.includes('internet') || assetType.includes('bandwidth')) {
        name = 'Internet Bandwidth Sharing';
      } else if (assetType.includes('storage')) {
        name = 'Personal Storage Rental';
      } else if (assetType.includes('pool') || assetType.includes('swimming')) {
        name = 'Swimming Pool';
      } else if (assetType.includes('solar') || assetType.includes('rooftop')) {
        name = 'Solar Panels';
      } else if (assetType.includes('parking')) {
        name = 'Parking Spaces';
      } else if (assetType.includes('garden')) {
        name = 'Garden Space';
      }

      return {
        type: assetType,
        name,
        revenue: selection.monthly_revenue || 0,
        setupCost: selection.setup_cost || 0,
        data: selection.asset_data
      };
    });

    // Sort by revenue (highest first)
    return assets.sort((a, b) => b.revenue - a.revenue);
  };

  const selectedAssets = getSelectedAssets();
  const totalSelectedRevenue = selectedAssets.reduce((sum, asset) => sum + asset.revenue, 0);
  const totalSelectedCount = selectedAssets.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-tiptop-purple" />
          Property Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
              <p className="text-gray-900">{propertyAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Monthly Revenue Potential
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalSelectedRevenue > 0 ? totalSelectedRevenue : analysis.total_monthly_revenue}/month
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Selected Assets
                </p>
                <p className="text-2xl font-bold text-tiptop-purple">
                  {totalSelectedCount > 0 ? totalSelectedCount : analysis.total_opportunities}
                </p>
              </div>
            </div>

            {selectedAssets.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Assets</p>
                <div className="space-y-2">
                  {selectedAssets.slice(0, 3).map((asset) => (
                    <div key={asset.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-600">
                          ${asset.revenue}/month
                          {asset.setupCost > 0 && ` • Setup: $${asset.setupCost}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartAssetSetup(asset.type)}
                        disabled={navigatingAsset === asset.type || navigatingGeneral}
                        className="bg-tiptop-purple hover:bg-purple-600 disabled:opacity-50"
                      >
                        {navigatingAsset === asset.type ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-1" />
                            Manage
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Satellite Image - Right Side */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Satellite View</p>
                <div className="relative overflow-hidden rounded-lg border bg-gray-100">
                  {imageLoading ? (
                    <div className="aspect-square flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Loading image...</p>
                      </div>
                    </div>
                  ) : satelliteImageUrl ? (
                    <img
                      src={satelliteImageUrl}
                      alt={`Satellite view of ${propertyAddress}`}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="aspect-square flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">Satellite view unavailable</p>
                      </div>
                    </div>
                  )}
                  {satelliteImageUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{propertyAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t mt-6">
          <Button
            onClick={() => handleStartAssetSetup()}
            disabled={navigatingGeneral || navigatingAsset !== null}
            className="w-full bg-tiptop-purple hover:bg-purple-600 disabled:opacity-50"
          >
            {navigatingGeneral ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading AI Assistant...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start AI Assistant
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPropertyOverview;
