
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, Upload, X } from 'lucide-react';
import { hasUnauthenticatedAnalyses } from '@/services/unauthenticatedAnalysisService';

// Local storage keys for user preferences
const STORAGE_KEYS = {
  DISMISSED_SIGNIN_PROMPT: 'dismissed_signin_prompt',
  SHOW_SIGNIN_NOTIFICATIONS: 'show_signin_notifications'
};

const DataSyncNotification = () => {
  const [authContext, setAuthContext] = useState<{ user: any } | null>(null);
  const [authError, setAuthError] = useState(false);
  const { analysisComplete, analysisResults, address, analysisError } = useGoogleMap();
  const { toast } = useToast();
  const [hasShownSyncNotification, setHasShownSyncNotification] = useState(false);
  const [hasShownRecoveryPrompt, setHasShownRecoveryPrompt] = useState(false);
  const [showSigninNotifications, setShowSigninNotifications] = useState(true);

  // Safely get auth context
  useEffect(() => {
    try {
      const authResult = useAuth();
      setAuthContext(authResult);
      setAuthError(false);
    } catch (error) {
      console.warn('Auth context not available in DataSyncNotification');
      setAuthContext({ user: null });
      setAuthError(true);
    }
  }, []);

  // Load user preferences
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED_SIGNIN_PROMPT) === 'true';
    const showNotifications = localStorage.getItem(STORAGE_KEYS.SHOW_SIGNIN_NOTIFICATIONS) !== 'false';
    setShowSigninNotifications(showNotifications && !dismissed);
  }, []);

  const user = authContext?.user;

  // Permanently dismiss sign-in notifications
  const dismissSigninNotifications = () => {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_SIGNIN_PROMPT, 'true');
    localStorage.setItem(STORAGE_KEYS.SHOW_SIGNIN_NOTIFICATIONS, 'false');
    setShowSigninNotifications(false);
  };

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
    
    // Only show sign-in reminder if notifications are enabled and analysis is complete
    if (analysisComplete && 
        analysisResults && 
        address && 
        !user && 
        !hasShownSyncNotification && 
        showSigninNotifications &&
        !authError) {
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
                onClick={dismissSigninNotifications}
              >
                <X className="w-4 h-4 mr-1" />
                Don't show again
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
  }, [analysisComplete, analysisResults, address, user, analysisError, hasShownSyncNotification, showSigninNotifications, authError, toast]);

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
    }
  }, [user]);

  return null; // This component only handles notifications
};

export default DataSyncNotification;
