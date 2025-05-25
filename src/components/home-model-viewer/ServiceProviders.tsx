
import React from 'react';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ProviderInfo } from '@/types/analysis';

interface ServiceProvidersProps {
  title: string;
  providers: ProviderInfo[];
}

const ServiceProviders = ({ title, providers }: ServiceProvidersProps) => {
  const getAvailabilityIcon = (provider: ProviderInfo) => {
    const availability = (provider as any).availability;
    if (!availability) return null;
    
    if (availability.coverage === 'full') {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    } else if (availability.coverage === 'partial') {
      return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    } else if (availability.coverage === 'none') {
      return <XCircle className="h-3 w-3 text-red-500" />;
    }
    return <AlertCircle className="h-3 w-3 text-gray-400" />;
  };

  const getAvailabilityText = (provider: ProviderInfo) => {
    const availability = (provider as any).availability;
    const isUnavailable = (provider as any).available === false;
    
    if (isUnavailable) {
      return (provider as any).unavailableReason || 'Not available';
    }
    
    if (!availability) return 'Unverified';
    
    switch (availability.coverage) {
      case 'full': return 'Available';
      case 'partial': return 'Limited availability';
      case 'none': return 'Not available';
      default: return 'Unverified';
    }
  };

  const availableProviders = providers.filter(p => (p as any).available !== false);
  const unavailableProviders = providers.filter(p => (p as any).available === false);

  return (
    <div className="bg-white/5 p-3 rounded-lg">
      <h4 className="text-sm font-medium text-tiptop-purple mb-2">{title}</h4>
      
      {/* Available Providers */}
      {availableProviders.length > 0 && (
        <div className="space-y-2 mb-3">
          {availableProviders.slice(0, 2).map((provider, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm border-b border-white/5 pb-2 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {getAvailabilityIcon(provider)}
                  <span className="text-white font-medium">{provider.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {getAvailabilityText(provider)}
                </div>
                {(provider as any).availability?.restrictions?.length > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    {(provider as any).availability.restrictions[0]}
                  </div>
                )}
              </div>
              <div className="flex items-center ml-2">
                <div className="text-right mr-2">
                  <div className="text-xs text-gray-400">
                    {provider.setupCost ? `$${provider.setupCost}` : ''}
                    {provider.setupCost && provider.roi ? ' • ' : ''}
                    {provider.roi ? `ROI: ${provider.roi} mo` : ''}
                    {provider.fee ? `${provider.fee}${typeof provider.fee === 'number' ? '%' : ''} fee` : ''}
                  </div>
                </div>
                {provider.url && (
                  <a 
                    href={provider.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-tiptop-purple hover:underline"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unavailable Providers (collapsed) */}
      {unavailableProviders.length > 0 && (
        <details className="text-xs">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
            {unavailableProviders.length} service{unavailableProviders.length > 1 ? 's' : ''} not available in your area
          </summary>
          <div className="mt-2 space-y-1 pl-2 border-l border-gray-600">
            {unavailableProviders.map((provider, idx) => (
              <div key={idx} className="flex items-center gap-1">
                {getAvailabilityIcon(provider)}
                <span className="text-gray-500">{provider.name}</span>
                <span className="text-red-400">- {getAvailabilityText(provider)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {availableProviders.length === 0 && unavailableProviders.length === 0 && (
        <div className="text-xs text-gray-400">No providers configured</div>
      )}
    </div>
  );
};

export default ServiceProviders;
