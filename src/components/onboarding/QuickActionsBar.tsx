import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 glass-effect border border-border/20 hover:bg-background/80 group"
        onClick={() => navigate('/')}
        title="Analyze Another Property"
      >
        <Home className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 glass-effect border border-border/20 hover:bg-background/80 group"
        onClick={() => navigate('/dashboard')}
        title="View My Dashboard"
      >
        <BarChart3 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        className="w-12 h-12 bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary hover:bg-primary/30 group"
        onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
        title="Schedule Concierge Call"
      >
        <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </Button>
    </div>
  );
};

export default QuickActionsBar;