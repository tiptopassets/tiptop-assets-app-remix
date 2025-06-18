
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

interface DashboardErrorStateProps {
  error: string;
  onRefresh: () => void;
  onReload: () => void;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ 
  error, 
  onRefresh, 
  onReload 
}) => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={onRefresh} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={onReload} variant="outline" className="w-full">
                Reload Dashboard
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardErrorState;
