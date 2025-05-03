
import { motion } from 'framer-motion';

const SolarPanelIcon = () => {
  return (
    <motion.div 
      className="3d-asset-icon absolute top-[-15%] left-[50%] transform -translate-x-1/2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center icon-3d 
                    backdrop-blur-sm backdrop-filter shadow-[0_0_15px_rgba(255,215,0,0.5)]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent rounded-lg transform rotate-3 translate-z-4 blur-[2px]"></div>
          <img 
            src="/lovable-uploads/4ac94444-6856-4868-a7d1-4649c212b28a.png" 
            alt="Solar Panel" 
            className="relative z-10 w-10 h-10 object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))',
            }}
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SolarPanelIcon;
