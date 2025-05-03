
import { motion } from 'framer-motion';

const SolarPanelIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute top-6 right-[40%] md:right-[35%]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-xl flex items-center justify-center icon-3d 
                    backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(255,215,0,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <svg className="relative z-10 w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="#7D5700" strokeWidth="1.5" fill="url(#solarGradient)" />
            <path d="M4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10Z" fill="#7D5700" />
            <rect x="11" y="18" width="2" height="4" fill="#7D5700" />
            <defs>
              <linearGradient id="solarGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFD700" />
                <stop offset="1" stopColor="#FFA500" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SolarPanelIcon;
