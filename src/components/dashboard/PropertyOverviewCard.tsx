
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { 
  Home, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Zap
} from 'lucide-react';

interface PropertyOverviewCardProps {
  propertyData: PropertyAnalysisData;
  analysisId?: string;
  addressId?: string;
}

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({ 
  propertyData, 
  analysisId,
  addressId 
}) => {
  const navigate = useNavigate();

  const handleStartAssetSetup = (assetType: string) => {
    console.log('🚀 [DASHBOARD] Starting asset setup:', {
      assetType,
      analysisId,
      addressId,
      propertyAddress: propertyData.address
    });

    // Navigate to chatbot with specific parameters to ensure data consistency
    const params = new URLSearchParams({
      asset: assetType,
      ...(analysisId && { analysisId }),
      ...(addressId && { addressId })
    });
    
    navigate(`/onboarding-chatbot?${params.toString()}`);
  };

  const completionProgress = Math.min(
    (propertyData.availableAssets.filter(asset => asset.isConfigured).length / 
     Math.max(propertyData.availableAssets.length, 1)) * 100, 
    100
  );

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-tiptop-purple" />
            <CardTitle className="text-lg font-semibold">Property Analysis</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Address */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Property Address</p>
          <p className="text-sm text-gray-900">{propertyData.address}</p>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Monthly Revenue</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              ${propertyData.totalMonthlyRevenue}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Opportunities</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {propertyData.totalOpportunities}
            </p>
          </div>
        </div>

        {/* Setup Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-500">{Math.round(completionProgress)}%</span>
          </div>
          <Progress value={completionProgress} className="h-2" />
        </div>

        {/* Available Assets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Available Assets ({propertyData.availableAssets.length})
          </p>
          <div className="space-y-2">
            {propertyData.availableAssets.slice(0, 3).map((asset) => (
              <div key={asset.type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                    {asset.isConfigured && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Configured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-600 font-medium">
                      ${asset.monthlyRevenue}/month
                    </span>
                    {asset.area && (
                      <span className="text-xs text-gray-500">• {asset.area}</span>
                    )}
                  </div>
                </div>
                {!asset.isConfigured && (
                  <Button
                    size="sm"
                    onClick={() => handleStartAssetSetup(asset.type)}
                    className="bg-tiptop-purple hover:bg-purple-600 text-xs px-3 py-1"
                  >
                    Start Now
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* View All Assets Button */}
        {propertyData.availableAssets.length > 3 && (
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams({
                ...(analysisId && { analysisId }),
                ...(addressId && { addressId })
              });
              navigate(`/onboarding-chatbot?${params.toString()}`);
            }}
            className="w-full"
          >
            View All Assets ({propertyData.availableAssets.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOverviewCard;
