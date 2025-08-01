
import React from 'react';

// Define interface for the icons
export interface IconDefinition {
  element: React.ReactNode;
}

// Export icon map to be used across components
const iconMap: Record<string, React.ReactNode> = {
  "parking": (
    <img 
      src="/lovable-uploads/091a67ab-4042-438b-bc99-27ee182ea80e.png" 
      alt="Parking Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(155, 135, 245, 0.6))' }}
    />
  ),
  "solar": (
    <img 
      src="/lovable-uploads/e416e0ba-c9ba-499a-92ff-6944f77ba0db.png" 
      alt="Solar Panel" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))' }}
    />
  ),
  "garden": (
    <img 
      src="/lovable-uploads/ef52333e-7ea8-4692-aeed-9a222da95b75.png" 
      alt="Garden Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.6))' }}
    />
  ),
  "storage": (
    <img 
      src="/lovable-uploads/22c671c2-d3d7-4f4f-bde0-baf89c4f5ce1.png" 
      alt="Storage Box" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11, 0.6))' }}
    />
  ),
  "wifi": (
    <img 
      src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
      alt="WiFi Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.6))' }}
    />
  ),
  "pool": (
    <img 
      src="/lovable-uploads/f14eb0ad-2e5a-40c8-b1a5-a0b1b22c11ee.png" 
      alt="Swimming Pool Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.6))' }}
    />
  ),
  "car": (
    <img 
      src="/lovable-uploads/5169ceb8-ccbc-4b72-8758-a91052320c2c.png" 
      alt="Car Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.6))' }}
    />
  ),
  "evcharger": (
    <img 
      src="/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png" 
      alt="EV Charger Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(167, 139, 250, 0.6))' }}
    />
  ),
  "airbnb": (
    <img 
      src="/lovable-uploads/945316e5-4983-47c7-b231-ed89d12f2ebe.png" 
      alt="House Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 91, 91, 0.6))' }}
    />
  ),
  "house": (
    <img 
      src="/lovable-uploads/945316e5-4983-47c7-b231-ed89d12f2ebe.png" 
      alt="House Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 91, 91, 0.6))' }}
    />
  ),
  "rental": (
    <img 
      src="/lovable-uploads/945316e5-4983-47c7-b231-ed89d12f2ebe.png" 
      alt="House Icon" 
      className="w-8 h-8 object-contain"
      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 91, 91, 0.6))' }}
    />
  )
};

export default iconMap;
