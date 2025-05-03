
import { motion } from 'framer-motion';

const SolarPanelIcon = () => {
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
          
          {/* New solar panel icon */}
          <img 
            src="/lovable-uploads/e416e0ba-c9ba-499a-92ff-6944f77ba0db.png" 
            alt="Solar Panel" 
            className="relative z-10 w-8 h-8 object-contain m-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))' }}
          />
          
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
          
          {/* Light reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SolarPanelIcon;
