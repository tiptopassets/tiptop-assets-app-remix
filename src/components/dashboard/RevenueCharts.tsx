
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
}

interface RevenueByAssetProps {
  data: ChartData[];
}

interface TodayRevenueProps {
  amount: number;
  increasePercentage: number;
}

interface RevenueOverTimeProps {
  data: {
    name: string;
    [key: string]: number | string;
  }[];
  keys: string[];
}

const COLORS = ['#9b87f5', '#33C3F0', '#6E59A5', '#FF8042', '#FFBB28', '#00C49F'];

export const AssetDistributionChart = ({ data }: RevenueByAssetProps) => {
  return (
    <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-white/50 z-0"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-medium">Asset Distribution Revenue</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const TodayRevenueChart = ({ amount, increasePercentage }: TodayRevenueProps) => {
  return (
    <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-white/50 z-0"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-medium">Today's Revenue</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center pt-2">
        <div className="text-4xl font-bold">${amount.toFixed(2)}</div>
        <div className={cn(
          "flex items-center mt-2 text-sm",
          increasePercentage >= 0 ? "text-green-600" : "text-red-600"
        )}>
          <span>
            {increasePercentage >= 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L12 19M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19L12 5M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="ml-1">{Math.abs(increasePercentage)}% from yesterday</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const RevenueOverTimeChart = ({ data, keys }: RevenueOverTimeProps) => {
  return (
    <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-white/50 z-0"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-medium">Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Legend />
              {keys.map((key, index) => (
                <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
