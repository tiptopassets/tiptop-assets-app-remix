import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Eye, 
  Trash2, 
  Download,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyDetailsDialog from './PropertyDetailsDialog';
import PropertyStatsCards from './PropertyStatsCards';

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

const PropertyManagement = () => {
  const [properties, setProperties] = useState<PropertyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyAnalysis | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();

    // Set up real-time subscription for property updates
    const channel = supabase
      .channel('property-management-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_property_analyses',
        },
        () => {
          console.log('🔄 [PROPERTY-MGMT] Real-time update detected, refreshing properties...');
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🏠 [PROPERTY-MGMT] Fetching all properties with enhanced extraction...');
      
      // Get ALL properties from user_property_analyses
      const { data: allProperties, error: allError } = await supabase
        .from('user_property_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      console.log('🏠 [PROPERTY-MGMT] Raw properties data:', allProperties);

      if (!allProperties || allProperties.length === 0) {
        console.log('🏠 [PROPERTY-MGMT] No properties found');
        setProperties([]);
        setLoading(false);
        return;
      }

      // Get all possible user IDs to fetch journey data
      const userIds = [...new Set(allProperties.map(p => p.user_id))];
      
      // Get user journey data for additional context
      let journeyData: any[] = [];
      if (userIds.length > 0) {
        const { data: journeys } = await supabase
          .from('user_journey_complete')
          .select('user_id, property_address, analysis_results')
          .in('user_id', userIds)
          .not('property_address', 'is', null);
        
        journeyData = journeys || [];
        console.log('🏠 [PROPERTY-MGMT] Found journey data:', journeyData.length);
      }

      // Get user addresses as well
      const { data: userAddresses } = await supabase
        .from('user_addresses')
        .select('*')
        .in('user_id', userIds);

      const addressData = userAddresses || [];
      console.log('🏠 [PROPERTY-MGMT] Found user addresses:', addressData.length);

      // Enhanced property extraction with multiple fallback sources
      const transformedData = allProperties.map((item: any, index: number) => {
        let propertyAddress = '';
        let propertyType = item.property_type || 'Unknown';
        let totalRevenue = item.total_monthly_revenue || 0;
        let totalOpportunities = item.total_opportunities || 0;

        // Priority 1: Check analysis_results for property address
        if (item.analysis_results) {
          // Check multiple possible locations for address in analysis_results
          if (item.analysis_results.propertyAddress) {
            propertyAddress = item.analysis_results.propertyAddress;
          } else if (item.analysis_results.address) {
            propertyAddress = item.analysis_results.address;
          } else if (item.analysis_results.property_address) {
            propertyAddress = item.analysis_results.property_address;
          }

          // Extract additional data from analysis results if missing
          if (!totalRevenue && item.analysis_results.topOpportunities) {
            totalRevenue = item.analysis_results.topOpportunities.reduce((sum: number, opp: any) => 
              sum + (opp.monthlyRevenue || 0), 0);
          }

          if (!totalOpportunities && item.analysis_results.topOpportunities) {
            totalOpportunities = item.analysis_results.topOpportunities.length;
          }

          if (propertyType === 'Unknown' && item.analysis_results.propertyType) {
            propertyType = item.analysis_results.propertyType;
          }
        }

        // Priority 2: Check linked user address
        if (!propertyAddress && item.address_id) {
          const linkedAddress = addressData.find(addr => addr.id === item.address_id);
          if (linkedAddress) {
            propertyAddress = linkedAddress.formatted_address || linkedAddress.address;
          }
        }

        // Priority 3: Check journey data
        if (!propertyAddress) {
          const journeyMatch = journeyData.find(j => j.user_id === item.user_id);
          if (journeyMatch) {
            propertyAddress = journeyMatch.property_address;
            
            // Also try to extract from journey analysis results
            if (!propertyAddress && journeyMatch.analysis_results?.propertyAddress) {
              propertyAddress = journeyMatch.analysis_results.propertyAddress;
            }
          }
        }

        // Priority 4: Final fallback with better identification
        if (!propertyAddress) {
          const userJourneyCount = journeyData.filter(j => j.user_id === item.user_id).length;
          const userPropertyCount = allProperties.filter(p => p.user_id === item.user_id).length;
          
          propertyAddress = `Property Analysis ${index + 1} (User: ${item.user_id.substring(0, 8)}..., ${userPropertyCount} analyses, ${userJourneyCount} journeys)`;
        }

        console.log(`🏠 [PROPERTY-MGMT] Property ${index + 1}: "${propertyAddress}" (Revenue: $${totalRevenue}, Opportunities: ${totalOpportunities})`);

        return {
          id: item.id,
          property_address: propertyAddress,
          user_id: item.user_id,
          total_monthly_revenue: totalRevenue,
          total_opportunities: totalOpportunities,
          property_type: propertyType,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: true,
          coordinates: item.coordinates,
          analysis_results: item.analysis_results
        };
      });

      console.log('✅ [PROPERTY-MGMT] Successfully transformed properties:', transformedData.length);
      console.log('✅ [PROPERTY-MGMT] Address samples:', transformedData.slice(0, 5).map(p => p.property_address));
      
      setProperties(transformedData);
    } catch (error) {
      console.error('❌ [PROPERTY-MGMT] Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch property data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('user_property_analyses')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.filter(p => p.id !== propertyId));
      toast({
        title: "Success",
        description: "Property deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive"
      });
    }
  };

  const exportPropertyData = async () => {
    try {
      const dataToExport = properties.map(property => ({
        address: property.property_address,
        type: property.property_type,
        monthly_revenue: property.total_monthly_revenue,
        opportunities: property.total_opportunities,
        created_at: property.created_at,
        is_active: property.is_active
      }));

      const csvContent = [
        ['Address', 'Type', 'Monthly Revenue', 'Opportunities', 'Created At', 'Active'],
        ...dataToExport.map(row => [
          row.address,
          row.type,
          row.monthly_revenue,
          row.opportunities,
          row.created_at,
          row.is_active
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `properties_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Property data exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export property data",
        variant: "destructive"
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.property_address
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'active' && property.is_active) ||
      (filterType === 'inactive' && !property.is_active) ||
      (filterType === property.property_type);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Statistics Cards */}
      <PropertyStatsCards properties={properties} />

      {/* Property Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Management ({properties.length} total)
              </CardTitle>
              <CardDescription>
                Manage all property analyses and user data
              </CardDescription>
            </div>
            <Button onClick={exportPropertyData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('active')}
              >
                Active
              </Button>
            </div>
          </div>

          {/* Properties Table */}
          <div className="rounded-md border max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Property Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {properties.length === 0 ? 'No properties found' : 'No properties match your search'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={property.property_address}>
                          {property.property_address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {property.property_type || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          ${property.total_monthly_revenue?.toLocaleString() || '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          {property.total_opportunities || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.is_active ? 'default' : 'secondary'}>
                          {property.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(property.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProperty(property.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        property={selectedProperty}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </motion.div>
  );
};

export default PropertyManagement;
