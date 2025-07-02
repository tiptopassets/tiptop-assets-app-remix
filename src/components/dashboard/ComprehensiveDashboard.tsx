import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  DollarSign, 
  Camera, 
  Users, 
  Sun, 
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loadComprehensiveUserData } from '@/services/comprehensiveUserDataService';
import { AssetsTable } from './AssetsTable';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

interface ComprehensiveDashboardProps {
  onRefresh: () => void;
}

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAssetConfigured } = useUserAssetSelections();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await loadComprehensiveUserData(user.id);
        setComprehensiveData(data);
        console.log('📊 Loaded comprehensive dashboard data:', data);
      } catch (err) {
        console.error('❌ Error loading comprehensive data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiptop-purple mx-auto mb-4"></div>
          <p>Loading your comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !comprehensiveData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Load Data</h3>
        <p className="text-gray-600 mb-4">{error || 'No analysis data found'}</p>
        <Button onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  const { analysis, images, suppliers, solarData, address } = comprehensiveData;
  const analysisResults = analysis.analysis_results;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'connected': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Property Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-tiptop-purple to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Property Dashboard</h1>
            <div className="flex items-center gap-2 text-purple-100">
              <MapPin className="h-4 w-4" />
              <span>{address?.formatted_address || address?.address || 'Property Address'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${analysis.total_monthly_revenue || 0}</div>
            <div className="text-purple-100">Monthly Potential</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold">${analysis.total_monthly_revenue || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-2xl font-semibold">{analysis.total_opportunities || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Images</p>
                <p className="text-2xl font-semibold">{images.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-semibold">{suppliers.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="solar">Solar Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Property Overview</CardTitle>
                <CardDescription>Key property details and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Property Type:</span>
                  <Badge variant="outline">{analysisResults.propertyType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Opportunities:</span>
                  <span className="font-semibold">{analysis.total_opportunities}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Revenue:</span>
                  <span className="font-semibold text-green-600">${analysis.total_monthly_revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Analysis Date:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Top Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Opportunities</CardTitle>
                <CardDescription>Your highest revenue potential assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResults.topOpportunities?.slice(0, 3).map((opp: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-gray-600">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${opp.monthlyRevenue}/mo</p>
                        {opp.setupCost && (
                          <p className="text-xs text-gray-500">Setup: ${opp.setupCost}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Potential Assets Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your property's monetization potential</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsTable 
                analysisResults={analysisResults} 
                isAssetConfigured={isAssetConfigured}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>Satellite, street view, and other property images</CardDescription>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image: any) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {image.image_url ? (
                          <img 
                            src={image.image_url} 
                            alt={`${image.image_type} view`}
                            className="w-full h-full object-cover"
                          />
                        ) : image.image_base64 ? (
                          <img 
                            src={`data:image/jpeg;base64,${image.image_base64}`} 
                            alt={`${image.image_type} view`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {image.image_type.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(image.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No property images available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Connections</CardTitle>
              <CardDescription>Your service provider connections and statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length > 0 ? (
                <div className="space-y-4">
                  {suppliers.map((supplier: any) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{supplier.supplier_name}</h4>
                          <p className="text-sm text-gray-600">{supplier.asset_type}</p>
                        </div>
                        <Badge className={getStatusColor(supplier.connection_status)}>
                          {supplier.connection_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Est. Revenue:</span>
                          <span className="ml-2 font-medium">${supplier.estimated_revenue}/mo</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Setup Cost:</span>
                          <span className="ml-2 font-medium">${supplier.setup_cost}</span>
                        </div>
                      </div>
                      {supplier.referral_link && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a href={supplier.referral_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit Supplier
                            </a>
                          </Button>
                        </div>
                      )}
                      {supplier.notes && (
                        <div className="mt-3 text-sm text-gray-600">
                          <strong>Notes:</strong> {supplier.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No supplier connections yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solar Data Analysis</CardTitle>
              <CardDescription>Google Solar API data and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {solarData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-semibold">Solar Potential</h4>
                      <Badge variant={solarData.using_real_data ? "default" : "secondary"}>
                        {solarData.using_real_data ? "Real Data" : "Estimated"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Annual Generation:</span>
                        <span className="font-medium">{solarData.solar_potential_kwh?.toLocaleString()} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Panel Count:</span>
                        <span className="font-medium">{solarData.panel_count} panels</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Roof Area:</span>
                        <span className="font-medium">{solarData.roof_area_sqft} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Savings:</span>
                        <span className="font-medium text-green-600">${solarData.annual_savings?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Setup Cost:</span>
                        <span className="font-medium">${solarData.setup_cost?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-3">Solar Insights</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Solar viable for your property</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>ROI estimated at {Math.round((solarData.setup_cost || 0) / (solarData.annual_savings || 1))} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span>Data updated {new Date(solarData.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sun className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No solar data available</p>
                  <p className="text-sm text-gray-500 mt-2">Solar analysis will appear here after property analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveDashboard;