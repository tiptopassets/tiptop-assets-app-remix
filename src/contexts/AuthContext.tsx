import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Track login event when user signs in
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Use setTimeout to prevent deadlocking in the auth state change handler
          setTimeout(() => {
            updateLoginStats(currentSession.user.id);
          }, 0);
          
          // Redirect to dashboard if user is logged in
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        }
        
        // Redirect to homepage if user logs out
        if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            navigate('/');
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // If user was already signed in on page load, update login stats
      if (currentSession?.user) {
        updateLoginStats(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in process");
      const origin = window.location.origin;
      console.log("Current origin:", origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: origin + '/dashboard'
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
      
      console.log("Sign in initiated:", data);
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
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
