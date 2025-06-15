
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Activity, Zap, DollarSign, TrendingUp, Wifi, Users } from 'lucide-react';

interface MetricData {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

export const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      label: 'Live Revenue',
      value: '$1,847',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'green'
    },
    {
      label: 'Active Assets',
      value: 8,
      change: 0,
      trend: 'stable',
      icon: <Activity className="h-5 w-5" />,
      color: 'blue'
    },
    {
      label: 'Energy Generated',
      value: '47.3 kWh',
      change: 8.2,
      trend: 'up',
      icon: <Zap className="h-5 w-5" />,
      color: 'yellow'
    },
    {
      label: 'Connected Users',
      value: 156,
      change: -2.1,
      trend: 'down',
      icon: <Users className="h-5 w-5" />,
      color: 'purple'
    }
  ]);

  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: typeof metric.value === 'number' 
          ? metric.value + Math.floor(Math.random() * 3 - 1)
          : metric.value,
        change: metric.change + (Math.random() * 2 - 1)
      })));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate connection status
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);

    return () => clearInterval(statusInterval);
  }, []);

  const getColorClasses = (color: string, trend: string) => {
    const baseClasses = {
      green: trend === 'up' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-gray-100 text-gray-600',
      blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-sm text-gray-600">
            {isOnline ? 'Live Data' : 'Reconnecting...'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Wifi className="h-3 w-3" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className={`relative overflow-hidden border ${getColorClasses(metric.color, metric.trend)}`}>
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <div className="absolute top-2 right-2 text-2xl">
                  {metric.icon}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  {isOnline && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend === 'up' && (
                  <Badge className="mt-1 text-xs bg-green-100 text-green-800">
                    Trending Up
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[
              { time: '2 min ago', action: 'Solar panel generated 2.1 kWh', type: 'success' },
              { time: '5 min ago', action: 'Parking space rented for 4 hours', type: 'info' },
              { time: '8 min ago', action: 'Internet bandwidth shared to 3 users', type: 'info' },
              { time: '12 min ago', action: 'Pool booking confirmed for weekend', type: 'success' },
              { time: '15 min ago', action: 'Garden space inquiry received', type: 'warning' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
