
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
   * Note: This will work once the admin_audit_log table is recognized by TypeScript
   */
  static async logAdminAction(
    action: string,
    targetUserId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use raw SQL query until TypeScript types are updated
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO admin_audit_log (admin_user_id, action, target_user_id, details)
          VALUES ($1, $2, $3, $4)
        `,
        params: [user.id, action, targetUserId, JSON.stringify(details)]
      });

      if (error) {
        console.error('Error logging admin action:', error);
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin audit logs (admin only)
   * Note: Returns empty array until TypeScript types are updated
   */
  static async getAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    try {
      // Return empty array until TypeScript types include admin_audit_log table
      console.log('Audit logs will be available once database types are regenerated');
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
