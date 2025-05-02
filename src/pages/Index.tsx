
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/AssetResultList';
import { GoogleMapProvider, useGoogleMap } from '@/contexts/GoogleMapContext';
import { LogIn } from 'lucide-react'; // Changed from Google to LogIn

const HomeContent = () => {
  const { isAnalyzing, analysisComplete } = useGoogleMap();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <header className="w-full p-6 flex justify-between items-center">
          <div className="text-3xl font-bold text-tiptop-purple">
            tiptop
          </div>
          <button className="glass-effect px-4 py-2 rounded-full flex items-center gap-2 text-gray-700 hover:scale-105 transition-transform">
            <LogIn size={20} />
            <span>Sign in Google</span>
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full flex flex-col items-center justify-center px-6 transition-all duration-500">
          <div className={`text-center mb-8 transform transition-all duration-500 ${isCollapsed ? 'scale-0 h-0 mb-0' : 'scale-100'}`}>
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Monetize Your Home Assets
            </h1>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <SearchBar isCollapsed={isCollapsed} />
            {!isAnalyzing && !analysisComplete && <AnalyzeButton />}
          </div>

          <div className="mt-8 w-full flex justify-center">
            <AssetIcons />
            <AssetResultList />
          </div>
        </main>
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
