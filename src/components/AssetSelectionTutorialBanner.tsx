import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetSelectionTutorialBannerProps {
  onDismiss: () => void;
}

const AssetSelectionTutorialBanner = ({ onDismiss }: AssetSelectionTutorialBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto mb-8 px-4"
        >
          <div className="relative bg-gradient-to-r from-tiptop-purple/20 to-violet-600/20 backdrop-blur-md border border-tiptop-purple/30 rounded-2xl p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              aria-label="Close tutorial"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-tiptop-purple/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-tiptop-purple" />
                </div>
                <div className="absolute -inset-1 bg-tiptop-purple/20 rounded-full blur-md -z-10 animate-pulse"></div>
              </div>

              {/* Heading */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Time to Pick Your Money Makers! 💰
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Now it's time to select what you want to make money from - your <span className="text-tiptop-purple font-semibold">parking</span>, <span className="text-tiptop-purple font-semibold">storage</span>, <span className="text-tiptop-purple font-semibold">internet</span>, and more!
                </p>
              </div>

              {/* Additional tip */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full">
                <p className="text-sm text-white/70">
                  💡 <span className="font-semibold text-white">Pro tip:</span> Scroll down to the <span className="text-violet-400">additional assets section</span> to discover even more ways to earn!
                </p>
              </div>

              {/* Got it button */}
              <Button
                onClick={handleDismiss}
                className="bg-tiptop-purple hover:bg-tiptop-purple/90 text-white px-8 py-2 rounded-full font-semibold shadow-lg hover:shadow-tiptop-purple/50 transition-all"
              >
                Got it! Let's go
              </Button>
            </div>

            {/* Animated arrow pointing down */}
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <ChevronDown className="w-8 h-8 text-tiptop-purple drop-shadow-glow" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssetSelectionTutorialBanner;
