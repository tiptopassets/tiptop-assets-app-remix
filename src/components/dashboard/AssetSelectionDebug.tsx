import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { linkUserSessionOnAuth } from '@/services/authLinkingService';
import { useToast } from '@/hooks/use-toast';

const AssetSelectionDebug = () => {
  const { user } = useAuth();
  const currentAnalysisId = localStorage.getItem('currentAnalysisId');
  const { assetSelections, loading, refetch } = useUserAssetSelections(currentAnalysisId || undefined);
  const { toast } = useToast();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleManualLink = async () => {
    if (!user?.id) return;
    
    try {
      await linkUserSessionOnAuth(user.id);
      toast({
        title: "Manual Link Triggered",
        description: "Attempting to link session data to user account.",
      });
      // Refresh the asset selections
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error) {
      toast({
        title: "Link Failed",
        description: "Failed to link session data to user account.",
        variant: "destructive"
      });
    }
  };

  const sessionId = localStorage.getItem('anonymous_session_id');
  const analysisId = localStorage.getItem('currentAnalysisId');

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔧 Asset Selection Debug (Dev Only)
          <Badge variant="outline">Development</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <strong>User Status:</strong>{' '}
          {user ? `Authenticated (${user.email})` : 'Anonymous'}
        </div>
        
        <div>
          <strong>Asset Selections:</strong>{' '}
          {loading ? 'Loading...' : `${assetSelections.length} found`}
        </div>
        
        <div>
          <strong>Session ID:</strong>{' '}
          {sessionId ? sessionId.substring(0, 20) + '...' : 'None'}
        </div>
        
        <div>
          <strong>Current Analysis ID:</strong>{' '}
          {analysisId ? analysisId.substring(0, 20) + '...' : 'None'}
        </div>
        
        {assetSelections.length > 0 && (
          <div>
            <strong>Selection Details:</strong>
            <ul className="mt-1 space-y-1">
              {assetSelections.map((selection, index) => (
                <li key={selection.id} className="pl-2">
                  {index + 1}. {selection.asset_type} - ${selection.monthly_revenue}/mo
                  {selection.user_id ? ' (User)' : ' (Session)'}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {user && sessionId && (
          <Button 
            size="sm" 
            onClick={handleManualLink}
            className="w-full text-xs"
          >
            🔗 Manual Link Session to User
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetSelectionDebug;