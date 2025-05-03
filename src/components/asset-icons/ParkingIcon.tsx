
import { motion } from 'framer-motion';

const ParkingIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute bottom-[10%] right-10 md:right-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-500 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(147,51,234,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-400 rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/d469ef0b-f200-47aa-b3a1-e7ec1f301a48.png" 
            alt="Parking Icon" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.6))' }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent opacity-60"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParkingIcon;
