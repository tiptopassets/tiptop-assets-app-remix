
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, TrendingUp, Clock, DollarSign, Star, Users, Home, Wifi, TreePine, Package } from 'lucide-react';
import { AdditionalOpportunity } from '@/types/analysis';

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

const categoryIcons = {
  spaceRentals: Home,
  petServices: Users,
  logistics: Package,
  community: TreePine,
  tech: Wifi
};

const categoryLabels = {
  spaceRentals: 'Space Rentals',
  petServices: 'Pet Services',
  logistics: 'Logistics',
  community: 'Community',
  tech: 'Technology'
};

const tierColors = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const difficultyColors = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400'
};

const EnhancedAdditionalAssetsCarousel: React.FC<EnhancedAdditionalAssetsCarouselProps> = ({
  opportunities,
  selectedAssets,
  onAssetToggle,
  opportunitiesByTier,
  opportunitiesByCategory
}) => {
  const [activeView, setActiveView] = useState<'tier' | 'category'>('tier');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const renderOpportunityCard = (opportunity: AdditionalOpportunity) => {
    const isSelected = selectedAssets.includes(opportunity.title);
    const IconComponent = opportunity.icon;

    return (
      <motion.div
        key={opportunity.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card 
          className={`glass-effect cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
            isSelected 
              ? 'border-tiptop-purple bg-tiptop-purple/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
          onClick={() => onAssetToggle(opportunity.title)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tierColors[opportunity.tier || 'low']}`}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">{opportunity.title}</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {opportunity.provider}
                  </CardDescription>
                </div>
              </div>
              {isSelected ? (
                <CheckCircle className="text-tiptop-purple" size={24} />
              ) : (
                <Circle className="text-gray-400" size={24} />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {opportunity.description && (
              <p className="text-gray-300 text-sm">{opportunity.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-400" />
                <span className="text-white font-medium">${opportunity.monthlyRevenue}/mo</span>
              </div>
              
              {opportunity.setupCost !== undefined && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-400" />
                  <span className="text-white font-medium">${opportunity.setupCost} setup</span>
                </div>
              )}
              
              {opportunity.timeCommitment && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-white text-sm">{opportunity.timeCommitment}</span>
                </div>
              )}
              
              {opportunity.roi && (
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-white text-sm">ROI: {opportunity.roi}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {opportunity.tier && (
                <Badge className={tierColors[opportunity.tier]}>
                  {opportunity.tier.charAt(0).toUpperCase() + opportunity.tier.slice(1)} Revenue
                </Badge>
              )}
              
              {opportunity.difficulty && (
                <Badge className={difficultyColors[opportunity.difficulty]}>
                  {opportunity.difficulty}
                </Badge>
              )}
            </div>
            
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2">Requirements:</p>
                <div className="flex flex-wrap gap-1">
                  {opportunity.requirements.slice(0, 3).map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {opportunity.requirements.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{opportunity.requirements.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderTierView = () => (
    <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
      <TabsList className="grid w-full grid-cols-4 glass-effect">
        <TabsTrigger value="all">All Tiers</TabsTrigger>
        <TabsTrigger value="high">High Revenue</TabsTrigger>
        <TabsTrigger value="medium">Medium Revenue</TabsTrigger>
        <TabsTrigger value="low">Low Revenue</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(renderOpportunityCard)}
        </div>
      </TabsContent>
      
      <TabsContent value="high" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunitiesByTier.high.map(renderOpportunityCard)}
        </div>
      </TabsContent>
      
      <TabsContent value="medium" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunitiesByTier.medium.map(renderOpportunityCard)}
        </div>
      </TabsContent>
      
      <TabsContent value="low" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunitiesByTier.low.map(renderOpportunityCard)}
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderCategoryView = () => (
    <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
      <TabsList className="grid w-full grid-cols-6 glass-effect">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="spaceRentals">Space</TabsTrigger>
        <TabsTrigger value="petServices">Pets</TabsTrigger>
        <TabsTrigger value="logistics">Logistics</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
        <TabsTrigger value="tech">Tech</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(renderOpportunityCard)}
        </div>
      </TabsContent>
      
      {Object.entries(opportunitiesByCategory).map(([category, categoryOpportunities]) => (
        <TabsContent key={category} value={category} className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { 
              size: 24, 
              className: "text-tiptop-purple" 
            })}
            <h3 className="text-xl font-bold text-white">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryOpportunities.map(renderOpportunityCard)}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="glass-effect p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Additional Opportunities</h2>
            <p className="text-gray-300">
              Explore more ways to monetize your property beyond the main analysis
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant={activeView === 'tier' ? 'default' : 'outline'}
              onClick={() => {
                setActiveView('tier');
                setSelectedFilter('all');
              }}
              className="glass-effect"
            >
              By Revenue
            </Button>
            <Button
              variant={activeView === 'category' ? 'default' : 'outline'}
              onClick={() => {
                setActiveView('category');
                setSelectedFilter('all');
              }}
              className="glass-effect"
            >
              By Category
            </Button>
          </div>
        </div>
        
        {activeView === 'tier' ? renderTierView() : renderCategoryView()}
      </div>
    </motion.div>
  );
};

export default EnhancedAdditionalAssetsCarousel;
