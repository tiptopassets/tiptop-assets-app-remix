
import { motion } from 'framer-motion';

const ParkingIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute bottom-[10%] right-10 md:right-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(147,51,234,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/72c97a7c-f1cb-47be-9354-616e819e15ee.png" 
            alt="Parking Icon" 
            className="relative z-10 w-10 h-10 object-contain animate-float"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))',
            }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParkingIcon;
