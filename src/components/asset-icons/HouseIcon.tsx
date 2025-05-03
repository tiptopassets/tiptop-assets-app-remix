
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './IconGlowEffect.css';

const HouseIcon = () => {
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  
  // Create a subtle pulsing effect
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
          src="/lovable-uploads/e6249249-86a2-4511-81d6-8e66ce807506.png" 
          alt="3D House"
          className="h-48 object-contain drop-shadow-2xl transform-gpu"
          style={{ 
            filter: `drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))
                    drop-shadow(0 0 25px rgba(255, 135, 45, 0.3))`,
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
        
        {/* Glowing overlay */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 8px rgba(255, 165, 0, ${glowIntensity}))
                    drop-shadow(0 0 12px rgba(255, 140, 0, ${glowIntensity * 0.7}))`,
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
            src="/lovable-uploads/e6249249-86a2-4511-81d6-8e66ce807506.png" 
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
