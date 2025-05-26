
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Home, Cpu, TrendingUp, MapPin, Image } from 'lucide-react';

interface LoadingAnalysisProps {
  address: string;
  satelliteImageUrl?: string;
  streetViewImageUrl?: string;
}

const analysisSteps = [
  {
    id: 1,
    title: "Capturing Property Images",
    description: "Using Google Street View and satellite imagery to get comprehensive property views",
    icon: Image,
    duration: 2000
  },
  {
    id: 2,
    title: "Analyzing Roof Structure",
    description: "Google Solar API is calculating solar panel capacity and energy production potential",
    icon: Zap,
    duration: 3000
  },
  {
    id: 3,
    title: "Evaluating Property Features",
    description: "AI is identifying parking spaces, garden areas, pool, and other monetizable assets",
    icon: Home,
    duration: 2500
  },
  {
    id: 4,
    title: "Processing Market Data",
    description: "Analyzing local market rates and demand for each identified opportunity",
    icon: TrendingUp,
    duration: 2000
  },
  {
    id: 5,
    title: "Generating Revenue Insights",
    description: "Calculating potential monthly income and ROI for each monetization strategy",
    icon: Cpu,
    duration: 1500
  }
];

const LoadingAnalysis = ({ address, satelliteImageUrl, streetViewImageUrl }: LoadingAnalysisProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const stepInterval = setInterval(() => {
      if (currentStep < analysisSteps.length - 1) {
        elapsed += analysisSteps[currentStep].duration;
        setProgress((elapsed / totalDuration) * 100);
        setCurrentStep(prev => prev + 1);
      } else {
        setProgress(100);
        clearInterval(stepInterval);
      }
    }, analysisSteps[currentStep]?.duration || 1000);

    return () => clearInterval(stepInterval);
  }, [currentStep]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-tiptop-purple" />
          <h2 className="text-xl font-semibold text-white">Analyzing Property</h2>
        </div>
        <p className="text-gray-300 text-lg">{address}</p>
      </motion.div>

      {/* Property Images */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {satelliteImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect p-4">
              <h3 className="text-white font-medium mb-2">Satellite View</h3>
              <img
                src={satelliteImageUrl}
                alt="Satellite view"
                className="w-full h-48 object-cover rounded-md"
              />
            </Card>
          </motion.div>
        )}
        {streetViewImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-effect p-4">
              <h3 className="text-white font-medium mb-2">Street View</h3>
              <img
                src={streetViewImageUrl}
                alt="Street view"
                className="w-full h-48 object-cover rounded-md"
              />
            </Card>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">Analysis Progress</span>
          <span className="text-tiptop-purple font-bold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {analysisSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 transition-all duration-500 ${
                isActive 
                  ? 'glass-effect border-tiptop-purple/50 bg-tiptop-purple/10' 
                  : isCompleted 
                    ? 'glass-effect border-green-500/50 bg-green-500/10' 
                    : 'glass-effect border-white/10'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? 'bg-tiptop-purple/20 text-tiptop-purple' 
                      : isCompleted 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-white/10 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors duration-500 ${
                      isActive || isCompleted ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isActive || isCompleted ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-tiptop-purple border-t-transparent rounded-full"
                    />
                  )}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-center mt-8"
      >
        <p className="text-gray-400 text-sm">
          Our AI is working hard to identify every monetization opportunity for your property...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingAnalysis;
