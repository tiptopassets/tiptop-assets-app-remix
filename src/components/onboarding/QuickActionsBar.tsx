
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionsBarProps {
  onStartOver: () => void;
  onExportChat: () => void;
}

const QuickActionsBar = ({ onStartOver, onExportChat }: QuickActionsBarProps) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          onClick={onStartOver}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        
        <Button
          onClick={onExportChat}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export Chat
        </Button>
        
        <Button 
          onClick={() => window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAFKAG3Oh5NUN1FBQlBKUzNaQjVGNlBIS1ZXRU8wRTFWRi4u', '_blank')}
          variant="outline"
          size="sm"
          className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Quick Survey
        </Button>

        <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Link to="/dashboard">
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsBar;
