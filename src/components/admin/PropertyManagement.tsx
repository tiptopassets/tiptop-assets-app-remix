
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
      console.log('Fetching property analyses...');

      // Fetch property analyses from user_property_analyses table
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
        .limit(200);

      if (analysesError) {
        console.error('Error fetching analyses:', analysesError);
        throw analysesError;
      }

      console.log('Fetched analyses from user_property_analyses:', analysesData?.length || 0);

      // Also fetch recent journey data that contains analysis results but may not be in user_property_analyses
      const { data: journeyData, error: journeyError } = await supabase
        .from('user_journey_complete')
        .select(`
          id,
          user_id,
          property_address,
          analysis_results,
          total_monthly_revenue,
          total_opportunities,
          created_at,
          updated_at,
          analysis_id
        `)
        .not('analysis_results', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (journeyError) {
        console.error('Error fetching journey data:', journeyError);
        throw journeyError;
      }

      console.log('Fetched journey data with analyses:', journeyData?.length || 0);

      // Process analyses from user_property_analyses table
      const processedFromAnalyses: PropertyAnalysis[] = (analysesData || []).map(analysis => {
        // Extract property address from analysis results with improved type checking
        let propertyAddress = 'Unknown Address';
        if (analysis.analysis_results) {
          try {
            const results = analysis.analysis_results as Record<string, any>;
            propertyAddress = 
              results.propertyAddress || 
              results.address || 
              results.property_address ||
              'Unknown Address';
          } catch (e) {
            console.warn('Error parsing analysis results for:', analysis.id);
          }
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
          is_active: true,
          coordinates: null
        };
      });

      // Process analyses from user_journey_complete table that aren't already in user_property_analyses
      const existingAnalysisIds = new Set((analysesData || []).map(a => a.id));
      const processedFromJourney: PropertyAnalysis[] = (journeyData || [])
        .filter(journey => {
          // Skip if this analysis_id already exists in user_property_analyses
          return !journey.analysis_id || !existingAnalysisIds.has(journey.analysis_id);
        })
        .map(journey => {
          // Extract property address and other data from journey analysis results
          let propertyAddress = journey.property_address || 'Unknown Address';
          let propertyType = 'Unknown';
          let totalMonthlyRevenue = journey.total_monthly_revenue || 0;
          let totalOpportunities = journey.total_opportunities || 0;

          if (journey.analysis_results) {
            try {
              const results = journey.analysis_results as Record<string, any>;
              propertyAddress = 
                results.propertyAddress || 
                results.address || 
                results.property_address ||
                journey.property_address ||
                'Unknown Address';
              
              propertyType = results.propertyType || 'Unknown';
              totalMonthlyRevenue = results.totalMonthlyRevenue || journey.total_monthly_revenue || 0;
              
              // Count opportunities from analysis results
              if (results.topOpportunities && Array.isArray(results.topOpportunities)) {
                totalOpportunities = results.topOpportunities.length;
              }
            } catch (e) {
              console.warn('Error parsing journey analysis results for:', journey.id);
            }
          }

          return {
            id: journey.id,
            user_id: journey.user_id || 'unknown',
            property_address: propertyAddress,
            property_type: propertyType,
            total_monthly_revenue: totalMonthlyRevenue,
            total_opportunities: totalOpportunities,
            analysis_results: journey.analysis_results,
            created_at: journey.created_at,
            updated_at: journey.updated_at,
            is_active: true,
            coordinates: null
          };
        });

      // Combine both sources of property data
      const allProperties = [...processedFromAnalyses, ...processedFromJourney];
      
      // Sort by creation date (most recent first)
      allProperties.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Processed properties from analyses table:', processedFromAnalyses.length);
      console.log('Processed properties from journey table:', processedFromJourney.length);
      console.log('Total combined properties:', allProperties.length);
      
      setProperties(allProperties);

      // Calculate statistics
      const totalAnalyses = allProperties.length;
      const averageRevenue = totalAnalyses > 0 
        ? allProperties.reduce((sum, p) => sum + (p.total_monthly_revenue || 0), 0) / totalAnalyses
        : 0;

      // Count property types
      const propertyTypeCounts: Record<string, number> = {};
      allProperties.forEach(p => {
        const type = p.property_type || 'Unknown';
        propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
      });

      const topPropertyType = Object.entries(propertyTypeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Single Family';

      // Count recent analyses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAnalyses = allProperties.filter(p => {
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
