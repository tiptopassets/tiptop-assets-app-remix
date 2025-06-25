import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PropertyAnalysis {
  id: string;
  address: string;
  coordinates?: any;
  analysis_results: any;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type?: string;
  created_at: string;
  is_active?: boolean; // Make this optional since it doesn't exist in the database
}

interface PropertyWithAddress {
  id: string;
  address: string;
  coordinates?: any;
  analysis_results: any;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type?: string;
  created_at: string;
  is_active?: boolean; // Add this to match PropertyAnalysis interface
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<PropertyWithAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyAnalysis | null>(null);

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
          user_addresses!inner(address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: PropertyWithAddress[] = (data || []).map(item => ({
        id: item.id,
        address: item.user_addresses?.address || 'Unknown Address',
        coordinates: item.coordinates,
        analysis_results: item.analysis_results,
        total_monthly_revenue: item.total_monthly_revenue || 0,
        total_opportunities: item.total_opportunities || 0,
        property_type: item.property_type,
        created_at: item.created_at,
        is_active: true // Default value since this field doesn't exist in database
      }));

      setProperties(transformedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePropertySelect = (property: PropertyWithAddress) => {
    // Add is_active if it's missing
    const propertyWithDefaults: PropertyAnalysis = {
      ...property,
      is_active: property.is_active ?? true
    };
    setSelectedProperty(propertyWithDefaults);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading properties...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Opportunities</TableHead>
              <TableHead>Property Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map(property => (
              <TableRow key={property.id}>
                <TableCell>{property.address}</TableCell>
                <TableCell>${property.total_monthly_revenue}</TableCell>
                <TableCell>{property.total_opportunities}</TableCell>
                <TableCell>{property.property_type || 'N/A'}</TableCell>
                <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handlePropertySelect(property)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input type="text" id="address" value={selectedProperty.address} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="revenue" className="text-right">
                    Total Revenue
                  </Label>
                  <Input type="text" id="revenue" value={`$${selectedProperty.total_monthly_revenue}`} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opportunities" className="text-right">
                    Opportunities
                  </Label>
                  <Input type="text" id="opportunities" value={selectedProperty.total_opportunities} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="propertyType" className="text-right">
                    Property Type
                  </Label>
                  <Input type="text" id="propertyType" value={selectedProperty.property_type || 'N/A'} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="createdAt" className="text-right">
                    Created At
                  </Label>
                  <Input type="text" id="createdAt" value={new Date(selectedProperty.created_at).toLocaleDateString()} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="analysisResults" className="text-right">
                    Analysis Results
                  </Label>
                  <Textarea id="analysisResults" value={JSON.stringify(selectedProperty.analysis_results, null, 2)} className="col-span-3" readOnly />
                </div>
              </div>
            </div>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;
