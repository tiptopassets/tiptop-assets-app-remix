
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
  address_id: string;
  user_id: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type: string;
  created_at: string;
  updated_at: string;
  analysis_results: any;
  coordinates: any;
  satellite_image_url?: string;
  property_address?: string;
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
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_property_analyses')
        .select(`
          *,
          user_addresses (
            address,
            formatted_address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(analysis => ({
        ...analysis,
        property_address: analysis.user_addresses?.formatted_address || analysis.user_addresses?.address || 'Unknown Address'
      }));
      
      setProperties(transformedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
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
        created_at: property.created_at
      }));

      const csvContent = [
        ['Address', 'Type', 'Monthly Revenue', 'Opportunities', 'Created At'],
        ...dataToExport.map(row => [
          row.address,
          row.type,
          row.monthly_revenue,
          row.opportunities,
          row.created_at
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
    const matchesSearch = (property.property_address || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
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
      <PropertyStatsCards properties={properties} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Management
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
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {property.property_address}
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

      <PropertyDetailsDialog
        property={selectedProperty}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </motion.div>
  );
};

export default PropertyManagement;
