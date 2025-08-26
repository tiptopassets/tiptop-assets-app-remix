import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  MoreVertical, 
  X, 
  Edit, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ServiceIntegration } from '@/hooks/useServiceIntegrations';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { trackAndOpenReferral } from '@/services/clickTrackingService';

interface MobileServiceIntegrationsCardsProps {
  integrations: ServiceIntegration[];
  loading: boolean;
  onUpdateStatus: (id: string, status: 'active' | 'pending' | 'inactive') => Promise<{success: boolean}>;
}

const MobileServiceIntegrationsCards = ({ 
  integrations, 
  loading, 
  onUpdateStatus 
}: MobileServiceIntegrationsCardsProps) => {
  const [selectedIntegration, setSelectedIntegration] = useState<ServiceIntegration | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500"><Check className="mr-1 h-3 w-3" /> Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500"><X className="mr-1 h-3 w-3" /> Inactive</Badge>;
      default:
        return <Badge className="bg-gray-500"><AlertCircle className="mr-1 h-3 w-3" /> Unknown</Badge>;
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'pending' | 'inactive') => {
    const { success } = await onUpdateStatus(id, status);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Integration status changed to ${status}`,
      });
    } else {
      toast({
        title: "Update Failed", 
        description: "There was an error updating the integration status",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (integration: ServiceIntegration) => {
    setSelectedIntegration(integration);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-t-tiptop-purple rounded-full animate-spin"></div>
        <span className="ml-2">Loading integrations...</span>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No service integrations found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="bg-white shadow-sm border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 p-2 bg-violet-500/10 rounded-md">
                    {integration.icon === 'home' && <div className="w-6 h-6 text-violet-600">🏠</div>}
                    {integration.icon === 'parking' && <div className="w-6 h-6 text-violet-600">🅿️</div>}
                    {integration.icon === 'sun' && <div className="w-6 h-6 text-violet-600">☀️</div>}
                    {integration.icon === 'battery-charging' && <div className="w-6 h-6 text-violet-600">🔋</div>}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-gray-500">{integration.partner_name}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(integration)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(integration.id, 'active')}>
                      Set as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(integration.id, 'pending')}>
                      Set as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(integration.id, 'inactive')}>
                      Set as Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Monthly Revenue:</span>
                  <p className="font-medium">${integration.monthly_revenue_low}-${integration.monthly_revenue_high}/mo</p>
                </div>
                <div>
                  {getStatusBadge(integration.status)}
                </div>
              </div>
              
              {integration.integration_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => trackAndOpenReferral({
                    provider: integration.name,
                    url: integration.integration_url!,
                    source: 'admin_services_mobile'
                  })}
                >
                  Visit Partner Portal <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        {selectedIntegration && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedIntegration.name} Integration</DialogTitle>
              <DialogDescription>
                Integration details and configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-gray-600">{selectedIntegration.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Partner</h4>
                  <p className="text-gray-600">{selectedIntegration.partner_name}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <div>{getStatusBadge(selectedIntegration.status)}</div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Integration Added</h4>
                  <p className="text-gray-600">
                    {new Date(selectedIntegration.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Expected Revenue</h4>
                  <p className="text-gray-600">
                    ${selectedIntegration.monthly_revenue_low}-${selectedIntegration.monthly_revenue_high}/mo
                  </p>
                </div>
              </div>
              
              {selectedIntegration.integration_url && (
                <div className="pt-2">
                  <Button variant="outline" onClick={() => trackAndOpenReferral({
                    provider: selectedIntegration.name,
                    url: selectedIntegration.integration_url!,
                    source: 'admin_services_mobile_dialog'
                  })}>
                    Visit Partner Portal <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default MobileServiceIntegrationsCards;