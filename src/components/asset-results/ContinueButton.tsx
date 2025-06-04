
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 group"
        size="lg"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">
            Continue with {selectedAssetsCount} Asset{selectedAssetsCount !== 1 ? 's' : ''}
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </Button>
    </motion.div>
  );
};

export default ContinueButton;
