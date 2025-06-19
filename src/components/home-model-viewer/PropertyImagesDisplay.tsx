
import React from 'react';
import { motion } from 'framer-motion';

interface PropertyImagesDisplayProps {
  satelliteImageUrl?: string;
  streetViewImageUrl?: string;
  address?: string;
}

const PropertyImagesDisplay = ({ 
  satelliteImageUrl, 
  streetViewImageUrl, 
  address 
}: PropertyImagesDisplayProps) => {
  if (!satelliteImageUrl && !streetViewImageUrl) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Property Images</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {satelliteImageUrl && (
          <div className="bg-black/20 rounded-xl overflow-hidden border border-white/10">
            <div className="p-3 border-b border-white/10">
              <h4 className="text-sm font-medium text-white">Satellite View</h4>
              <p className="text-xs text-white/60">Aerial perspective of your property</p>
            </div>
            <div className="aspect-video">
              <img 
                src={satelliteImageUrl}
                alt={`Satellite view of ${address}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('Failed to load satellite image:', satelliteImageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        
        {streetViewImageUrl && (
          <div className="bg-black/20 rounded-xl overflow-hidden border border-white/10">
            <div className="p-3 border-b border-white/10">
              <h4 className="text-sm font-medium text-white">Street View</h4>
              <p className="text-xs text-white/60">Front view from the street</p>
            </div>
            <div className="aspect-video">
              <img 
                src={streetViewImageUrl}
                alt={`Street view of ${address}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('Failed to load street view image:', streetViewImageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyImagesDisplay;
