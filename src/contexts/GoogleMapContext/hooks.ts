
import { useContext } from 'react';
import { GoogleMapContext } from './GoogleMapProvider';
import { GoogleMapContextProps } from './types';

export const useGoogleMap = (): GoogleMapContextProps => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};
