
import React from 'react';

interface ChatbotLoadingStateProps {
  isAuthLoading: boolean;
  analysisId?: string | null;
  propertyAddress?: string;
}

const ChatbotLoadingState: React.FC<ChatbotLoadingStateProps> = ({
  isAuthLoading,
  analysisId,
  propertyAddress
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isAuthLoading ? 'Authenticating...' : 'Loading your property analysis...'}
        </p>
        {analysisId && (
          <div className="mt-2 text-sm text-gray-500">
            <p>Analysis ID: {analysisId}</p>
            {propertyAddress && (
              <p>Address: {propertyAddress}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotLoadingState;
