
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertyOverviewProps {
  address: string;
  description: string;
  imageUrl?: string;
}

export const PropertyOverviewCard = ({ address, description, imageUrl }: PropertyOverviewProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md relative">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-white/50 z-0"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 relative z-10">
        <div className="lg:col-span-1">
          {imageUrl ? (
            <div className="h-full min-h-[200px] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
          ) : (
            <div className="h-full min-h-[200px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Satellite View Unavailable</span>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">{address || "Property Address"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600">{description || "No property analysis available yet."}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
