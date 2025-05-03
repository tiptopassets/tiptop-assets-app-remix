
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './IconGlowEffect.css';

const HouseIcon = () => {
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  
  // Create a subtle pulsing effect for the solar panels
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => {
        // Oscillate between 0.4 and 0.7 for subtle effect
        return prev >= 0.7 ? 0.4 : prev + 0.02;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute animate-float"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative">
        {/* The main house image */}
        <motion.img 
          src="/lovable-uploads/ebe8eca7-2fd2-4673-9591-9e84fb0fc0fa.png" 
          alt="3D Transparent House with Solar Panels"
          className="h-48 object-contain drop-shadow-2xl transform-gpu"
          style={{ 
            filter: `drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))
                    drop-shadow(0 0 25px rgba(155, 135, 245, 0.3))`,
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        
        {/* Glowing overlay for the solar panels */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 8px rgba(65, 105, 225, ${glowIntensity}))
                    drop-shadow(0 0 12px rgba(25, 25, 255, ${glowIntensity * 0.7}))`,
            mixBlendMode: "screen",
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <img 
            src="/lovable-uploads/ebe8eca7-2fd2-4673-9591-9e84fb0fc0fa.png" 
            alt=""
            className="h-48 object-contain invisible"
          />
        </motion.div>
        
        {/* Glass reflection effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)",
            borderRadius: "inherit",
          }}
        />
      </div>
    </motion.div>
  );
};

export default HouseIcon;
