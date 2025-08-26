
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClickTrackingData {
  provider: string;
  url: string;
  source: string;
  userAgent?: string;
  referrer?: string;
  extra?: Record<string, any>;
}

/**
 * Centralized service for tracking partner referral link clicks
 * and opening the links in a new tab
 */
class ClickTrackingService {
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tiptop_session_id');
    if (!sessionId) {
      sessionId = `session_${crypto.randomUUID()}`;
      sessionStorage.setItem('tiptop_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track a click event and open the referral link
   * This function always opens the link regardless of tracking success
   */
  async trackAndOpenReferral(data: ClickTrackingData): Promise<void> {
    const { provider, url, source, userAgent, referrer, extra } = data;
    
    console.log('🔄 Tracking click for provider:', provider, 'from source:', source);
    
    // Always open the link first to ensure user experience isn't blocked
    window.open(url, '_blank', 'noopener,noreferrer');
    
    try {
      // Get user and session info
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult?.user?.id;
      const sessionId = this.getSessionId();

      // Track the click via affiliate partner integration edge function
      const { data: result, error } = await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'track_click',
          userId,
          sessionId,
          provider,
          data: {
            url,
            referralLink: url,
            source,
            timestamp: new Date().toISOString(),
            userAgent: userAgent || navigator.userAgent,
            referrer: referrer || document.referrer,
            user_email: userResult?.user?.email,
            extra: extra || {}
          }
        }
      });

      if (error) {
        console.error('❌ Failed to track click:', error);
        // Don't show error to user since link was still opened
        return;
      }

      console.log('✅ Click tracked successfully:', result);
      
    } catch (err) {
      console.error('❌ Error tracking click:', err);
      // Don't show error to user since link was still opened
    }
  }

  /**
   * Track a click without opening a link (for analytics only)
   */
  async trackClick(provider: string, source: string, extra?: Record<string, any>): Promise<boolean> {
    try {
      console.log('🔄 Tracking click event for provider:', provider);
      
      // Get user and session info
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult?.user?.id;
      const sessionId = this.getSessionId();
      
      const { error } = await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'track_click',
          userId,
          sessionId,
          provider,
          data: {
            source,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            user_email: userResult?.user?.email,
            extra: extra || {}
          }
        }
      });

      if (error) {
        console.error('❌ Failed to track click:', error);
        return false;
      }

      console.log('✅ Click tracked successfully');
      return true;
      
    } catch (err) {
      console.error('❌ Error tracking click:', err);
      return false;
    }
  }
}

// Export singleton instance
export const clickTrackingService = new ClickTrackingService();

// Export convenience functions
export const trackAndOpenReferral = (data: ClickTrackingData) => 
  clickTrackingService.trackAndOpenReferral(data);

export const trackClick = (provider: string, source: string, extra?: Record<string, any>) => 
  clickTrackingService.trackClick(provider, source, extra);
