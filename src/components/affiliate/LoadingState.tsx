
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle>Loading Earnings...</CardTitle>
        <CardDescription>Fetching your affiliate earnings. Please wait.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </CardContent>
    </Card>
  );
};

export default LoadingState;
