import React, { useState, useEffect } from 'react';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAssetIcon as registryGetAssetIcon } from '@/icons/registry';

interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  url: string;
  referral_link_template: string;
  asset_types: string[];
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
}

const ManageAssets: React.FC = () => {
  const { assetSelections, loading, error } = useUserAssetSelections();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  // Fetch service providers from database
  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('enhanced_service_providers')
          .select('id, name, description, logo, url, referral_link_template, asset_types, avg_monthly_earnings_low, avg_monthly_earnings_high')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (error) {
          console.error('Error fetching service providers:', error);
        } else {
          setServiceProviders(data || []);
        }
      } catch (err) {
        console.error('Error fetching service providers:', err);
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchServiceProviders();
  }, []);

  // Get unique asset selections
  const uniqueAssetSelections = assetSelections.reduce((acc, selection) => {
    const existingIndex = acc.findIndex(existing => 
      existing.asset_type.toLowerCase() === selection.asset_type.toLowerCase()
    );
    
    if (existingIndex === -1) {
      acc.push(selection);
    } else {
      const existingDate = new Date(acc[existingIndex].selected_at);
      const currentDate = new Date(selection.selected_at);
      
      if (currentDate > existingDate) {
        acc[existingIndex] = selection;
      }
    }
    
    return acc;
  }, [] as typeof assetSelections);

  const getAssetIcon = (assetType: string) => registryGetAssetIcon(assetType, { className: 'w-5 h-5 object-contain' });

  const handlePartnerClick = (provider: ServiceProvider) => {
    if (provider.referral_link_template) {
      window.open(provider.referral_link_template, '_blank');
    } else {
      window.open(provider.url, '_blank');
    }
  };

  const getPartnerLogo = (provider: ServiceProvider) => {
    return (
      <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
        <img 
          src={provider.logo || `https://www.google.com/s2/favicons?domain=${new URL(provider.url).hostname}&sz=64`} 
          alt={provider.name}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            // Fallback to domain favicon if logo fails to load
            const img = e.target as HTMLImageElement;
            const domain = new URL(provider.url).hostname;
            img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          }}
        />
      </div>
    );
  };

  // Find matching partners for asset type
  const getMatchingPartnersForAsset = (assetType: string) => {
    const normalizedAssetType = assetType.toLowerCase().replace(/[_\s-]/g, '');
    
    const matchingProviders = serviceProviders.filter(provider => {
      return provider.asset_types.some(providerAssetType => {
        const normalizedProviderType = providerAssetType.toLowerCase().replace(/[_\s-]/g, '');
        
        // Check for exact match or partial match
        return normalizedProviderType === normalizedAssetType ||
               normalizedProviderType.includes(normalizedAssetType) ||
               normalizedAssetType.includes(normalizedProviderType);
      });
    });

    console.log(`Found ${matchingProviders.length} providers for asset type: ${assetType}`);
    matchingProviders.forEach(provider => {
      console.log(`- ${provider.name}: ${provider.asset_types.join(', ')}`);
    });

    return matchingProviders;
  };

  if (loading || partnersLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Assets</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (uniqueAssetSelections.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Assets Selected</h1>
          <p className="text-gray-600 mb-6">You haven't selected any assets to monetize yet.</p>
          <Button 
            onClick={() => window.location.href = '/dashboard/add-asset'}
            className="bg-tiptop-purple hover:bg-purple-700"
          >
            Add Your First Asset
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Assets</h1>
          <p className="text-gray-600">Track and manage your monetized assets and partner integrations</p>
        </div>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {uniqueAssetSelections.map((selection, index) => {
            // Find matching partners from database
            const partners = getMatchingPartnersForAsset(selection.asset_type);
            
            return (
              <motion.div
                key={selection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-tiptop-purple/10">
                          {getAssetIcon(selection.asset_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {selection.asset_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                          <p className="text-gray-500 text-sm">
                            Selected {new Date(selection.selected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        ${selection.monthly_revenue}/mo
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Setup Cost:</span>
                        <span className="font-medium">${selection.setup_cost}</span>
                      </div>
                      
                      {selection.roi_months && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">ROI Timeline:</span>
                          <span className="font-medium">{selection.roi_months} months</span>
                        </div>
                      )}

                      {/* Partner Logos */}
                      <div className="pt-3 border-t">
                        <p className="text-gray-500 text-sm mb-3">Available Partners:</p>
                        <div className="flex flex-wrap gap-2">
                          {partners.slice(0, 6).map((provider) => (
                            <Button
                              key={provider.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePartnerClick(provider)}
                              className="h-12 w-12 p-1 hover:bg-tiptop-purple/10 hover:border-tiptop-purple relative group"
                              title={`Visit ${provider.name} - ${provider.description}`}
                            >
                              {getPartnerLogo(provider)}
                              <ExternalLink className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-tiptop-purple" />
                            </Button>
                          ))}
                          {partners.length > 6 && (
                            <div className="h-12 w-12 border border-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                              +{partners.length - 6}
                            </div>
                          )}
                        </div>
                        {partners.length === 0 && (
                          <p className="text-gray-400 text-sm italic">No partners available for this asset type</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Calendar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Reservation Calendar
            </CardTitle>
            <p className="text-gray-600">Track your bookings and reservations across all platforms</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select a date'}
                  </h3>
                  <div className="text-gray-600 text-sm">
                    <p>No reservations scheduled for this date.</p>
                    <p className="mt-2">
                      Connect with your chosen partners to start accepting bookings and track them here.
                    </p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3">Calendar Legend</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-gray-600">Confirmed Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span className="text-gray-600">Pending Reservations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span className="text-gray-600">Blocked/Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageAssets;
