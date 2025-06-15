
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle } from 'lucide-react';

const DataSyncNotification = () => {
  const { user } = useAuth();
  const { analysisComplete, analysisResults, address } = useGoogleMap();
  const { toast } = useToast();
  const [hasShownSyncNotification, setHasShownSyncNotification] = useState(false);

  useEffect(() => {
    // Show sync notification when analysis completes for authenticated users
    if (analysisComplete && analysisResults && address && user && !hasShownSyncNotification) {
      setHasShownSyncNotification(true);
      
      // Give a moment for the sync to complete, then show notification
      setTimeout(() => {
        toast({
          title: "Analysis Saved",
          description: `Your property analysis for ${address} has been saved to your dashboard`,
          action: (
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">
                <Database className="w-4 h-4 mr-2" />
                View Dashboard
              </a>
            </Button>
          )
        });
      }, 2000);
    }
    
    // Show reminder for non-authenticated users
    if (analysisComplete && analysisResults && address && !user && !hasShownSyncNotification) {
      setHasShownSyncNotification(true);
      
      setTimeout(() => {
        toast({
          title: "Analysis Complete",
          description: "Sign in to save your analysis results to your dashboard",
          action: (
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">
                <AlertCircle className="w-4 h-4 mr-2" />
                Sign In
              </a>
            </Button>
          )
        });
      }, 1000);
    }
  }, [analysisComplete, analysisResults, address, user, hasShownSyncNotification, toast]);

  // Reset notification state when starting new analysis
  useEffect(() => {
    if (!analysisComplete) {
      setHasShownSyncNotification(false);
    }
  }, [analysisComplete]);

  return null; // This component only handles notifications
};

export default DataSyncNotification;
