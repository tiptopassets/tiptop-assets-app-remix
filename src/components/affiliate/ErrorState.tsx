
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: Error | null;
  refreshData: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, refreshData }) => {
  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>Failed to load affiliate earnings.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center">
        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
        {error?.message || 'An unexpected error occurred.'}
      </CardContent>
      <CardFooter>
        <Button onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorState;
