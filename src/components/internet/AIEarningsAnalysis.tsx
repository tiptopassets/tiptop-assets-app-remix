
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Lightbulb,
  DollarSign,
  Target,
  Calendar,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIEarningsResponse } from '@/services/aiEarningsService';

interface AIEarningsAnalysisProps {
  analysis: AIEarningsResponse | null;
  isAnalyzing: boolean;
}

export const AIEarningsAnalysis = ({ analysis, isAnalyzing }: AIEarningsAnalysisProps) => {
  if (isAnalyzing) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-pulse mx-auto mb-2 text-purple-400" />
            <p className="text-white/80">AI is analyzing your earnings potential...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-gray-400">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Run a speed test to get AI-powered earnings analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Earnings Analysis
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>AI-powered analysis considering network quality, location, market demand, and optimization opportunities</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Earnings Predictions */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              Monthly Earnings Forecast
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-xs text-gray-300">Conservative</p>
                <p className="text-lg font-bold text-red-400">
                  ${analysis.monthlyEarnings.conservative}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-xs text-gray-300">Average</p>
                <p className="text-lg font-bold text-blue-400">
                  ${analysis.monthlyEarnings.average}
                </p>
              </div>
              <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-xs text-gray-300">Optimistic</p>
                <p className="text-lg font-bold text-green-400">
                  ${analysis.monthlyEarnings.optimistic}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Confidence & Market Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Confidence Score
              </h4>
              <div className="flex items-center gap-2">
                <Progress value={analysis.confidenceScore * 100} className="flex-1 h-2" />
                <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidenceScore)}`}>
                  {Math.round(analysis.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                Market Factors
              </h4>
              <div className="flex gap-2">
                <Badge className={getDemandColor(analysis.marketFactors.demandLevel)}>
                  {analysis.marketFactors.demandLevel} demand
                </Badge>
                <Badge variant="outline" className="text-gray-300 border-gray-500">
                  {analysis.marketFactors.locationPremium}x location
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* AI Reasoning */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              AI Analysis
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>

          {/* Optimization Tips */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              Optimization Tips
            </h4>
            <ul className="space-y-1">
              {analysis.optimizationTips.map((tip, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Best Sharing Schedule */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Optimal Sharing Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-green-500/20 rounded border border-green-500/30">
                <p className="text-green-400 font-medium">Peak Hours</p>
                <p className="text-gray-300">{analysis.bestSharingSchedule.peakHours.join(', ')}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded border border-blue-500/30">
                <p className="text-blue-400 font-medium">Recommended Uptime</p>
                <p className="text-gray-300">{analysis.bestSharingSchedule.recommendedUptime} hours/day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
