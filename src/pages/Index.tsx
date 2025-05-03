
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/AssetResultList';
import { GoogleMapProvider, useGoogleMap } from '@/contexts/GoogleMapContext';
import { LogIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HomeContent = () => {
  const { isAnalyzing, analysisComplete } = useGoogleMap();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

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
            <span>Sign in Google</span>
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-6 transition-all duration-500">
          <div className={`text-center mb-6 md:mb-8 transform transition-all duration-500 ${isCollapsed ? 'scale-0 h-0 mb-0' : 'scale-100'}`}>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Monetize Your Home Assets
            </h1>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-full md:max-w-md">
            <SearchBar isCollapsed={isCollapsed} />
            {!isAnalyzing && !analysisComplete && <AnalyzeButton />}
          </div>

          <div className="mt-8 w-full flex flex-col md:flex-row justify-center items-center">
            <AssetIcons />
            <AssetResultList />
          </div>
        </main>
        
        {/* Footer */}
        {!analysisComplete && !isAnalyzing && (
          <footer className="w-full py-8 px-4 text-center">
            <div className="glass-effect max-w-4xl mx-auto py-6 px-4 md:px-8 rounded-2xl">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
                Rent Your Assets, Make Passive Income
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div className="p-3 glass-effect rounded-xl hover:scale-105 transition-transform cursor-pointer">
                  <h3 className="font-medium mb-1">Rooftop</h3>
                  <p className="text-sm opacity-80">Solar panels, gardens</p>
                </div>
                <div className="p-3 glass-effect rounded-xl hover:scale-105 transition-transform cursor-pointer">
                  <h3 className="font-medium mb-1">Garden Space</h3>
                  <p className="text-sm opacity-80">Urban farming, events</p>
                </div>
                <div className="p-3 glass-effect rounded-xl hover:scale-105 transition-transform cursor-pointer">
                  <h3 className="font-medium mb-1">Storage Space</h3>
                  <p className="text-sm opacity-80">Equipment, vehicles</p>
                </div>
                <div className="p-3 glass-effect rounded-xl hover:scale-105 transition-transform cursor-pointer">
                  <h3 className="font-medium mb-1">Swimming Pool</h3>
                  <p className="text-sm opacity-80">Hourly rental, events</p>
                </div>
              </div>
              <p className="text-white mt-5 text-lg">Check which assets you can start monetizing now!</p>
            </div>
          </footer>
        )}
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
