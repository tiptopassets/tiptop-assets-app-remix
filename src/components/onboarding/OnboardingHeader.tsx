
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Home, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingData } from '@/services/onboardingService';

interface OnboardingHeaderProps {
  onboardingData: OnboardingData | null;
  detectedAssets: string[];
}

const OnboardingHeader = ({ onboardingData, detectedAssets }: OnboardingHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-tiptop-purple" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Onboarding Assistant</h1>
                <p className="text-sm text-gray-600">
                  {onboardingData?.selected_option === 'concierge' ? 'Concierge Service' : 'Self-Service Setup'}
                </p>
              </div>
            </Link>

            {/* Dashboard Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/add-asset">Add Asset</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/affiliate">Earnings</Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {detectedAssets.length > 0 && (
              <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">
                {detectedAssets.length} Assets Detected
              </Badge>
            )}
            {onboardingData && (
              <Badge variant="outline" className="border-tiptop-purple text-tiptop-purple bg-purple-50">
                Step {onboardingData.current_step} of {onboardingData.total_steps}
              </Badge>
            )}
            
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-tiptop-purple/20 flex items-center justify-center">
                <User className="h-4 w-4 text-tiptop-purple" />
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OnboardingHeader;
