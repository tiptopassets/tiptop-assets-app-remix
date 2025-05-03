
import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import AssetCard, { glowColorMap } from './asset-results/AssetCard';
import iconMap from './asset-results/IconMap';
import PropertySummaryCard from './asset-results/PropertySummaryCard';
import AdditionalAssetsCarousel from './asset-results/AdditionalAssetsCarousel';
import AssetFormSection from './asset-results/AssetFormSection';
import { AdditionalOpportunity, SelectedAsset } from '@/types/analysis';
import { toast } from '@/hooks/use-toast';
import { LogIn, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample additional asset opportunities
const additionalOpportunities: AdditionalOpportunity[] = [
  {
    title: "Smart Home Hub",
    icon: "wifi",
    monthlyRevenue: 25,
    description: "Rent smart home management system access to tenants.",
    formFields: [
      { type: "select", name: "hubType", label: "Hub Type", value: "Basic", options: ["Basic", "Premium", "Advanced"] },
      { type: "number", name: "connections", label: "Max Connections", value: 10 }
    ]
  },
  {
    title: "Bike Storage",
    icon: "storage",
    monthlyRevenue: 15,
    description: "Secure bike storage for apartment residents.",
    formFields: [
      { type: "number", name: "capacity", label: "Storage Capacity", value: 4 },
      { type: "select", name: "storageType", label: "Storage Type", value: "Outdoor", options: ["Indoor", "Outdoor", "Covered"] }
    ]
  },
  {
    title: "Laundry Space",
    icon: "storage",
    monthlyRevenue: 80,
    description: "Convert unused space to laundry facilities.",
    formFields: [
      { type: "number", name: "machines", label: "Number of Machines", value: 2 },
      { type: "select", name: "paymentSystem", label: "Payment System", value: "Coin", options: ["Coin", "App-based", "Card"] }
    ]
  },
  {
    title: "Pet Amenities",
    icon: "garden",
    monthlyRevenue: 40,
    description: "Pet-friendly areas with services for residents.",
    formFields: [
      { type: "select", name: "amenityType", label: "Amenity Type", value: "Play Area", options: ["Play Area", "Washing Station", "Both"] },
      { type: "number", name: "areaSize", label: "Area Size (sq ft)", value: 100 }
    ]
  },
  {
    title: "Workshop Space",
    icon: "storage",
    monthlyRevenue: 120,
    description: "Shared workshop for DIY projects and repairs.",
    formFields: [
      { type: "number", name: "toolsProvided", label: "Tools Provided", value: 5 },
      { type: "select", name: "workspaceType", label: "Workspace Type", value: "General", options: ["General", "Woodworking", "Automotive", "Electronics"] }
    ]
  },
  {
    title: "Event Space",
    icon: "garden",
    monthlyRevenue: 200,
    description: "Dedicated space for community events and gatherings.",
    formFields: [
      { type: "number", name: "capacity", label: "Capacity (people)", value: 30 },
      { type: "select", name: "amenities", label: "Included Amenities", value: "Basic", options: ["Basic", "Standard", "Premium"] }
    ]
  }
];

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing } = useGoogleMap();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showFormSection, setShowFormSection] = useState(false);
  const navigate = useNavigate();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  // Calculate total potential monthly income from selected assets
  const calculateTotalMonthlyIncome = () => {
    let total = 0;
    
    // Add from main opportunities
    analysisResults.topOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
    
    // Add from additional opportunities
    additionalOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
      
    return total;
  };

  const totalMonthlyIncome = calculateTotalMonthlyIncome();

  const handleAssetToggle = (assetTitle: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetTitle)) {
        return prev.filter(title => title !== assetTitle);
      } else {
        return [...prev, assetTitle];
      }
    });
  };
  
  const handleContinue = () => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one asset to continue",
        variant: "destructive"
      });
      return;
    }
    
    setShowFormSection(true);
    
    // Scroll to the form section
    setTimeout(() => {
      const formSection = document.getElementById('asset-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleAuthenticateClick = () => {
    // Navigate to the options page
    navigate('/options');
  };
  
  // Prepare the selected assets for the form
  const selectedAssetObjects: SelectedAsset[] = [
    ...analysisResults.topOpportunities.filter(opp => selectedAssets.includes(opp.title)),
    ...additionalOpportunities.filter(opp => selectedAssets.includes(opp.title))
  ];
  
  // Combine all opportunities for form field lookup
  const allOpportunities = [...analysisResults.topOpportunities, ...additionalOpportunities];

  return (
    <div className="w-full px-4 md:px-0 md:max-w-3xl">
      {/* Property Summary Card */}
      <PropertySummaryCard 
        analysisResults={analysisResults}
        totalMonthlyIncome={totalMonthlyIncome}
        selectedAssetsCount={selectedAssets.length}
        isCollapsed={false}
      />

      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center md:text-left"
      >
        Available Asset Opportunities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisResults.topOpportunities.map((opportunity, index) => {
          const iconType = opportunity.icon as keyof typeof iconMap;
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          const isSelected = selectedAssets.includes(opportunity.title);
          
          return (
            <AssetCard
              key={opportunity.title}
              title={opportunity.title}
              icon={opportunity.icon}
              monthlyRevenue={opportunity.monthlyRevenue}
              description={opportunity.description}
              iconComponent={iconMap[iconType]}
              isSelected={isSelected}
              onClick={() => handleAssetToggle(opportunity.title)}
              glowColor={glowColor}
            />
          );
        })}
      </div>
      
      {/* Additional Asset Opportunities Carousel */}
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities} 
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {/* Continue Button - Only show when at least one asset is selected */}
      {selectedAssets.length > 0 && !showFormSection && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button 
            onClick={handleContinue}
            className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl animate-pulse-glow"
            style={{ 
              boxShadow: '0 0 30px rgba(155, 135, 245, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="text-white drop-shadow-md">Continue with Selected Assets</span>
            <ArrowRight size={24} className="text-white drop-shadow-md" />
          </Button>
        </motion.div>
      )}
      
      {/* Additional Information Form Section */}
      {showFormSection && (
        <div id="asset-form-section">
          <AssetFormSection 
            selectedAssets={selectedAssetObjects}
            opportunities={allOpportunities}
            onComplete={handleAuthenticateClick}
          />
        </div>
      )}
    </div>
  );
};

export default AssetResultList;
