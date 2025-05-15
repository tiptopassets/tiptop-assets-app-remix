
import React from 'react';

const LoadingState = () => {
  return (
    <div className="p-4 md:p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
      </div>
      <p className="text-white">Analyzing property images and data...</p>
    </div>
  );
};

export default LoadingState;
