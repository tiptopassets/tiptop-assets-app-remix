
import { useState } from 'react';
import { 
  useAffiliateEarnings, 
  ServiceWithEarnings 
} from '@/hooks/useAffiliateEarnings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  RefreshCw, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3,
  Key
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import ServiceCard from '../property/ServiceCard';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Helper function to format earnings
const formatEarnings = (amount: number = 0) => {
  return `$${amount.toFixed(2)}`;
};

// Helper function to format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Never';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'success':
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-1 h-4 w-4" /> Synced
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="mr-1 h-4 w-4" /> Error
        </div>
      );
    case 'pending':
    default:
      return (
        <div className="flex items-center text-yellow-600">
          <Clock className="mr-1 h-4 w-4" /> Pending
        </div>
      );
  }
};

const AffiliateEarningsDashboard = () => {
  const { 
    services, 
    loading, 
    syncServiceEarnings,
    saveCredentials,
    checkCredentials,
    refreshData
  } = useAffiliateEarnings();
  
  const [selectedService, setSelectedService] = useState<ServiceWithEarnings | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // Calculate total earnings
  const totalEarnings = services.reduce((sum, service) => sum + (service.earnings || 0), 0);
  
  const handleSync = async (service: ServiceWithEarnings) => {
    setIsSyncing(service.name);
    
    try {
      if (service.integration_type === 'manual') {
        setSelectedService(service);
        setShowManualDialog(true);
        setIsSyncing(null);
        return;
      }
      
      // For automatic syncing methods, check credentials
      if (service.integration_type === 'puppeteer') {
        const { exists } = await checkCredentials(service.name);
        
        if (!exists) {
          setSelectedService(service);
          setShowCredentialsDialog(true);
          setIsSyncing(null);
          return;
        }
      }
      
      // Perform the sync
      await syncServiceEarnings(service.name);
    } finally {
      setIsSyncing(null);
    }
  };
  
  const handleManualSync = async () => {
    if (!selectedService) return;
    
    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid earnings amount.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSyncing(selectedService.name);
    await syncServiceEarnings(selectedService.name, amount);
    setIsSyncing(null);
    setShowManualDialog(false);
    setManualAmount('');
  };
  
  const handleCredentialsSave = async () => {
    if (!selectedService) return;
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await saveCredentials(
      selectedService.name,
      credentials.email,
      credentials.password
    );
    
    if (result.success) {
      // After saving credentials, try to sync
      await syncServiceEarnings(
        selectedService.name,
        undefined,
        credentials
      );
      
      setCredentials({ email: '', password: '' });
      setShowCredentialsDialog(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Affiliate Earnings</h2>
          <p className="text-muted-foreground">
            Track and manage your affiliate earnings across all services
          </p>
        </div>
        <Button 
          onClick={() => refreshData()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </motion.div>
      
      {/* Earnings Summary Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-effect p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Total Earnings</h3>
          {loading ? (
            <Skeleton className="h-12 w-32 mx-auto" />
          ) : (
            <div className="text-4xl font-bold text-tiptop-purple">
              {formatEarnings(totalEarnings)}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Combined earnings across all services
          </p>
        </Card>
      </motion.div>
      
      {/* Earnings Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="cards">Cards View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, idx) => (
                  <Skeleton key={idx} className="h-64 w-full" />
                ))
              ) : services.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No affiliate services available</p>
                </div>
              ) : (
                services.map(service => (
                  <ServiceCard
                    key={service.name}
                    id={service.name}
                    title={service.name}
                    description={`Integration Type: ${service.integration_type}`}
                    earnings={formatEarnings(service.earnings || 0)}
                    icon={<DollarSign className="h-5 w-5 text-tiptop-purple" />}
                    link={service.login_url || undefined}
                    linkText="Visit Partner Site"
                  >
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Last updated: {formatDate(service.updated_at)}
                      </div>
                      <StatusBadge status={service.last_sync_status || 'pending'} />
                    </div>
                    <Button 
                      onClick={() => handleSync(service)}
                      disabled={!!isSyncing}
                      variant="default"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      {isSyncing === service.name ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" /> 
                          Sync Earnings
                        </>
                      )}
                    </Button>
                    {service.integration_type === 'puppeteer' && (
                      <Button
                        onClick={() => {
                          setSelectedService(service);
                          setShowCredentialsDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                      >
                        <Key className="mr-2 h-4 w-4" /> Manage Credentials
                      </Button>
                    )}
                  </ServiceCard>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            <Card className="glass-effect">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Integration Type</th>
                    <th className="text-right p-4">Earnings</th>
                    <th className="text-right p-4">Last Updated</th>
                    <th className="text-right p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(3).fill(0).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={6} className="p-4">
                          <Skeleton className="h-10 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : services.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        No affiliate services available
                      </td>
                    </tr>
                  ) : (
                    services.map(service => (
                      <tr key={service.name} className="border-b">
                        <td className="p-4 font-medium">{service.name}</td>
                        <td className="p-4 capitalize">{service.integration_type}</td>
                        <td className="p-4 text-right font-semibold">
                          {formatEarnings(service.earnings || 0)}
                        </td>
                        <td className="p-4 text-right text-muted-foreground">
                          {formatDate(service.updated_at)}
                        </td>
                        <td className="p-4 text-right">
                          <StatusBadge status={service.last_sync_status || 'pending'} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleSync(service)}
                              disabled={!!isSyncing}
                              variant="ghost"
                              size="sm"
                            >
                              {isSyncing === service.name ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              <span className="sr-only">Sync</span>
                            </Button>
                            
                            {service.integration_type === 'puppeteer' && (
                              <Button
                                onClick={() => {
                                  setSelectedService(service);
                                  setShowCredentialsDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                <Key className="h-4 w-4" />
                                <span className="sr-only">Credentials</span>
                              </Button>
                            )}
                            
                            {service.integration_type === 'manual' && (
                              <Button
                                onClick={() => {
                                  setSelectedService(service);
                                  setShowManualDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Manual Earnings Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update {selectedService?.name} Earnings</DialogTitle>
            <DialogDescription>
              Enter the current earnings amount from your {selectedService?.name} dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ($)
              </Label>
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualSync} disabled={!manualAmount}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedService?.name} Login Credentials</DialogTitle>
            <DialogDescription>
              Enter your login credentials for automatic synchronization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your credentials are securely stored and only used to automatically fetch your earnings.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCredentialsSave}>
              Save & Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AffiliateEarningsDashboard;
