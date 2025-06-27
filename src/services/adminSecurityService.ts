
import { supabase } from '@/integrations/supabase/client';

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export class AdminSecurityService {
  
  /**
   * Securely check if current user is admin
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Log admin actions for audit trail
   */
  static async logAdminAction(
    action: string,
    targetUserId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          action,
          target_user_id: targetUserId,
          details,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin audit logs (admin only)
   */
  static async getAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Validate admin access before sensitive operations
   */
  static async validateAdminAccess(): Promise<boolean> {
    const isAdmin = await this.isCurrentUserAdmin();
    if (!isAdmin) {
      console.warn('Unauthorized admin access attempt');
      await this.logAdminAction('UNAUTHORIZED_ACCESS_ATTEMPT');
    }
    return isAdmin;
  }
}
