
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
          className="h-40 object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 20px rgba(155, 135, 245, 0.5))' }}
        />
      </motion.div>

      {/* Solar Panel Icon - Top Right */}
      <motion.div 
        className="3d-asset-icon absolute top-6 right-[40%] md:right-[35%]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="#7D5700" strokeWidth="1.5" fill="url(#solarGradient)" />
              <path d="M4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10Z" fill="#7D5700" />
              <rect x="11" y="18" width="2" height="4" fill="#7D5700" />
              <defs>
                <linearGradient id="solarGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD700" />
                  <stop offset="1" stopColor "#FFA500" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Garden Icon - Far Right */}
      <motion.div 
        className="3d-asset-icon absolute top-[35%] right-10 md:right-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-300 to-green-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C12 7.5 14 10.5 18 11C16 11.5 14 13 14 16C14 13 12 11.5 10 11C14 10.5 16 7.5 16 4" fill="url(#gardenGradient)" stroke="#166534" strokeWidth="1.5" />
              <path d="M12 22V16" stroke="#166534" strokeWidth="1.5" />
              <circle cx="14" cy="10" r="2" fill="url(#gardenFlowerGradient)" />
              <circle cx="9" cy="13" r="2" fill="url(#gardenFlowerGradient)" />
              <defs>
                <linearGradient id="gardenGradient" x1="12" y1="4" x2="15" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#86EFAC" />
                  <stop offset="1" stopColor="#16A34A" />
                </linearGradient>
                <linearGradient id="gardenFlowerGradient" x1="12" y1="8" x2="16" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FBCFE8" />
                  <stop offset="1" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Wifi/Bandwidth Icon - Bottom Left */}
      <motion.div 
        className="3d-asset-icon absolute bottom-[30%] left-10 md:left-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <img 
              src="/lovable-uploads/b2f01532-85bb-44ee-98c1-afa2d7ae2620.png" 
              alt="WiFi Icon" 
              className="relative z-10 w-10 h-10 object-contain"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Parking Icon - Bottom Right */}
      <motion.div 
        className="3d-asset-icon absolute bottom-[10%] right-10 md:right-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#parkingGradient)" stroke="#1E3A8A" strokeWidth="1.5" />
              <path d="M12 6H9V18H11V14H12C14.2 14 16 12.2 16 10C16 7.8 14.2 6 12 6ZM12 12H11V8H12C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="#1E3A8A" />
              <defs>
                <linearGradient id="parkingGradient" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93C5FD" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Storage Icon - Bottom */}
      <motion.div 
        className="3d-asset-icon absolute bottom-6 left-[40%] md:left-[35%]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="16" height="12" rx="1" fill="url(#storageGradient)" stroke="#854D0E" strokeWidth="1.5" />
              <rect x="6" y="10" width="12" height="1" fill="#854D0E" />
              <rect x="6" y="13" width="12" height="1" fill="#854D0E" />
              <rect x="6" y="16" width="12" height="1" fill="#854D0E" />
              <path d="M12 8V4M8 4H16" stroke="#854D0E" strokeWidth="1.5" />
              <defs>
                <linearGradient id="storageGradient" x1="4" y1="14" x2="20" y2="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FCD34D" />
                  <stop offset="1" stopColor="#EAB308" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Swimming Pool Icon - Top Left */}
      <motion.div 
        className="3d-asset-icon absolute top-[35%] left-10 md:left-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-sky-300 to-cyan-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-sky-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 15C3.5 18 7 21 12 21C17 21 20.5 18 22 15" stroke="#0E7490" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M22 12C22 15.866 17.523 19 12 19C6.477 19 2 15.866 2 12C2 9 6.477 6 12 6C17.523 6 22 9 22 12Z" fill="url(#poolGradient)" stroke="#0E7490" strokeWidth="0.75" />
              <ellipse cx="12" cy="9" rx="3" ry="2" fill="#0E7490" fillOpacity="0.5" />
              <path d="M7 10C7.33333 10.6667 8.4 11.8 10 11C11.6 10.2 12 12 12 12C12 12 12.4 10.2 14 11C15.6 11.8 16.6667 10.6667 17 10" stroke="white" strokeWidth="0.75" strokeLinecap="round" />
              <defs>
                <linearGradient id="poolGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7DD3FC" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>

      {/* Car Icon - Left Bottom */}
      <motion.div 
        className="3d-asset-icon absolute bottom-10 left-[20%] md:left-[25%]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-xl flex items-center justify-center icon-3d">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
            <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="url(#carGradient)" stroke="#3730A3" strokeWidth="1" />
              <circle cx="7.5" cy="16.5" r="1.5" fill="#3730A3" />
              <circle cx="16.5" cy="16.5" r="1.5" fill="#3730A3" />
              <path d="M5 10H19L17.86 6.64C17.58 5.67 16.66 5 15.64 5H8.36C7.34 5 6.42 5.67 6.14 6.64L5 10Z" fill="url(#carTopGradient)" />
              <defs>
                <linearGradient id="carGradient" x1="3" y1="13" x2="21" y2="13" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A5B4FC" />
                  <stop offset="1" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="carTopGradient" x1="5" y1="7.5" x2="19" y2="7.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C7D2FE" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssetIcons;
