
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not loading and we have a session, redirect to the intended path (or dashboard as fallback)
    if (!loading) {
      if (session) {
        // Successfully authenticated - navigate will be handled by the AuthContext
        console.log('Authentication successful, redirecting...');
      } else {
        // No session - redirect to homepage
        navigate('/');
      }
    }
  }, [session, loading, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-black/30 backdrop-blur-sm">
        <div className="h-12 w-12 border-4 border-t-tiptop-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Completing Sign In</h1>
        <p className="text-white/80">Please wait while we complete your authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
