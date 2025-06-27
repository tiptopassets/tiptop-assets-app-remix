import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/asset-results/AssetResultList';
import ModelGenerationSheet from '@/components/ModelGenerationSheet';
import HomeModelViewer from '@/components/home-model-viewer';
import DataSyncNotification from '@/components/DataSyncNotification';
import JourneyTracker from '@/components/JourneyTracker';
import { SatelliteMonitor } from '@/components/satellite/SatelliteMonitor';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterCarousel from '@/components/FooterCarousel';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAnalyzing, analysisComplete, address, analysisResults } = useGoogleMap();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showingFormSection, setShowingFormSection] = useState(false);
  const isMobile = useIsMobile();
  const hasAddress = !!address;
  const { user, loading } = useAuth();

  // Collapse UI elements when analysis is complete
  useEffect(() => {
    setIsCollapsed(analysisComplete);
  }, [analysisComplete]);

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Journey Tracker */}
      <JourneyTracker />

      {/* Google Map as background */}
      <GoogleMap />

      {/* Data Sync Notification Handler */}
      <DataSyncNotification />

      {/* Content overlay - flex-1 to take available space */}
      <div className="relative z-10 flex-1 flex flex-col items-center">
        {/* Header - Responsive */}
        <header className="w-full p-3 sm:p-4 md:p-6 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold text-tiptop-purple hover:scale-105 transition-transform flex items-center">
            tiptop
          </Link>
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            <Link
              to="/submit-property"
              className="glass-effect px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 sm:gap-2 text-white hover:scale-105 transition-transform text-xs sm:text-sm md:text-base relative"
            >
              <PlusCircle size={isMobile ? 12 : 16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="text-gray-100">{isMobile ? 'Submit' : 'Submit Property'}</span>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-sm -z-10"></div>
            </Link>
            <Link 
              to="/dashboard" 
              className="glass-effect px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 sm:gap-2 text-white hover:scale-105 transition-transform text-xs sm:text-sm md:text-base relative"
            >
              <span className="text-gray-100">Dashboard</span>
              {user && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-sm -z-10"></div>
            </Link>
          </div>
        </header>

        {/* Main content - flex-1 to take available space */}
        <main className="flex-1 w-full flex flex-col items-center justify-start px-3 sm:px-4 md:px-6 transition-all duration-500">
          <div className={`text-center mb-4 sm:mb-6 md:mb-8 transform transition-all duration-500 ${isCollapsed ? 'scale-0 h-0 mb-0' : 'scale-100'}`}>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg px-4">
              {isAnalyzing ? "Analyzing Your Home Assets..." : "Monetize Your Home Assets"}
            </h1>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md">
            <SearchBar isCollapsed={isCollapsed} />
            {!isAnalyzing && !analysisComplete && <AnalyzeButton />}
          </div>

          {/* Real-time Satellite Monitor - shows when address is entered but analysis isn't complete */}
          {hasAddress && !analysisComplete && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md mt-6"
            >
              <SatelliteMonitor />
            </motion.div>
          )}

          {/* Asset Icons positioned responsively */}
          <div className={`w-full flex flex-col justify-center items-center ${!analysisComplete && !isAnalyzing ? (isMobile ? 'mt-6 sm:mt-8' : 'mt-12 lg:mt-16') : ''}`}>
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
          </div>

          {/* Analysis results positioned based on whether form is showing */}
          {analysisComplete && analysisResults && (
            <div className={`w-full ${showingFormSection ? 'mt-0' : 'mt-[60vh] sm:mt-[65vh] md:mt-[70vh] lg:mt-[75vh]'}`}>
              <AssetResultList 
                analysisResults={analysisResults} 
                onFormSectionToggle={setShowingFormSection}
              />
            </div>
          )}
        </main>
        
        {/* Footer with carousel - responsive spacing */}
        {!analysisComplete && !isAnalyzing && !hasAddress && (
          <footer className="w-full">
            <div className={`${isMobile ? 'py-12 sm:py-16 pb-20 sm:pb-24' : 'py-16 md:py-20 lg:py-32'}`}></div>
            <FooterCarousel />
          </footer>
        )}

        {/* 3D Model Viewer */}
        {(analysisComplete || isAnalyzing) && <HomeModelViewer />}
      </div>

      {/* Copyright footer - Always at the bottom with fixed positioning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-20 w-full py-2 sm:py-3 md:py-4 text-center px-4 mt-auto"
      >
        <p className="text-white/60 text-xs sm:text-sm backdrop-blur-sm py-1 sm:py-2 px-2 sm:px-4 rounded-full inline-block bg-black/30 border border-white/10">
          © 2025 Tiptop by Kolonia. All rights reserved.
        </p>
      </motion.div>

      {/* Model Generation Progress Sheet */}
      <ModelGenerationSheet />
    </div>
  );
};

export default Index;
