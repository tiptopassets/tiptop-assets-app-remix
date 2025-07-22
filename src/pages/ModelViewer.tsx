
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { useToast } from '@/hooks/use-toast';
import { useAssetSelection } from '@/hooks/useAssetSelection';
import ViewerHeader from '@/components/model-viewer/ViewerHeader';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import './ModelViewerSummary.css';

const ModelViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assetSelections } = useUserAssetSelections();
  const { saveSelection } = useAssetSelection();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from navigation state or sessionStorage
    let data = location.state;
    
    if (!data) {
      const storedData = sessionStorage.getItem('model-viewer-data');
      if (storedData) {
        try {
          data = JSON.parse(storedData);
        } catch (e) {
          console.error('Error parsing stored data:', e);
        }
      }
    }

    if (data && data.analysisResults && data.address) {
      setAnalysisResults(data.analysisResults);
      setAddress(data.address);
      setIsLoading(false);
    } else {
      console.log('No analysis data found, redirecting to home...');
      toast({
        title: "No Property Data Available",
        description: "Please complete the property analysis first",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [location.state, navigate, toast]);

  useEffect(() => {
    // Initialize selected assets from user selections
    if (assetSelections.length > 0) {
      const selectedAssetTypes = assetSelections.map(selection => selection.asset_type);
      setSelectedAssets(selectedAssetTypes);
    }
  }, [assetSelections]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="summary-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading property summary...</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no analysis results
  if (!analysisResults || !address) {
    return (
      <div className="summary-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl mb-4">No property analysis available</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  // Get main assets from analysis results
  const mainAssets = [
    { 
      id: 'rooftop_solar', 
      name: 'Rooftop Solar', 
      revenue: analysisResults.rooftop.revenue, 
      description: `${analysisResults.rooftop.area} sq ft rooftop with ${analysisResults.rooftop.solarCapacity}kW solar capacity`,
      setupCost: 0,
      area: analysisResults.rooftop.area
    },
    { 
      id: 'garden_space', 
      name: 'Garden Space', 
      revenue: analysisResults.garden.revenue, 
      description: `${analysisResults.garden.area} sq ft garden space for ${analysisResults.garden.opportunity}`,
      setupCost: 0,
      area: analysisResults.garden.area
    },
    { 
      id: 'parking_space', 
      name: 'Parking Space', 
      revenue: analysisResults.parking.revenue, 
      description: `${analysisResults.parking.spaces} parking spaces at $${analysisResults.parking.rate}/day`,
      setupCost: 0,
      spaces: analysisResults.parking.spaces
    },
    { 
      id: 'storage_space', 
      name: 'Storage Space', 
      revenue: analysisResults.storage.revenue, 
      description: `${analysisResults.storage.volume} cubic feet of storage space`,
      setupCost: 0,
      volume: analysisResults.storage.volume
    },
    { 
      id: 'short_term_rental', 
      name: 'Short-term Rental', 
      revenue: analysisResults.shortTermRental.monthlyProjection, 
      description: `$${analysisResults.shortTermRental.nightlyRate}/night rental potential`,
      setupCost: 0,
      nightlyRate: analysisResults.shortTermRental.nightlyRate
    },
    ...(analysisResults.pool?.present ? [{
      id: 'pool_rental', 
      name: 'Pool Rental', 
      revenue: analysisResults.pool.revenue, 
      description: `${analysisResults.pool.area} sq ft ${analysisResults.pool.type} pool`,
      setupCost: 0,
      area: analysisResults.pool.area
    }] : [])
  ];

  const selectedAssetData = mainAssets.filter(asset => 
    selectedAssets.some(selectedId => 
      selectedId.toLowerCase().includes(asset.id.toLowerCase()) ||
      asset.id.toLowerCase().includes(selectedId.toLowerCase())
    )
  );

  const unselectedAssets = mainAssets.filter(asset => 
    !selectedAssets.some(selectedId => 
      selectedId.toLowerCase().includes(asset.id.toLowerCase()) ||
      asset.id.toLowerCase().includes(selectedId.toLowerCase())
    )
  );

  const handleAssetToggle = async (asset: any) => {
    try {
      const isCurrentlySelected = selectedAssets.some(selectedId => 
        selectedId.toLowerCase().includes(asset.id.toLowerCase()) ||
        asset.id.toLowerCase().includes(selectedId.toLowerCase())
      );

      if (isCurrentlySelected) {
        // Remove from selection
        setSelectedAssets(prev => prev.filter(id => 
          !id.toLowerCase().includes(asset.id.toLowerCase()) &&
          !asset.id.toLowerCase().includes(id.toLowerCase())
        ));
      } else {
        // Add to selection
        setSelectedAssets(prev => [...prev, asset.id]);
        
        // Save the selection
        await saveSelection(
          asset.id,
          asset,
          asset.revenue,
          asset.setupCost || 0
        );
      }
    } catch (error) {
      console.error('Error toggling asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset selection",
        variant: "destructive"
      });
    }
  };

  const totalSelectedRevenue = selectedAssetData.reduce((sum, asset) => sum + asset.revenue, 0);

  return (
    <div className="summary-container">
      {/* Background effects */}
      <div className="summary-background-effects" />
      <div className="summary-glow-top" />
      <div className="summary-glow-bottom" />
      
      {/* Header */}
      <ViewerHeader onClose={() => navigate('/')} />

      {/* Main content */}
      <div className="summary-content">
        <div className="container mx-auto px-4 pb-20 mt-6">
          {/* Property Address */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">{address}</h2>
            <p className="text-gray-400">Property Analysis Summary</p>
            <div className="mt-2">
              <Badge className="bg-tiptop-purple text-white">
                Selected Income: ${totalSelectedRevenue}/month
              </Badge>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mt-8">
            <div className="summary-card p-6">
              <h2 className="text-xl font-bold mb-6 text-center">Summary</h2>
              
              {/* Selected Assets */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-green-400">Selected Assets</h3>
                <div className="space-y-3">
                  {selectedAssetData.map((asset, index) => (
                    <Card key={index} className="selected-asset-card p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-400">{asset.description}</p>
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
                      <Card 
                        key={index} 
                        className="available-asset-card p-4"
                        onClick={() => handleAssetToggle(asset)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Plus className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <h4 className="font-medium">{asset.name}</h4>
                              <p className="text-sm text-gray-400">{asset.description}</p>
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
    </div>
  );
};

export default ModelViewer;
