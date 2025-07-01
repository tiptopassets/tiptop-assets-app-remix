
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';

const DashboardSidebarHeader = () => {
  const { journeyData } = useDashboardJourneyData();

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="text-2xl font-bold text-tiptop-purple hover:scale-105 transition-transform">
          tiptop
        </Link>
        <p className="text-gray-400 text-sm mt-1">Property Dashboard</p>
      </div>

      {/* Property Info */}
      {journeyData && (
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
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
    </>
  );
};

export default DashboardSidebarHeader;
