import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  Sun, 
  Zap, 
  Wifi, 
  Car,
  Settings,
  LogOut,
  User,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { journeyData } = useDashboardJourneyData();

  // Check if property has solar potential
  const hasSolarPotential = journeyData?.analysisResults?.rooftop?.solarPotential;

  const navigationItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Revenue analytics'
    },
    // Conditionally include solar dashboard
    ...(hasSolarPotential ? [{
      name: 'Solar System',
      href: '/dashboard/rooftop',
      icon: Sun,
      description: 'Solar panel monitoring',
      badge: journeyData?.analysisResults?.rooftop?.usingRealSolarData ? 'Real Data' : 'Estimated'
    }] : []),
    {
      name: 'EV Charging',
      href: '/dashboard/ev-charging',
      icon: Zap,
      description: 'EV charging stations'
    },
    {
      name: 'Internet Sharing',
      href: '/dashboard/internet',
      icon: Wifi,
      description: 'Bandwidth monetization'
    },
    {
      name: 'Parking',
      href: '/dashboard/parking',
      icon: Car,
      description: 'Parking space rental'
    }
  ];

  const toolsItems = [
    {
      name: 'Add Asset',
      href: '/dashboard/add-asset',
      icon: Settings,
      description: 'Add new revenue streams'
    },
    {
      name: 'AI Assistant',
      href: '/dashboard/onboarding',
      icon: User,
      description: 'Get personalized help'
    },
    {
      name: 'Affiliate Program',
      href: '/dashboard/affiliate',
      icon: DollarSign,
      description: 'Earn referral rewards'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold text-tiptop-purple hover:scale-105 transition-transform">
          tiptop
        </Link>
        <p className="text-gray-400 text-sm mt-1">Property Dashboard</p>
      </div>

      {/* Property Info */}
      {journeyData && (
        <div className="p-4 border-b border-gray-800">
          <div className="text-sm text-gray-400 mb-1">Current Property</div>
          <div className="text-white font-medium text-sm truncate" title={journeyData.propertyAddress}>
            {journeyData.propertyAddress}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">
              ${journeyData.totalMonthlyRevenue}/mo potential
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Assets Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Assets</h3>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group mb-1',
                  isActive 
                    ? 'bg-tiptop-purple text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon size={18} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 group-hover:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools</h3>
          {toolsItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group mb-1',
                  isActive 
                    ? 'bg-tiptop-purple text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon size={18} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 group-hover:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <Separator className="bg-gray-800" />

      {/* Bottom section */}
      <div className="p-4 space-y-2">
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        
        <Link
          to="/account"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <User size={18} />
          <span>Account</span>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
