
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  recoverAnalysesToDatabase, 
  hasUnauthenticatedAnalyses 
} from '@/services/unauthenticatedAnalysisService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoginCountUpdate, setLastLoginCountUpdate] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to update login statistics in the database
  const updateLoginStats = async (userId: string, isActualLogin: boolean = false) => {
    try {
      console.log('📊 [AUTH] Checking login stats for user:', userId, 'isActualLogin:', isActualLogin);
      
      // Prevent multiple updates for the same user within 5 minutes unless it's an actual login
      const currentTime = new Date().toISOString();
      const lastUpdateKey = `${userId}-${currentTime.slice(0, 16)}`; // 5-minute window
      
      if (!isActualLogin && lastLoginCountUpdate === lastUpdateKey) {
        console.log('⏩ [AUTH] Skipping duplicate login stats update');
        return;
      }
      
      // Get user agent and IP information
      const userAgent = navigator.userAgent;
      
      // Check if this user already has an entry in the login stats table
      const { data: existingStats } = await supabase
        .from('user_login_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingStats) {
        // Only update login count for actual logins, but always update last_login_at
        const updateData: any = {
          last_login_at: new Date().toISOString(),
          last_user_agent: userAgent,
        };
        
        // Only increment login count for actual sign-in events
        if (isActualLogin) {
          updateData.login_count = (existingStats.login_count || 0) + 1;
          console.log('✅ [AUTH] Incrementing login count to:', updateData.login_count);
        }
        
        await supabase
          .from('user_login_stats')
          .update(updateData)
          .eq('user_id', userId);
        
        console.log('✅ [AUTH] Updated login stats:', updateData);
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
      
      setLastLoginCountUpdate(lastUpdateKey);
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
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🔐 [AUTH] Initializing auth state');
        
        // Set up auth state listener first
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('🔐 [AUTH] Auth state changed:', event, currentSession?.user?.email);
            
            if (!mounted) return;

            // Update state immediately
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // Handle specific auth events
            if (event === 'SIGNED_IN' && currentSession?.user) {
              console.log('👤 [AUTH] User signed in, processing post-signin tasks...');
              // Use setTimeout to prevent deadlocking in the auth state change handler
              setTimeout(() => {
                if (mounted) {
                  // Only count as actual login for SIGNED_IN events
                  updateLoginStats(currentSession.user.id, true);
                  
                  // Trigger analysis recovery
                  handleAnalysisRecovery(currentSession.user.id);
                  
                  // Always redirect to dashboard when user signs in
                  console.log('🔄 [AUTH] Redirecting to dashboard...');
                  navigate('/dashboard');
                }
              }, 100); // Small delay to ensure state is updated
            }
            
            // For other events like TOKEN_REFRESHED, don't count as login
            if (event === 'TOKEN_REFRESHED' && currentSession?.user) {
              console.log('🔄 [AUTH] Token refreshed, updating last activity only');
              setTimeout(() => {
                if (mounted) {
                  updateLoginStats(currentSession.user.id, false);
                }
              }, 100);
            }
            
            // Redirect to homepage if user logs out
            if (event === 'SIGNED_OUT') {
              console.log('🚪 [AUTH] User signed out, redirecting to home...');
              setTimeout(() => {
                if (mounted) {
                  navigate('/');
                }
              }, 0);
            }
            
            // Mark loading as complete after processing
            if (mounted) {
              setLoading(false);
            }
          }
        );

        // Then check for existing session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH] Error getting session:', error);
        }
        
        if (mounted) {
          console.log('🔐 [AUTH] Initial session check:', currentSession?.user?.email || 'No session');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // If user was already signed in on page load, DON'T count as login
          if (currentSession?.user) {
            console.log('👤 [AUTH] User already signed in on page load, updating activity only');
            setTimeout(() => {
              if (mounted) {
                updateLoginStats(currentSession.user.id, false);
                handleAnalysisRecovery(currentSession.user.id);
              }
            }, 100);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ [AUTH] Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 [AUTH] Cleaning up auth context');
      mounted = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [navigate, toast]);

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
