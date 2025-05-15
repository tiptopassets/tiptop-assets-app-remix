
import React from 'react';

interface PropertyImagesProps {
  satellite?: string | null;
  streetView?: string | null;
}

const PropertyImages = ({ satellite, streetView }: PropertyImagesProps) => {
  if (!satellite && !streetView) return null;
  
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {satellite && (
        <div className="relative overflow-hidden rounded-lg">
          <p className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">Satellite View</p>
          <img 
            src={satellite} 
            alt="Satellite view of property"
            className="w-full h-48 object-cover" 
          />
        </div>
      )}
      {streetView && (
        <div className="relative overflow-hidden rounded-lg">
          <p className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">Street View</p>
          <img 
            src={streetView} 
            alt="Street view of property"
            className="w-full h-48 object-cover" 
          />
        </div>
      )}
    </div>
  );
};

export default PropertyImages;
