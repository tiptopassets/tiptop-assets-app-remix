import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  recoverAnalysesToDatabase, 
  hasUnauthenticatedAnalyses 
} from '@/services/unauthenticatedAnalysisService';
import { linkUserSessionOnAuth } from '@/services/authLinkingService';

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
  const [loginTracker, setLoginTracker] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to update login statistics in the database with improved deduplication
  const updateLoginStats = async (userId: string, isActualLogin: boolean = false) => {
    try {
      console.log('📊 [AUTH] Checking login stats for user:', userId, 'isActualLogin:', isActualLogin);
      
      // Only process actual sign-in events to prevent inflated counts
      if (!isActualLogin) {
        console.log('⏩ [AUTH] Skipping login count update - not an actual sign-in event');
        return;
      }
      
      // Improved deduplication: Check database for recent logins
      const { data: recentStats } = await supabase
        .from('user_login_stats')
        .select('last_login_at')
        .eq('user_id', userId)
        .single();
      
      // Only count as new login if last login was more than 1 hour ago
      if (recentStats?.last_login_at) {
        const lastLogin = new Date(recentStats.last_login_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (lastLogin > oneHourAgo) {
          console.log('⏩ [AUTH] Skipping - user logged in within the last hour');
          // Still update last_login_at but don't increment count
          await supabase
            .from('user_login_stats')
            .update({ 
              last_login_at: new Date().toISOString(),
              last_user_agent: navigator.userAgent
            })
            .eq('user_id', userId);
          return;
        }
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
        // Always increment count for actual logins (we already checked timing above)
        const newCount = (existingStats.login_count || 0) + 1;
        
        await supabase
          .from('user_login_stats')
          .update({
            login_count: newCount,
            last_login_at: new Date().toISOString(),
            last_user_agent: userAgent,
          })
          .eq('user_id', userId);
        
        console.log('✅ [AUTH] Incremented login count to:', newCount);
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

  // Enhanced function to handle analysis recovery after sign-in with better data consistency
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
        
        // Ensure data consistency by updating related tables
        await ensureDataConsistency(userId);
        
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

  // Helper function to safely extract property address from analysis results
  const extractPropertyAddress = (analysisResults: any): string => {
    if (!analysisResults || typeof analysisResults !== 'object') {
      return '';
    }

    // Check for propertyAddress field
    if (typeof analysisResults.propertyAddress === 'string') {
      return analysisResults.propertyAddress;
    }

    // Check for address field
    if (typeof analysisResults.address === 'string') {
      return analysisResults.address;
    }

    return '';
  };

  // New function to ensure data consistency across tables
  const ensureDataConsistency = async (userId: string) => {
    try {
      console.log('🔄 [AUTH] Ensuring data consistency for user:', userId);
      
      // Get all property analyses for this user
      const { data: analyses } = await supabase
        .from('user_property_analyses')
        .select('*')
        .eq('user_id', userId);

      if (!analyses || analyses.length === 0) {
        console.log('ℹ️ [AUTH] No analyses found for consistency check');
        return;
      }

      // Check and update missing addresses
      for (const analysis of analyses) {
        let addressNeedsUpdate = false;
        let addressFromAnalysis = '';

        // Extract address from analysis results using the safe helper function
        if (analysis.analysis_results) {
          addressFromAnalysis = extractPropertyAddress(analysis.analysis_results);
        }

        // If we have an address from analysis but no address_id, create the address record
        if (addressFromAnalysis && !analysis.address_id) {
          try {
            const { data: existingAddress } = await supabase
              .from('user_addresses')
              .select('id')
              .eq('user_id', userId)
              .eq('address', addressFromAnalysis)
              .maybeSingle();

            let addressId = existingAddress?.id;

            if (!addressId) {
              const { data: newAddress } = await supabase
                .from('user_addresses')
                .insert({
                  user_id: userId,
                  address: addressFromAnalysis,
                  formatted_address: addressFromAnalysis,
                  is_primary: analyses.length === 1 // Make primary if it's the only one
                })
                .select('id')
                .single();

              addressId = newAddress?.id;
            }

            if (addressId) {
              await supabase
                .from('user_property_analyses')
                .update({ address_id: addressId })
                .eq('id', analysis.id);
              
              console.log('✅ [AUTH] Updated analysis with address_id:', addressId);
            }
          } catch (error) {
            console.error('❌ [AUTH] Error creating/linking address:', error);
          }
        }
      }

      console.log('✅ [AUTH] Data consistency check completed');
    } catch (error) {
      console.error('❌ [AUTH] Error ensuring data consistency:', error);
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
              console.log('👤 [AUTH] User signed in via auth event, processing post-signin tasks...');
              // Use setTimeout to prevent deadlocking in the auth state change handler
              setTimeout(() => {
                if (mounted) {
                  // Count as actual login for SIGNED_IN events
                  updateLoginStats(currentSession.user.id, true);
                  
                  // Link any anonymous session asset selections to the authenticated user
                  linkUserSessionOnAuth(currentSession.user.id);
                  
                  // Trigger analysis recovery with enhanced data consistency
                  handleAnalysisRecovery(currentSession.user.id);
                  
                  // Only redirect to dashboard if user is on auth page (not homepage)
                  // Allow signed-in users to stay on homepage to analyze new properties
                  const currentPath = window.location.pathname;
                  const shouldRedirectToDashboard = currentPath === '/auth' || currentPath.startsWith('/auth');
                  
                  if (shouldRedirectToDashboard) {
                    console.log('🔄 [AUTH] Redirecting to dashboard from auth page:', currentPath);
                    navigate('/dashboard');
                  } else {
                    console.log('🔄 [AUTH] Staying on current page:', currentPath);
                  }
                }
              }, 100);
            }
            
            // For TOKEN_REFRESHED, don't count as login or update last activity
            if (event === 'TOKEN_REFRESHED' && currentSession?.user) {
              console.log('🔄 [AUTH] Token refreshed, not updating login stats');
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
          
          // If user was already signed in on page load, DON'T count as login but do recovery and consistency check
          if (currentSession?.user) {
            console.log('👤 [AUTH] User already signed in on page load, running consistency check');
            setTimeout(() => {
              if (mounted) {
                // Don't update login stats for existing sessions
                // Link any session data for existing users (in case it was missed before)
                linkUserSessionOnAuth(currentSession.user.id);
                handleAnalysisRecovery(currentSession.user.id);
                // Also run consistency check for existing users
                ensureDataConsistency(currentSession.user.id);
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
