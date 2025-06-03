
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ServiceAvailability {
  serviceName: string;
  available: boolean;
  reason?: string;
}

interface ServiceAvailabilityCheckerProps {
  coordinates: google.maps.LatLngLiteral;
  address: string;
}

const ServiceAvailabilityChecker = ({ coordinates, address }: ServiceAvailabilityCheckerProps) => {
  const [services, setServices] = useState<ServiceAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServiceAvailability();
  }, [coordinates, address]);

  const checkServiceAvailability = async () => {
    setLoading(true);
    
    // Simulate service availability checking
    // In production, this would check actual service coverage areas
    const serviceChecks: ServiceAvailability[] = [
      {
        serviceName: 'Swimply',
        available: true, // Most areas have pool rental demand
        reason: 'High demand area for pool rentals'
      },
      {
        serviceName: 'SpotHero',
        available: coordinates.lat > 25 && coordinates.lat < 50, // US coverage primarily
        reason: coordinates.lat > 25 && coordinates.lat < 50 ? 'Active in this metropolitan area' : 'Limited coverage in this area'
      },
      {
        serviceName: 'Honeygain',
        available: true, // Global service
        reason: 'Available worldwide'
      },
      {
        serviceName: 'ChargePoint',
        available: coordinates.lat > 30 && coordinates.lat < 48, // Major US cities
        reason: coordinates.lat > 30 && coordinates.lat < 48 ? 'EV infrastructure available' : 'Limited EV infrastructure'
      },
      {
        serviceName: 'Airbnb',
        available: true, // Global availability
        reason: 'Active short-term rental market'
      }
    ];

    setServices(serviceChecks);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
        <span className="text-sm text-gray-600">Checking service availability...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Service Availability in Your Area</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {services.map((service) => (
          <Badge
            key={service.serviceName}
            variant={service.available ? 'default' : 'secondary'}
            className="flex items-center gap-1 justify-center p-2"
          >
            {service.available ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs">{service.serviceName}</span>
          </Badge>
        ))}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        {services.filter(s => !s.available).map((service) => (
          <p key={service.serviceName}>
            <strong>{service.serviceName}:</strong> {service.reason}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ServiceAvailabilityChecker;
