
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResults } from '@/types/analysis';

interface PropertySummaryCardProps {
  analysisResults: AnalysisResults;
  totalMonthlyIncome: number;
  selectedAssetsCount: number;
  isCollapsed: boolean;
}

const PropertySummaryCard = ({
  analysisResults,
  totalMonthlyIncome,
  selectedAssetsCount,
  isCollapsed
}: PropertySummaryCardProps) => {
  // Calculate total potential income
  const calculateTotalPotential = () => {
    let total = 0;
    analysisResults.topOpportunities.forEach(opportunity => {
      total += opportunity.monthlyRevenue;
    });
    return total;
  };
  
  const totalPotentialIncome = calculateTotalPotential();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="overflow-hidden border-none relative">
        <div className="absolute inset-0 bg-gradient-to-r from-tiptop-purple/80 to-purple-600/70 rounded-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-lg"></div>
        {/* Enhanced glossy effect */}
        <div className="absolute inset-0 backdrop-blur-md rounded-lg"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">Property Summary</h2>
            <div className="text-right">
              <div className="text-lg text-gray-200">Selected Monthly Income</div>
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                ${selectedAssetsCount ? totalMonthlyIncome : 0} <span className="text-base text-gray-300">out of ${totalPotentialIncome} possible</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Property Details:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-200"><span className="font-medium">Type:</span> {analysisResults.propertyType}</p>
                <p className="text-gray-200"><span className="font-medium">Amenities:</span> {analysisResults.amenities.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-200"><span className="font-medium">Roof Area:</span> {analysisResults.rooftop.area} sq ft</p>
                <p className="text-gray-200"><span className="font-medium">Parking Spaces:</span> {analysisResults.parking.spaces}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="mb-2 text-gray-100">This {analysisResults.propertyType} property offers excellent monetization potential through multiple assets.</p>
            <p className="text-lg font-medium text-lime-300 bg-white/10 backdrop-blur-md p-3 rounded-lg mt-3 border border-white/20 shadow-lg glow-text">
              Select the opportunities below that you'd like to pursue to calculate your potential income.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertySummaryCard;
