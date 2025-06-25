
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';

export const useAuthContextIntegration = () => {
  const [authReady, setAuthReady] = useState(false);
  const [userDataReady, setUserDataReady] = useState(false);
  
  let authContext;
  let userDataContext;
  
  try {
    authContext = useAuth();
    setAuthReady(true);
  } catch (error) {
    console.warn('⚠️ AuthProvider not available yet, proceeding without auth context');
    authContext = { user: null };
  }

  const { user } = authContext;
  
  // Only use useUserData hook if we have a valid auth context
  try {
    if (authReady && user) {
      userDataContext = useUserData();
      setUserDataReady(true);
    } else {
      userDataContext = { 
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
      };
    }
  } catch (error) {
    console.warn('⚠️ UserData hook not available, proceeding without user data');
    userDataContext = { 
      refreshUserData: async () => {},
      saveAddress: async () => null,
      savePropertyAnalysis: async () => null
    };
  }

  return {
    user,
    authReady,
    userDataReady,
    refreshUserData: userDataContext.refreshUserData,
    saveAddress: userDataContext.saveAddress,
    savePropertyAnalysis: userDataContext.savePropertyAnalysis
  };
};
