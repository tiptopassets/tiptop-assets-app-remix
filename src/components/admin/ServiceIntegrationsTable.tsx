
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { 
  Check, 
  Clock, 
  ExternalLink, 
  MoreHorizontal, 
  X, 
  Edit, 
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Users,
  MousePointer,
  TrendingUp,
  Calendar
} from "lucide-react";
import { ServiceIntegration, PartnerClick } from "@/hooks/useServiceIntegrations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import MobileServiceIntegrationsCards from './MobileServiceIntegrationsCards';

interface ServiceIntegrationsTableProps {
  integrations: ServiceIntegration[];
  partnerClicks: Record<string, PartnerClick[]>;
  loading: boolean;
  onUpdateStatus: (id: string, status: 'active' | 'pending' | 'inactive') => Promise<{success: boolean}>;
}

const ServiceIntegrationsTable = ({ 
  integrations, 
  partnerClicks,
  loading, 
  onUpdateStatus 
}: ServiceIntegrationsTableProps) => {
  const isMobile = useIsMobile();
  const [selectedIntegration, setSelectedIntegration] = useState<ServiceIntegration | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedPartners, setExpandedPartners] = useState<Set<string>>(new Set());

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

  const togglePartnerExpansion = (partnerName: string) => {
    const newExpanded = new Set(expandedPartners);
    if (newExpanded.has(partnerName)) {
      newExpanded.delete(partnerName);
    } else {
      newExpanded.add(partnerName);
    }
    setExpandedPartners(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use mobile cards on small screens
  if (isMobile) {
    return <MobileServiceIntegrationsCards integrations={integrations} loading={loading} onUpdateStatus={onUpdateStatus} />;
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.reduce((sum, partner) => sum + partner.total_clicks, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.length > 0 
                  ? Math.round((integrations.reduce((sum, partner) => sum + partner.conversion_rate, 0) / integrations.length) * 100) / 100
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter(p => p.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Asset Types</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Revenue Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-t-tiptop-purple rounded-full animate-spin"></div>
                      <span className="ml-2">Loading partners...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : integrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No service integrations found
                  </TableCell>
                </TableRow>
              ) : (
                integrations.map((integration) => (
                  <React.Fragment key={integration.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {integration.logo_url && (
                            <img 
                              src={integration.logo_url} 
                              alt={integration.name}
                              className="w-8 h-8 rounded mr-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-gray-500">{integration.partner_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {integration.asset_types.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MousePointer className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">{integration.total_clicks}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-medium">{integration.conversion_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>${integration.monthly_revenue_low}-${integration.monthly_revenue_high}/mo</TableCell>
                      <TableCell>{getStatusBadge(integration.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {integration.total_clicks > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePartnerExpansion(integration.name)}
                            >
                              {expandedPartners.has(integration.name) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              View Clicks
                            </Button>
                          )}
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
                              <DropdownMenuItem onClick={() => handleStatusChange(integration.id, 'inactive')}>
                                Set as Inactive
                              </DropdownMenuItem>
                              {integration.integration_url && (
                                <DropdownMenuItem onClick={() => window.open(integration.integration_url!, '_blank')}>
                                  <ExternalLink className="mr-2 h-4 w-4" /> Visit Partner
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Click Details */}
                    {expandedPartners.has(integration.name) && partnerClicks[integration.name] && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-gray-50 p-4 border-t">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Users who clicked {integration.name} ({partnerClicks[integration.name].length} total)
                            </h4>
                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                              {partnerClicks[integration.name].map((click, index) => (
                                <div key={click.id} className="flex items-center justify-between bg-white p-3 rounded border text-sm">
                                  <div className="flex items-center space-x-3">
                                    <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                      {click.user_id.substring(0, 8)}...
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(click.clicked_at)}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge 
                                      variant={click.integration_status === 'completed' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {click.integration_status}
                                    </Badge>
                                    {click.referral_link && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(click.referral_link, '_blank')}
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Integration Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        {selectedIntegration && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedIntegration.name} Integration</DialogTitle>
              <DialogDescription>
                Partner analytics and detailed information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-gray-600">{selectedIntegration.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Total Clicks</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedIntegration.total_clicks}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedIntegration.conversion_rate}%</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <div>{getStatusBadge(selectedIntegration.status)}</div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Revenue Range</h4>
                  <p className="text-gray-600">
                    ${selectedIntegration.monthly_revenue_low}-${selectedIntegration.monthly_revenue_high}/mo
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Asset Types</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedIntegration.asset_types.map((type, index) => (
                    <Badge key={index} variant="outline">
                      {type}
                    </Badge>
                  ))}
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
