
import { motion } from 'framer-motion';

const WifiIcon = () => {
  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="w-full h-full rounded-xl flex items-center justify-center icon-3d
                   backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(147,51,234,0.5)]">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
            alt="WiFi Icon" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(155, 135, 245, 0.8))' }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default WifiIcon;
