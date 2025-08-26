
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
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-pulse mx-auto mb-2 text-primary" />
            <p className="text-card-foreground font-medium">AI is analyzing your earnings potential...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Run a speed test to get AI-powered earnings analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-600 dark:bg-green-500';
      case 'medium': return 'bg-yellow-600 dark:bg-yellow-500';
      case 'low': return 'bg-red-600 dark:bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Earnings Analysis
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
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
            <h4 className="text-card-foreground font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              Monthly Earnings Forecast
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-muted-foreground font-medium">Conservative</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  ${analysis.monthlyEarnings.conservative}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-muted-foreground font-medium">Average</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${analysis.monthlyEarnings.average}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-muted-foreground font-medium">Optimistic</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${analysis.monthlyEarnings.optimistic}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Confidence & Market Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-card-foreground font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
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
              <h4 className="text-card-foreground font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Market Factors
              </h4>
              <div className="flex gap-2">
                <Badge className={`${getDemandColor(analysis.marketFactors.demandLevel)} text-white border-none`}>
                  {analysis.marketFactors.demandLevel} demand
                </Badge>
                <Badge variant="outline" className="text-card-foreground border-border bg-muted">
                  {analysis.marketFactors.locationPremium}x location
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Reasoning */}
          <div>
            <h4 className="text-card-foreground font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Analysis
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>

          {/* Optimization Tips */}
          <div>
            <h4 className="text-card-foreground font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Optimization Tips
            </h4>
            <ul className="space-y-1">
              {analysis.optimizationTips.map((tip, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Best Sharing Schedule */}
          <div>
            <h4 className="text-card-foreground font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Optimal Sharing Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                <p className="text-green-600 dark:text-green-400 font-medium">Peak Hours</p>
                <p className="text-muted-foreground">{analysis.bestSharingSchedule.peakHours.join(', ')}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-blue-600 dark:text-blue-400 font-medium">Recommended Uptime</p>
                <p className="text-muted-foreground">{analysis.bestSharingSchedule.recommendedUptime} hours/day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
