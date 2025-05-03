
import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import AssetCard, { glowColorMap } from './asset-results/AssetCard';
import iconMap from './asset-results/IconMap';
import PropertySummaryCard from './asset-results/PropertySummaryCard';
import AdditionalAssetsCarousel from './asset-results/AdditionalAssetsCarousel';
import RestrictionsCard from './asset-results/RestrictionsCard';
import { AdditionalOpportunity } from '@/types/analysis';

// Sample additional asset opportunities
const additionalOpportunities: AdditionalOpportunity[] = [
  {
    title: "Smart Home Hub",
    icon: "wifi",
    monthlyRevenue: 25,
    description: "Rent smart home management system access to tenants."
  },
  {
    title: "Bike Storage",
    icon: "storage",
    monthlyRevenue: 15,
    description: "Secure bike storage for apartment residents."
  },
  {
    title: "Laundry Space",
    icon: "storage",
    monthlyRevenue: 80,
    description: "Convert unused space to laundry facilities."
  },
  {
    title: "Pet Amenities",
    icon: "garden",
    monthlyRevenue: 40,
    description: "Pet-friendly areas with services for residents."
  },
  {
    title: "Workshop Space",
    icon: "storage",
    monthlyRevenue: 120,
    description: "Shared workshop for DIY projects and repairs."
  },
  {
    title: "Event Space",
    icon: "garden",
    monthlyRevenue: 200,
    description: "Dedicated space for community events and gatherings."
  }
];

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing } = useGoogleMap();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  // Calculate total potential monthly income from selected assets
  const totalMonthlyIncome = analysisResults.topOpportunities
    .filter(opportunity => selectedAssets.includes(opportunity.title))
    .reduce((total, opportunity) => total + opportunity.monthlyRevenue, 0);

  const handleAssetToggle = (assetTitle: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetTitle)) {
        return prev.filter(title => title !== assetTitle);
      } else {
        return [...prev, assetTitle];
      }
    });
  };

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
      <AdditionalAssetsCarousel opportunities={additionalOpportunities} />
      
      {/* Restrictions Card */}
      <RestrictionsCard restrictions={analysisResults.restrictions} />
    </div>
  );
};

export default AssetResultList;
