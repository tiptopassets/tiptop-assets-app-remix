import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, X } from 'lucide-react';

interface ManualUploadInstructionsBannerProps {
  onDismiss: () => void;
}

export const ManualUploadInstructionsBanner = ({ onDismiss }: ManualUploadInstructionsBannerProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative mb-6"
      >
        <div className="glass-effect rounded-xl p-6 border-2 border-tiptop-purple/30 shadow-lg shadow-tiptop-purple/10">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Start Uploading!</h2>
            <p className="text-muted-foreground mb-4">
              Click on any "Start Integration" button below to begin uploading your assets to partner platforms
            </p>
            
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="w-8 h-8 text-tiptop-purple" />
              </motion.div>
            </div>

            <Button 
              onClick={onDismiss}
              variant="outline"
              className="border-tiptop-purple/30 hover:border-tiptop-purple/50"
            >
              Got it!
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
