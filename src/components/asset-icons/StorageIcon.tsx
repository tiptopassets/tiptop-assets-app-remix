
import { motion } from 'framer-motion';

const StorageIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute bottom-6 left-[40%] md:left-[35%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(245,158,11,0.5)]">
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
  );
};

export default StorageIcon;
