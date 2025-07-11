import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[70] flex flex-col gap-2">
      <div className="text-center mb-2">
        <h3 className="text-xs font-semibold text-[hsl(267,83%,60%)] tracking-wide uppercase">Quick Actions</h3>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-[hsl(267,83%,60%)] hover:text-[hsl(267,83%,55%)] font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/')}
      >
        Analyze New Property
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-[hsl(267,83%,60%)]/20 hover:bg-[hsl(267,83%,60%)]/5 text-[hsl(267,83%,60%)] hover:text-[hsl(267,83%,55%)] font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/dashboard')}
      >
        My Dashboard
      </Button>
      
      <Button
        variant="default"
        size="sm"
        className="w-36 h-9 bg-[hsl(267,83%,60%)]/10 backdrop-blur-md border border-[hsl(267,83%,60%)]/30 text-[hsl(267,83%,60%)] hover:bg-[hsl(267,83%,60%)]/20 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
      >
        Concierge Call
      </Button>
    </div>
  );
};

export default QuickActionsBar;