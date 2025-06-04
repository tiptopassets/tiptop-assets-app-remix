
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/asset-results/AssetResultList';
import ModelGenerationSheet from '@/components/ModelGenerationSheet';
import HomeModelViewer from '@/components/home-model-viewer';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterCarousel from '@/components/FooterCarousel';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAnalyzing, analysisComplete, address, analysisResults } = useGoogleMap();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Google Map as background */}
      <GoogleMap />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center">
        {/* Header */}
        <header className="w-full p-4 md:p-6 flex justify-between items-center">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-tiptop-purple hover:scale-105 transition-transform flex items-center">
            tiptop
          </Link>
          <div className="flex gap-4">
            <Link
              to="/submit-property"
              className="glass-effect px-3 py-1 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-white hover:scale-105 transition-transform text-sm md:text-base"
            >
              <PlusCircle size={isMobile ? 16 : 20} />
              <span className="text-gray-100">Submit Property</span>
              
              {/* Glow effect for hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-sm -z-10"></div>
            </Link>
            <Link 
              to="/dashboard" 
              className="glass-effect px-3 py-1 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-white hover:scale-105 transition-transform text-sm md:text-base"
            >
              <span className="text-gray-100">Dashboard</span>
              
              {/* Glow effect for hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-sm -z-10"></div>
            </Link>
          </div>
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

          {/* Push asset cards almost to the bottom of the viewport */}
          <div className={`w-full flex flex-col justify-center items-center ${analysisComplete ? 'mt-[calc(100vh-500px)] min-h-[400px]' : 'mt-8'}`}>
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
            <AssetResultList analysisResults={analysisResults} />
          </div>

          {/* 3D Model Viewer */}
          {(analysisComplete || isAnalyzing) && <HomeModelViewer />}
        </main>
        
        {/* Footer with carousel - pushed much lower, especially on mobile */}
        {!analysisComplete && !isAnalyzing && !hasAddress && (
          <footer className="w-full mt-auto">
            <div className={`py-20 md:py-32 ${isMobile ? 'pb-36' : ''}`}></div>
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

      {/* Model Generation Progress Sheet */}
      <ModelGenerationSheet />
    </div>
  );
};

export default Index;
