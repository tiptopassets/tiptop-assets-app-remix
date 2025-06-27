
import React, { useEffect, useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { SatelliteImageDisplay } from './SatelliteImageDisplay';
import { motion, AnimatePresence } from 'framer-motion';

interface SatelliteMonitorProps {
  className?: string;
  autoUpdate?: boolean;
}

export const SatelliteMonitor = ({ 
  className = "",
  autoUpdate = true 
}: SatelliteMonitorProps) => {
  const { address, addressCoordinates } = useGoogleMap();
  const [displayAddress, setDisplayAddress] = useState(address);
  const [displayCoordinates, setDisplayCoordinates] = useState(addressCoordinates);

  // Update display when address changes (with debounce)
  useEffect(() => {
    if (!autoUpdate) return;

    const timer = setTimeout(() => {
      if (address && address.trim() && address !== displayAddress) {
        console.log('📍 Satellite monitor detected address change:', address);
        setDisplayAddress(address);
        setDisplayCoordinates(addressCoordinates);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [address, addressCoordinates, displayAddress, autoUpdate]);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayAddress || 'empty'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <SatelliteImageDisplay 
            address={displayAddress || ''}
            coordinates={displayCoordinates || undefined}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
