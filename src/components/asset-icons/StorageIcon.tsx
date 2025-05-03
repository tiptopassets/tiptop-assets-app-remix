
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
          <img 
            src="/lovable-uploads/417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png" 
            alt="Storage Box" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11, 0.6))' }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default StorageIcon;
