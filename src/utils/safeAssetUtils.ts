/**
 * Utility functions for safely handling asset names and preventing toLowerCase errors
 */

export const safeAssetName = (name: any): string => {
  if (typeof name === 'string' && name.trim()) {
    return name;
  }
  return 'Asset'; // Default fallback
};

export const safeAssetType = (type: any): string => {
  if (typeof type === 'string' && type.trim()) {
    return type.toLowerCase().replace(/\s+/g, '_');
  }
  return 'asset'; // Default fallback
};

export const safeToLowerCase = (str: any): string => {
  try {
    if (typeof str === 'string' && str.trim()) {
      return str.toLowerCase();
    }
    return 'asset';
  } catch (error) {
    console.warn('⚠️ safeToLowerCase error:', error);
    return 'asset';
  }
};

export const generateAssetSetupMessage = (assetName: any): string => {
  const safeName = safeToLowerCase(safeAssetName(assetName));
  return `Set up my ${safeName}`;
};