
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';

interface PropertyAnalysis {
  id: string;
  property_address: string;
  user_id: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  coordinates: any;
  analysis_results: any;
}

interface PropertyDetailsDialogProps {
  property: PropertyAnalysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PropertyDetailsDialog = ({ property, open, onOpenChange }: PropertyDetailsDialogProps) => {
  if (!property) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAssetOpportunities = () => {
    if (!property.analysis_results?.assets) return [];
    return property.analysis_results.assets.map((asset: any) => ({
      type: asset.type,
      revenue: asset.monthlyRevenue,
      setup: asset.setupCost,
      available: asset.available
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis and data for {property.property_address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">{property.property_address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{property.property_type || 'Unknown'}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={property.is_active ? 'default' : 'secondary'}>
                      {property.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono">{property.user_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Revenue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${property.total_monthly_revenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Opportunities</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {property.total_opportunities || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg per Opportunity</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${property.total_opportunities > 0 
                      ? Math.round((property.total_monthly_revenue || 0) / property.total_opportunities)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Opportunities */}
          {getAssetOpportunities().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Asset Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAssetOpportunities().map((asset, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{asset.type}</h4>
                        <Badge variant={asset.available ? 'default' : 'secondary'}>
                          {asset.available ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Revenue:</span>
                          <span className="font-medium">${asset.revenue || 0}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Setup Cost:</span>
                          <span className="font-medium">${asset.setup || 0}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{formatDate(property.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(property.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordinates (if available) */}
          {property.coordinates && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                    <p className="text-sm font-mono">{property.coordinates.lat}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                    <p className="text-sm font-mono">{property.coordinates.lng}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
