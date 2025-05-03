
import { motion } from 'framer-motion';

const HouseIcon = () => {
  return (
    <motion.div 
      className="absolute animate-float"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <img 
        src="/lovable-uploads/16aed391-2f58-4689-9ed3-43da2bdc31b7.png" 
        alt="3D House"
        className="h-40 object-contain drop-shadow-2xl"
        style={{ 
          filter: 'drop-shadow(0 0 20px rgba(155, 135, 245, 0.5))',
        }}
      />
    </motion.div>
  );
};

export default HouseIcon;
