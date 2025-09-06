import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdditionalOpportunity } from "@/types/analysis";
import { glowColorMap } from "./AssetCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAssetIcon } from '@/icons/registry';
import ContinueButton from './ContinueButton';

interface EnhancedAdditionalAssetsCarouselProps {
  opportunities: AdditionalOpportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
  opportunitiesByTier: {
    high: AdditionalOpportunity[];
    medium: AdditionalOpportunity[];
    low: AdditionalOpportunity[];
  };
  opportunitiesByCategory: {
    spaceRentals: AdditionalOpportunity[];
    petServices: AdditionalOpportunity[];
    logistics: AdditionalOpportunity[];
    community: AdditionalOpportunity[];
    tech: AdditionalOpportunity[];
    homeServices?: AdditionalOpportunity[];
  };
}

const EnhancedAdditionalAssetsCarousel = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle,
  opportunitiesByTier,
  opportunitiesByCategory
}: EnhancedAdditionalAssetsCarouselProps) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const isMobile = useIsMobile();

  // Get filtered opportunities based on current filter
  const getFilteredOpportunities = () => {
    let filtered: AdditionalOpportunity[] = [];
    
    switch (filterType) {
      case "high-revenue":
        filtered = opportunitiesByTier.high;
        break;
      case "medium-revenue":
        filtered = opportunitiesByTier.medium;
        break;
      case "low-revenue":
        filtered = opportunitiesByTier.low;
        break;
      case "space-rentals":
        filtered = opportunitiesByCategory.spaceRentals;
        break;
      case "pet-services":
        filtered = opportunitiesByCategory.petServices;
        break;
      case "logistics":
        filtered = opportunitiesByCategory.logistics;
        break;
      case "community":
        filtered = opportunitiesByCategory.community;
        break;
      case "tech":
        filtered = opportunitiesByCategory.tech;
        break;
      case "home-services":
        filtered = opportunitiesByCategory.homeServices || [];
        break;
      default:
        filtered = opportunities;
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return b.monthlyRevenue - a.monthlyRevenue;
        case "roi":
          const aRoi = a.roi || (a.setupCost ? a.monthlyRevenue / (a.setupCost / 30) : 0);
          const bRoi = b.roi || (b.setupCost ? b.monthlyRevenue / (b.setupCost / 30) : 0);
          return bRoi - aRoi;
        case "setup-cost":
          return (a.setupCost || 0) - (b.setupCost || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });
  };

  const filteredOpportunities = getFilteredOpportunities();

  const getRevenueTierIcon = (revenue: number) => {
    if (revenue >= 150) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (revenue >= 50) return <Minus className="h-3 w-3 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 text-blue-500" />;
  };

  const getRevenueTierColor = (revenue: number) => {
    if (revenue >= 150) return "text-green-400";
    if (revenue >= 50) return "text-yellow-400";
    return "text-blue-400";
  };

  // Create groups for both mobile and desktop (mobile: 2 per group, desktop: 4 per group)
  const createCardGroups = (opportunities: AdditionalOpportunity[]) => {
    const groupSize = isMobile ? 2 : 4;
    const groups = [];
    for (let i = 0; i < opportunities.length; i += groupSize) {
      groups.push(opportunities.slice(i, i + groupSize));
    }
    return groups;
  };

  const cardGroups = createCardGroups(filteredOpportunities);

  const CompactCard = ({ opportunity, index }: { opportunity: AdditionalOpportunity; index: number }) => {
    const iconType = opportunity.icon as keyof typeof glowColorMap;
    const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
    const isSelected = selectedAssets.includes(opportunity.title);
    
    return (
      <div 
        className={`${isMobile ? 'w-[128px] h-[200px]' : 'h-[120px]'} rounded-xl relative cursor-pointer transition-all duration-300 overflow-hidden group`}
        onClick={() => onAssetToggle(opportunity.title)}
        style={{
          boxShadow: isSelected ? `0 4px 20px ${glowColor.replace('0.5', '0.3')}` : `0 2px 10px rgba(0,0,0,0.3)`
        }}
      >
        {/* Background Image with Icon */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            {getAssetIcon(opportunity.icon, { className: 'w-16 h-16 sm:w-20 sm:h-20 object-contain' })}
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        
        {/* Selection indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`transition-all duration-300 ${
            isSelected ? 'bg-green-500 scale-110' : 'bg-white/20 border border-white/30'
          } rounded-full p-1 shadow-lg`}>
            {isSelected ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <Plus className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-3 flex flex-col z-10">
          {/* Top: Small icon and revenue tier */}
          <div className="flex items-center justify-between mb-2">
            {getAssetIcon(opportunity.icon, { className: `${isMobile ? 'w-6 h-6' : 'w-8 h-8'} object-contain` })}
            {getRevenueTierIcon(opportunity.monthlyRevenue)}
          </div>
          
          {/* Title - moved higher and allows multiple lines */}
          <div className="flex-1 flex flex-col justify-start">
            <h3 className={`${isMobile ? 'text-sm leading-tight' : 'text-base'} font-bold text-white drop-shadow-lg mb-auto max-w-full`}>
              {opportunity.title}
            </h3>
          </div>
          
          {/* Bottom: Revenue and Provider Badge */}
          <div className="mt-auto space-y-1">
            <div className="flex items-end justify-between">
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold ${getRevenueTierColor(opportunity.monthlyRevenue)} drop-shadow-lg`}>
                ${opportunity.monthlyRevenue}/mo
              </p>
            </div>
            {/* Provider Badge - separate row to prevent cutting off */}
            {opportunity.provider && (
              <div className="flex justify-end">
                <div className="bg-white/20 backdrop-blur text-white text-xs rounded-full px-2 py-1 font-medium">
                  {opportunity.provider}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-8 sm:mt-10 md:mt-12 px-3 sm:px-4 md:px-6"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg text-center md:text-left">
        Additional Asset Opportunities
      </h2>
      
      {/* Filter and Sort Controls - Desktop */}
      <div className="hidden sm:flex flex-row flex-wrap gap-4 mb-6 glass-effect p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="setup-cost">Setup Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="ml-auto text-white text-sm">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </div>
      </div>

      {/* Mobile Stats Only */}
      <div className="sm:hidden mb-4 text-center">
        <div className="text-white text-sm">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </div>
      </div>

      {/* Category Carousel */}
      <div className="mb-4 sm:mb-6">
        <Carousel 
          className="w-full"
          opts={{
            align: "start",
            dragFree: true
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {[
              { key: "all", label: "All Opportunities" },
              { key: "high-revenue", label: "High Revenue ($200+)" },
              { key: "medium-revenue", label: "Medium Revenue ($75–$199)" },
              { key: "low-revenue", label: "Lower Revenue ($25–$74)" },
              { key: "space-rentals", label: "Space Rentals" },
              { key: "home-services", label: "Home Services" },
              { key: "pet-services", label: "Pet & Care Services" },
              { key: "logistics", label: "Logistics & Storage" },
              { key: "community", label: "Community Services" },
              { key: "tech", label: "Tech Infrastructure" }
            ].map((category) => (
              <CarouselItem key={category.key} className="pl-2 md:pl-4 basis-auto">
                <Button
                  variant={filterType === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(category.key)}
                  className={`whitespace-nowrap transition-all duration-200 ${
                    filterType === category.key
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {category.label}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      <Carousel 
        className="w-full glass-effect p-3 sm:p-4 rounded-lg"
        opts={{
          align: "start",
          loop: true
        }}
      >
        {isMobile ? (
          <CarouselContent className="py-2 -ml-2">
            {filteredOpportunities.map((opportunity, index) => (
              <CarouselItem key={opportunity.title} className="pl-2 basis-auto">
                <CompactCard opportunity={opportunity} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        ) : (
          <CarouselContent className="py-2">
            {cardGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex} className={`basis-1/2 md:basis-1/3 lg:basis-1/2`}>
                <div className={`grid grid-rows-2 gap-2`}>
                  {group.map((opportunity, index) => (
                    <CompactCard key={opportunity.title} opportunity={opportunity} index={index} />
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
        <CarouselPrevious className="left-1 bg-white/20 hover:bg-white/30 text-white" />
        <CarouselNext className="right-1 bg-white/20 hover:bg-white/30 text-white" />
      </Carousel>
      
      {/* Mobile Sort Controls - Below Cards */}
      <div className="sm:hidden mt-4 glass-effect p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="setup-cost">Setup Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-3 sm:mt-4 glass-effect p-3 sm:p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <p className="text-white/60 text-xs">Selected Assets</p>
            <p className="text-white font-bold text-sm sm:text-base md:text-lg">{selectedAssets.length}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Potential Revenue</p>
            <p className="text-tiptop-purple font-bold text-sm sm:text-base md:text-lg">
              ${filteredOpportunities
                .filter(opp => selectedAssets.includes(opp.title))
                .reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}/mo
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Total Setup Cost</p>
            <p className="text-orange-400 font-bold text-sm sm:text-base md:text-lg">
              ${filteredOpportunities
                .filter(opp => selectedAssets.includes(opp.title))
                .reduce((sum, opp) => sum + (opp.setupCost || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Available Options</p>
            <p className="text-white font-bold text-sm sm:text-base md:text-lg">{filteredOpportunities.length}</p>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="pt-2">
          <ContinueButton
            selectedCount={selectedAssets.length}
            onContinue={() => {}} // ContinueButton handles navigation internally
            selectedAssetsData={filteredOpportunities
              .filter(opp => selectedAssets.includes(opp.title))
              .map(opp => ({
                title: opp.title,
                icon: opp.icon,
                monthlyRevenue: opp.monthlyRevenue,
                setupCost: opp.setupCost || 0,
                provider: opp.provider,
                roi: opp.roi
              }))}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedAdditionalAssetsCarousel;
