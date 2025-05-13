
import { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();

  // Show loading state if authentication is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No longer redirect if not authenticated
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
