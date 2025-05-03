
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sun, Wifi, EvCharging, Plus, User, SignOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Sun, label: 'Rooftop', path: '/dashboard/rooftop' },
  { icon: Wifi, label: 'Internet', path: '/dashboard/internet' },
  { icon: EvCharging, label: 'EV Charging', path: '/dashboard/ev-charging' },
  { icon: Plus, label: 'Add Asset', path: '/dashboard/add-asset' },
  { icon: User, label: 'My Account', path: '/dashboard/account' },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "flex flex-col bg-tiptop-purple min-h-screen transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Glossy overlay for glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none"></div>
      
      {/* Header with logo and toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 relative z-10">
        <h1 className={cn(
          "font-bold text-white transition-all duration-300",
          collapsed ? "text-xl" : "text-2xl"
        )}>
          {!collapsed ? "Tiptop" : "T"}
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md text-white hover:bg-white/10 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {collapsed ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5l-7 7 7 7M19 5l-7 7 7 7" />
              </svg>
            )}
          </div>
        </button>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 py-4 z-10 relative">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200",
                  isActive ? "bg-white/20 font-medium shadow-lg" : "hover:bg-white/10",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon size={collapsed ? 24 : 20} />
                {!collapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
                
                {/* Glow effect for active state */}
                {!collapsed && (
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 blur-md -z-10"
                    initial={false}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sign out button at bottom */}
      <div className="p-4 border-t border-white/10 z-10 relative">
        <button
          onClick={signOut}
          className={cn(
            "flex items-center w-full py-3 px-4 rounded-lg text-white transition-all duration-200 hover:bg-white/10",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <SignOut size={collapsed ? 24 : 20} />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
