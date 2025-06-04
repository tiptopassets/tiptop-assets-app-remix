
import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

const PropertyPin = () => {
  const { address, analysisComplete } = useGoogleMap();

  if (!address || !analysisComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center my-8"
    >
      <div className="glass-effect px-6 py-4 rounded-full flex items-center gap-3 max-w-lg">
        <div className="relative">
          <MapPin className="h-6 w-6 text-tiptop-purple animate-pulse" />
          <div className="absolute -inset-1 bg-tiptop-purple/20 rounded-full blur-sm"></div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium text-sm md:text-base line-clamp-1">
            {address}
          </p>
          <p className="text-white/60 text-xs">
            Property Analysis Complete
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyPin;
