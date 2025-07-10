
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
  propertyData?: any; // Updated to accept unified data structure
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
      {/* Quick Actions - Moved to top and horizontal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-tiptop-purple" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="w-full justify-center text-xs px-2 py-2 h-auto"
              onClick={() => navigate('/submit-property')}
            >
              Analyze Another Property
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center text-xs px-2 py-2 h-auto"
              onClick={() => navigate('/dashboard')}
            >
              View My Dashboard
            </Button>
            <Button
              variant="default"
              className="w-full justify-center text-xs px-2 py-2 h-auto bg-tiptop-purple hover:bg-tiptop-purple/90 text-white font-medium"
              onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
            >
              Schedule Concierge Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Property Analysis Card - Hidden as requested */}
      {/* {hasPropertyData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ... Property Analysis Card Content ...
        </motion.div>
      )} */}

      {/* Conversation Analytics */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ConversationAnalytics analytics={analytics} />
        </motion.div>
      )}

    </div>
  );
};

export default ChatbotSidebar;
