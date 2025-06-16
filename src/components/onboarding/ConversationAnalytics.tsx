
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, MessageSquare, Target, Clock } from 'lucide-react';

interface ConversationAnalyticsProps {
  analytics: {
    totalMessages: number;
    conversationDuration: number;
    detectedAssets: string[];
    confidenceScore: number;
    completionProgress: number;
    keyInsights: string[];
  };
}

const ConversationAnalytics: React.FC<ConversationAnalyticsProps> = ({ analytics }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-tiptop-purple" />
            Conversation Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4" />
                Messages
              </div>
              <div className="text-2xl font-bold text-tiptop-purple">{analytics.totalMessages}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="text-2xl font-bold text-tiptop-purple">
                {formatDuration(analytics.conversationDuration)}
              </div>
            </div>
          </div>

          {/* Completion Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Completion</span>
              <span className="text-sm text-gray-600">{analytics.completionProgress}%</span>
            </div>
            <Progress value={analytics.completionProgress} className="h-2" />
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Confidence</span>
              <span className="text-sm text-gray-600">{Math.round(analytics.confidenceScore * 100)}%</span>
            </div>
            <Progress value={analytics.confidenceScore * 100} className="h-2" />
          </div>

          {/* Detected Assets */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-tiptop-purple" />
              <span className="text-sm font-medium">Detected Assets</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analytics.detectedAssets.map((asset) => (
                <Badge key={asset} variant="secondary" className="text-xs">
                  {asset.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          {analytics.keyInsights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {analytics.keyInsights.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-tiptop-purple">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationAnalytics;
