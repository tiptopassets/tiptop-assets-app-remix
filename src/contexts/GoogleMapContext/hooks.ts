
import { useContext } from 'react';
import { GoogleMapContext } from './GoogleMapProvider';
import { GoogleMapContextType } from './types';

export const useGoogleMap = (): GoogleMapContextType => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};
