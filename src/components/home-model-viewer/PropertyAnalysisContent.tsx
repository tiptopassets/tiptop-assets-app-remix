
import React from 'react';
import { Building, Car, Leaf, Zap, WifiIcon, Home, Waves, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LocationVerificationBadge from './LocationVerificationBadge';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

interface PropertyAnalysisContentProps {
  analysisResults: AnalysisResults;
  showFullAnalysis: boolean;
}

const PropertyAnalysisContent: React.FC<PropertyAnalysisContentProps> = ({
  analysisResults,
  showFullAnalysis
}) => {
  if (!analysisResults) {
    return (
      <div className="text-center text-gray-400 p-8">
        <p>No analysis results available</p>
      </div>
    );
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'rooftop':
      case 'solar':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'parking':
        return <Car className="h-5 w-5 text-blue-500" />;
      case 'garden':
        return <Leaf className="h-5 w-5 text-green-500" />;
      case 'pool':
        return <Waves className="h-5 w-5 text-blue-400" />;
      case 'internet':
      case 'bandwidth':
        return <WifiIcon className="h-5 w-5 text-purple-500" />;
      case 'storage':
        return <Building className="h-5 w-5 text-gray-500" />;
      case 'rental':
        return <Home className="h-5 w-5 text-tiptop-purple" />;
      default:
        return <DollarSign className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Location verification badge */}
      <LocationVerificationBadge 
        serviceAvailability={analysisResults.serviceAvailability}
        locationInfo={analysisResults.locationInfo}
      />

      {/* Property Overview */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">Property Type</p>
              <p className="font-medium">{analysisResults.propertyType || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Total Monthly Revenue</p>
              <p className="font-medium text-green-400">
                ${analysisResults.propertyValuation?.totalMonthlyRevenue || 0}/month
              </p>
            </div>
          </div>
          
          {analysisResults.amenities && analysisResults.amenities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {analysisResults.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      {analysisResults.topOpportunities && analysisResults.topOpportunities.length > 0 && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Top Revenue Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResults.topOpportunities.slice(0, showFullAnalysis ? undefined : 3).map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {getAssetIcon(opportunity.icon)}
                  <div>
                    <h4 className="text-white font-medium">{opportunity.title}</h4>
                    <p className="text-gray-300 text-sm">{opportunity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">${opportunity.monthlyRevenue}/mo</p>
                  {opportunity.setupCost && (
                    <p className="text-gray-400 text-sm">Setup: ${opportunity.setupCost}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Asset Details */}
      {showFullAnalysis && (
        <div className="space-y-4">
          {/* Solar/Rooftop */}
          {analysisResults.rooftop && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Solar & Rooftop
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Roof Area</p>
                    <p className="font-medium">{analysisResults.rooftop.area} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Solar Capacity</p>
                    <p className="font-medium">{analysisResults.rooftop.solarCapacity} kW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Monthly Revenue</p>
                    <p className="font-medium text-green-400">${analysisResults.rooftop.revenue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Solar Potential</p>
                    <Badge variant={analysisResults.rooftop.solarPotential ? "default" : "secondary"}>
                      {analysisResults.rooftop.solarPotential ? "Excellent" : "Limited"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parking */}
          {analysisResults.parking && analysisResults.parking.spaces > 0 && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-500" />
                  Parking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Available Spaces</p>
                    <p className="font-medium">{analysisResults.parking.spaces}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Daily Rate</p>
                    <p className="font-medium">${analysisResults.parking.rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Monthly Revenue</p>
                    <p className="font-medium text-green-400">${analysisResults.parking.revenue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">EV Charger Potential</p>
                    <Badge variant={analysisResults.parking.evChargerPotential ? "default" : "secondary"}>
                      {analysisResults.parking.evChargerPotential ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pool */}
          {analysisResults.pool && analysisResults.pool.present && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Waves className="h-5 w-5 text-blue-400" />
                  Swimming Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Pool Area</p>
                    <p className="font-medium">{analysisResults.pool.area} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Pool Type</p>
                    <p className="font-medium capitalize">{analysisResults.pool.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Monthly Revenue</p>
                    <p className="font-medium text-green-400">${analysisResults.pool.revenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Restrictions */}
      {analysisResults.restrictions && (
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-300">Important Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-200">{analysisResults.restrictions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyAnalysisContent;
