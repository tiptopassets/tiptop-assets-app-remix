
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
import { OpenAIConnectionTest } from '@/components/OpenAIConnectionTest';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterCarousel from '@/components/FooterCarousel';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Index = () => {
  const { isAnalyzing, analysisComplete, address, analysisResults } = useGoogleMap();
  const { status } = useModelGeneration();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showingFormSection, setShowingFormSection] = useState(false);
  const isMobile = useIsMobile();
  const hasAddress = !!address;
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

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

  // Check if we should show the banner (hide during capturing, show during generating and error)
  const showBanner = status !== 'idle' && (status === 'generating' || status === 'error');

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
            {isAdmin && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="glass-effect px-2 py-1 sm:px-3 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 text-white hover:scale-105 transition-transform text-xs sm:text-sm border-orange-500/50"
                    >
                      🔧 Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>OpenAI Connection Test</DialogTitle>
                    </DialogHeader>
                    <OpenAIConnectionTest />
                  </DialogContent>
                </Dialog>
                <Link
                  to="/dashboard/admin"
                  className="glass-effect px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 sm:gap-2 text-white hover:scale-105 transition-transform text-xs sm:text-sm md:text-base relative"
                >
                  <Settings size={isMobile ? 12 : 16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="text-gray-100">Admin</span>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-sm -z-10"></div>
                </Link>
              </>
            )}
            <Link 
              to={user ? "/dashboard" : "/auth"} 
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

          {/* Asset Icons positioned responsively */}
          <div className={`w-full flex flex-col justify-center items-center ${!analysisComplete && !isAnalyzing ? (isMobile ? 'mt-6 sm:mt-8' : 'mt-12 lg:mt-16') : ''}`}>
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
          </div>

          {/* Model Generation Banner - now inline instead of modal */}
          {showBanner && (
            <div className="w-full max-w-4xl mx-auto mb-4 px-4">
              <ModelGenerationSheet />
            </div>
          )}

          {/* Analysis results positioned extremely far down */}
          {analysisComplete && analysisResults && (
            <div 
              className={`w-full ${showingFormSection ? 'mt-0' : 'mt-64 sm:mt-72 md:mt-80 lg:mt-96'}`}
              style={{
                background: 'linear-gradient(to bottom right, #1e293b, #111827, #000000)',
                position: 'relative'
              }}
            >
              {/* Background effects matching summary page */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.05), transparent, rgba(168, 85, 247, 0.05))'
                }}
              />
              <div className="relative z-10 px-4 py-8">
                <AssetResultList 
                  analysisResults={analysisResults} 
                  onFormSectionToggle={setShowingFormSection}
                />
              </div>
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
    </div>
  );
};

export default Index;
