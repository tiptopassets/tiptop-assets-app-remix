
import { motion } from 'framer-motion';

const SwimmingPoolIcon = () => {
  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/f14eb0ad-2e5a-40c8-b1a5-a0b1b22c11ee.png" 
            alt="Swimming Pool Icon" 
            className="relative z-10 w-8 h-8 object-contain m-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.6))' }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwimmingPoolIcon;
