
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
        return "text-emerald-400 font-semibold";
      case "down":
        return "text-red-400 font-semibold";
      default:
        return "text-slate-200 font-medium";
    }
  };

  return (
    <Card className={`glassmorphism-card border-white/10 bg-white/10 backdrop-blur-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-semibold text-white drop-shadow-sm">
          {title}
        </CardTitle>
        <div className="text-white opacity-90 drop-shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-sm">
          {value}
        </div>
        {trendValue && (
          <p className={`text-xs ${getTrendColor()} drop-shadow-sm`}>
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
