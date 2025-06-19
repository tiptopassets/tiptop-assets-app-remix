
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
  
  // Determine property type display
  const getPropertyTypeDisplay = () => {
    const propertyType = analysisResults?.propertyType || 'unknown';
    const buildingType = analysisResults?.buildingTypeRestrictions?.restrictionExplanation;
    
    switch (propertyType) {
      case 'vacant_land':
        return {
          icon: <Building2 className="w-5 h-5 text-green-500" />,
          label: 'Vacant Land',
          description: buildingType?.includes('commercial') ? 'Commercial Development Site' : 'Development Opportunity'
        };
      case 'apartment':
        return {
          icon: <Building2 className="w-5 h-5 text-blue-500" />,
          label: 'Apartment',
          description: 'Multi-Unit Residential Building'
        };
      case 'single_family':
        return {
          icon: <Building2 className="w-5 h-5 text-purple-500" />,
          label: 'Single Family Home',
          description: 'Residential Property'
        };
      case 'commercial':
        return {
          icon: <Building2 className="w-5 h-5 text-orange-500" />,
          label: 'Commercial Property',
          description: 'Business/Retail Space'
        };
      default:
        return {
          icon: <Building2 className="w-5 h-5 text-gray-500" />,
          label: 'Property',
          description: 'Real Estate Asset'
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
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-tiptop-purple" />
            <h2 className="text-xl font-bold text-white">
              {address || 'Property Analysis'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {propertyDisplay.icon}
            <span className="text-white font-medium">{propertyDisplay.label}</span>
            <span className="text-gray-400 text-sm">• {propertyDisplay.description}</span>
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
        <div className="bg-black/20 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 text-2xl font-bold">
            ${analysisRevenue.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Monthly Potential</p>
        </div>

        <div className="bg-black/20 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-blue-400 text-2xl font-bold">{opportunitiesCount}</p>
          <p className="text-gray-400 text-sm">Opportunities</p>
        </div>

        <div className="bg-black/20 rounded-xl p-4 text-center">
          <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 text-2xl font-bold">{selectedAssetsCount}</p>
          <p className="text-gray-400 text-sm">Selected Assets</p>
        </div>

        <div className="bg-black/20 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-orange-400 text-2xl font-bold">
            ${totalSetupCost.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Setup Investment</p>
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
