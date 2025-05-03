
import { motion } from 'framer-motion';

const WifiIcon = () => {
  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Removed the background div */}
          <img 
            src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
            alt="WiFi Icon" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(155, 135, 245, 0.8))' }}
          />
          {/* Removed background gradient div */}
        </div>
      </div>
    </motion.div>
  );
};

export default WifiIcon;
