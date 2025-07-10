
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
      {/* Quick Actions removed - now in QuickActionsBar above chat */}

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
