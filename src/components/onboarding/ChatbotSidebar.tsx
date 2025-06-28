
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import ConversationAnalytics from '@/components/onboarding/ConversationAnalytics';

interface ChatbotSidebarProps {
  propertyData?: PropertyAnalysisData | null;
  analysisId?: string | null;
  targetAsset?: string | null;
  hasPropertyData: boolean;
  showAnalytics: boolean;
  analytics: {
    totalMessages: number;
    conversationDuration: number;
    detectedAssets: string[];
    confidenceScore: number;
    completionProgress: number;
    keyInsights: string[];
  };
}

const ChatbotSidebar: React.FC<ChatbotSidebarProps> = ({
  propertyData,
  analysisId,
  targetAsset,
  hasPropertyData,
  showAnalytics,
  analytics
}) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Property Summary */}
      {hasPropertyData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-tiptop-purple" />
                Your Property Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-600">{propertyData?.address}</p>
                </div>
                {analysisId && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Analysis ID</p>
                    <p className="text-xs text-gray-500 font-mono">{analysisId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Monthly Potential</p>
                  <p className="text-lg font-bold text-green-600">${propertyData?.totalMonthlyRevenue}/month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Available Assets ({propertyData?.availableAssets.length})</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {propertyData?.availableAssets.map((asset) => (
                      <Badge key={asset.type} variant="outline" className="text-xs">
                        {asset.name} (${asset.monthlyRevenue}/mo)
                      </Badge>
                    ))}
                  </div>
                </div>
                {targetAsset && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current Focus</p>
                    <Badge className="bg-tiptop-purple text-white">
                      {targetAsset.replace('_', ' ')} Setup
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conversation Analytics */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ConversationAnalytics analytics={analytics} />
        </motion.div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-tiptop-purple" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/submit-property')}
          >
            Analyze Another Property
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/dashboard')}
          >
            View My Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
          >
            Schedule Concierge Call
          </Button>
        </CardContent>
      </Card>

      {/* AI Assistant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-tiptop-purple" />
            AI Assistant Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-tiptop-purple/5 rounded-lg">
              <p className="font-medium text-tiptop-purple mb-1">Intelligent Responses</p>
              <p className="text-gray-600">
                Powered by OpenAI to understand your specific questions and provide accurate answers.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-700 mb-1">Property-Aware</p>
              <p className="text-gray-600">
                Knows your exact property analysis and can provide specific recommendations based on your assets.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700 mb-1">Context Memory</p>
              <p className="text-gray-600">
                Remembers our conversation to provide consistent and relevant assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotSidebar;
