import { linkSessionToUser, updateAssetSelectionsWithAnalysisId, getStoredAnalysisId } from '@/services/sessionStorageService';
import { getRecentAnalysisId } from '@/services/dataRecoveryService';
import { useToast } from '@/hooks/use-toast';

export const linkUserSessionOnAuth = async (userId: string): Promise<void> => {
  try {
    console.log('🔗 Attempting to link session data to authenticated user:', userId);
    
    const linkedCount = await linkSessionToUser(userId);
    
    if (linkedCount > 0) {
      console.log(`✅ Successfully linked ${linkedCount} asset selections to user`);
      
      // Check if we need to update any asset selections with analysis ID
      const sessionId = localStorage.getItem('anonymous_session_id');
      if (sessionId) {
        // Try to get analysis ID from user's recent analyses or localStorage
        let analysisId = await getRecentAnalysisId(userId);
        if (!analysisId) {
          analysisId = getStoredAnalysisId();
        }
        
        if (analysisId) {
          await updateAssetSelectionsWithAnalysisId(sessionId, analysisId);
          console.log('✅ Updated asset selections with analysis ID');
        }
      }
    } else {
      console.log('ℹ️ No session data found to link');
    }
  } catch (error) {
    console.error('❌ Failed to link session data to user:', error);
    // Don't throw - this shouldn't block the authentication flow
  }
};

// Hook to automatically link session data when user logs in
export const useAuthSessionLinking = () => {
  const { toast } = useToast();
  
  const linkSessionOnAuth = async (userId: string) => {
    try {
      const linkedCount = await linkSessionToUser(userId);
      
      if (linkedCount > 0) {
        toast({
          title: "Previous Selections Restored",
          description: `Found and restored ${linkedCount} asset selection${linkedCount > 1 ? 's' : ''} from your previous session.`,
        });
      }
    } catch (error) {
      console.error('Failed to link session data:', error);
      // Don't show error toast - this is background functionality
    }
  };
  
  return { linkSessionOnAuth };
};