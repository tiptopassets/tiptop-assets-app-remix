
import { motion } from 'framer-motion';

const SwimmingPoolIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute top-[35%] left-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(14,165,233,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/76f34c86-decf-4d23-aeee-b23ba55c1be1.png" 
            alt="Swimming Pool Icon" 
            className="relative z-10 w-10 h-10 object-contain animate-float"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.6))',
            }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwimmingPoolIcon;
