import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Upload, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import { markUserAsReturning } from '@/services/firstTimeUserService';

interface FirstTimeUserOptionsBannerProps {
  onDismiss: () => void;
}

export const FirstTimeUserOptionsBanner = ({ onDismiss }: FirstTimeUserOptionsBannerProps) => {
  const [selectedOption, setSelectedOption] = useState<'manual' | 'concierge' | null>(null);
  const { trackOption } = useJourneyTracking();
  const { toast } = useToast();

  const handleOptionSelect = async (option: 'manual' | 'concierge') => {
    setSelectedOption(option);
    await trackOption(option);
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      toast({
        title: "Selection Required",
        description: "Please select an upload option to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Mark user as returning so banner doesn't show again
    markUserAsReturning();
    
    toast({
      title: "Option Selected",
      description: `${selectedOption === 'manual' ? 'Manual Upload' : 'Tiptop Concierge'} selected. Redirecting to onboarding...`,
    });
    
    window.location.href = `/onboarding?option=${selectedOption}`;
  };

  const handleDismiss = () => {
    markUserAsReturning();
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative mb-6"
      >
        <div className="glass-effect rounded-xl p-6 border-2 border-tiptop-purple/30 shadow-lg shadow-tiptop-purple/10">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Welcome! Choose How to Upload Your Assets</h2>
            <p className="text-muted-foreground mb-6">
              Select the option that works best for you to get your assets listed on partner platforms
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual Upload Option */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`glass-effect rounded-lg p-5 cursor-pointer relative overflow-hidden transition-all duration-300 border-2 
                  ${selectedOption === 'manual' ? 
                    'border-tiptop-purple shadow-md shadow-tiptop-purple/20' : 
                    'border-border hover:border-tiptop-purple/50'}`}
                onClick={() => handleOptionSelect('manual')}
              >
                {selectedOption === 'manual' && (
                  <div className="absolute top-3 right-3 text-tiptop-purple">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                
                <div className="flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-tiptop-purple/20 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-tiptop-purple" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Manual Upload</h3>
                  <p className="text-sm text-muted-foreground mb-3">Upload your assets yourself with our partner platforms</p>
                  <div className="text-tiptop-purple font-bold text-lg mb-3">Free</div>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> Step-by-step guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> Access to all partner platforms
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> DIY flexibility and control
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              {/* Concierge Option */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`glass-effect rounded-lg p-5 cursor-pointer relative overflow-hidden transition-all duration-300 border-2 
                  ${selectedOption === 'concierge' ? 
                    'border-tiptop-purple shadow-md shadow-tiptop-purple/20' : 
                    'border-border hover:border-tiptop-purple/50'}`}
                onClick={() => handleOptionSelect('concierge')}
              >
                {selectedOption === 'concierge' && (
                  <div className="absolute top-3 right-3 text-tiptop-purple">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                
                <div className="flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-tiptop-purple/20 flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-tiptop-purple" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Tiptop Concierge</h3>
                  <p className="text-sm text-muted-foreground mb-3">We'll handle everything for you</p>
                  <div className="text-tiptop-purple font-bold text-lg mb-3">$20.00 USD</div>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> Full-service asset listing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> Professional optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-tiptop-purple">✓</span> Priority support
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
            
            {/* Continue Button */}
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleContinue} 
                disabled={!selectedOption}
                className="bg-tiptop-purple hover:bg-tiptop-purple/90 px-6 py-3 rounded-full"
              >
                Continue to Onboarding
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
