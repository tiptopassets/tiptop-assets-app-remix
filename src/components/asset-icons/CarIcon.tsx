
import { motion } from 'framer-motion';

const CarIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute left-[35%] bottom-[10%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/5169ceb8-ccbc-4b72-8758-a91052320c2c.png" 
            alt="Car Icon" 
            className="relative z-10 w-10 h-10 object-contain animate-float"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))',
            }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarIcon;
