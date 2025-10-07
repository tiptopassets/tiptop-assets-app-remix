
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserProperty } from '@/hooks/useUserProperties';
import DashboardSidebarHeader from './DashboardSidebarHeader';
import DashboardSidebarNavigation from './DashboardSidebarNavigation';
import DashboardSidebarBottomNav from './DashboardSidebarBottomNav';

interface DashboardSidebarProps {
  properties?: UserProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
}

const DashboardSidebar = ({ properties, selectedPropertyId, onPropertySelect }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-gray-900 text-white rounded-md shadow-lg"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-80 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <DashboardSidebarHeader 
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={onPropertySelect}
              isCollapsed={false}
            />
            <DashboardSidebarNavigation isCollapsed={false} />
            <DashboardSidebarBottomNav isCollapsed={false} />
          </div>
        </div>
      </>
    );
  }

  const isCollapsed = !isHovered;

  return (
    <div 
      className={`bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <DashboardSidebarHeader 
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={onPropertySelect}
        isCollapsed={isCollapsed}
      />
      <DashboardSidebarNavigation isCollapsed={isCollapsed} />
      <DashboardSidebarBottomNav isCollapsed={isCollapsed} />
    </div>
  );
};

export default DashboardSidebar;
