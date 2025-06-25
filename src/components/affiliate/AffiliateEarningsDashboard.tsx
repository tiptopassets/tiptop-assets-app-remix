
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AffiliateEarningsDashboard: React.FC = () => {
  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle>Affiliate Earnings</CardTitle>
        <CardDescription>Affiliate system is currently unavailable.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Affiliate earnings tracking is temporarily disabled.</p>
          <p className="text-sm mt-2">This feature will be restored in a future update.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateEarningsDashboard;
