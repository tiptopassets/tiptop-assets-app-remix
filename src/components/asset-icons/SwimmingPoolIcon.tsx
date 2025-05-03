
import { motion } from 'framer-motion';

const SwimmingPoolIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute top-[35%] left-10 md:left-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-sky-300/80 to-cyan-500/80 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(14,165,233,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-60 rounded-lg"></div>
          
          {/* Glow effect - blue water glow */}
          <div className="absolute inset-0 -m-1 bg-sky-400/30 rounded-lg blur-md"></div>
          
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
          
          {/* Light reflection - water sparkle */}
          <div className="absolute top-1 right-1 h-4 w-4 bg-white/60 rounded-full blur-sm"></div>
          <div className="absolute bottom-2 left-2 h-2 w-2 bg-white/40 rounded-full blur-sm"></div>
        </div>
      </div>
      
      {/* Side glow puddle */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-10 bg-sky-500/40 rounded-full blur-lg"></div>
    </motion.div>
  );
};

export default SwimmingPoolIcon;
