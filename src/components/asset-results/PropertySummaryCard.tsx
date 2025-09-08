
import React from 'react';
import { motion } from "framer-motion";
import { MapPin, DollarSign, TrendingUp, Building2, Zap } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

interface PropertySummaryCardProps {
  analysisResults: any;
  totalMonthlyIncome: number;
  totalSetupCost: number;
  selectedAssetsCount: number;
  isCollapsed: boolean;
}

const PropertySummaryCard: React.FC<PropertySummaryCardProps> = ({
  analysisResults,
  totalMonthlyIncome,
  totalSetupCost,
  selectedAssetsCount,
  isCollapsed
}) => {
  const { address } = useGoogleMap();
  
  const scrollToOpportunities = () => {
    const opportunitiesSection = document.querySelector('.asset-opportunities-grid');
    if (opportunitiesSection) {
      opportunitiesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // Determine property type display
  const getPropertyTypeDisplay = () => {
    if (!analysisResults?.propertyType) {
      return {
        icon: <Building2 className="w-5 h-5 text-purple-500" />,
        label: 'Real Estate Asset',
        description: 'Property with income potential'
      };
    }

    const type = analysisResults.propertyType.toLowerCase();
    const subType = analysisResults.subType?.toLowerCase();
    
    const getTypeIcon = (type: string) => {
      if (type === 'vacant_land') return <Building2 className="w-5 h-5 text-green-500" />;
      if (type === 'commercial') return <Building2 className="w-5 h-5 text-orange-500" />;
      if (type === 'industrial') return <Building2 className="w-5 h-5 text-red-500" />;
      if (type === 'mixed_use') return <Building2 className="w-5 h-5 text-yellow-500" />;
      if (type === 'institutional') return <Building2 className="w-5 h-5 text-indigo-500" />;
      if (type === 'agricultural') return <Building2 className="w-5 h-5 text-emerald-500" />;
      if (type === 'apartment') return <Building2 className="w-5 h-5 text-blue-500" />;
      return <Building2 className="w-5 h-5 text-purple-500" />;
    };
    
    switch (type) {
      case 'residential':
        const residentialLabel = subType ? 
          `Residential • ${subType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 
          'Residential Property';
        return {
          icon: getTypeIcon(type),
          label: residentialLabel,
          description: 'Single-family home with individual property control and various income opportunities'
        };
      case 'apartment':
        const apartmentLabel = subType === 'condominium' ? 
          'Apartment • Condominium' : 
          'Apartment • Multi-Unit Building';
        return {
          icon: getTypeIcon(type),
          label: apartmentLabel,
          description: 'Multi-unit residential building with limited individual monetization options'
        };
      case 'commercial':
        return {
          icon: getTypeIcon(type),
          label: 'Commercial Property', 
          description: 'Business property with strong revenue potential'
        };
      case 'vacant_land':
      case 'vacant land':
        return {
          icon: getTypeIcon('vacant_land'),
          label: 'Vacant Land',
          description: 'Undeveloped land with development opportunities'
        };
      case 'industrial':
        return {
          icon: getTypeIcon(type),
          label: 'Industrial Property',
          description: 'Industrial facility with specialized income potential'
        };
      case 'mixed_use':
        return {
          icon: getTypeIcon(type),
          label: 'Mixed-Use Property',
          description: 'Multi-purpose property with diverse opportunities'
        };
      case 'institutional':
        return {
          icon: getTypeIcon(type),
          label: 'Institutional Property',
          description: 'Institutional facility with limited commercial opportunities'
        };
      case 'agricultural':
        return {
          icon: getTypeIcon(type),
          label: 'Agricultural Property',
          description: 'Farmland with agricultural and alternative income opportunities'
        };
      default:
        return {
          icon: getTypeIcon(type),
          label: analysisResults.propertyType,
          description: 'Property with monetization potential'
        };
    }
  };

  const propertyDisplay = getPropertyTypeDisplay();
  const analysisRevenue = analysisResults?.totalMonthlyRevenue || 0;
  const opportunitiesCount = analysisResults?.topOpportunities?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-effect rounded-2xl p-6 mb-8 transition-all duration-500 ${
        isCollapsed ? 'scale-95 opacity-90' : 'scale-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-tiptop-purple mb-1">
              Property Analysis
            </h2>
            {address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-tiptop-purple" />
                <p className="text-sm text-white">{address}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {propertyDisplay.icon}
            <span className="text-white font-medium">{propertyDisplay.label}</span>
            <span className="text-white text-sm">• {propertyDisplay.description}</span>
          </div>

          {/* Property Type Specific Info */}
          {analysisResults?.propertyType === 'vacant_land' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">High Development Potential</span>
              </div>
              <p className="text-gray-300 text-sm">
                This vacant land offers multiple development and leasing opportunities for immediate income generation.
              </p>
            </div>
          )}

          {analysisResults?.buildingTypeWarnings && analysisResults.buildingTypeWarnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
              <p className="text-amber-300 text-sm">
                <strong>Property Restrictions:</strong> {analysisResults.buildingTypeWarnings[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={scrollToOpportunities}
          className="bg-black/20 rounded-xl p-4 text-center hover:bg-black/30 transition-colors cursor-pointer"
        >
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 text-2xl font-bold">
            ${analysisRevenue.toLocaleString()}
          </p>
          <p className="text-white text-sm">Monthly Potential</p>
        </button>

        <button 
          onClick={scrollToOpportunities}
          className="bg-black/20 rounded-xl p-4 text-center hover:bg-black/30 transition-colors cursor-pointer"
        >
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-blue-400 text-2xl font-bold">{opportunitiesCount}</p>
          <p className="text-white text-sm">Opportunities</p>
        </button>

        <button 
          onClick={scrollToOpportunities}
          className="bg-black/20 rounded-xl p-4 text-center hover:bg-black/30 transition-colors cursor-pointer"
        >
          <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 text-2xl font-bold">{selectedAssetsCount}</p>
          <p className="text-white text-sm">Selected Assets</p>
        </button>

        <div className="bg-black/20 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-orange-400 text-2xl font-bold">
            ${totalSetupCost.toLocaleString()}
          </p>
          <p className="text-white text-sm">Setup Investment</p>
        </div>
      </div>

      {/* Quick Insights */}
      {analysisResults?.keyRecommendations && analysisResults.keyRecommendations.length > 0 && (
        <div className="mt-6 p-4 bg-tiptop-purple/10 border border-tiptop-purple/20 rounded-xl">
          <h3 className="text-white font-medium mb-2">Key Recommendations</h3>
          <ul className="space-y-1">
            {analysisResults.keyRecommendations.slice(0, 2).map((rec: string, index: number) => (
              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-tiptop-purple">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PropertySummaryCard;
