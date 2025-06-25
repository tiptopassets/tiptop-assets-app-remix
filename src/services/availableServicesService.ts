
import { supabase } from '@/integrations/supabase/client';
import { AvailableService, UserServiceSelection } from '@/types/journey';
import { AnalysisResults } from '@/types/analysis';

export const createAvailableServices = async (
  analysisId: string,
  analysisResults: AnalysisResults
): Promise<AvailableService[]> => {
  const services: Omit<AvailableService, 'id' | 'created_at'>[] = [];

  // Create rooftop/solar service if available
  if (analysisResults.rooftop && analysisResults.rooftop.revenue > 0) {
    services.push({
      analysis_id: analysisId,
      service_type: 'rooftop',
      service_name: 'Solar Panel Installation',
      monthly_revenue_low: analysisResults.rooftop.revenue * 0.8,
      monthly_revenue_high: analysisResults.rooftop.revenue * 1.2,
      setup_cost: analysisResults.rooftop.providers?.[0]?.setupCost || 15000,
      roi_months: Math.ceil((analysisResults.rooftop.providers?.[0]?.setupCost || 15000) / analysisResults.rooftop.revenue) || 36,
      requirements: {
        roof_area: analysisResults.rooftop.area,
        sun_exposure: analysisResults.rooftop.sunExposure || 'Good'
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
      service_type: 'parking',
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
      service_type: 'garden',
      service_name: 'Garden Space Sharing',
      monthly_revenue_low: analysisResults.garden.revenue * 0.6,
      monthly_revenue_high: analysisResults.garden.revenue * 1.4,
      setup_cost: 200,
      roi_months: 2,
      requirements: {
        area: analysisResults.garden.area,
        soil_quality: analysisResults.garden.soilQuality || 'Good'
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
      service_type: 'bandwidth',
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
      service_type: 'storage',
      service_name: 'Storage Space Rental',
      monthly_revenue_low: analysisResults.storage.revenue * 0.7,
      monthly_revenue_high: analysisResults.storage.revenue * 1.3,
      setup_cost: 100,
      roi_months: 1,
      requirements: {
        space: analysisResults.storage.space,
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
    return data || [];
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

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching user service selections:', error);
    throw error;
  }
};

export const selectService = async (
  userId: string,
  availableServiceId: string,
  selectionType: 'selected' | 'interested' | 'maybe_later' = 'selected',
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
    return data;
  } catch (error) {
    console.error('❌ Error selecting service:', error);
    throw error;
  }
};
