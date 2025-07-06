
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from './DashboardLayout';

const DashboardAuthGuard: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically trigger Google sign-in
    const timer = setTimeout(() => {
      signInWithGoogle();
    }, 1500); // Small delay for better UX

    return () => clearTimeout(timer);
  }, [signInWithGoogle]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md text-center bg-black/20 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-tiptop-purple mb-2">tiptop</h1>
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
              <p className="text-gray-300 mb-4">Redirecting you to Google to sign in...</p>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-white mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-tiptop-purple" />
              <span>Preparing sign-in...</span>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="mt-2"
            >
              Go Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAuthGuard;
