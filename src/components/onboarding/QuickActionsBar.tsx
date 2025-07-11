import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      <div className="text-center mb-3">
        <h3 className="text-sm font-medium text-tiptop-purple">Quick Actions</h3>
      </div>
      
      <Button
        variant="outline"
        className="w-40 h-10 glass-effect border border-tiptop-purple/20 hover:bg-tiptop-purple/10 text-tiptop-purple hover:text-tiptop-purple font-medium"
        onClick={() => navigate('/')}
      >
        Analyze Another Property
      </Button>
      
      <Button
        variant="outline"
        className="w-40 h-10 glass-effect border border-tiptop-purple/20 hover:bg-tiptop-purple/10 text-tiptop-purple hover:text-tiptop-purple font-medium"
        onClick={() => navigate('/dashboard')}
      >
        View My Dashboard
      </Button>
      
      <Button
        variant="default"
        className="w-40 h-10 bg-tiptop-purple/20 backdrop-blur-sm border border-tiptop-purple/30 text-tiptop-purple hover:bg-tiptop-purple/30 font-medium"
        onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
      >
        Schedule Concierge Call
      </Button>
    </div>
  );
};

export default QuickActionsBar;