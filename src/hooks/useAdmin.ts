
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user has admin role using the new secure function
      const { data, error } = await supabase.rpc('is_admin');

      if (error) throw error;

      setIsAdmin(data || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Removed makeAdmin and removeAdmin functions for security
  // These operations should only be performed through secure admin endpoints
  // with proper authorization checks

  return { isAdmin, loading };
};
