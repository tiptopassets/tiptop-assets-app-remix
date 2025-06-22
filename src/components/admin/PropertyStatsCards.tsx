
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, TrendingUp, Users } from 'lucide-react';
import { PropertyAnalysisRow } from '@/types/propertyAnalysis';

interface PropertyStatsCardsProps {
  properties: PropertyAnalysisRow[];
}

const PropertyStatsCards = ({ properties }: PropertyStatsCardsProps) => {
  const totalProperties = properties.length;
  const activeProperties = properties.length; // All properties are considered active since we don't have is_active field
  const totalRevenue = properties.reduce((sum, p) => sum + (p.total_monthly_revenue || 0), 0);
  const totalOpportunities = properties.reduce((sum, p) => sum + (p.total_opportunities || 0), 0);
  const uniqueUsers = new Set(properties.map(p => p.user_id)).size;

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties.toLocaleString(),
      subtitle: `${activeProperties} active`,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Monthly Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: "Across all properties",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Opportunities",
      value: totalOpportunities.toLocaleString(),
      subtitle: "Revenue opportunities",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Unique Users",
      value: uniqueUsers.toLocaleString(),
      subtitle: "Property owners",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyStatsCards;
