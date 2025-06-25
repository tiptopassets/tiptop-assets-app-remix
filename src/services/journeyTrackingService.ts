
import { supabase } from '@/integrations/supabase/client';
import { VisitorSession, UserJourneyProgress } from '@/types/journey';

class JourneyTrackingService {
  private sessionId: string;
  private sessionStartTime: Date;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeSession() {
    try {
      const sessionData = {
        session_id: this.sessionId,
        ip_address: null, // Will be populated by edge function if needed
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        landing_page: window.location.pathname,
        current_step: 'address_entry',
        started_at: this.sessionStartTime.toISOString()
      };

      const { error } = await supabase
        .from('visitor_sessions')
        .insert(sessionData);

      if (error) {
        console.error('❌ Failed to initialize session:', error);
      } else {
        console.log('✅ Session initialized:', this.sessionId);
      }
    } catch (error) {
      console.error('❌ Error initializing session:', error);
    }
  }

  async updateStep(step: string, additionalData?: Record<string, any>) {
    try {
      const { error } = await supabase
        .from('visitor_sessions')
        .update({
          current_step: step,
          updated_at: new Date().toISOString(),
          ...additionalData
        })
        .eq('session_id', this.sessionId);

      if (error) {
        console.error('❌ Failed to update session step:', error);
      } else {
        console.log('📊 Session step updated:', step);
      }
    } catch (error) {
      console.error('❌ Error updating session step:', error);
    }
  }

  async completeConversion(type: 'manual' | 'concierge') {
    try {
      const totalTime = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
      
      const { error } = await supabase
        .from('visitor_sessions')
        .update({
          conversion_type: type,
          completed_at: new Date().toISOString(),
          total_time_seconds: totalTime
        })
        .eq('session_id', this.sessionId);

      if (error) {
        console.error('❌ Failed to complete conversion:', error);
      } else {
        console.log('🎉 Conversion completed:', type);
      }
    } catch (error) {
      console.error('❌ Error completing conversion:', error);
    }
  }

  async linkToUser(userId: string) {
    try {
      // Update session with user ID
      const { error: sessionError } = await supabase
        .from('visitor_sessions')
        .update({ user_id: userId })
        .eq('session_id', this.sessionId);

      if (sessionError) {
        console.error('❌ Failed to link session to user:', sessionError);
        return;
      }

      // Create journey progress record
      const { error: journeyError } = await supabase
        .from('user_journey_progress')
        .insert({
          session_id: this.sessionId,
          user_id: userId,
          current_step: 'dashboard_accessed',
          auth_completed: true,
          step_completed_at: {
            auth_completed: new Date().toISOString()
          }
        });

      if (journeyError) {
        console.error('❌ Failed to create journey progress:', journeyError);
      } else {
        console.log('✅ Journey linked to user:', userId);
      }
    } catch (error) {
      console.error('❌ Error linking session to user:', error);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const journeyTracker = new JourneyTrackingService();
