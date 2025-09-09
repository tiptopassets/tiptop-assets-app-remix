
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const LoadingState = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="p-4 md:p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
      </div>
      
      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-4 space-y-2">
        <Progress 
          value={progress} 
          className="h-2 bg-black/40 border border-white/10"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Analyzing property images and data...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      
      <p className="text-white">Analyzing property images and data...</p>
    </div>
  );
};

export default LoadingState;
