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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to update login statistics in the database
  const updateLoginStats = async (userId: string) => {
    try {
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
      }
    } catch (error) {
      console.error('Error updating login stats:', error);
      // Don't block authentication if this fails
    }
  };

  // Function to handle analysis recovery after sign-in
  const handleAnalysisRecovery = async (userId: string) => {
    try {
      if (!hasUnauthenticatedAnalyses()) {
        console.log('ℹ️ No unauthenticated analyses to recover');
        return;
      }
      
      console.log('🔄 Starting analysis recovery for user:', userId);
      const result = await recoverAnalysesToDatabase(userId);
      
      if (result.recovered > 0) {
        toast({
          title: "Analysis Recovered",
          description: `Successfully recovered ${result.recovered} property analysis${result.recovered > 1 ? 'es' : ''} to your dashboard`,
        });
      }
      
      if (result.failed > 0) {
        console.error('⚠️ Some analyses failed to recover:', result.errors);
        toast({
          title: "Partial Recovery",
          description: `Recovered ${result.recovered} analyses, but ${result.failed} failed to save`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error during analysis recovery:', error);
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
        console.log('🔐 Initializing auth state');
        
        // Set up auth state listener first
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event, currentSession?.user?.email);
            
            if (!mounted) return;

            // Update state immediately
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // Handle specific auth events
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Use setTimeout to prevent deadlocking in the auth state change handler
              setTimeout(() => {
                if (mounted) {
                  updateLoginStats(currentSession.user.id);
                  
                  // Trigger analysis recovery
                  handleAnalysisRecovery(currentSession.user.id);
                  
                  // Always redirect to dashboard when user signs in
                  navigate('/dashboard');
                }
              }, 0);
            }
            
            // Redirect to homepage if user logs out
            if (event === 'SIGNED_OUT') {
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
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // If user was already signed in on page load, update login stats and recover analyses
          if (currentSession?.user) {
            setTimeout(() => {
              if (mounted) {
                updateLoginStats(currentSession.user.id);
                handleAnalysisRecovery(currentSession.user.id);
              }
            }, 0);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [navigate, toast]);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in process");
      setLoading(true);
      
      const origin = window.location.origin;
      console.log("Current origin:", origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
      
      console.log("Sign in initiated:", data);
    } catch (error) {
      console.error('Google sign in error:', error);
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
      console.log('🚪 Starting sign out process');
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
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
