
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetectedAsset {
  id: string;
  name: string;
  confidence: number;
  estimatedRevenue: number;
  setupComplexity: 'low' | 'medium' | 'high';
  keyRequirements: string[];
  marketOpportunity: 'high' | 'medium' | 'low';
}

interface SmartAssetDetectionProps {
  detectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onAssetDismiss: (assetId: string) => void;
}

const SmartAssetDetection: React.FC<SmartAssetDetectionProps> = ({
  detectedAssets,
  onAssetSelect,
  onAssetDismiss
}) => {
  const [analyzedAssets, setAnalyzedAssets] = useState<DetectedAsset[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock analysis - in real implementation, this would call an AI service
  useEffect(() => {
    if (detectedAssets.length > 0) {
      setIsAnalyzing(true);
      
      // Simulate AI analysis
      setTimeout(() => {
        const analyzed = detectedAssets.map((asset, index) => ({
          id: asset,
          name: asset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          confidence: 0.7 + (Math.random() * 0.3), // 70-100% confidence
          estimatedRevenue: Math.floor(Math.random() * 800) + 200, // $200-$1000
          setupComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          keyRequirements: getAssetRequirements(asset),
          marketOpportunity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
        }));
        
        setAnalyzedAssets(analyzed);
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [detectedAssets]);

  const getAssetRequirements = (asset: string): string[] => {
    const requirements: Record<string, string[]> = {
      'rooftop': ['Structural assessment', 'Solar permits', 'Grid connection'],
      'parking': ['Insurance coverage', 'Access management', 'Payment system'],
      'internet': ['Speed test verification', 'Router setup', 'Bandwidth allocation'],
      'pool': ['Safety compliance', 'Insurance update', 'Booking platform'],
      'storage': ['Security measures', 'Access control', 'Item restrictions'],
      'garden': ['Space preparation', 'Event permits', 'Liability coverage']
    };
    
    return requirements[asset] || ['Initial setup', 'Documentation', 'Service activation'];
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-tiptop-purple/10 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-tiptop-purple animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Analyzing Asset Opportunities</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our AI is evaluating your property assets for monetization potential...
              </p>
              <Progress value={65} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyzedAssets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Smart Asset Detection Results
        </h3>
        <p className="text-sm text-gray-600">
          AI-powered analysis of your property's monetization potential
        </p>
      </div>

      <AnimatePresence>
        {analyzedAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-tiptop-purple">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {asset.name}
                      <Badge className={`text-xs ${getComplexityColor(asset.setupComplexity)}`}>
                        {asset.setupComplexity} setup
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm text-gray-600">
                        Confidence: {Math.round(asset.confidence * 100)}%
                      </div>
                      <div className="text-sm font-medium text-tiptop-purple">
                        ${asset.estimatedRevenue}/month
                      </div>
                      <div className={`text-sm font-medium ${getOpportunityColor(asset.marketOpportunity)}`}>
                        {asset.marketOpportunity} demand
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssetDismiss(asset.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="bg-tiptop-purple hover:bg-purple-600"
                      onClick={() => onAssetSelect(asset.id)}
                    >
                      Set Up
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Confidence Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">AI Confidence</span>
                      <span className="text-xs font-medium">{Math.round(asset.confidence * 100)}%</span>
                    </div>
                    <Progress value={asset.confidence * 100} className="h-1" />
                  </div>

                  {/* Key Requirements */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Key Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {asset.keyRequirements.map((req, reqIndex) => (
                        <Badge key={reqIndex} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Market Opportunity Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className={`h-3 w-3 ${getOpportunityColor(asset.marketOpportunity)}`} />
                    <span className="text-gray-600">
                      Market opportunity: 
                    </span>
                    <span className={`font-medium ${getOpportunityColor(asset.marketOpportunity)}`}>
                      {asset.marketOpportunity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SmartAssetDetection;
