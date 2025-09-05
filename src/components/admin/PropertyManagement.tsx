
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, TrendingUp, Calendar, DollarSign, Eye, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import PropertyDetailsDialog from './PropertyDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  is_active: boolean;
  coordinates: any;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'total_monthly_revenue' | 'property_address'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('Fetching property analyses from unified view...');

      // Use the unified view for consistent data
      const { data: analysesData, error: analysesError } = await supabase
        .from('user_all_analyses')
        .select(`
          id,
          user_id,
          property_address,
          total_monthly_revenue,
          total_opportunities,
          analysis_results,
          property_type,
          created_at,
          updated_at,
          coordinates,
          source_table
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (analysesError) {
        console.error('Error fetching from unified view:', analysesError);
        throw analysesError;
      }

      console.log('Fetched analyses from unified view:', analysesData?.length || 0);

      // Process analyses from unified view
      const processedProperties: PropertyAnalysis[] = (analysesData || []).map(analysis => {
        return {
          id: analysis.id,
          user_id: analysis.user_id,
          property_address: analysis.property_address || 'Unknown Address',
          property_type: analysis.property_type || 'Unknown',
          total_monthly_revenue: analysis.total_monthly_revenue || 0,
          total_opportunities: analysis.total_opportunities || 0,
          analysis_results: analysis.analysis_results,
          created_at: analysis.created_at,
          updated_at: analysis.updated_at,
          is_active: true,
          coordinates: analysis.coordinates
        };
      });

      console.log('Processed properties from unified view:', processedProperties.length);
      
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

      console.log('Stats calculated from unified view:', {
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

    // Set up real-time subscription for property updates on both tables
    const subscription = supabase
      .channel('unified_property_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_property_analyses'
        },
        () => {
          console.log('Property analyses table updated, refreshing...');
          fetchProperties();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_journey_complete'
        },
        () => {
          console.log('Journey complete table updated, refreshing...');
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSort = (column: 'created_at' | 'total_monthly_revenue' | 'property_address') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'created_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortBy === 'total_monthly_revenue') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredProperties = sortedProperties.filter(property =>
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

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('property_address')}
                    className="h-auto p-0 font-semibold"
                  >
                    Address
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_monthly_revenue')}
                    className="h-auto p-0 font-semibold"
                  >
                    Monthly Revenue
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Opportunities</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="h-auto p-0 font-semibold"
                  >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={property.property_address}>
                      {property.property_address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {property.property_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ${property.total_monthly_revenue?.toFixed(0) || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {property.total_opportunities || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono text-gray-500">
                      {property.user_id?.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {format(new Date(property.created_at), 'MMM dd, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProperty(property);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProperties.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found matching your search criteria.</p>
              <Button onClick={fetchProperties} className="mt-4" variant="outline">
                Refresh Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      {selectedProperty && (
        <PropertyDetailsDialog 
          property={selectedProperty} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      )}
    </div>
  );
};

export default PropertyManagement;
