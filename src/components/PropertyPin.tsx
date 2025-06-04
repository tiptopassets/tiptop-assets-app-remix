
import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyPinProps {
  address: string;
}

const PropertyPin = ({ address }: PropertyPinProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-effect rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-center gap-3">
          {/* Animated Map Pin */}
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="relative"
          >
            <MapPin 
              size={32} 
              className="text-tiptop-purple drop-shadow-lg" 
              fill="currentColor"
            />
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 rounded-full bg-tiptop-purple/30 blur-md animate-pulse" />
          </motion.div>
          
          {/* Address Text */}
          <div className="text-center">
            <p className="text-white/80 text-sm font-medium">Analyzing Property</p>
            <p className="text-white text-lg font-semibold truncate max-w-md">
              {address}
            </p>
          </div>
        </div>
        
        {/* Subtle gradient border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-tiptop-purple/20 to-violet-500/20 rounded-xl blur-sm -z-10" />
      </div>
    </motion.div>
  );
};

export default PropertyPin;
