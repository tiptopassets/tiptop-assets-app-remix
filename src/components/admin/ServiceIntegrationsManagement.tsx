
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RefreshCw } from 'lucide-react';
import ServiceIntegrationsTable from './ServiceIntegrationsTable';
import AddServiceIntegrationForm, { ServiceIntegrationFormValues } from './AddServiceIntegrationForm';
import ServiceProviderSync from './ServiceProviderSync';
import { useServiceIntegrations } from '@/hooks/useServiceIntegrations';

const ServiceIntegrationsManagement = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { integrations, partnerClicks, loading, addIntegration, updateIntegrationStatus } = useServiceIntegrations();

  // Create a wrapper function to handle the Promise returned by addIntegration
  const handleAddIntegration = async (integration: ServiceIntegrationFormValues) => {
    try {
      const result = await addIntegration(integration as any);
      if (!result.success && result.error) {
        throw result.error;
      }
      setShowAddDialog(false);
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = () => {
    window.location.reload(); // Simple refresh to get latest data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Integrations</h2>
          <p className="text-muted-foreground">
            Manage property monetization service partners and track user engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Integration
          </Button>
        </div>
      </div>

      {/* Add the sync component */}
      <ServiceProviderSync />

      <div className="glass-effect rounded-lg border p-1">
        <ServiceIntegrationsTable
          integrations={integrations}
          partnerClicks={partnerClicks}
          loading={loading}
          onUpdateStatus={updateIntegrationStatus}
        />
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Service Integration</DialogTitle>
          </DialogHeader>
          <AddServiceIntegrationForm 
            onAdd={handleAddIntegration}
            onClose={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceIntegrationsManagement;
