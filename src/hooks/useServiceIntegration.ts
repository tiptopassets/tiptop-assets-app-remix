
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ServiceIntegrationData {
  serviceName: string;
  propertyAddress: string;
  assetType: string;
  revenue: number;
  setupCost: number;
  userEmail?: string;
  userPhone?: string;
}

export const useServiceIntegration = () => {
  const [isIntegrating, setIsIntegrating] = useState(false);
  const { user } = useAuth();

  const integrateWithServices = async (integrationData: ServiceIntegrationData[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to integrate with services",
        variant: "destructive"
      });
      return false;
    }

    setIsIntegrating(true);
    
    try {
      // Save service integrations to database
      const integrations = integrationData.map(data => ({
        user_id: user.id,
        service_name: data.serviceName,
        property_address: data.propertyAddress,
        asset_type: data.assetType,
        expected_monthly_revenue: data.revenue,
        setup_cost: data.setupCost,
        integration_status: 'pending',
        created_at: new Date().toISOString()
      }));

      const { error: dbError } = await supabase
        .from('service_integrations')
        .insert(integrations);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Call edge function for each service integration
      for (const data of integrationData) {
        try {
          const { error: apiError } = await supabase.functions.invoke('integrate-service', {
            body: {
              serviceName: data.serviceName,
              userEmail: user.email,
              propertyAddress: data.propertyAddress,
              assetType: data.assetType,
              revenue: data.revenue,
              setupCost: data.setupCost,
              userId: user.id
            }
          });

          if (apiError) {
            console.error(`Error integrating with ${data.serviceName}:`, apiError);
            // Continue with other integrations even if one fails
          }
        } catch (serviceError) {
          console.error(`Service integration error for ${data.serviceName}:`, serviceError);
          // Continue with other integrations
        }
      }

      toast({
        title: "Services Integration Started",
        description: `Successfully initiated integration with ${integrationData.length} services. Check your dashboard for updates.`,
      });

      return true;
    } catch (error) {
      console.error('Service integration error:', error);
      toast({
        title: "Integration Failed",
        description: error instanceof Error ? error.message : "Failed to integrate with services",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsIntegrating(false);
    }
  };

  return {
    integrateWithServices,
    isIntegrating
  };
};
