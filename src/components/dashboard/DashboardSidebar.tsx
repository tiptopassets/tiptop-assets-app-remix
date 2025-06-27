
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Sun, 
  Wifi, 
  Battery, 
  Plus, 
  LogOut, 
  UserCircle, 
  Settings, 
  Menu, 
  X, 
  Lock,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { path: '/dashboard', icon: <Home className="h-5 w-5 mr-3" />, label: 'Dashboard' },
  { 
    path: '/dashboard/rooftop', 
    icon: <Sun className="h-5 w-5 mr-3" />, 
    label: 'Rooftop Solar'
  },
  { 
    path: '/dashboard/internet', 
    icon: <Wifi className="h-5 w-5 mr-3" />, 
    label: 'Internet Bandwidth'
  },
  { 
    path: '/dashboard/ev-charging', 
    icon: <Battery className="h-5 w-5 mr-3" />, 
    label: 'EV Charging'
  },
  {
    path: '/dashboard/affiliate',
    icon: <DollarSign className="h-5 w-5 mr-3" />,
    label: 'Affiliate Earnings'
  },
  { 
    path: '/dashboard/add-asset', 
    icon: <Plus className="h-5 w-5 mr-3" />, 
    label: 'Add Asset'
  },
  {
    path: '/dashboard/onboarding',
    icon: <MessageSquare className="h-5 w-5 mr-3" />,
    label: 'Asset Onboarding'
  }
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    closed: {
      x: '-100%',
      opacity: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  const navItemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };
  
  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black z-40"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={overlayVariants}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-4 left-4 z-50 rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      )}

      {/* Sidebar */}
      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white",
          isMobile ? "shadow-xl" : "md:relative md:z-auto"
        )}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full p-5 overflow-y-auto">
          {/* Logo */}
          <div className="mb-8 mt-4 flex justify-center">
            <Link to="/" className="text-2xl font-bold text-tiptop-purple">tiptop</Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <motion.li key={item.path} variants={navItemVariants}>
                  <Link 
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      location.pathname === item.path 
                        ? 'bg-gray-700 text-tiptop-purple'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              ))}
              
              {/* Admin Dashboard Link (conditionally rendered) */}
              {isAdmin && (
                <motion.li variants={navItemVariants}>
                  <Link 
                    to="/dashboard/admin"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      location.pathname === '/dashboard/admin' 
                        ? 'bg-gray-700 text-tiptop-purple'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <Lock className="h-5 w-5 mr-3" />
                    <span>Admin Panel</span>
                  </Link>
                </motion.li>
              )}
            </ul>
          </nav>
          
          {/* User Actions */}
          <div className="mt-auto space-y-2">
            <Link 
              to="/dashboard/account"
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname === '/dashboard/account' 
                  ? 'bg-gray-700 text-tiptop-purple'
                  : 'hover:bg-gray-700'
              }`}
            >
              <UserCircle className="h-5 w-5 mr-3" />
              <span>Account</span>
            </Link>
            <Link 
              to="/options"
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname === '/options' 
                  ? 'bg-gray-700 text-tiptop-purple'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 rounded-md text-red-400 hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* User Info */}
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="flex items-center px-4">
              <div className="w-8 h-8 rounded-full bg-tiptop-purple/20 flex items-center justify-center">
                {user?.user_metadata?.full_name?.charAt(0) || 
                 user?.email?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
