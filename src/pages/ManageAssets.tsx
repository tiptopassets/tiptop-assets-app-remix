
import React, { useState } from 'react';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { PartnerIntegrationService } from '@/services/partnerIntegrationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Car, Wifi, Sun, Zap, Home, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageAssets: React.FC = () => {
  const { assetSelections, loading, error } = useUserAssetSelections();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  const getAssetIcon = (assetType: string) => {
    const type = assetType.toLowerCase();
    if (type.includes('parking')) return <Car className="w-5 h-5" />;
    if (type.includes('internet') || type.includes('wifi') || type.includes('bandwidth')) return <Wifi className="w-5 h-5" />;
    if (type.includes('solar') || type.includes('rooftop')) return <Sun className="w-5 h-5" />;
    if (type.includes('ev') || type.includes('charging')) return <Zap className="w-5 h-5" />;
    return <Home className="w-5 h-5" />;
  };

  const handlePartnerClick = (partnerId: string) => {
    const partner = PartnerIntegrationService.getPlatformById(partnerId);
    if (partner) {
      window.open(partner.referralLink, '_blank');
    }
  };

  const getPartnerIcon = (partnerName: string) => {
    const name = partnerName.toLowerCase();
    if (name.includes('airbnb')) return '🏠';
    if (name.includes('spothero')) return '🅿️';
    if (name.includes('neighbor')) return '🏠';
    if (name.includes('swimply')) return '🏊';
    if (name.includes('honeygain')) return '🍯';
    if (name.includes('grass')) return '🌱';
    if (name.includes('tesla')) return '⚡';
    if (name.includes('kolonia')) return '☀️';
    if (name.includes('chargepoint')) return '🔌';
    if (name.includes('evgo')) return '⚡';
    if (name.includes('turo')) return '🚗';
    if (name.includes('peerspace')) return '📍';
    return '💼';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b from-black to-purple-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-b from-black to-purple-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Error Loading Assets</h1>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (uniqueAssetSelections.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-b from-black to-purple-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">No Assets Selected</h1>
            <p className="text-gray-300 mb-6">You haven't selected any assets to monetize yet.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard/add-asset'}
              className="bg-tiptop-purple hover:bg-purple-700"
            >
              Add Your First Asset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-black to-purple-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Your Assets</h1>
          <p className="text-gray-300">Track and manage your monetized assets and partner integrations</p>
        </div>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {uniqueAssetSelections.map((selection, index) => {
            const partners = PartnerIntegrationService.getPlatformsByAsset(selection.asset_type);
            
            return (
              <motion.div
                key={selection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 border-gray-700 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-tiptop-purple/20">
                          {getAssetIcon(selection.asset_type)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {PartnerIntegrationService.getAssetTypeDisplayName(selection.asset_type)}
                          </CardTitle>
                          <p className="text-gray-400 text-sm">
                            Selected {new Date(selection.selected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        ${selection.monthly_revenue}/mo
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Setup Cost:</span>
                        <span className="text-white">${selection.setup_cost}</span>
                      </div>
                      
                      {selection.roi_months && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">ROI Timeline:</span>
                          <span className="text-white">{selection.roi_months} months</span>
                        </div>
                      )}

                      {/* Partner Icons */}
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Available Partners:</p>
                        <div className="flex flex-wrap gap-2">
                          {partners.slice(0, 6).map((partner) => (
                            <Button
                              key={partner.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePartnerClick(partner.id)}
                              className="h-10 w-10 p-0 border-gray-600 hover:border-tiptop-purple hover:bg-tiptop-purple/20 relative group"
                              title={`Visit ${partner.name} - ${partner.briefDescription}`}
                            >
                              <span className="text-lg">
                                {getPartnerIcon(partner.name)}
                              </span>
                              <ExternalLink className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-tiptop-purple" />
                            </Button>
                          ))}
                          {partners.length > 6 && (
                            <div className="h-10 w-10 border border-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                              +{partners.length - 6}
                            </div>
                          )}
                        </div>
                        {partners.length === 0 && (
                          <p className="text-gray-500 text-sm italic">No partners available for this asset type</p>
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
        <Card className="bg-white/10 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Reservation Calendar
            </CardTitle>
            <p className="text-gray-300">Track your bookings and reservations across all platforms</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-700 bg-white/5 text-white"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="border border-gray-700 rounded-lg p-4 bg-white/5">
                  <h3 className="text-white font-semibold mb-3">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select a date'}
                  </h3>
                  <div className="text-gray-400 text-sm">
                    <p>No reservations scheduled for this date.</p>
                    <p className="mt-2">
                      Connect with your chosen partners to start accepting bookings and track them here.
                    </p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="border border-gray-700 rounded-lg p-4 bg-white/5">
                  <h4 className="text-white font-semibold mb-3">Calendar Legend</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-gray-300">Confirmed Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span className="text-gray-300">Pending Reservations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span className="text-gray-300">Blocked/Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageAssets;
