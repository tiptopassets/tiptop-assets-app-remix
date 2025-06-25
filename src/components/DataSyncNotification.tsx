
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, Upload } from 'lucide-react';
import { hasUnauthenticatedAnalyses } from '@/services/unauthenticatedAnalysisService';

const DataSyncNotification = () => {
  const { user } = useAuth();
  const { analysisComplete, analysisResults, address, analysisError } = useGoogleMap();
  const { toast } = useToast();
  const [hasShownSyncNotification, setHasShownSyncNotification] = useState(false);
  const [hasShownRecoveryPrompt, setHasShownRecoveryPrompt] = useState(false);
  const [userDismissedSignInPrompt, setUserDismissedSignInPrompt] = useState(false);

  // Show recovery prompt for users who sign in with pending analyses
  useEffect(() => {
    if (user && !hasShownRecoveryPrompt && hasUnauthenticatedAnalyses()) {
      setHasShownRecoveryPrompt(true);
      
      setTimeout(() => {
        toast({
          title: "Previous Analysis Found",
          description: "We found property analysis data from before you signed in. Recovery in progress...",
          action: (
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">
                <Upload className="w-4 h-4 mr-2" />
                View Dashboard
              </a>
            </Button>
          )
        });
      }, 1000);
    }
  }, [user, hasShownRecoveryPrompt, toast]);

  // Show sync notification when analysis completes for authenticated users
  useEffect(() => {
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
    
    // Only show sign-in reminder if user hasn't dismissed it and analysis is complete
    if (analysisComplete && analysisResults && address && !user && !hasShownSyncNotification && !userDismissedSignInPrompt) {
      setHasShownSyncNotification(true);
      
      setTimeout(() => {
        toast({
          title: "Analysis Complete",
          description: "Sign in to save your analysis results to your dashboard and access them later",
          action: (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUserDismissedSignInPrompt(true)}
              >
                Dismiss
              </Button>
            </div>
          )
        });
      }, 1000);
    }

    // Show error notification if analysis failed
    if (analysisError && !hasShownSyncNotification) {
      setHasShownSyncNotification(true);
      
      toast({
        title: "Analysis Error",
        description: analysisError,
        variant: "destructive",
        action: (
          <Button asChild variant="outline" size="sm">
            <a href="/">
              <AlertCircle className="w-4 h-4 mr-2" />
              Try Again
            </a>
          </Button>
        )
      });
    }
  }, [analysisComplete, analysisResults, address, user, analysisError, hasShownSyncNotification, userDismissedSignInPrompt, toast]);

  // Reset notification state when starting new analysis
  useEffect(() => {
    if (!analysisComplete && !analysisError) {
      setHasShownSyncNotification(false);
    }
  }, [analysisComplete, analysisError]);

  // Reset recovery prompt when user logs out
  useEffect(() => {
    if (!user) {
      setHasShownRecoveryPrompt(false);
      setUserDismissedSignInPrompt(false);
    }
  }, [user]);

  return null; // This component only handles notifications
};

export default DataSyncNotification;
