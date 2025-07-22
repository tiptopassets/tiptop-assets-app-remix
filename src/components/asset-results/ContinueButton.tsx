
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueButtonProps {
  selectedAssetsCount: number;
  onClick: () => void;
  className?: string;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({ 
  selectedAssetsCount, 
  onClick,
  className 
}) => {
  const isDisabled = selectedAssetsCount < 2;
  const buttonText = isDisabled 
    ? `Select at least ${2 - selectedAssetsCount} more asset${2 - selectedAssetsCount !== 1 ? 's' : ''} to continue`
    : `Continue with ${selectedAssetsCount} Asset${selectedAssetsCount !== 1 ? 's' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      <Button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "text-white border-none shadow-lg transition-all duration-300 group",
          isDisabled
            ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
        )}
        size="lg"
      >
        <div className="flex items-center gap-2">
          {isDisabled ? (
            <Plus className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span className="font-semibold">
            {buttonText}
          </span>
          {!isDisabled && (
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          )}
        </div>
      </Button>
    </motion.div>
  );
};

export default ContinueButton;
