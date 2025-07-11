import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      <div className="text-center mb-2">
        <h3 className="text-xs font-semibold text-purple-600/80 tracking-wide uppercase">Quick Actions</h3>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-purple-600/20 hover:bg-purple-600/5 text-purple-600 hover:text-purple-700 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/')}
      >
        Analyze New Property
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-36 h-9 bg-background/80 backdrop-blur-md border border-purple-600/20 hover:bg-purple-600/5 text-purple-600 hover:text-purple-700 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate('/dashboard')}
      >
        My Dashboard
      </Button>
      
      <Button
        variant="default"
        size="sm"
        className="w-36 h-9 bg-purple-600/10 backdrop-blur-md border border-purple-600/30 text-purple-600 hover:bg-purple-600/20 font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
      >
        Concierge Call
      </Button>
    </div>
  );
};

export default QuickActionsBar;