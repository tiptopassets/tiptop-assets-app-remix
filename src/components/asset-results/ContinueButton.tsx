
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ContinueButtonProps {
  selectedAssetsCount: number;
  onClick: () => void;
}

const ContinueButton = ({ selectedAssetsCount, onClick }: ContinueButtonProps) => {
  if (selectedAssetsCount === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 flex justify-center"
    >
      <Button 
        onClick={onClick}
        className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl"
        style={{ 
          boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
        }}
      >
        <span>Continue with Selected Assets</span>
        <ArrowRight size={24} />
      </Button>
    </motion.div>
  );
};

export default ContinueButton;
