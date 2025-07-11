
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, MessageSquare, CheckCircle, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import QuickActionsBar from './QuickActionsBar';

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
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 bg-gradient-to-r from-background/40 via-[hsl(267,83%,60%)]/5 to-background/40 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Layout */}
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="bg-background/30 backdrop-blur-sm border border-border/20 hover:bg-background/40 transition-all duration-200 p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 bg-background/30 backdrop-blur-sm border border-border/20 rounded-lg px-2 py-1">
                    <img 
                      src="/lovable-uploads/e24798be-80af-43c7-98ff-618e9adc0ee4.png" 
                      alt="AI Assistant" 
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="text-sm font-semibold text-foreground">
                        Property Assistant
                      </h1>
                      {propertyAddress && (
                        <p className="text-xs text-muted-foreground/80 font-medium truncate max-w-[120px]">
                          {propertyAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="bg-background/30 backdrop-blur-sm border border-border/20 hover:bg-background/40 transition-all duration-200 p-2"
                  >
                    {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              /* Desktop Layout */
              <>
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
                <QuickActionsBar />
              </>
            )}
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobile && showMobileMenu && (
            <div className="mt-3 p-3 bg-background/60 backdrop-blur-xl rounded-xl border border-border/20">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs">
                  OpenAI Powered
                </Badge>
                {isReady && (
                  <Badge variant="outline" className="bg-green-500/20 backdrop-blur-sm text-green-600 border border-green-500/30 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
                    Ready
                  </Badge>
                )}
                {targetAsset && (
                  <Badge variant="outline" className="bg-green-500/20 backdrop-blur-sm text-green-600 border border-green-500/30 text-xs">
                    {targetAsset.replace('_', ' ')} Setup
                  </Badge>
                )}
                {hasPropertyData && (
                  <Badge variant="outline" className="bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-500/30 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analysis Complete
                  </Badge>
                )}
              </div>
              <QuickActionsBar isMobile={true} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatbotHeader;
