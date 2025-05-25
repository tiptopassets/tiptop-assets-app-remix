import React from 'react';
import { SelectedAsset, AnalysisResults } from '@/types/analysis';
import { DollarSign, Sun, Car, Home, Database, Wifi, SwimmingPool, FileText } from 'lucide-react';
import ServiceCard from '@/components/property/ServiceCard';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import LocationVerificationBadge from './LocationVerificationBadge';

interface PropertyAnalysisContentProps {
  results: AnalysisResults & {
    serviceAvailability?: {
      verified: boolean;
      location: string;
      coverage: string;
    };
    locationInfo?: {
      country: string;
      state?: string;
      city?: string;
      zipCode?: string;
    };
  };
  onSelectAsset: (asset: SelectedAsset) => void;
}

const PropertyAnalysisContent = ({ results, onSelectAsset }: PropertyAnalysisContentProps) => {
  const totalMonthlyRevenue =
    results.rooftop.revenue +
    results.garden.revenue +
    results.parking.revenue +
    results.pool.revenue +
    results.storage.revenue +
    results.bandwidth.revenue +
    results.shortTermRental.monthlyProjection;

  const bestOpportunity = results.topOpportunities.reduce((prev, current) => {
    return prev.monthlyRevenue > current.monthlyRevenue ? prev : current;
  }, results.topOpportunities[0]);

  const handleSelectAsset = (asset: SelectedAsset) => {
    onSelectAsset(asset);
  };

  return (
    <div className="space-y-6">
      {/* Location Verification Badge */}
      <LocationVerificationBadge 
        serviceAvailability={results.serviceAvailability}
        locationInfo={results.locationInfo}
      />

      {/* Property Type Display */}
      <PropertyTypeDisplay 
        propertyType={results.propertyType}
        amenities={results.amenities}
      />

      {/* Rooftop Analysis */}
      {results.rooftop.solarPotential && (
        <ServiceCard
          id="rooftop-solar"
          title="Rooftop Solar Potential"
          description={`Harness the sun's energy with an estimated ${results.rooftop.solarCapacity} kW solar panel system.`}
          earnings={`Est. $${results.rooftop.revenue}/month`}
          icon={<Sun className="h-5 w-5 text-yellow-500" />}
          link="https://www.energysage.com/"
          linkText="Find Local Installers"
        >
          {results.rooftop.providers && results.rooftop.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.rooftop.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Garden Analysis */}
      {results.garden.revenue > 0 && (
        <ServiceCard
          id="garden-opportunity"
          title="Garden Monetization Opportunity"
          description={`Transform your garden into a revenue-generating asset with ${results.garden.opportunity} potential.`}
          earnings={`Est. $${results.garden.revenue}/month`}
          icon={<Home className="h-5 w-5 text-green-500" />}
          link="https://www.neighbor.com/"
          linkText="Explore Options"
        >
          {results.garden.providers && results.garden.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.garden.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Parking Analysis */}
      {results.parking.revenue > 0 && (
        <ServiceCard
          id="parking-monetization"
          title="Parking Space Monetization"
          description={`Monetize your unused parking spaces with an estimated ${results.parking.spaces} available.`}
          earnings={`Est. $${results.parking.revenue}/month`}
          icon={<Car className="h-5 w-5 text-blue-500" />}
          link="https://www.spothero.com/"
          linkText="List Your Space"
        >
          {results.parking.providers && results.parking.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.parking.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Pool Analysis */}
      {results.pool.present && (
        <ServiceCard
          id="pool-rental"
          title="Pool Rental Opportunity"
          description={`Rent out your pool for hourly rentals and earn an estimated income.`}
          earnings={`Est. $${results.pool.revenue}/month`}
          icon={<SwimmingPool className="h-5 w-5 text-cyan-500" />}
          link="https://swimply.com/"
          linkText="List Your Pool"
        >
          {results.pool.providers && results.pool.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.pool.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Storage Analysis */}
      {results.storage.revenue > 0 && (
        <ServiceCard
          id="storage-rental"
          title="Storage Space Rental"
          description={`Rent out unused storage space in your property and earn passive income.`}
          earnings={`Est. $${results.storage.revenue}/month`}
          icon={<Database className="h-5 w-5 text-orange-500" />}
          link="https://www.neighbor.com/"
          linkText="List Your Space"
        >
          {results.storage.providers && results.storage.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.storage.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Bandwidth Analysis */}
      {results.bandwidth.revenue > 0 && (
        <ServiceCard
          id="bandwidth-sharing"
          title="Bandwidth Sharing Opportunity"
          description={`Share your unused internet bandwidth and earn passive income every month.`}
          earnings={`Est. $${results.bandwidth.revenue}/month`}
          icon={<Wifi className="h-5 w-5 text-teal-500" />}
          link="https://www.honeygain.com/"
          linkText="Get Started"
        >
          {results.bandwidth.providers && results.bandwidth.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.bandwidth.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Short Term Rental Analysis */}
      {results.shortTermRental.monthlyProjection > 0 && (
        <ServiceCard
          id="short-term-rental"
          title="Short Term Rental Potential"
          description={`List your property for short term rentals and earn an estimated income.`}
          earnings={`Est. $${results.shortTermRental.monthlyProjection}/month`}
          icon={<Home className="h-5 w-5 text-indigo-500" />}
          link="https://www.airbnb.com/"
          linkText="List Your Property"
        >
          {results.shortTermRental.providers && results.shortTermRental.providers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Top Providers</h4>
              <div className="space-y-2">
                {results.shortTermRental.providers.slice(0, 2).map((provider, idx) => (
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
                          {/* <ExternalLink size={12} /> */}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ServiceCard>
      )}

      {/* Permits and Restrictions */}
      {(results.permits.length > 0 || results.restrictions) && (
        <ServiceCard
          id="permits-restrictions"
          title="Permits & Restrictions"
          description="Important information regarding permits and restrictions for your property."
          earnings=""
          icon={<FileText className="h-5 w-5 text-gray-500" />}
        >
          {results.permits.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Required Permits</h4>
              <ul className="list-disc pl-4 text-sm text-gray-300">
                {results.permits.map((permit, index) => (
                  <li key={index}>{permit}</li>
                ))}
              </ul>
            </div>
          )}
          {results.restrictions && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-tiptop-purple mb-2">Restrictions</h4>
              <p className="text-sm text-gray-300">{results.restrictions}</p>
            </div>
          )}
        </ServiceCard>
      )}
    </div>
  );
};

export default PropertyAnalysisContent;
