
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
          {/* Removed the background div */}
          <img 
            src="/lovable-uploads/417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png" 
            alt="Storage Box" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11, 0.8))' }}
          />
          {/* Removed background gradient div */}
        </div>
      </div>
    </motion.div>
  );
};

export default StorageIcon;
