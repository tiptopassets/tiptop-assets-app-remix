
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatbotHeaderProps {
  targetAsset?: string | null;
  hasPropertyData: boolean;
  conversationStage: string;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
  propertyAddress?: string;
  isReady?: boolean;
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  targetAsset,
  hasPropertyData,
  conversationStage,
  showAnalytics,
  onToggleAnalytics,
  propertyAddress,
  isReady
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-background/40 via-primary/5 to-background/40 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-background/30 backdrop-blur-sm border border-border/20 hover:bg-background/40 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-background/30 backdrop-blur-sm border border-border/20 rounded-lg px-3 py-1.5">
                <img 
                  src="/lovable-uploads/e24798be-80af-43c7-98ff-618e9adc0ee4.png" 
                  alt="AI Assistant" 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Property Assistant
                  </h1>
                  {propertyAddress && (
                    <p className="text-sm text-muted-foreground/80 font-medium">
                      {propertyAddress}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary">
                OpenAI Powered
              </Badge>
              {isReady && (
                <Badge variant="outline" className="bg-green-500/20 backdrop-blur-sm text-green-600 border border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  Ready
                </Badge>
              )}
              {targetAsset && (
                <Badge variant="outline" className="bg-green-500/20 backdrop-blur-sm text-green-600 border border-green-500/30">
                  {targetAsset.replace('_', ' ')} Setup
                </Badge>
              )}
              {hasPropertyData && (
                <Badge variant="outline" className="bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-500/30">
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
