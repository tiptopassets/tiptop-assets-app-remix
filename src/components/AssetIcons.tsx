
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from 'framer-motion';

const AssetIcons = () => {
  const { isAnalyzing, analysisComplete } = useGoogleMap();

  // Don't show icons when analysis is in progress or complete
  if (isAnalyzing || analysisComplete) return null;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* 3D House in the center */}
      <motion.div 
        className="absolute animate-float"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img 
          src="/lovable-uploads/38c4dd36-b2e0-4e04-a613-1ac8c513265e.png" 
          alt="3D House"
          className="h-40 object-contain"
        />
      </motion.div>

      {/* Solar Panel Icon */}
      <motion.div 
        className="glass-icon absolute top-10 right-[35%]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" fill="#FFB800" />
            <path d="M4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10Z" fill="#7D5700" />
            <rect x="11" y="18" width="2" height="4" fill="#7D5700" />
          </svg>
        </div>
      </motion.div>

      {/* Garden Icon */}
      <motion.div 
        className="glass-icon absolute top-[25%] right-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C12 7.5 14 10.5 18 11C16 11.5 14 13 14 16C14 13 12 11.5 10 11C14 10.5 16 7.5 16 4" fill="#4ADE80" />
            <path d="M12 22V16" stroke="#166534" strokeWidth="2" />
            <circle cx="14" cy="10" r="2" fill="#4ADE80" />
            <circle cx="9" cy="13" r="2" fill="#4ADE80" />
          </svg>
        </div>
      </motion.div>

      {/* Wifi Icon */}
      <motion.div 
        className="glass-icon absolute bottom-[25%] left-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5C7.03 5 2.73 8.51 1 12C2.73 15.49 7.03 19 12 19C16.97 19 21.27 15.49 23 12C21.27 8.51 16.97 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="#C084FC" />
            <circle cx="12" cy="12" r="2" fill="#7E22CE" />
            <path d="M2 12C3.73 15.49 7.56 18 12 18C16.44 18 20.27 15.49 22 12" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 8C17.83 6.1 15.01 5 12 5C8.99 5 6.17 6.1 4 8" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {/* Parking Icon */}
      <motion.div 
        className="glass-icon absolute bottom-[15%] right-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#60A5FA" />
            <path d="M12 6H9V18H11V14H12C14.2 14 16 12.2 16 10C16 7.8 14.2 6 12 6ZM12 12H11V8H12C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="#1E3A8A" />
          </svg>
        </div>
      </motion.div>

      {/* Storage Icon */}
      <motion.div 
        className="glass-icon absolute bottom-10 left-[35%]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="16" height="12" rx="1" fill="#EAB308" />
            <rect x="6" y="10" width="12" height="1" fill="#854D0E" />
            <rect x="6" y="13" width="12" height="1" fill="#854D0E" />
            <rect x="6" y="16" width="12" height="1" fill="#854D0E" />
            <path d="M12 8V4M8 4H16" stroke="#854D0E" strokeWidth="2" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default AssetIcons;
