
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Check, 
  Clock, 
  ExternalLink, 
  MoreHorizontal, 
  X, 
  Edit, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { ServiceIntegration } from "@/hooks/useServiceIntegrations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import MobileServiceIntegrationsCards from './MobileServiceIntegrationsCards';

interface ServiceIntegrationsTableProps {
  integrations: ServiceIntegration[];
  loading: boolean;
  onUpdateStatus: (id: string, status: 'active' | 'pending' | 'inactive') => Promise<{success: boolean}>;
}

const ServiceIntegrationsTable = ({ 
  integrations, 
  loading, 
  onUpdateStatus 
}: ServiceIntegrationsTableProps) => {
  const isMobile = useIsMobile();
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

  // Use mobile cards on small screens
  if (isMobile) {
    return <MobileServiceIntegrationsCards integrations={integrations} loading={loading} onUpdateStatus={onUpdateStatus} />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>Monthly Revenue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-t-tiptop-purple rounded-full animate-spin"></div>
                  <span className="ml-2">Loading integrations...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : integrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No service integrations found
              </TableCell>
            </TableRow>
          ) : (
            integrations.map((integration) => (
              <TableRow key={integration.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="mr-2 p-1.5 bg-violet-500/10 rounded-md">
                      {/* Placeholder for dynamic icon - in a real implementation this would use dynamic icons */}
                      {integration.icon === 'home' && <div className="w-5 h-5 text-violet-600">🏠</div>}
                      {integration.icon === 'parking' && <div className="w-5 h-5 text-violet-600">🅿️</div>}
                      {integration.icon === 'sun' && <div className="w-5 h-5 text-violet-600">☀️</div>}
                      {integration.icon === 'battery-charging' && <div className="w-5 h-5 text-violet-600">🔋</div>}
                    </div>
                    {integration.name}
                  </div>
                </TableCell>
                <TableCell>{integration.partner_name}</TableCell>
                <TableCell>${integration.monthly_revenue_low}-${integration.monthly_revenue_high}/mo</TableCell>
                <TableCell>{getStatusBadge(integration.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Button variant="outline" onClick={() => window.open(selectedIntegration.integration_url!, '_blank')}>
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

export default ServiceIntegrationsTable;
