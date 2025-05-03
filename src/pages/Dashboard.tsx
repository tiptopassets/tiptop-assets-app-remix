import { useState } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PropertyOverviewCard } from "@/components/dashboard/PropertyOverviewCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AssetsTable } from "@/components/dashboard/AssetsTable";
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from "@/components/dashboard/RevenueCharts";
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ChartBar, Activity, PieChart } from 'lucide-react';

// Mock data - In a real app, this would come from an API
const mockPropertyData = {
  address: "123 Main St, San Francisco, CA 94103",
  description: "This property has excellent potential for monetization with multiple assets including a rooftop for solar panels, high-speed internet capabilities, EV charging infrastructure, and more. Our analysis shows an estimated monthly revenue of $1,250 based on current market rates.",
  imageUrl: "https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=satellite&key=YOUR_API_KEY"
};

// Define asset type
type Asset = {
  id: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  revenue: number;
  partner: string;
  actionRequired?: string;
};

const mockAssets: Asset[] = [
  { id: '1', type: 'Rooftop Solar', status: 'active', revenue: 450.00, partner: 'SolarCity', actionRequired: undefined },
  { id: '2', type: 'Internet Bandwidth', status: 'pending', revenue: 120.00, partner: 'Grass', actionRequired: 'Sign Contract' },
  { id: '3', type: 'Parking Space', status: 'active', revenue: 300.00, partner: 'Neighbor.com', actionRequired: undefined },
  { id: '4', type: 'Storage Space', status: 'inactive', revenue: 0, partner: 'Neighbor.com', actionRequired: 'Define Hours' },
  { id: '5', type: 'EV Charging', status: 'pending', revenue: 380.00, partner: 'ChargePoint', actionRequired: 'Download App' },
];

const revenueDistribution = [
  { name: 'Solar', value: 450 },
  { name: 'Parking', value: 300 },
  { name: 'Internet', value: 120 },
  { name: 'EV Charging', value: 380 },
];

const revenueOverTime = [
  { name: 'Jan', Solar: 400, Parking: 240, Internet: 100, EV: 0 },
  { name: 'Feb', Solar: 420, Parking: 250, Internet: 110, EV: 0 },
  { name: 'Mar', Solar: 430, Parking: 260, Internet: 120, EV: 0 },
  { name: 'Apr', Solar: 440, Parking: 280, Internet: 120, EV: 0 },
  { name: 'May', Solar: 450, Parking: 290, Internet: 120, EV: 0 },
  { name: 'Jun', Solar: 450, Parking: 300, Internet: 120, EV: 350 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [assets] = useState<Asset[]>(mockAssets);
  
  const totalMonthlyRevenue = assets.reduce((sum, asset) => sum + asset.revenue, 0);
  const activeAssetCount = assets.filter(asset => asset.status === 'active').length;
  const actionsNeeded = assets.filter(asset => asset.actionRequired).length;

  const handleEdit = (id: string) => {
    console.log('Edit asset:', id);
  };

  const handleView = (id: string) => {
    console.log('View asset:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete asset:', id);
  };

  const handleAction = (id: string, action: string) => {
    console.log('Action:', action, 'for asset:', id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}! Here's an overview of your property and assets.
          </p>
        </motion.div>

        {/* Property Overview Card with glassmorphism */}
        <motion.div variants={itemVariants}>
          <PropertyOverviewCard
            address={mockPropertyData.address}
            description={mockPropertyData.description}
            imageUrl={mockPropertyData.imageUrl}
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Monthly Revenue"
            value={`$${totalMonthlyRevenue.toFixed(2)}`}
            description="Estimated from all active assets"
            trend="up"
            trendValue="12% from last month"
            variant="purple"
            icon={<ChartBar size={20} />}
          />
          
          <StatsCard
            title="Daily Revenue"
            value={`$${(totalMonthlyRevenue / 30).toFixed(2)}`}
            description="Average per day"
            variant="blue"
          />
          
          <StatsCard
            title="Active Assets"
            value={activeAssetCount}
            description={`${assets.length - activeAssetCount} inactive assets`}
            variant="green"
          />
          
          <StatsCard
            title="Items Needing Attention"
            value={actionsNeeded}
            description="Actions required"
            variant="orange"
            icon={<Activity size={20} />}
          />
        </motion.div>

        {/* Assets Table with glassmorphism */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChartBar className="mr-2" size={20} />
            Assets Table
          </h2>
          <AssetsTable
            assets={assets}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onAction={handleAction}
          />
        </motion.div>

        {/* Revenue Charts with glassmorphism */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="mr-2" size={20} />
            Revenue Charts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AssetDistributionChart data={revenueDistribution} />
            <TodayRevenueChart amount={(totalMonthlyRevenue / 30)} increasePercentage={5.2} />
            <RevenueOverTimeChart data={revenueOverTime} keys={['Solar', 'Parking', 'Internet', 'EV']} />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
