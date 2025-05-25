
import React from 'react';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelHeaderProps {
  isGenerating: boolean;
  isVisible: boolean;
  showFullAnalysis: boolean;
  toggleFullAnalysis: () => void;
  onClose: () => void;
}

const ModelHeader = ({ 
  isGenerating, 
  isVisible, 
  showFullAnalysis, 
  toggleFullAnalysis, 
  onClose 
}: ModelHeaderProps) => {
  if (!isVisible) return null;

  return (
    <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
          {isGenerating ? 
            "Analyzing Your Property..." : 
            <><Check className="text-green-500 h-6 w-6 mr-2" />Property Analysis Complete</>
          }
        </h2>
        <p className="text-sm text-gray-400">
          {isGenerating 
            ? "Please wait while our AI analyzes your property" 
            : "View your property's monetization insights below"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isGenerating && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={toggleFullAnalysis}
            className="text-gray-400 hover:text-white"
          >
            {showFullAnalysis ? "Show Less" : "Show More"}
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="text-gray-400 hover:text-white"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModelHeader;
