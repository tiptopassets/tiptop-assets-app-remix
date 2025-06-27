
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Log admin actions for audit trail
   * Note: This logs to console until audit logging is fully implemented
   */
  static async logAdminAction(
    action: string,
    targetUserId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log to console for now - implement database logging when RPC is available
      console.log('Admin Action:', {
        admin_user_id: user.id,
        action,
        target_user_id: targetUserId,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin audit logs (admin only)
   * Note: Returns empty array until database audit logging is implemented
   */
  static async getAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    try {
      // Return empty array until audit logging is fully implemented
      console.log('Audit logs will be available once database audit logging is implemented');
      return [];
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
