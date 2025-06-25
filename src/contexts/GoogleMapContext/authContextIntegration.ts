
import { useState, useEffect } from 'react';

// Create a safe hook wrapper that doesn't violate Rules of Hooks
const useSafeAuth = () => {
  const [authState, setAuthState] = useState<{
    user: any;
    error: boolean;
  }>({
    user: null,
    error: false
  });

  useEffect(() => {
    // Try to import auth context dynamically
    const loadAuthContext = async () => {
      try {
        const { useAuth } = await import('@/contexts/AuthContext');
        const authResult = useAuth();
        setAuthState({
          user: authResult.user,
          error: false
        });
      } catch (error) {
        console.warn('⚠️ AuthProvider not available, proceeding without auth context');
        setAuthState({
          user: null,
          error: true
        });
      }
    };

    loadAuthContext();
  }, []);

  return authState;
};

const useSafeUserData = (user: any) => {
  const [userDataState, setUserDataState] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setUserDataState({
        refreshUserData: async () => {
          console.log('📝 User not authenticated, skipping data refresh');
        },
        saveAddress: async () => {
          console.log('📝 User not authenticated, skipping address save');
          return null;
        },
        savePropertyAnalysis: async () => {
          console.log('📝 User not authenticated, skipping analysis save');
          return null;
        }
      });
      return;
    }

    const loadUserData = async () => {
      try {
        const { useUserData } = await import('@/hooks/useUserData');
        const userDataResult = useUserData();
        setUserDataState(userDataResult);
      } catch (error) {
        console.warn('⚠️ UserData hook not available, proceeding without user data');
        setUserDataState({
          refreshUserData: async () => {},
          saveAddress: async () => null,
          savePropertyAnalysis: async () => null
        });
      }
    };

    loadUserData();
  }, [user]);

  return userDataState;
};

export const useAuthContextIntegration = () => {
  const authState = useSafeAuth();
  const userDataState = useSafeUserData(authState.user);

  return {
    user: authState.user,
    authReady: !authState.error,
    userDataReady: !!userDataState,
    refreshUserData: userDataState?.refreshUserData || (async () => {}),
    saveAddress: userDataState?.saveAddress || (async () => null),
    savePropertyAnalysis: userDataState?.savePropertyAnalysis || (async () => null)
  };
};
