
import { Link } from 'react-router-dom';
import { Settings, User, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

const DashboardSidebarBottomNav = () => {
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-shrink-0 border-t border-gray-800">
        <div className="p-3 flex items-center justify-center gap-1">
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard/settings"
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Settings size={16} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Account */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/account"
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <User size={16} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Account</p>
            </TooltipContent>
          </Tooltip>

          {/* Admin Dashboard - Only show for admin users */}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/dashboard/admin"
                  className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Shield size={16} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Admin Dashboard</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Logout Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="p-2 h-auto text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardSidebarBottomNav;
