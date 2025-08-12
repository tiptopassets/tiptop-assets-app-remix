import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { useToast } from '@/hooks/use-toast';
import { useAssetSelection } from '@/hooks/useAssetSelection';
import { SelectedAsset } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './ModelViewerSummary.css';
import { getAssetIcon as registryGetAssetIcon } from '@/icons/registry';


const ModelViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assetSelections } = useUserAssetSelections();
  const { saveSelection } = useAssetSelection();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Centralized icon from registry
  const getAssetIcon = (assetType: string) =>
    registryGetAssetIcon(assetType, { className: 'w-8 h-8 md:w-12 md:h-12 object-contain' });

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
      
      // Use passed selected assets data if available
      if (data.selectedAssetsData && data.selectedAssetsData.length > 0) {
        console.log('📋 Using passed selected assets data:', data.selectedAssetsData);
        setSelectedAssetsData(data.selectedAssetsData);
        setSelectedAssets(data.selectedAssetsData.map((asset: SelectedAsset) => asset.title));
      }
      
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
    // Fallback: Initialize from database selections if no passed data
    if (assetSelections.length > 0 && selectedAssetsData.length === 0) {
      const selectedAssetTypes = assetSelections.map(selection => selection.asset_type);
      setSelectedAssets(selectedAssetTypes);
      
      // Convert database selections to SelectedAsset format
      const convertedData = assetSelections.map(selection => ({
        title: selection.asset_type,
        icon: 'default',
        monthlyRevenue: selection.monthly_revenue,
        provider: undefined,
        setupCost: selection.setup_cost,
        roi: selection.roi_months,
        formData: selection.asset_data
      }));
      
      setSelectedAssetsData(convertedData);
    }
  }, [assetSelections, selectedAssetsData.length]);

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

  // Get main assets from analysis results and convert to SelectedAsset format
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
  ].map(asset => ({
    ...asset,
    title: asset.name,
    icon: 'default',
    monthlyRevenue: asset.revenue,
    provider: undefined,
    formData: {}
  }));

  // Use selected assets data if available, otherwise convert mainAssets to SelectedAsset format
  const selectedAssetDataToShow = selectedAssetsData.length > 0 
    ? selectedAssetsData
    : mainAssets.filter(asset => 
        selectedAssets.some(selectedId => 
          selectedId.toLowerCase().includes(asset.id.toLowerCase()) ||
          asset.id.toLowerCase().includes(selectedId.toLowerCase())
        )
      );

  // Filter out selected assets from available assets to avoid duplicates
  const unselectedAssets = mainAssets.filter(asset => 
    !selectedAssets.some(selectedId => 
      selectedId.toLowerCase().includes(asset.id.toLowerCase()) ||
      asset.id.toLowerCase().includes(selectedId.toLowerCase())
    ) && !selectedAssetDataToShow.some(selectedAsset => 
      selectedAsset.title.toLowerCase().includes(asset.title.toLowerCase()) ||
      asset.title.toLowerCase().includes(selectedAsset.title.toLowerCase())
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
        setSelectedAssetsData(prev => prev.filter(item => item.title !== asset.title));
      } else {
        // Add to selection
        setSelectedAssets(prev => [...prev, asset.id]);
        setSelectedAssetsData(prev => [...prev, {
          title: asset.title,
          icon: 'default',
          monthlyRevenue: asset.monthlyRevenue,
          provider: undefined,
          setupCost: asset.setupCost || 0,
          roi: undefined,
          formData: {}
        }]);
        
        // Save the selection
        await saveSelection(
          asset.id,
          asset,
          asset.monthlyRevenue,
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

  const totalSelectedRevenue = selectedAssetDataToShow.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);

  return (
    <div className="summary-container">
      {/* Background effects */}
      <div className="summary-background-effects" />
      <div className="summary-glow-top" />
      <div className="summary-glow-bottom" />
      
      {/* Header with tiptop logo */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-tiptop-purple">tiptop</h1>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-gray-300 hover:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </header>

      {/* Main content */}
      <div className="summary-content">
        <div className="container mx-auto px-4 pb-20 mt-2 md:mt-6 max-w-4xl">
          {/* Property Address */}
          <div className="mb-4 md:mb-6 text-center">
            <h2 className="text-lg md:text-2xl font-bold leading-tight">{address}</h2>
            <div className="mt-2">
              <Badge className="bg-tiptop-purple text-white text-xs md:text-sm">
                Selected Income: ${totalSelectedRevenue}/month
              </Badge>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mt-4 md:mt-8">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-center text-white">Summary</h2>
              
              {/* Selected Assets */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-green-400">Selected Assets</h3>
                <div className="space-y-2 md:space-y-3">
                  {selectedAssetDataToShow.map((asset, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ translateY: -2 }}
                      className="backdrop-blur-sm bg-white/5 border border-green-400/30 rounded-xl p-3 md:p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 md:mr-4 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                            {getAssetIcon(asset.title)}
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400 mr-2 md:mr-3" />
                            <div>
                              <h4 className="font-medium text-white text-sm md:text-base">{asset.title}</h4>
                              <p className="text-xs md:text-sm text-gray-300">
                                {asset.title === 'Internet Bandwidth Sharing' ? 'Share unused bandwidth for passive income' :
                                 asset.title === 'Personal Storage Rental' ? 'Rent out personal storage space within your unit' :
                                 `Asset: ${asset.title}`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm md:text-base">${asset.monthlyRevenue}/month</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Available Assets */}
              {unselectedAssets.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-400">Available Assets</h3>
                  <div className="space-y-2 md:space-y-3">
                    {unselectedAssets.map((asset, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ translateY: -2 }}
                        className="backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer rounded-xl p-3 md:p-4 transition-all duration-300"
                        onClick={() => handleAssetToggle(asset)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3 md:mr-4 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                              {getAssetIcon(asset.title)}
                            </div>
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-2 md:mr-3" />
                              <div>
                                <h4 className="font-medium text-white text-sm md:text-base">{asset.title}</h4>
                                <p className="text-xs md:text-sm text-gray-300">{asset.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-300 font-bold text-sm md:text-base">${asset.monthlyRevenue}/month</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Complete & Authenticate Button */}
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/options')}
                  className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-6 py-4 md:px-8 md:py-6 rounded-full text-lg md:text-xl font-semibold text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
                  }}
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
