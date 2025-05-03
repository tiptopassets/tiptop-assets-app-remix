
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
      className="mb-8 z-10 relative"
    >
      <Card className="overflow-hidden border-none relative">
        {/* Enhanced multi-layered background for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-tiptop-purple/70 to-purple-600/60 rounded-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 rounded-lg backdrop-blur-xl"></div>
        
        {/* Outer glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-xl blur-md -z-10"></div>
        
        {/* Advanced light reflection effects */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/40 to-transparent rounded-t-lg"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black/20 to-transparent rounded-b-lg"></div>
        
        {/* Left-to-right light sweep animation */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -inset-[100%] animate-[shimmer_8s_infinite_linear] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        {/* Diagonal highlight streaks */}
        <div className="absolute -top-[150%] -left-[50%] w-[200%] h-[300%] rotate-[30deg] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        
        <CardContent className="p-6 relative z-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              <span className="relative">
                Property Summary
                {/* Text glow effect */}
                <span className="absolute inset-0 blur-sm text-white/70">Property Summary</span>
              </span>
            </h2>
            <div className="text-right">
              <div className="text-lg text-gray-100">Selected Monthly Income</div>
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg relative">
                <span className="relative">
                  ${selectedAssetsCount ? totalMonthlyIncome : 0}
                  {/* Text glow effect */}
                  <span className="absolute inset-0 blur-sm text-white/70">${selectedAssetsCount ? totalMonthlyIncome : 0}</span>
                </span>
                <span className="text-base text-gray-300 ml-2">out of ${totalPotentialIncome} possible</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-md rounded-lg p-4 border border-white/30 shadow-lg relative overflow-hidden">
            {/* Inner panel reflections */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
            
            <h3 className="text-lg font-medium text-white mb-3 relative z-10">
              Property Details:
              <span className="absolute bottom-0 left-0 w-12 h-px bg-gradient-to-r from-white/80 to-transparent"></span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-gray-100"><span className="font-medium text-white/90">Type:</span> {analysisResults.propertyType}</p>
                <p className="text-gray-100"><span className="font-medium text-white/90">Amenities:</span> {analysisResults.amenities.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-100"><span className="font-medium text-white/90">Roof Area:</span> {analysisResults.rooftop.area} sq ft</p>
                <p className="text-gray-100"><span className="font-medium text-white/90">Parking Spaces:</span> {analysisResults.parking.spaces}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <p className="mb-3 text-gray-100">This {analysisResults.propertyType} property offers excellent monetization potential through multiple assets.</p>
            <div className="relative">
              <p className="text-lg font-medium text-white/90 bg-white/15 backdrop-blur-md p-3 rounded-lg border border-white/30 shadow-lg relative overflow-hidden">
                {/* Inner reflections for message box */}
                <span className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg"></span>
                <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-lg"></span>
                
                <span className="relative z-10">
                  Select the opportunities below that you'd like to pursue to calculate your potential income.
                </span>
              </p>
              
              {/* Pulsing glow effect around the message box */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-lg blur animate-pulse-glow -z-10"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertySummaryCard;
