
import { motion } from 'framer-motion';

const CarIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute bottom-10 left-[20%] md:left-[25%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
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
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarIcon;
