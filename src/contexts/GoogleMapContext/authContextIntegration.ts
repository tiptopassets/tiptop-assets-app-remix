
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';

export const useAuthContextIntegration = () => {
  const [authReady, setAuthReady] = useState(false);
  const [userDataReady, setUserDataReady] = useState(false);
  const [authContext, setAuthContext] = useState<{ user: any } | null>(null);
  const [userDataContext, setUserDataContext] = useState<any>(null);

  // Always call useAuth hook - handle errors in useEffect
  let authHookResult = null;
  let authHookError = false;
  
  try {
    authHookResult = useAuth();
  } catch (error) {
    authHookError = true;
  }

  // Always call useUserData hook - handle errors in useEffect
  let userDataHookResult = null;
  let userDataHookError = false;
  
  try {
    userDataHookResult = useUserData();
  } catch (error) {
    userDataHookError = true;
  }

  // Handle auth context initialization
  useEffect(() => {
    if (authHookError) {
      console.warn('⚠️ AuthProvider not available yet, proceeding without auth context');
      setAuthContext({ user: null });
      setAuthReady(false);
    } else if (authHookResult) {
      setAuthContext(authHookResult);
      setAuthReady(true);
    }
  }, [authHookError, authHookResult]);

  // Handle user data context initialization
  useEffect(() => {
    if (userDataHookError || !authReady || !authContext?.user) {
      if (userDataHookError) {
        console.warn('⚠️ UserData hook not available, proceeding without user data');
      }
      
      setUserDataContext({
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
      setUserDataReady(false);
    } else if (userDataHookResult) {
      setUserDataContext(userDataHookResult);
      setUserDataReady(true);
    }
  }, [userDataHookError, authReady, authContext?.user, userDataHookResult]);

  return {
    user: authContext?.user || null,
    authReady,
    userDataReady,
    refreshUserData: userDataContext?.refreshUserData || (async () => {}),
    saveAddress: userDataContext?.saveAddress || (async () => null),
    savePropertyAnalysis: userDataContext?.savePropertyAnalysis || (async () => null)
  };
};
