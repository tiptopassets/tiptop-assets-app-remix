
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, Shield, Zap, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignUpForm = z.infer<typeof signUpSchema>;
type SignInForm = z.infer<typeof signInSchema>;

const Auth = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      });
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Welcome to TipTop! You can now start monetizing your property.",
      });
    } catch (error) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
      
      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex justify-between items-center">
        <Link to="/" className="text-2xl md:text-3xl font-bold text-white hover:scale-105 transition-transform">
          tiptop
        </Link>
      </header>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Marketing content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Turn Your Home Into a 
              <span className="text-tiptop-purple"> Revenue Machine</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Our AI analyzes your property using satellite imagery and Google Solar API to identify every monetization opportunity - from solar panels to parking spaces.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tiptop-purple/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-tiptop-purple" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Analysis</h3>
                  <p className="text-gray-400">Advanced algorithms analyze your property's monetization potential</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Centralized Dashboard</h3>
                  <p className="text-gray-400">Track all your income streams in one unified platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Integration</h3>
                  <p className="text-gray-400">Safe, automated connections to partner platforms</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <Card className="glass-effect border-white/10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Welcome to TipTop</CardTitle>
                <CardDescription className="text-gray-300">
                  Sign in to access your property monetization dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Google Sign In Button */}
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full mb-6 bg-white text-gray-900 hover:bg-gray-100 border-white/20"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-5 w-5" />
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-400">Or continue with email</span>
                    </div>
                  </div>

                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={signInForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-white">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          {...signInForm.register('email')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {signInForm.formState.errors.email && (
                          <p className="text-red-400 text-sm">{signInForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-white">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          {...signInForm.register('password')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {signInForm.formState.errors.password && (
                          <p className="text-red-400 text-sm">{signInForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={signUpForm.handleSubmit(handleEmailSignUp)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-white">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          {...signUpForm.register('email')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {signUpForm.formState.errors.email && (
                          <p className="text-red-400 text-sm">{signUpForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-white">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          {...signUpForm.register('password')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {signUpForm.formState.errors.password && (
                          <p className="text-red-400 text-sm">{signUpForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          {...signUpForm.register('confirmPassword')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {signUpForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm">{signUpForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
