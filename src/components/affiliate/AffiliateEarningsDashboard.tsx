
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Download, Plus, ExternalLink } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Integration type badge colors
const integrationTypeColors = {
  api: 'bg-green-600',
  oauth: 'bg-blue-600',
  puppeteer: 'bg-amber-600',
  extension: 'bg-orange-600',
  manual: 'bg-gray-600'
};

// Status badge colors
const statusColors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  pending: 'bg-amber-600'
};

const AffiliateEarningsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [earnings, setEarnings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingService, setSyncingService] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [selectedTab, setSelectedTab] = useState('all');
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  
  // Check if our Chrome extension is installed
  useEffect(() => {
    // This only works if the extension is installed and has the right ID
    // In development, this will always be false
    if (window.chrome && chrome.runtime) {
      try {
        chrome.runtime.sendMessage('EXTENSION_ID_HERE', { action: 'ping' }, response => {
          if (response && response.installed) {
            setExtensionInstalled(true);
          }
        });
      } catch (e) {
        // Extension not installed, ignore
      }
    }
  }, []);
  
  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  // Load earnings and available services
  const loadData = async () => {
    setLoading(true);
    try {
      // Load earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*, services(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (earningsError) throw earningsError;
      
      // Load all available services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (servicesError) throw servicesError;
      
      setEarnings(earningsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Sync earnings for a specific service
  const syncService = async (service, amount = null, creds = null) => {
    if (!user) return;
    
    setSyncingService(service.name);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: {
          user_id: user.id,
          service: service.name,
          earnings: amount,
          credentials: creds
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Earnings updated',
          description: `Successfully synced ${service.name} earnings: $${data.earnings}`,
        });
        
        // Refresh data
        loadData();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing earnings:', error);
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
      
      // If this was a puppeteer service and it failed, suggest using the extension
      if (service.integration_type === 'puppeteer') {
        toast({
          title: 'Try using the extension',
          description: 'Automatic sync failed. Try installing our Chrome extension for better results.',
          action: extensionInstalled ? undefined : (
            <Button variant="outline" size="sm" onClick={promptInstallExtension}>
              Get Extension
            </Button>
          )
        });
      }
    } finally {
      setSyncingService(null);
    }
  };
  
  // Handle manual sync with amount entry
  const handleManualSync = async () => {
    if (!selectedService) return;
    
    const amount = parseFloat(manualAmount);
    if (isNaN(amount)) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }
    
    await syncService(selectedService, amount);
    setShowAddDialog(false);
    setManualAmount('');
  };
  
  // Handle sync with credentials
  const handleCredentialsSync = async () => {
    if (!selectedService) return;
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }
    
    await syncService(selectedService, null, credentials);
    setShowCredentialsDialog(false);
    setCredentials({ email: '', password: '' });
  };
  
  // Handle clicking the sync button
  const handleSyncClick = (service) => {
    setSelectedService(service);
    
    switch (service.integration_type) {
      case 'api':
      case 'oauth':
        // These don't need user input, sync immediately
        syncService(service);
        break;
        
      case 'puppeteer':
        // Need credentials for puppeteer
        setShowCredentialsDialog(true);
        break;
        
      case 'extension':
        // Prompt to use extension if installed, otherwise suggest manual entry
        if (extensionInstalled) {
          promptUseExtension(service);
        } else {
          toast({
            title: 'Extension required',
            description: 'This service requires our Chrome extension to sync automatically.',
            action: (
              <Button variant="outline" size="sm" onClick={promptInstallExtension}>
                Get Extension
              </Button>
            )
          });
          setShowAddDialog(true);
        }
        break;
        
      case 'manual':
      default:
        // Show manual entry dialog
        setShowAddDialog(true);
        break;
    }
  };
  
  // Prompt user to install Chrome extension
  const promptInstallExtension = () => {
    // In a production app, this would link to the Chrome Web Store
    window.open('https://tiptop.com/extension', '_blank');
  };
  
  // Prompt user to use Chrome extension
  const promptUseExtension = (service) => {
    toast({
      title: 'Use Chrome Extension',
      description: `Please use the TipTop Chrome extension on the ${service.name} website to sync earnings.`,
    });
  };
  
  // Download earnings report as PDF
  const downloadReport = () => {
    try {
      const pdfData = {
        earnings: earnings.map(item => ({
          service: item.services?.name || item.service,
          earnings: item.earnings || 0,
          updated_at: item.updated_at
        }))
      };
      
      generatePDF(pdfData, 'TipTop_Affiliate_Earnings.pdf');
      
      toast({
        title: 'Report Downloaded',
        description: 'Your affiliate earnings report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to generate earnings report',
        variant: 'destructive',
      });
    }
  };
  
  // Get services for current tab
  const getFilteredServices = () => {
    if (selectedTab === 'all') return services;
    
    return services.filter(service => {
      switch (selectedTab) {
        case 'energy':
          return ['sunrun', 'tesla_energy', 'enphase_energy'].includes(service.name);
        case 'ev':
          return ['chargepoint', 'evgo', 'blink_charging', 'enel_x_way', 'evmatch', 'ampup'].includes(service.name);
        case 'internet':
          return ['honeygain', 'mysterium_network', 'cudo_compute', 'packetstream', 'golem_network', 'storj'].includes(service.name);
        case 'spaces':
          return ['swimply', 'neighbor', 'turo', 'peerspace', 'splacer', 'liquidspace', 'yardyum', 'rentthebackyard'].includes(service.name);
        default:
          return true;
      }
    });
  };
  
  // Calculate total monthly earnings
  const totalMonthlyEarnings = earnings.reduce((sum, item) => sum + (parseFloat(item.earnings) || 0), 0);
  
  // Get integration type badge
  const getIntegrationBadge = (type) => {
    const colorClass = integrationTypeColors[type] || 'bg-gray-600';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass} text-white`}>
        {type === 'api' && 'API'}
        {type === 'oauth' && 'OAuth'}
        {type === 'puppeteer' && 'Auto'}
        {type === 'extension' && 'Extension'}
        {type === 'manual' && 'Manual'}
      </span>
    );
  };
  
  // Get sync status badge
  const getStatusBadge = (status) => {
    const colorClass = statusColors[status] || 'bg-gray-600';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass} text-white`}>
        {status === 'success' && 'Success'}
        {status === 'error' && 'Error'}
        {status === 'pending' && 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Earnings</h2>
          <p className="text-muted-foreground">
            Manage and track your affiliate earnings from connected services
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadReport}
            disabled={earnings.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button 
            variant="default" 
            onClick={loadData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Total Earnings Summary Card */}
      <Card className="bg-gray-800 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Monthly Earnings</p>
              <h3 className="text-4xl font-bold text-tiptop-purple">
                ${totalMonthlyEarnings.toFixed(2)}
              </h3>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" className="text-white border-white hover:bg-gray-700">
                <Download className="mr-2 h-4 w-4" />
                PDF Report
              </Button>
              <Button>Add Service</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Services Tabs */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="ev">EV Charging</TabsTrigger>
          <TabsTrigger value="internet">Internet</TabsTrigger>
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-tiptop-purple" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredServices().map((service) => {
                const earningsData = earnings.find(e => e.service === service.name);
                return (
                  <Card key={service.name} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {service.name.replace(/_/g, ' ')}
                            {getIntegrationBadge(service.integration_type)}
                          </CardTitle>
                          <CardDescription>
                            {earningsData ? (
                              <span className="flex items-center gap-1">
                                Last updated: {new Date(earningsData.updated_at).toLocaleDateString()}
                                {earningsData.last_sync_status && getStatusBadge(earningsData.last_sync_status)}
                              </span>
                            ) : (
                              'Not yet connected'
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Monthly Earnings</p>
                          <p className="text-2xl font-bold">
                            ${earningsData ? (earningsData.earnings || 0).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        
                        <Button
                          variant={earningsData ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleSyncClick(service)}
                          disabled={syncingService === service.name}
                        >
                          {syncingService === service.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : earningsData ? (
                            'Update'
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                      
                      {service.login_url && (
                        <div className="mt-4">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs text-muted-foreground"
                            onClick={() => window.open(service.login_url, '_blank')}
                          >
                            Visit Dashboard <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Add New Service Card */}
              <Card className="border border-dashed border-gray-300 bg-transparent hover:border-gray-400 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Button variant="ghost" onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-6 w-6 mr-2" />
                    Add Service
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Manual Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Earnings</DialogTitle>
            <DialogDescription>
              {selectedService ? (
                `Enter the monthly earnings for ${selectedService.name.replace(/_/g, ' ')}`
              ) : (
                'Enter the monthly earnings for this service'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Earnings ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
            
            <Button onClick={handleManualSync} className="w-full">Save Earnings</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Credentials</DialogTitle>
            <DialogDescription>
              {selectedService ? (
                `Enter your ${selectedService.name.replace(/_/g, ' ')} credentials to sync earnings`
              ) : (
                'Enter your credentials to sync earnings'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Your credentials are securely stored and only used to sync earnings from this service.
            </div>
            
            <Button onClick={handleCredentialsSync} className="w-full">Sync Earnings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateEarningsDashboard;
