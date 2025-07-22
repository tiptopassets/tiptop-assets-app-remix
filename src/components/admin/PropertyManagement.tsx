
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, MapPin, TrendingUp, Calendar, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';
import PropertyDetailsDialog from './PropertyDetailsDialog';

interface PropertyAnalysis {
  id: string;
  user_id: string;
  property_address: string;
  property_type: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  analysis_results: any;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

interface PropertyStats {
  totalAnalyses: number;
  averageRevenue: number;
  topPropertyType: string;
  recentAnalyses: number;
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<PropertyAnalysis[]>([]);
  const [stats, setStats] = useState<PropertyStats>({
    totalAnalyses: 0,
    averageRevenue: 0,
    topPropertyType: 'Single Family',
    recentAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyAnalysis | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('Fetching property analyses...');

      // Fetch property analyses with proper date handling
      const { data: analysesData, error: analysesError } = await supabase
        .from('user_property_analyses')
        .select(`
          id,
          user_id,
          total_monthly_revenue,
          total_opportunities,
          analysis_results,
          property_type,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (analysesError) {
        console.error('Error fetching analyses:', analysesError);
        throw analysesError;
      }

      console.log('Fetched analyses:', analysesData?.length || 0);

      // Process the data to extract property addresses and format properly
      const processedProperties: PropertyAnalysis[] = (analysesData || []).map(analysis => {
        // Extract property address from analysis results
        let propertyAddress = 'Unknown Address';
        if (analysis.analysis_results) {
          propertyAddress = 
            analysis.analysis_results.propertyAddress || 
            analysis.analysis_results.address || 
            analysis.analysis_results.property_address ||
            'Unknown Address';
        }

        return {
          id: analysis.id,
          user_id: analysis.user_id,
          property_address: propertyAddress,
          property_type: analysis.property_type || 'Unknown',
          total_monthly_revenue: analysis.total_monthly_revenue || 0,
          total_opportunities: analysis.total_opportunities || 0,
          analysis_results: analysis.analysis_results,
          created_at: analysis.created_at,
          updated_at: analysis.updated_at,
        };
      });

      console.log('Processed properties:', processedProperties.length);
      setProperties(processedProperties);

      // Calculate statistics
      const totalAnalyses = processedProperties.length;
      const averageRevenue = totalAnalyses > 0 
        ? processedProperties.reduce((sum, p) => sum + (p.total_monthly_revenue || 0), 0) / totalAnalyses
        : 0;

      // Count property types
      const propertyTypeCounts: Record<string, number> = {};
      processedProperties.forEach(p => {
        const type = p.property_type || 'Unknown';
        propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
      });

      const topPropertyType = Object.entries(propertyTypeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Single Family';

      // Count recent analyses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAnalyses = processedProperties.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= sevenDaysAgo;
      }).length;

      setStats({
        totalAnalyses,
        averageRevenue,
        topPropertyType,
        recentAnalyses
      });

      console.log('Stats calculated:', {
        totalAnalyses,
        averageRevenue,
        topPropertyType,
        recentAnalyses
      });

    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    // Set up real-time subscription for property updates
    const subscription = supabase
      .channel('property_analyses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_property_analyses'
        },
        () => {
          console.log('Property analyses updated, refreshing...');
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredProperties = properties.filter(property =>
    property.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading properties: {error.message}</p>
        <Button onClick={fetchProperties} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue</p>
                <p className="text-2xl font-bold">${stats.averageRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Property Type</p>
                <p className="text-2xl font-bold">{stats.topPropertyType}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                <p className="text-2xl font-bold">{stats.recentAnalyses}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties by address, type, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">
                  {property.property_address}
                </CardTitle>
                <Badge variant="secondary">
                  {property.property_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Revenue:</span>
                  <span className="font-semibold text-green-600">
                    ${property.total_monthly_revenue?.toFixed(0) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Opportunities:</span>
                  <span className="font-semibold">
                    {property.total_opportunities || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-xs font-mono">
                    {property.user_id?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Analyzed:</span>
                  <span className="text-xs">
                    {format(new Date(property.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Property Analysis Details</DialogTitle>
                    </DialogHeader>
                    {selectedProperty && (
                      <PropertyDetailsDialog property={selectedProperty} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
