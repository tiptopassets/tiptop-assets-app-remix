
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

const Footer = () => (
  <div className="w-full py-4 mt-auto text-center text-gray-300 text-sm glass-effect backdrop-blur-md">
    <div className="max-w-5xl mx-auto">
      © 2025 Tiptop by Kolonia. All rights reserved.
    </div>
  </div>
);

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
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Google Map as background */}
      <GoogleMap />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center flex-1">
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
        <main className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-6 transition-all duration-500">
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
          <div className="mt-8 w-full flex flex-col justify-center items-center">
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
            <AssetResultList />
          </div>
        </main>
        
        {/* Footer with carousel - only show when no address is entered and analysis is not complete */}
        {!analysisComplete && !isAnalyzing && !hasAddress && (
          <footer className="w-full mt-auto">
            <FooterCarousel />
          </footer>
        )}
        
        {/* Copyright Footer - Always show */}
        <Footer />
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
