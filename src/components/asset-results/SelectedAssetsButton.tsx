
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SelectedAssetsButtonProps {
  selectedAssetsCount: number;
  onContinue: () => void;
  showFormSection: boolean;
}

const SelectedAssetsButton = ({ 
  selectedAssetsCount, 
  onContinue, 
  showFormSection 
}: SelectedAssetsButtonProps) => {
  if (selectedAssetsCount === 0 || showFormSection) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 flex justify-center"
    >
      <Button 
        onClick={onContinue}
        className="bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl"
        style={{ 
          boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
          background: 'linear-gradient(135deg, rgba(155, 135, 245, 0.9), rgba(138, 112, 253, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="relative overflow-hidden rounded-full flex items-center gap-3">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
          <span>Continue with Selected Assets</span>
          <ArrowRight size={24} />
        </div>
      </Button>
    </motion.div>
  );
};

export default SelectedAssetsButton;
