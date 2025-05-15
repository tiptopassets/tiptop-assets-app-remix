
import { useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ViewerHeader from '@/components/model-viewer/ViewerHeader';
import ImageGrid from '@/components/model-viewer/ImageGrid';
import ActionButtons from '@/components/model-viewer/ActionButtons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, Info } from 'lucide-react';
import './ModelViewer.css';

const ModelViewer = () => {
  const { propertyImages, status } = useModelGeneration();
  const { analysisResults, address } = useGoogleMap();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect if no images or analysis are available
    if (status !== 'completed' || (!propertyImages.satellite && !propertyImages.streetView)) {
      toast({
        title: "No Property Images Available",
        description: "Please complete the property analysis first",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [status, propertyImages, navigate, toast]);

  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <p>No property analysis available. Please analyze a property first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <ViewerHeader onClose={() => navigate('/')} />

      {/* Main content */}
      <div className="container mx-auto px-4 pb-20 mt-6">
        {/* Property Address */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">{address}</h2>
          <p className="text-gray-400">Property Analysis Results</p>
        </div>
        
        {/* Image Grid */}
        <ImageGrid propertyImages={propertyImages} />
        
        {/* Analysis Results */}
        <div className="mt-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Check className="text-green-500 h-5 w-5 mr-2" />
              AI Property Analysis Results
            </h2>
            
            {/* Property Type & Key Details */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-tiptop-purple/80">{analysisResults.propertyType}</Badge>
                {analysisResults.amenities && analysisResults.amenities.map((amenity, i) => (
                  <Badge key={i} variant="outline" className="text-gray-300">{amenity}</Badge>
                ))}
              </div>
              
              {analysisResults.imageAnalysisSummary && (
                <div className="bg-white/5 p-3 rounded text-gray-300 text-sm">
                  <p className="flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1 text-tiptop-purple" />
                    <span className="font-semibold">Image Analysis</span>
                  </p>
                  <p>{analysisResults.imageAnalysisSummary}</p>
                </div>
              )}
            </div>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Rooftop */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Rooftop</h3>
                <p className="text-xl font-bold">{analysisResults.rooftop.area} sq ft</p>
                <div className="mt-1 text-sm">
                  <p>Solar: {analysisResults.rooftop.solarCapacity}kW</p>
                  <p className="text-green-400">${analysisResults.rooftop.revenue}/month</p>
                </div>
              </Card>
              
              {/* Garden */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Garden</h3>
                <p className="text-xl font-bold">{analysisResults.garden.area} sq ft</p>
                <div className="mt-1 text-sm">
                  <p>Opportunity: {analysisResults.garden.opportunity}</p>
                  <p className="text-green-400">${analysisResults.garden.revenue}/month</p>
                </div>
              </Card>
              
              {/* Parking */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Parking</h3>
                <p className="text-xl font-bold">{analysisResults.parking.spaces} spaces</p>
                <div className="mt-1 text-sm">
                  <p>Rate: ${analysisResults.parking.rate}/day</p>
                  <p className="text-green-400">${analysisResults.parking.revenue}/month</p>
                </div>
              </Card>
              
              {/* Storage */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Storage</h3>
                <p className="text-xl font-bold">{analysisResults.storage.volume} cu ft</p>
                <div className="mt-1 text-sm">
                  <p className="text-green-400">${analysisResults.storage.revenue}/month</p>
                </div>
              </Card>
            </div>
            
            {/* Top Opportunities */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Top Monetization Opportunities</h3>
              <div className="space-y-2">
                {analysisResults.topOpportunities.map((opp, i) => (
                  <div key={i} className="bg-white/10 rounded p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{opp.title}</h4>
                      <p className="text-sm text-gray-400">{opp.description}</p>
                    </div>
                    <span className="text-green-400 font-bold">${opp.monthlyRevenue}/mo</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Additional Info */}
            {(analysisResults.permits?.length > 0 || analysisResults.restrictions) && (
              <div className="mt-6 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">Important Considerations</h3>
                
                {analysisResults.permits?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Required Permits:</p>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {analysisResults.permits.map((permit, i) => (
                        <li key={i}>{permit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResults.restrictions && (
                  <div>
                    <p className="text-sm font-medium">Restrictions:</p>
                    <p className="text-sm text-gray-300">{analysisResults.restrictions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <ActionButtons onViewAssets={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default ModelViewer;
