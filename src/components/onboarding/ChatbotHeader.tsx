
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatbotHeaderProps {
  targetAsset?: string | null;
  hasPropertyData: boolean;
  conversationStage: string;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  targetAsset,
  hasPropertyData,
  conversationStage,
  showAnalytics,
  onToggleAnalytics
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-tiptop-purple" />
              <h1 className="text-xl font-semibold text-gray-900">
                AI Property Assistant
              </h1>
              <Badge className="bg-tiptop-purple/10 text-tiptop-purple border-tiptop-purple/20">
                OpenAI Powered
              </Badge>
              {targetAsset && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {targetAsset.replace('_', ' ')} Setup
                </Badge>
              )}
              {hasPropertyData && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Analysis Complete
                </Badge>
              )}
            </div>
          </div>
          {/* Analytics and stage indicators hidden per user request */}
          {/* 
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAnalytics}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {conversationStage.charAt(0).toUpperCase() + conversationStage.slice(1)}
            </Badge>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default ChatbotHeader;
