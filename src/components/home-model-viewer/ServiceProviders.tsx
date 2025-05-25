
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ProviderInfo } from '@/types/analysis';

interface ServiceProvidersProps {
  title: string;
  providers: ProviderInfo[];
}

const ServiceProviders = ({ title, providers }: ServiceProvidersProps) => {
  return (
    <div className="bg-white/5 p-3 rounded-lg">
      <h4 className="text-sm font-medium text-tiptop-purple mb-2">{title}</h4>
      <div className="space-y-2">
        {providers.slice(0, 2).map((provider, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-1 last:border-0">
            <span className="text-white">{provider.name}</span>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">
                {provider.setupCost ? `$${provider.setupCost}` : ''}
                {provider.setupCost && provider.roi ? ' • ' : ''}
                {provider.roi ? `ROI: ${provider.roi} mo` : ''}
                {provider.fee ? `${provider.fee}${typeof provider.fee === 'number' ? '%' : ''} fee` : ''}
              </span>
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
    </div>
  );
};

export default ServiceProviders;
