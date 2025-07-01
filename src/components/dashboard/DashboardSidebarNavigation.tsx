
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
  User,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';

const DashboardSidebarNavigation = () => {
  const location = useLocation();
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

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <nav className="p-4 space-y-2">
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
    </div>
  );
};

export default DashboardSidebarNavigation;
