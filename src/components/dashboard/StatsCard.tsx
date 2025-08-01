
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactElement<LucideIcon>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend = "neutral", 
  trendValue,
  className = ""
}: StatsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <Card className={`glassmorphism-card border-white/10 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-white">
          {title}
        </CardTitle>
        <div className="text-white opacity-80">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold text-white mb-1">
          {value}
        </div>
        {trendValue && (
          <p className={`text-xs ${getTrendColor()} font-medium`}>
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
