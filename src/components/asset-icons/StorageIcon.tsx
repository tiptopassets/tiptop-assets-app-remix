
import { motion } from 'framer-motion';

const StorageIcon = () => {
  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          
          {/* New storage icon */}
          <img 
            src="/lovable-uploads/22c671c2-d3d7-4f4f-bde0-baf89c4f5ce1.png" 
            alt="Storage Box" 
            className="relative z-10 w-8 h-8 object-contain m-auto"
            style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11, 0.8))' }}
          />
          
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
          
          {/* Light reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg"></div>
          
          {/* Bottom glow effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-500/20 to-transparent rounded-b-lg"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default StorageIcon;
