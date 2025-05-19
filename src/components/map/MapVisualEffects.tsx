
import React from 'react';

const MapVisualEffects = () => {
  return (
    <>
      {/* Enhanced gradient overlay with glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 pointer-events-none" 
        style={{mixBlendMode: 'overlay'}} 
      />
      {/* Add a subtle light glow at the top */}
      <div 
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.2) 0%, transparent 70%)',
        }} 
      />
    </>
  );
};

export default MapVisualEffects;
