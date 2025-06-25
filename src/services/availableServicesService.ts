
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/types/analysis';

// Use consistent types with the database
type ServiceType = 'rooftop' | 'parking' | 'garden' | 'storage' | 'bandwidth' | 'rental';
type SelectionType = 'selected' | 'interested' | 'maybe_later';

export interface AvailableService {
  id: string;
  analysis_id: string;
  service_type: ServiceType;
  service_name: string;
  monthly_revenue_low: number;
  monthly_revenue_high: number;
  setup_cost: number;
  roi_months?: number;
  requirements: Record<string, any>;
  provider_info: Record<string, any>;
  is_available: boolean;
  priority_score: number;
  created_at: string;
}

export interface UserServiceSelection {
  id: string;
  user_id: string;
  journey_id?: string;
  available_service_id: string;
  selected_at: string;
  selection_type: SelectionType;
  notes?: string;
  priority: number;
  created_at: string;
}

export const createAvailableServices = async (
  analysisId: string,
  analysisResults: AnalysisResults
): Promise<AvailableService[]> => {
  const services: Omit<AvailableService, 'id' | 'created_at'>[] = [];

  // Create rooftop/solar service if available
  if (analysisResults.rooftop && analysisResults.rooftop.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'rooftop' as ServiceType,
      service_name: 'Solar Panel Installation',
      monthly_revenue_low: analysisResults.rooftop.revenue * 0.8,
      monthly_revenue_high: analysisResults.rooftop.revenue * 1.2,
      setup_cost: analysisResults.rooftop.providers?.[0]?.setupCost || 15000,
      roi_months: Math.ceil((analysisResults.rooftop.providers?.[0]?.setupCost || 15000) / analysisResults.rooftop.revenue) || 36,
      requirements: {
        roof_area: analysisResults.rooftop.area,
        sun_exposure: 'Good' // Default value since sunExposure doesn't exist
      },
      provider_info: analysisResults.rooftop.providers?.[0] || {},
      is_available: true,
      priority_score: 10
    });
  }

  // Create parking service if available
  if (analysisResults.parking && analysisResults.parking.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'parking' as ServiceType,
      service_name: 'Parking Space Rental',
      monthly_revenue_low: analysisResults.parking.revenue * 0.7,
      monthly_revenue_high: analysisResults.parking.revenue * 1.3,
      setup_cost: 50,
      roi_months: 1,
      requirements: {
        spaces: analysisResults.parking.spaces,
        access: 'Street accessible'
      },
      provider_info: analysisResults.parking.providers?.[0] || {},
      is_available: true,
      priority_score: 8
    });
  }

  // Create garden service if available
  if (analysisResults.garden && analysisResults.garden.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'garden' as ServiceType,
      service_name: 'Garden Space Sharing',
      monthly_revenue_low: analysisResults.garden.revenue * 0.6,
      monthly_revenue_high: analysisResults.garden.revenue * 1.4,
      setup_cost: 200,
      roi_months: 2,
      requirements: {
        area: analysisResults.garden.area,
        soil_quality: 'Good' // Default value since soilQuality doesn't exist
      },
      provider_info: analysisResults.garden.providers?.[0] || {},
      is_available: analysisResults.garden.opportunity !== 'Low',
      priority_score: 6
    });
  }

  // Create bandwidth service if available
  if (analysisResults.bandwidth && analysisResults.bandwidth.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'bandwidth' as ServiceType,
      service_name: 'Internet Bandwidth Sharing',
      monthly_revenue_low: analysisResults.bandwidth.revenue * 0.8,
      monthly_revenue_high: analysisResults.bandwidth.revenue * 1.2,
      setup_cost: 0,
      roi_months: 0,
      requirements: {
        available_bandwidth: analysisResults.bandwidth.available,
        connection_type: 'High-speed internet required'
      },
      provider_info: analysisResults.bandwidth.providers?.[0] || {},
      is_available: true,
      priority_score: 9
    });
  }

  // Create storage service if available
  if (analysisResults.storage && analysisResults.storage.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'storage' as ServiceType,
      service_name: 'Storage Space Rental',
      monthly_revenue_low: analysisResults.storage.revenue * 0.7,
      monthly_revenue_high: analysisResults.storage.revenue * 1.3,
      setup_cost: 100,
      roi_months: 1,
      requirements: {
        space: analysisResults.storage.volume, // Use volume instead of space
        access: 'Secure access required'
      },
      provider_info: analysisResults.storage.providers?.[0] || {},
      is_available: true,
      priority_score: 7
    });
  }

  // Insert services into database
  try {
    const { data, error } = await supabase
      .from('available_services')
      .insert(services)
      .select();

    if (error) {
      console.error('❌ Failed to create available services:', error);
      throw error;
    }

    console.log('✅ Created available services:', data?.length);
    return data as AvailableService[] || [];
  } catch (error) {
    console.error('❌ Error creating available services:', error);
    throw error;
  }
};

export const getUserServiceSelections = async (userId: string): Promise<UserServiceSelection[]> => {
  try {
    const { data, error } = await supabase
      .from('user_service_selections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch user service selections:', error);
      throw error;
    }

    return data as UserServiceSelection[] || [];
  } catch (error) {
    console.error('❌ Error fetching user service selections:', error);
    throw error;
  }
};

export const selectService = async (
  userId: string,
  availableServiceId: string,
  selectionType: SelectionType = 'selected',
  journeyId?: string
): Promise<UserServiceSelection> => {
  try {
    const { data, error } = await supabase
      .from('user_service_selections')
      .insert({
        user_id: userId,
        available_service_id: availableServiceId,
        selection_type: selectionType,
        journey_id: journeyId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to select service:', error);
      throw error;
    }

    console.log('✅ Service selected:', data);
    return data as UserServiceSelection;
  } catch (error) {
    console.error('❌ Error selecting service:', error);
    throw error;
  }
};
