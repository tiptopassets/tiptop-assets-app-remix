
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { format, subDays, parseISO } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type DailyLoginData = {
  date: string;
  count: number;
};

type BrowserData = {
  name: string;
  value: number;
};

type LoginStatsRow = {
  last_login_at: string;
  last_user_agent: string | null;
};

export const LoginChartsSection = () => {
  const [dailyLogins, setDailyLogins] = useState<DailyLoginData[]>([]);
  const [browserDistribution, setBrowserDistribution] = useState<BrowserData[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch daily login counts for the past 7 days
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const date = subDays(new Date(), i);
          return format(date, 'yyyy-MM-dd');
        }).reverse();

        // Get all login stats with proper typing
        const { data: loginStats, error: loginError } = await supabase
          .from('user_login_stats')
          .select('last_login_at, last_user_agent')
          .returns<LoginStatsRow[]>();

        if (loginError) throw loginError;

        // Process daily login data
        const dailyData = last7Days.map(day => {
          const count = loginStats?.filter(log => 
            format(parseISO(log.last_login_at), 'yyyy-MM-dd') === day
          ).length || 0;
          
          return {
            date: format(new Date(day), 'MMM d'),
            count
          };
        });
        
        setDailyLogins(dailyData);

        // Process browser distribution data
        const browsers: Record<string, number> = {};
        
        loginStats?.forEach(stat => {
          const browser = getBrowserFromUserAgent(stat.last_user_agent);
          browsers[browser] = (browsers[browser] || 0) + 1;
        });
        
        const browserData = Object.entries(browsers).map(([name, value]) => ({
          name,
          value
        }));
        
        setBrowserDistribution(browserData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chart data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const getBrowserFromUserAgent = (userAgent: string | null): string => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    
    return 'Other';
  };
  
  const chartConfig = {
    Chrome: { color: "#4285F4" }, // Google Blue
    Firefox: { color: "#FF7139" }, // Firefox Orange
    Safari: { color: "#0FB5EE" }, // Safari Blue
    Edge: { color: "#0078D7" }, // Edge Blue
    "Internet Explorer": { color: "#0076D6" }, // IE Blue
    Other: { color: "#BDBDBD" }, // Gray
    Unknown: { color: "#E0E0E0" }, // Light Gray
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Daily Login Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ChartContainer 
              config={chartConfig}
              className="aspect-auto"
            >
              <BarChart data={dailyLogins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8884d8" name="Logins" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Browser Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ChartContainer 
              config={chartConfig}
              className="aspect-auto"
            >
              <PieChart>
                <Pie
                  data={browserDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {browserDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
