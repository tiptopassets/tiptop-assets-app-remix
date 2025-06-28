
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatbotErrorStateProps {
  analysisId?: string | null;
}

const ChatbotErrorState: React.FC<ChatbotErrorStateProps> = ({ analysisId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Property Analysis Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          {analysisId 
            ? `No property analysis found with ID: ${analysisId}` 
            : 'No property analysis found. Please analyze a property first.'
          }
        </p>
        <div className="space-y-2">
          <Button onClick={() => navigate('/submit-property')} className="w-full">
            Analyze Property
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotErrorState;
