import React from 'react';
import { Car, Sun, Wifi, BatteryCharging, Paintbrush, Home } from 'lucide-react';

// Centralized icon registry with normalization and dual variants (image | lucide)
export type AssetKey =
  | 'parking'
  | 'solar'
  | 'garden'
  | 'storage'
  | 'wifi'
  | 'pool'
  | 'car'
  | 'evcharger'
  | 'art-studio';

const IMAGE_SOURCES: Record<AssetKey, { src: string; alt: string; style?: React.CSSProperties }> = {
  parking: {
    src: '/lovable-uploads/091a67ab-4042-438b-bc99-27ee182ea80e.png',
    alt: 'Parking Icon',
    style: { filter: 'drop-shadow(0 0 5px rgba(155, 135, 245, 0.6))' },
  },
  solar: {
    src: '/lovable-uploads/e416e0ba-c9ba-499a-92ff-6944f77ba0db.png',
    alt: 'Solar Panel',
    style: { filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))' },
  },
  garden: {
    src: '/lovable-uploads/ef52333e-7ea8-4692-aeed-9a222da95b75.png',
    alt: 'Garden Icon',
    style: { filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.6))' },
  },
  storage: {
    src: '/lovable-uploads/22c671c2-d3d7-4f4f-bde0-baf89c4f5ce1.png',
    alt: 'Storage Box',
    style: { filter: 'drop-shadow(0 0 8px rgba(245,158,11, 0.6))' },
  },
  wifi: {
    src: '/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png',
    alt: 'WiFi Icon',
    style: { filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.6))' },
  },
  pool: {
    src: '/lovable-uploads/f14eb0ad-2e5a-40c8-b1a5-a0b1b22c11ee.png',
    alt: 'Swimming Pool Icon',
    style: { filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.6))' },
  },
  car: {
    src: '/lovable-uploads/5169ceb8-ccbc-4b72-8758-a91052320c2c.png',
    alt: 'Car Icon',
    style: { filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.6))' },
  },
  evcharger: {
    src: '/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png',
    alt: 'EV Charger Icon',
    style: { filter: 'drop-shadow(0 0 5px rgba(167, 139, 250, 0.6))' },
  },
  // Updated to use uploaded Art Studio icon image
  'art-studio': {
    src: '/lovable-uploads/a896cdf2-8269-40d0-a685-d80e9a89f27d.png',
    alt: 'Art Studio Icon',
    style: { filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.5))' },
  },
};

const LUCIDE_COMPONENTS: Partial<Record<AssetKey, React.ComponentType<any>>> = {
  parking: Car,
  car: Car,
  solar: Sun,
  wifi: Wifi,
  evcharger: BatteryCharging,
  'art-studio': Paintbrush,
  storage: Home,
  garden: Home,
  pool: Home,
};

function toKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function normalizeAssetKey(input: string): AssetKey {
  const k = toKey(input);
  // Common synonyms normalization
  if (['internet', 'bandwidth', 'wifi'].includes(k)) return 'wifi';
  if (['pool', 'swimming-pool', 'swimming_pool'].includes(k)) return 'pool';
  if (['ev-charger', 'ev_charger', 'ev-charging', 'ev_charging', 'ev-charging-station'].includes(k)) return 'evcharger';
  if (['art-studio', 'art-studio-space', 'art_studio', 'art-studio-room'].includes(k)) return 'art-studio';
  if (['parking', 'driveway'].includes(k)) return 'parking';
  if (['car', 'vehicle'].includes(k)) return 'car';
  if (['solar', 'rooftop', 'sun'].includes(k)) return 'solar';
  if (['garden', 'yard', 'outdoor-space'].includes(k)) return 'garden';
  if (['storage', 'garage', 'basement'].includes(k)) return 'storage';

  // Fallbacks to closest generic types
  return (['parking','solar','garden','storage','wifi','pool','car','evcharger','art-studio'].includes(k)
    ? (k as AssetKey)
    : 'storage');
}

export function getAssetIcon(
  assetType: string,
  options?: { variant?: 'image' | 'lucide'; className?: string; size?: number }
): React.ReactNode {
  const key = normalizeAssetKey(assetType);
  const { variant = 'image', className = 'w-8 h-8 object-contain', size } = options || {};

  if (variant === 'lucide') {
    const Lucide = LUCIDE_COMPONENTS[key] || Home;
    return <Lucide className={className} size={size} />;
  }

  // Image variant
  const img = IMAGE_SOURCES[key];
  if (img) {
    return <img src={img.src} alt={img.alt} className={className} style={img.style} />;
  }

  // Fallback to lucide if no image
  const Lucide = LUCIDE_COMPONENTS[key] || Home;
  return <Lucide className={className} size={size} />;
}

// Legacy export to support existing "iconMap" consumers
export function iconMapForLegacyUsage(): Record<string, React.ReactNode> {
  const keys: string[] = [
    'parking',
    'solar',
    'garden',
    'storage',
    'wifi',
    'pool',
    'car',
    'evcharger',
    // Common synonyms currently found in data/components
    'ev-charger',
    'ev_charger',
    'swimming-pool',
    'swimming_pool',
    'bandwidth',
    'internet',
    'art-studio',
  ];

  const map: Record<string, React.ReactNode> = {};
  keys.forEach((k) => {
    map[k] = getAssetIcon(k, { variant: 'image' });
  });
  return map;
}
