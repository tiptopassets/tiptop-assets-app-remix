
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/AssetResultList';
import { GoogleMapProvider, useGoogleMap } from '@/contexts/GoogleMapContext';
import { LogIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterCarousel from '@/components/FooterCarousel';
import { motion } from 'framer-motion';

const HomeContent = () => {
  const { isAnalyzing, analysisComplete, address } = useGoogleMap();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const hasAddress = !!address;

  // Collapse UI elements when analysis is complete
  useEffect(() => {
    setIsCollapsed(analysisComplete);
  }, [analysisComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Google Map as background */}
      <GoogleMap />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center">
        {/* Header */}
        <header className="w-full p-4 md:p-6 flex justify-between items-center">
          <div className="text-2xl md:text-3xl font-bold text-tiptop-purple">
            tiptop
          </div>
          <button className="glass-effect px-3 py-1 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-white hover:scale-105 transition-transform text-sm md:text-base">
            <LogIn size={isMobile ? 16 : 20} />
            <span className="text-gray-100">Sign in Google</span>
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full flex flex-col items-center justify-start px-4 md:px-6 transition-all duration-500">
          <div className={`text-center mb-6 md:mb-8 transform transition-all duration-500 ${isCollapsed ? 'scale-0 h-0 mb-0' : 'scale-100'}`}>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {isAnalyzing ? "Analyzing Your Home Assets..." : "Monetize Your Home Assets"}
            </h1>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-full md:max-w-md">
            <SearchBar isCollapsed={isCollapsed} />
            {!isAnalyzing && !analysisComplete && <AnalyzeButton />}
          </div>

          {/* Asset Icons and Results */}
          <div className={`mt-8 w-full flex flex-col justify-center items-center ${analysisComplete ? 'mt-4' : ''}`}>
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
            <AssetResultList />
          </div>
        </main>
        
        {/* Footer with carousel - pushed much lower */}
        {!analysisComplete && !isAnalyzing && !hasAddress && (
          <footer className="w-full mt-auto">
            <div className="py-20 md:py-32"></div> {/* Extra spacing to push footer down */}
            <FooterCarousel />
          </footer>
        )}
        
        {/* Copyright footer - always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full py-4 text-center"
        >
          <p className="text-white/60 text-xs backdrop-blur-sm py-2 px-4 rounded-full inline-block bg-black/30 border border-white/10">
            © 2025 Tiptop by Kolonia. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <GoogleMapProvider>
      <HomeContent />
    </GoogleMapProvider>
  );
};

export default Index;
