
import { motion } from 'framer-motion';

const HouseIcon = () => {
  const imageUrl = '/lovable-uploads/da82bbe6-d075-42d2-9dd8-2de7152f5557.png';

  return (
    <motion.div 
      className="absolute animate-float"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Glow effect below the image */}
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-purple-500/30 rounded-full blur-xl"></div>
        
        {/* Glass morphism effect around the image */}
        <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-white/10 to-purple-500/20 backdrop-blur-md z-[-1]"></div>
        
        <img 
          src={imageUrl} 
          alt="3D House"
          className="h-48 w-auto object-contain drop-shadow-lg icon-3d gloss-effect"
          style={{ 
            filter: 'drop-shadow(0 0 15px rgba(155, 135, 245, 0.7))',
          }}
        />
        
        {/* Light reflection effects */}
        <div className="absolute top-5 right-10 h-10 w-10 bg-white/20 rounded-full blur-md"></div>
        <div className="absolute top-20 left-10 h-6 w-6 bg-white/15 rounded-full blur-sm"></div>
        
        {/* Highlight solar panels with subtle glow */}
        <div className="absolute top-10 right-14 h-8 w-8 bg-blue-400/30 rounded-sm blur-md animate-pulse-glow"></div>
        <div className="absolute top-10 right-24 h-8 w-8 bg-blue-400/30 rounded-sm blur-md animate-pulse-glow" 
             style={{animationDelay: '1s'}}></div>
      </div>
    </motion.div>
  );
};

export default HouseIcon;
