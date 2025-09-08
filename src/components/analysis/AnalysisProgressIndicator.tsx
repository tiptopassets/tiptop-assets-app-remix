import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Zap, CheckCircle } from 'lucide-react';

interface AnalysisProgressIndicatorProps {
  currentStep: string;
  steps: {
    id: string;
    label: string;
    icon: React.ReactNode;
    completed: boolean;
    active: boolean;
  }[];
}

const AnalysisProgressIndicator: React.FC<AnalysisProgressIndicatorProps> = ({
  currentStep,
  steps
}) => {
  return (
    <div className="bg-black/20 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-5 h-5 text-primary" />
        </motion.div>
        <h3 className="text-white font-medium">Analyzing Property...</h3>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              step.active
                ? 'bg-primary/20 border border-primary/30'
                : step.completed
                ? 'bg-green-500/10'
                : 'bg-black/10'
            }`}
          >
            <div
              className={`flex-shrink-0 transition-colors ${
                step.completed
                  ? 'text-green-400'
                  : step.active
                  ? 'text-primary'
                  : 'text-gray-500'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                step.icon
              )}
            </div>
            
            <span
              className={`text-sm ${
                step.active
                  ? 'text-white font-medium'
                  : step.completed
                  ? 'text-green-300'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            
            {step.active && (
              <motion.div
                className="ml-auto flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-1 h-1 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-1 h-1 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1 h-1 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisProgressIndicator;