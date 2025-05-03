
import { motion } from 'framer-motion';

const GardenIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute top-[35%] right-10 md:right-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-green-300/80 to-green-500/80 rounded-xl flex items-center justify-center icon-3d
                    backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(34,197,94,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-60 rounded-lg"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 -m-1 bg-green-400/30 rounded-lg blur-md"></div>
          
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
          
          {/* Light reflection */}
          <div className="absolute top-1 right-1 h-4 w-4 bg-white/60 rounded-full blur-sm"></div>
        </div>
      </div>
      
      {/* Right side glow puddle */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-10 bg-green-500/40 rounded-full blur-lg"></div>
    </motion.div>
  );
};

export default GardenIcon;
