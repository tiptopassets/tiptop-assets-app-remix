
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (error) throw error;

      setIsAdmin(roles && roles.length > 0);
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

  const makeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;
      
      // If adding admin role to current user
      if (userId === user?.id) {
        setIsAdmin(true);
      }
      
      toast({
        title: "Admin Role Assigned",
        description: "User has been given administrator permissions.",
        variant: "default",
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error making user admin:", error);
      
      toast({
        title: "Error Assigning Role",
        description: "Could not assign admin role to user.",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
      
      // If removing admin role from current user
      if (userId === user?.id) {
        setIsAdmin(false);
      }
      
      toast({
        title: "Admin Role Removed",
        description: "Administrator permissions have been removed from user.",
        variant: "default",
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error removing admin role:", error);
      
      toast({
        title: "Error Removing Role",
        description: "Could not remove admin role from user.",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  };

  return { isAdmin, loading, makeAdmin, removeAdmin };
};
