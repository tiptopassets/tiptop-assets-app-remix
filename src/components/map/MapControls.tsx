
import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface MapControlsProps {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

const MapControls = ({ handleZoomIn, handleZoomOut }: MapControlsProps) => {
  return (
    <div className="absolute right-4 top-24 z-10 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn size={24} />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut size={24} />
      </button>
    </div>
  );
};

export default MapControls;
