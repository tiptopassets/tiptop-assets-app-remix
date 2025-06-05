
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
  const [sortBy, setSortBy] = useState<string>("revenue");

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
    if (revenue >= 150) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
    if (revenue >= 50) return <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
  };

  const getRevenueTierColor = (revenue: number) => {
    if (revenue >= 150) return "text-green-400";
    if (revenue >= 50) return "text-yellow-400";
    return "text-blue-400";
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
      
      {/* Filter and Sort Controls - Responsive */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 glass-effect p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Filter:</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Opportunities</SelectItem>
              <SelectItem value="high-revenue">High Revenue ($150+)</SelectItem>
              <SelectItem value="medium-revenue">Medium Revenue ($50-$149)</SelectItem>
              <SelectItem value="low-revenue">Lower Revenue ($15-$49)</SelectItem>
              <SelectItem value="space-rentals">Space Rentals</SelectItem>
              <SelectItem value="pet-services">Pet Services</SelectItem>
              <SelectItem value="logistics">Logistics & Storage</SelectItem>
              <SelectItem value="community">Community Services</SelectItem>
              <SelectItem value="tech">Tech Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-white text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="setup-cost">Setup Cost</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="sm:ml-auto text-white text-xs sm:text-sm">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </div>
      </div>
      
      <Carousel 
        className="w-full glass-effect p-3 sm:p-4 rounded-lg"
        opts={{
          align: "start",
          loop: true
        }}
      >
        <CarouselContent className="py-2">
          {filteredOpportunities.map((opportunity, index) => {
            const iconType = opportunity.icon as keyof typeof glowColorMap;
            const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
            const isSelected = selectedAssets.includes(opportunity.title);
            
            return (
              <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div 
                  className={`h-full min-h-[200px] sm:min-h-[220px] md:min-h-[240px] rounded-lg p-3 sm:p-4 flex flex-col glass-effect relative cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-white/70 shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.8')}, transparent)`,
                    boxShadow: isSelected ? `0 5px 20px ${glowColor.replace('0.5', '0.7')}` : `0 4px 15px ${glowColor}`
                  }}
                  onClick={() => onAssetToggle(opportunity.title)}
                >
                  {/* Selection indicator - Responsive */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col items-center">
                    <div className={`transition-all duration-300 ${
                      isSelected ? 'bg-white' : 'bg-white/30 border border-white/50'
                    } rounded-full p-1 sm:p-1.5 shadow-lg z-20`}>
                      {isSelected ? (
                        <Check className="h-3 w-3 text-tiptop-purple" />
                      ) : (
                        <Plus className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Icon - Responsive */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 glass-effect rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                    <img 
                      src={`/lovable-uploads/${
                        iconType === 'wifi' ? 'f5bf9c32-688f-4a52-8a95-4d803713d2ff.png' : 
                        iconType === 'storage' ? '417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png' :
                        'ef52333e-7ea8-4692-aeed-9a222da95b75.png'
                      }`}
                      alt={`${opportunity.title} Icon`}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
                      style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                  </div>
                  
                  {/* Title and Revenue with Tier Indicator - Responsive */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      {getRevenueTierIcon(opportunity.monthlyRevenue)}
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white line-clamp-2">
                        {opportunity.title}
                      </h3>
                    </div>
                    <p className={`text-lg sm:text-xl font-bold mb-1 ${getRevenueTierColor(opportunity.monthlyRevenue)}`}>
                      ${opportunity.monthlyRevenue}/mo
                    </p>
                  </div>
                  
                  {/* Description - Responsive */}
                  <p className="text-xs text-gray-200 mb-2 sm:mb-3 flex-grow line-clamp-3">
                    {opportunity.description}
                  </p>
                  
                  {/* Provider and Setup Info - Responsive */}
                  <div className="space-y-1 sm:space-y-2 mt-auto">
                    {opportunity.provider && (
                      <div className="inline-block bg-white/20 text-white text-xs rounded-full px-2 py-1 font-medium">
                        via {opportunity.provider}
                      </div>
                    )}
                    
                    {opportunity.setupCost && (
                      <div className="flex justify-between text-xs text-white/80">
                        <span>Setup: ${opportunity.setupCost}</span>
                        {opportunity.roi && (
                          <span>{opportunity.roi}mo ROI</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced glossy effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-1 bg-white/20 hover:bg-white/30 text-white" />
        <CarouselNext className="right-1 bg-white/20 hover:bg-white/30 text-white" />
      </Carousel>
      
      {/* Summary Stats - Responsive */}
      <div className="mt-3 sm:mt-4 glass-effect p-3 sm:p-4 rounded-lg">
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
      </div>
    </motion.div>
  );
};

export default EnhancedAdditionalAssetsCarousel;
