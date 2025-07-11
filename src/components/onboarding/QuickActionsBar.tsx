import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-tiptop-purple" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="w-full justify-center text-xs px-2 py-2 h-auto"
            onClick={() => navigate('/')}
          >
            Analyze Another Property
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center text-xs px-2 py-2 h-auto"
            onClick={() => navigate('/dashboard')}
          >
            View My Dashboard
          </Button>
          <Button
            variant="default"
            className="w-full justify-center text-xs px-2 py-2 h-auto bg-tiptop-purple hover:bg-tiptop-purple/90 text-white font-medium"
            onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
          >
            Schedule Concierge Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsBar;