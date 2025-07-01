
import DashboardSidebarHeader from './DashboardSidebarHeader';
import DashboardSidebarNavigation from './DashboardSidebarNavigation';
import DashboardSidebarBottomNav from './DashboardSidebarBottomNav';

const DashboardSidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <DashboardSidebarHeader />
      <DashboardSidebarNavigation />
      <DashboardSidebarBottomNav />
    </div>
  );
};

export default DashboardSidebar;
