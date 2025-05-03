
import { motion } from 'framer-motion';

const WifiIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute bottom-[30%] left-10 md:left-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-purple-300/80 to-purple-500/80 rounded-xl flex items-center justify-center icon-3d
                     backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(147,51,234,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-60 rounded-lg"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 -m-1 bg-purple-400/30 rounded-lg blur-md"></div>
          
          <img 
            src="/lovable-uploads/b2f01532-85bb-44ee-98c1-afa2d7ae2620.png" 
            alt="WiFi Icon" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.7))' }}
          />
          
          {/* Light reflection */}
          <div className="absolute top-1 right-1 h-4 w-4 bg-white/60 rounded-full blur-sm"></div>
        </div>
      </div>
      
      {/* Bottom glow puddle */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-purple-500/40 rounded-full blur-lg"></div>
    </motion.div>
  );
};

export default WifiIcon;
