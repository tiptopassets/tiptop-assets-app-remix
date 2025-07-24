
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Gamepad2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickActionsBarProps {
  isMobile?: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const isMobileDevice = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle scroll detection for mobile
  useEffect(() => {
    if (!isMobile && !isMobileDevice) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Collapse immediately when scrolling starts
      if (!isCollapsed) {
        setIsCollapsed(true);
        setIsExpanded(false);
      }

      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set timeout to show again after scrolling stops (optional)
      scrollTimeout = setTimeout(() => {
        // Don't auto-expand, keep collapsed until user clicks
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, isMobileDevice, isCollapsed]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  if (isMobile || isMobileDevice) {
    return (
      <div className="flex flex-col gap-2">
        <div 
          className="text-center mb-2 cursor-pointer transition-all duration-300 hover:opacity-80"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xs font-semibold text-[hsl(267,83%,60%)] tracking-wide uppercase">
              Quick Actions
            </h3>
            {isCollapsed && (
              isExpanded ? 
                <ChevronUp className="h-3 w-3 text-[hsl(267,83%,60%)]" /> : 
                <ChevronDown className="h-3 w-3 text-[hsl(267,83%,60%)]" />
            )}
          </div>
        </div>
        
        <div className={`grid grid-cols-1 gap-2 transition-all duration-300 ease-in-out overflow-hidden ${
          (isCollapsed && !isExpanded) ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
        }`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/')}
          >
            Analyze New Property
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/dashboard')}
          >
            My Dashboard
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 hover:bg-purple-500/30 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/gamified-property')}
          >
            <Gamepad2 className="h-3 w-3 mr-1" />
            3D View
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="w-full h-8 bg-[hsl(267,83%,60%)]/10 backdrop-blur-md border border-[hsl(267,83%,60%)]/30 text-black hover:bg-[hsl(267,83%,60%)]/20 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => window.open('https://calendly.com/tiptopassets/30min', '_blank')}
          >
            Concierge Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-6 top-28 z-[80] flex flex-col gap-2">
      <div className="text-center mb-2">
        <h3 className="text-xs font-semibold text-[hsl(267,83%,60%)] tracking-wide uppercase">Quick Actions</h3>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/')}
      >
        Analyze New Property
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/dashboard')}
      >
        My Dashboard
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 hover:bg-purple-500/30 text-black hover:text-black font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/gamified-property')}
      >
        <Gamepad2 className="h-4 w-4 mr-1" />
        3D View
      </Button>
      
      <Button
        variant="default"
        size="sm"
        className="w-36 h-9 bg-[hsl(267,83%,60%)]/10 backdrop-blur-md border border-[hsl(267,83%,60%)]/30 text-black hover:bg-[hsl(267,83%,60%)]/20 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => window.open('https://calendly.com/tiptopassets/30min', '_blank')}
      >
        Concierge Call
      </Button>
    </div>
  );
};

export default QuickActionsBar;
