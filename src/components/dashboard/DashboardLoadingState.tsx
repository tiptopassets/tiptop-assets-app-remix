
import React from 'react';
import DashboardLayout from './DashboardLayout';

interface DashboardLoadingStateProps {
  message: string;
}

const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({ message }) => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLoadingState;
