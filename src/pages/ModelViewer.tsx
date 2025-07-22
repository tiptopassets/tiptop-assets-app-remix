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
import { Check, Info, ExternalLink, Plus } from 'lucide-react';
import './ModelViewer.css';
import { Button } from '@/components/ui/button';

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

  // Calculate the total potential monthly income from all opportunities
  const totalPotentialIncome = analysisResults.topOpportunities.reduce(
    (sum, opp) => sum + opp.monthlyRevenue, 0
  );

  // Get main assets from analysis results
  const mainAssets = [
    { name: 'Rooftop Solar', revenue: analysisResults.rooftop.revenue, selected: true },
    { name: 'Garden Space', revenue: analysisResults.garden.revenue, selected: true },
    { name: 'Parking Space', revenue: analysisResults.parking.revenue, selected: false },
    { name: 'Storage Space', revenue: analysisResults.storage.revenue, selected: false },
    { name: 'Short-term Rental', revenue: analysisResults.shortTermRental.monthlyProjection, selected: false },
    ...(analysisResults.pool?.present ? [{ name: 'Pool Rental', revenue: analysisResults.pool.revenue, selected: false }] : [])
  ];

  const selectedAssets = mainAssets.filter(asset => asset.selected);
  const unselectedAssets = mainAssets.filter(asset => !asset.selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Ambient background effects - matching options page */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
      
      {/* Header */}
      <ViewerHeader onClose={() => navigate('/')} />

      {/* Main content */}
      <div className="container mx-auto px-4 pb-20 mt-6 relative z-10">
        {/* Property Address */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">{address}</h2>
          <p className="text-gray-400">Property Analysis Results</p>
          <div className="mt-2">
            <Badge className="bg-tiptop-purple text-white">
              Potential Income: ${totalPotentialIncome}/month
            </Badge>
          </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {/* Rooftop */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Rooftop</h3>
                <p className="text-xl font-bold">{analysisResults.rooftop.area} sq ft</p>
                <div className="mt-1 text-sm">
                  {analysisResults.rooftop.type && <p>Type: {analysisResults.rooftop.type}</p>}
                  <p>Solar: {analysisResults.rooftop.solarCapacity}kW</p>
                  <div className="flex justify-between items-center">
                    <p className="text-green-400">${analysisResults.rooftop.revenue}/month</p>
                    {analysisResults.rooftop.solarPotential && (
                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                        Solar Ready
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Provider Recommendations */}
                {analysisResults.rooftop?.providers && analysisResults.rooftop.providers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Recommended Providers:</p>
                    {analysisResults.rooftop.providers.slice(0, 2).map((provider, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{provider.name}</span>
                        {provider.url && (
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tiptop-purple hover:underline flex items-center"
                          >
                            <span className="mr-1">Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Garden */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Garden</h3>
                <p className="text-xl font-bold">{analysisResults.garden.area} sq ft</p>
                <div className="mt-1 text-sm">
                  <div className="flex justify-between items-center">
                    <p>Opportunity: {analysisResults.garden.opportunity}</p>
                    <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      {analysisResults.garden.opportunity}
                    </Badge>
                  </div>
                  <p className="text-green-400">${analysisResults.garden.revenue}/month</p>
                </div>
                
                {/* Provider Recommendations */}
                {analysisResults.garden?.providers && analysisResults.garden.providers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Recommended Platforms:</p>
                    {analysisResults.garden.providers.slice(0, 2).map((provider, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{provider.name}</span>
                        {provider.url && (
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tiptop-purple hover:underline flex items-center"
                          >
                            <span className="mr-1">Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Parking */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Parking</h3>
                <p className="text-xl font-bold">{analysisResults.parking.spaces} spaces</p>
                <div className="mt-1 text-sm">
                  <div className="flex justify-between items-center">
                    <p>Rate: ${analysisResults.parking.rate}/day</p>
                    {analysisResults.parking.evChargerPotential && (
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                        EV Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-green-400">${analysisResults.parking.revenue}/month</p>
                </div>
                
                {/* Provider Recommendations */}
                {analysisResults.parking?.providers && analysisResults.parking.providers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Recommended Platforms:</p>
                    {analysisResults.parking.providers.slice(0, 2).map((provider, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{provider.name}</span>
                        {provider.url && (
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tiptop-purple hover:underline flex items-center"
                          >
                            <span className="mr-1">Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Pool (if present) */}
              {analysisResults.pool && analysisResults.pool.present && (
                <Card className="bg-black/50 border-white/5 p-4">
                  <h3 className="text-sm font-medium text-gray-400">Swimming Pool</h3>
                  <p className="text-xl font-bold">{analysisResults.pool.area} sq ft</p>
                  <div className="mt-1 text-sm">
                    <p>Type: {analysisResults.pool.type}</p>
                    <p className="text-green-400">${analysisResults.pool.revenue}/month</p>
                  </div>
                  
                  {/* Provider Recommendations */}
                  {analysisResults.pool?.providers && analysisResults.pool.providers.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Rental Platforms:</p>
                      {analysisResults.pool.providers.slice(0, 2).map((provider, idx) => (
                        <div key={idx} className="flex justify-between text-xs mb-1">
                          <span>{provider.name}</span>
                          {provider.url && (
                            <a 
                              href={provider.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-tiptop-purple hover:underline flex items-center"
                            >
                              <span className="mr-1">Visit</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
              
              {/* Storage */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Storage</h3>
                <p className="text-xl font-bold">{analysisResults.storage.volume} cu ft</p>
                <div className="mt-1 text-sm">
                  <p className="text-green-400">${analysisResults.storage.revenue}/month</p>
                </div>
                
                {/* Provider Recommendations */}
                {analysisResults.storage?.providers && analysisResults.storage.providers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Recommended Platforms:</p>
                    {analysisResults.storage.providers.slice(0, 2).map((provider, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{provider.name}</span>
                        {provider.url && (
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tiptop-purple hover:underline flex items-center"
                          >
                            <span className="mr-1">Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Short-term Rental */}
              <Card className="bg-black/50 border-white/5 p-4">
                <h3 className="text-sm font-medium text-gray-400">Short-Term Rental</h3>
                <p className="text-xl font-bold">${analysisResults.shortTermRental.nightlyRate}/night</p>
                <div className="mt-1 text-sm">
                  <p className="text-green-400">${analysisResults.shortTermRental.monthlyProjection}/month</p>
                </div>
                
                {/* Provider Recommendations */}
                {analysisResults.shortTermRental?.providers && analysisResults.shortTermRental.providers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Recommended Platforms:</p>
                    {analysisResults.shortTermRental.providers.slice(0, 2).map((provider, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{provider.name}</span>
                        {provider.url && (
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tiptop-purple hover:underline flex items-center"
                          >
                            <span className="mr-1">Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
            
            {/* Top Opportunities */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Top Monetization Opportunities</h3>
              <div className="space-y-2">
                {analysisResults.topOpportunities.map((opp, i) => (
                  <div key={i} className="bg-white/10 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium flex items-center">
                          {opp.title}
                          {opp.provider && (
                            <span className="text-xs bg-tiptop-purple/30 text-tiptop-purple rounded px-2 py-0.5 ml-2">
                              {opp.provider}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-400">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        {opp.setupCost > 0 && (
                          <p className="text-xs text-gray-400">Setup: ${opp.setupCost}</p>
                        )}
                        {opp.roi > 0 && (
                          <p className="text-xs text-gray-400">ROI: {opp.roi} months</p>
                        )}
                        <span className="text-green-400 font-bold">${opp.monthlyRevenue}/mo</span>
                      </div>
                    </div>
                    
                    {opp.formFields && opp.formFields.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Required Setup Information:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {opp.formFields.slice(0, 4).map((field, idx) => (
                            <div key={idx} className="bg-white/5 p-1 rounded">
                              <span className="text-gray-300">{field.label}: </span>
                              <span className="text-white">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
        
        {/* Summary Section */}
        <div className="mt-8">
          <div className="bg-background/40 backdrop-blur-xl rounded-lg border border-border/20 p-6">
            <h2 className="text-xl font-bold mb-6 text-center">Summary</h2>
            
            {/* Selected Assets */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Selected Assets</h3>
              <div className="space-y-3">
                {selectedAssets.map((asset, index) => (
                  <Card key={index} className="bg-green-500/10 border-green-500/30 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-400 mr-3" />
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-400">Ready for setup</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${asset.revenue}/month</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Unselected Assets */}
            {unselectedAssets.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-400">Available Assets</h3>
                <div className="space-y-3">
                  {unselectedAssets.map((asset, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 p-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Plus className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-400">Click to add</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 font-bold">${asset.revenue}/month</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Complete & Authenticate Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
              >
                Complete & Authenticate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
