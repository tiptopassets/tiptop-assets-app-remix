
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "purple" | "blue" | "orange" | "green";
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  trendValue,
  variant = "default"
}: StatsCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "purple":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200";
      case "blue":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
      case "orange":
        return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200";
      case "green":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      default:
        return "bg-gradient-to-br from-gray-50 to-white border-gray-200";
    }
  };

  const getTrendIcon = () => {
    if (trend === "up") {
      return <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V7z" clipRule="evenodd"></path></svg>;
    }
    if (trend === "down") {
      return <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 10-2 0v-5.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L12 7.414V13z" clipRule="evenodd"></path></svg>;
    }
    return null;
  };

  const getTrendColorClass = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-500";
  };

  return (
    <Card className={cn(
      "overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 relative",
      getVariantClasses()
    )}>
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-full"></div>
      
      <CardHeader className="pb-1 md:pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xs md:text-sm font-medium text-gray-500">{title}</CardTitle>
          {icon && <div className="text-gray-400 md:block hidden">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-1 md:pt-6">
        <div className="text-lg md:text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="mt-2 flex items-center">
            {trend && getTrendIcon()}
            {trendValue && <span className={cn("text-xs font-medium ml-1", getTrendColorClass())}>{trendValue}</span>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
