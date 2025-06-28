
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar,
  ArrowRight,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

interface PropertyOverviewCardProps {
  address: string;
  description: string;
  imageUrl?: string;
  loading?: boolean;
}

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({ 
  address,
  description,
  imageUrl,
  loading
}) => {
  const navigate = useNavigate();

  const handleViewAnalysis = () => {
    console.log('🏠 [DASHBOARD] Viewing property analysis for:', address);
    navigate('/submit-property');
  };

  const handleStartOnboarding = () => {
    console.log('🚀 [DASHBOARD] Starting onboarding for property:', address);
    navigate('/onboarding-chatbot');
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-tiptop-purple" />
            <CardTitle className="text-lg font-semibold">Property Overview</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Analyzed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Address */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">Property Address</p>
          </div>
          <p className="text-sm text-gray-900 ml-6">{address}</p>
        </div>

        {/* Property Image */}
        {imageUrl && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Satellite View</p>
            </div>
            <div className="relative ml-6">
              {loading ? (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <img 
                  src={imageUrl} 
                  alt="Property satellite view" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>
        )}

        {/* Analysis Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">Analysis Summary</p>
          </div>
          <p className="text-sm text-gray-600 ml-6">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleViewAnalysis}
            variant="outline"
            className="flex-1"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            View Full Analysis
          </Button>
          <Button
            onClick={handleStartOnboarding}
            className="flex-1 bg-tiptop-purple hover:bg-purple-600"
          >
            Start Setup
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverviewCard;
