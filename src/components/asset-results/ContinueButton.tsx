
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContinueButtonProps {
  selectedAssets: string[];
  onContinue: () => void;
  isLoading?: boolean;
}

const ContinueButton = ({ selectedAssets, onContinue, isLoading = false }: ContinueButtonProps) => {
  const hasSelections = selectedAssets.length > 0;

  if (!hasSelections) {
    return null;
  }

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent p-6 mt-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {selectedAssets.length} Asset{selectedAssets.length > 1 ? 's' : ''} Selected
                </p>
                <p className="text-gray-400 text-sm">Ready to proceed with your selections</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
              
              <Button 
                onClick={onContinue}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueButton;
