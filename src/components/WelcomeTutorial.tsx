import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, DollarSign, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WelcomeTutorialProps {
  onClose: () => void;
}

const steps = [
  {
    icon: MapPin,
    title: 'Step 1: Enter Your Address',
    description: 'Start by entering your property address in the search bar above. This helps us analyze your specific location.',
    color: 'text-tiptop-purple'
  },
  {
    icon: Search,
    title: 'Step 2: Property Analysis',
    description: 'Our system analyzes your property using satellite imagery and local data to identify monetization opportunities.',
    color: 'text-tiptop-green'
  },
  {
    icon: DollarSign,
    title: 'Step 3: Select Opportunities',
    description: 'Review the asset monetization opportunities we found for your property and select the ones that interest you.',
    color: 'text-tiptop-orange'
  },
  {
    icon: Users,
    title: 'Step 4: Partner Integration',
    description: 'Get connected with trusted partners to integrate and start earning from your selected opportunities.',
    color: 'text-tiptop-purple'
  }
];

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Close tutorial"
          >
            <X className="h-5 w-5" />
          </button>
          
          <CardTitle className="text-2xl">Welcome to Tiptop!</CardTitle>
          <CardDescription>
            Discover how to monetize your property in 4 easy steps
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full bg-accent ${currentStepData.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                  <p className="text-muted-foreground mt-1">{currentStepData.description}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-tiptop-purple'
                    : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
