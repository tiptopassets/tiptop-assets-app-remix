
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ServiceIntegration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'pending' | 'inactive';
  monthly_revenue_low: number;
  monthly_revenue_high: number;
  integration_url: string | null;
  partner_name: string;
  created_at: string;
};

export const useServiceIntegrations = () => {
  const [integrations, setIntegrations] = useState<ServiceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Sample data - In a real implementation, this would come from the database
  const mockIntegrations: ServiceIntegration[] = [
    {
      id: '1',
      name: 'Airbnb',
      description: 'List spare rooms or ADUs for short-term rental',
      icon: 'home',
      status: 'active',
      monthly_revenue_low: 500,
      monthly_revenue_high: 1500,
      integration_url: 'https://airbnb.com/host',
      partner_name: 'Airbnb Inc.',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'SpotHero',
      description: 'Rent out parking spaces on your property',
      icon: 'parking',
      status: 'pending',
      monthly_revenue_low: 150,
      monthly_revenue_high: 400,
      integration_url: 'https://spothero.com/partners',
      partner_name: 'SpotHero Inc.',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Solar Referrals',
      description: 'Earn commissions by referring homeowners for solar installations',
      icon: 'sun',
      status: 'active',
      monthly_revenue_low: 300,
      monthly_revenue_high: 800,
      integration_url: null,
      partner_name: 'SolarCity',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'EV Charging',
      description: 'Install EV chargers and earn from charging sessions',
      icon: 'battery-charging',
      status: 'inactive',
      monthly_revenue_low: 200,
      monthly_revenue_high: 600,
      integration_url: 'https://chargepoint.com',
      partner_name: 'ChargePoint',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('service_integrations')
        //   .select('*');
        
        // if (error) throw error;
        // setIntegrations(data);
        
        // Using mock data for now
        setIntegrations(mockIntegrations);
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  const addIntegration = async (integration: Omit<ServiceIntegration, 'id' | 'created_at'>) => {
    try {
      // In a real implementation:
      // const { data, error } = await supabase
      //   .from('service_integrations')
      //   .insert({
      //     ...integration,
      //   })
      //   .single();
      
      // if (error) throw error;
      
      // Mock implementation
      const newIntegration: ServiceIntegration = {
        ...integration,
        id: `${integrations.length + 1}`,
        created_at: new Date().toISOString()
      };
      
      setIntegrations([...integrations, newIntegration]);
      return { success: true, data: newIntegration };
    } catch (err) {
      console.error('Error adding integration:', err);
      return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  const updateIntegrationStatus = async (id: string, status: 'active' | 'pending' | 'inactive') => {
    try {
      // In a real implementation:
      // const { error } = await supabase
      //   .from('service_integrations')
      //   .update({ status })
      //   .eq('id', id);
      
      // if (error) throw error;
      
      // Mock implementation
      setIntegrations(integrations.map(integration => 
        integration.id === id ? { ...integration, status } : integration
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating integration status:', err);
      return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  return {
    integrations,
    loading,
    error,
    addIntegration,
    updateIntegrationStatus
  };
};
