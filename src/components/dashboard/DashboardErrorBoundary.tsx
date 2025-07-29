
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

const DashboardErrorBoundary = ({ children }: DashboardErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Dashboard Error</h2>
            <p className="text-gray-600 mb-6">
              There was an error loading the dashboard. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-tiptop-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default DashboardErrorBoundary;
