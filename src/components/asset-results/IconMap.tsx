
import React from 'react';

// Define interface for the icons
export interface IconDefinition {
  element: React.ReactNode;
}

// Export icon map to be used across components
const iconMap: Record<string, React.ReactNode> = {
  "parking": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/091a67ab-4042-438b-bc99-27ee182ea80e.png" 
        alt="Parking Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(155, 135, 245, 0.6))' }}
      />
    </div>
  ),
  "solar": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/e416e0ba-c9ba-499a-92ff-6944f77ba0db.png" 
        alt="Solar Panel" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))' }}
      />
    </div>
  ),
  "garden": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/ef52333e-7ea8-4692-aeed-9a222da95b75.png" 
        alt="Garden Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.6))' }}
      />
    </div>
  ),
  "storage": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png" 
        alt="Storage Box" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11, 0.6))' }}
      />
    </div>
  ),
  "wifi": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
        alt="WiFi Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.6))' }}
      />
    </div>
  ),
  "pool": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/f14eb0ad-2e5a-40c8-b1a5-a0b1b22c11ee.png" 
        alt="Swimming Pool Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.6))' }}
      />
    </div>
  ),
  "car": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/5169ceb8-ccbc-4b72-8758-a91052320c2c.png" 
        alt="Car Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.6))' }}
      />
    </div>
  ),
  "evcharger": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png" 
        alt="EV Charger Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(167, 139, 250, 0.6))' }}
      />
    </div>
  )
};

export default iconMap;
