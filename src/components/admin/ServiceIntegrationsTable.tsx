
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, ExternalLink, Users, TrendingUp } from 'lucide-react';
import { ServiceIntegration, PartnerClick } from '@/hooks/useServiceIntegrations';

interface ServiceIntegrationsTableProps {
  integrations: ServiceIntegration[];
  partnerClicks: Record<string, PartnerClick[]>;
  loading: boolean;
  onUpdateStatus: (id: string, status: 'active' | 'pending' | 'inactive') => Promise<{ success: boolean; error?: Error }>;
}

const ServiceIntegrationsTable = ({ 
  integrations, 
  partnerClicks, 
  loading, 
  onUpdateStatus 
}: ServiceIntegrationsTableProps) => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [showClicksDialog, setShowClicksDialog] = useState(false);

  const handleViewClicks = (partnerName: string) => {
    setSelectedPartner(partnerName);
    setShowClicksDialog(true);
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'pending' | 'inactive') => {
    try {
      const result = await onUpdateStatus(id, newStatus);
      if (!result.success) {
        console.error('Failed to update status:', result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  // Sort integrations by priority and name
  const sortedIntegrations = [...integrations].sort((a, b) => {
    // First sort by total clicks (descending)
    if (a.total_clicks !== b.total_clicks) {
      return b.total_clicks - a.total_clicks;
    }
    // Then by name (ascending)
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Service</th>
              <th className="text-left p-3 font-medium">Asset Types</th>
              <th className="text-left p-3 font-medium">Revenue Range</th>
              <th className="text-left p-3 font-medium">Clicks</th>
              <th className="text-left p-3 font-medium">Conversion</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedIntegrations.map((integration) => {
              const clicks = partnerClicks[integration.partner_name] || [];
              const hasClicks = clicks.length > 0;
              
              return (
                <tr key={integration.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      {integration.logo_url ? (
                        <img 
                          src={integration.logo_url} 
                          alt={integration.name}
                          className="w-8 h-8 rounded object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {integration.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {integration.asset_types.slice(0, 2).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                      {integration.asset_types.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.asset_types.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        ${integration.monthly_revenue_low} - ${integration.monthly_revenue_high}
                      </div>
                      <div className="text-gray-600">per month</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{integration.total_clicks}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{integration.conversion_rate}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={integration.status}
                      onChange={(e) => handleStatusChange(integration.id, e.target.value as 'active' | 'pending' | 'inactive')}
                      className="text-sm border rounded px-2 py-1 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      {hasClicks && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClicks(integration.partner_name)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Clicks ({clicks.length})
                        </Button>
                      )}
                      {integration.integration_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(integration.integration_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show message if no integrations */}
      {sortedIntegrations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No service integrations found.</p>
        </div>
      )}

      {/* Clicks Dialog */}
      <Dialog open={showClicksDialog} onOpenChange={setShowClicksDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPartner} - User Clicks ({partnerClicks[selectedPartner || '']?.length || 0})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPartner && partnerClicks[selectedPartner] && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">User</th>
                      <th className="text-left p-2 font-medium">Clicked At</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Referral Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerClicks[selectedPartner].map((click) => (
                      <tr key={click.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">
                            {click.user_email || `User ${click.user_id?.slice(0, 8)}...`}
                          </div>
                          <div className="text-xs text-gray-600">
                            ID: {click.user_id?.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            {new Date(click.clicked_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={click.integration_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {click.integration_status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="text-xs text-gray-600 max-w-xs truncate">
                            {click.referral_link || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceIntegrationsTable;
