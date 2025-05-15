
import { useState, useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const HomeModelViewer = () => {
  const { status, progress } = useModelGeneration();
  const { analysisResults, isGeneratingAnalysis } = useGoogleMap();
  const [isVisible, setIsVisible] = useState(false);
  
  const isGenerating = isGeneratingAnalysis || status === 'generating';
  const isComplete = !isGenerating && analysisResults;
  
  // Determine if we should show the component
  useEffect(() => {
    if (isGenerating || isComplete) {
      setIsVisible(true);
    }
  }, [isGenerating, isComplete]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto mt-8 mb-12 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 relative"
    >
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            {isGenerating ? 
              "Analyzing Your Property..." : 
              <><Check className="text-green-500 h-6 w-6 mr-2" />Property Analysis Complete</>
            }
          </h2>
          <p className="text-sm text-gray-400">
            {isGenerating 
              ? "Please wait while our AI analyzes your property" 
              : "View your property's monetization insights below"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(false)} 
          className="text-gray-400 hover:text-white"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Show loading state or analysis results */}
      {isGenerating ? (
        <div className="p-4 md:p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
          </div>
          <p className="text-white">Analyzing property images and data...</p>
        </div>
      ) : analysisResults ? (
        <div className="p-4 md:p-6">
          {/* Property Type and Summary */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-2">Property Analysis</h3>
            <p className="text-gray-300"><span className="font-semibold">Type:</span> {analysisResults.propertyType}</p>
            
            {analysisResults.imageAnalysisSummary && (
              <p className="text-gray-300 mt-2 italic text-sm">{analysisResults.imageAnalysisSummary}</p>
            )}
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {analysisResults.rooftop && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Roof Area</p>
                <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area} sq ft</p>
                <p className="text-xs text-tiptop-purple">${analysisResults.rooftop.revenue}/mo</p>
              </div>
            )}
            {analysisResults.garden && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Garden Area</p>
                <p className="text-lg font-semibold text-white">{analysisResults.garden.area} sq ft</p>
                <p className="text-xs text-tiptop-purple">${analysisResults.garden.revenue}/mo</p>
              </div>
            )}
            {analysisResults.parking && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Parking</p>
                <p className="text-lg font-semibold text-white">{analysisResults.parking.spaces} spaces</p>
                <p className="text-xs text-tiptop-purple">${analysisResults.parking.revenue}/mo</p>
              </div>
            )}
            {analysisResults.storage && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Storage</p>
                <p className="text-lg font-semibold text-white">{analysisResults.storage.volume} cu ft</p>
                <p className="text-xs text-tiptop-purple">${analysisResults.storage.revenue}/mo</p>
              </div>
            )}
          </div>
          
          {/* Top Opportunities Section */}
          {analysisResults.topOpportunities && analysisResults.topOpportunities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-white mb-2">Top Opportunities</h3>
              <div className="space-y-2">
                {analysisResults.topOpportunities.slice(0, 3).map((opp, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                    <div className="flex items-center">
                      <span className="text-tiptop-purple font-medium">{opp.title}</span>
                    </div>
                    <span className="text-sm text-green-400">${opp.monthlyRevenue}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default HomeModelViewer;
