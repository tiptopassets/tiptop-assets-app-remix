
import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useNavigate } from 'react-router-dom';
import { useAssetSelection } from '@/hooks/use-asset-selection';
import { AdditionalOpportunity } from '@/types/analysis';
import { LogIn } from 'lucide-react';
import AssetGrid from './asset-results/AssetGrid';
import PropertySummaryCard from './asset-results/PropertySummaryCard';
import AdditionalAssetsCarousel from './asset-results/AdditionalAssetsCarousel';
import AssetFormSection from './asset-results/AssetFormSection';
import SelectedAssetsButton from './asset-results/SelectedAssetsButton';

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
  const navigate = useNavigate();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  const {
    selectedAssets,
    selectedAssetObjects,
    showFormSection,
    totalMonthlyIncome,
    handleAssetToggle,
    handleContinue,
  } = useAssetSelection(analysisResults.topOpportunities, additionalOpportunities);
  
  const handleAuthenticateClick = () => {
    // Navigate to the options page
    navigate('/options');
  };
  
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

      {/* Main Asset Grid */}
      <AssetGrid 
        opportunities={analysisResults.topOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {/* Additional Asset Opportunities Carousel */}
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities} 
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {/* Continue Button - Only show when at least one asset is selected */}
      <SelectedAssetsButton 
        selectedAssetsCount={selectedAssets.length}
        onContinue={handleContinue}
        showFormSection={showFormSection}
      />
      
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
