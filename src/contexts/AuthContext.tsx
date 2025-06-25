import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  recoverAnalysesToDatabase, 
  hasUnauthenticatedAnalyses 
} from '@/services/unauthenticatedAnalysisService';
import { journeyTracker } from '@/services/journeyTrackingService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to update login statistics in the database
  const updateLoginStats = async (userId: string) => {
    try {
      console.log('📊 [AUTH] Updating login stats for user:', userId);
      // Get user agent and IP information
      const userAgent = navigator.userAgent;
      
      // Check if this user already has an entry in the login stats table
      const { data: existingStats } = await supabase
        .from('user_login_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingStats) {
        // Update existing user's login stats
        await supabase
          .from('user_login_stats')
          .update({
            login_count: (existingStats.login_count || 0) + 1,
            last_login_at: new Date().toISOString(),
            last_user_agent: userAgent,
          })
          .eq('user_id', userId);
        console.log('✅ [AUTH] Updated existing login stats');
      } else {
        // First time login - create new record
        await supabase
          .from('user_login_stats')
          .insert({
            user_id: userId,
            login_count: 1,
            first_login_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            last_user_agent: userAgent,
          });
        console.log('✅ [AUTH] Created new login stats record');
      }
    } catch (error) {
      console.error('❌ [AUTH] Error updating login stats:', error);
      // Don't block authentication if this fails
    }
  };

  // Function to handle analysis recovery after sign-in
  const handleAnalysisRecovery = async (userId: string) => {
    try {
      console.log('🔍 [AUTH] Checking for analyses to recover for user:', userId);
      
      if (!hasUnauthenticatedAnalyses()) {
        console.log('ℹ️ [AUTH] No unauthenticated analyses to recover');
        return;
      }
      
      console.log('🔄 [AUTH] Starting analysis recovery process...');
      const result = await recoverAnalysesToDatabase(userId);
      
      console.log('📊 [AUTH] Recovery result:', result);
      
      if (result.recovered > 0) {
        console.log('✅ [AUTH] Successfully recovered analyses:', result.recovered);
        toast({
          title: "Analysis Recovered",
          description: `Successfully recovered ${result.recovered} property analysis${result.recovered > 1 ? 'es' : ''} to your dashboard`,
        });
      }
      
      if (result.failed > 0) {
        console.error('⚠️ [AUTH] Some analyses failed to recover:', result.errors);
        toast({
          title: "Partial Recovery",
          description: `Recovered ${result.recovered} analyses, but ${result.failed} failed to save`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [AUTH] Error during analysis recovery:', error);
      toast({
        title: "Recovery Error",
        description: "Failed to recover previous analysis. Please try analyzing your property again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', { event, userId: session?.user?.id });
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setLoading(false);
          
          // Link journey to user
          await journeyTracker.linkToUser(session.user.id);
          
          // Update login stats
          await updateLoginStats(session.user.id);
          
          console.log('✅ User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          console.log('👋 User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("🔐 [AUTH] Starting Google sign-in process");
      setLoading(true);
      
      const origin = window.location.origin;
      console.log("🌐 [AUTH] Current origin:", origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('❌ [AUTH] Google sign in error:', error);
        throw error;
      }
      
      console.log("✅ [AUTH] Sign in initiated:", data);
    } catch (error) {
      console.error('❌ [AUTH] Google sign in error:', error);
      setLoading(false);
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Starting sign out process');
      setLoading(true);
      await supabase.auth.signOut();
      console.log('✅ [AUTH] Sign out completed');
    } catch (error) {
      console.error('❌ [AUTH] Sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
