
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PropertyOverviewProps {
  address: string;
  description: string;
  imageUrl?: string;
  loading?: boolean;
}

export const PropertyOverviewCard = ({ 
  address, 
  description, 
  imageUrl, 
  loading = false 
}: PropertyOverviewProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md relative">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-white/50 z-0"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 relative z-10">
        <div className="lg:col-span-1">
          {loading ? (
            <div className="h-full min-h-[200px] bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-tiptop-purple" />
                <span className="text-sm text-gray-500">Loading satellite view...</span>
              </div>
            </div>
          ) : imageUrl ? (
            <div 
              className="h-full min-h-[200px] bg-cover bg-center bg-gray-100" 
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              <img 
                src={imageUrl} 
                alt="Property satellite view" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide the image and show fallback if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="h-full min-h-[200px] bg-gray-200 items-center justify-center hidden">
                <span className="text-gray-400">Satellite View Unavailable</span>
              </div>
            </div>
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
