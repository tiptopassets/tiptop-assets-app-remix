import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

export interface PropertyAnalysisRecord {
  id: string;
  user_id: string;
  address_id: string | null;
  analysis_results: any; // Use any to match Supabase Json type
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type?: string | null;
  satellite_image_url?: string | null;
  coordinates?: any;
  created_at: string | null;
  updated_at: string | null;
  analysis_version?: string | null;
  using_real_solar_data?: boolean | null;
  user_addresses?: {
    address: string;
    formatted_address: string;
    coordinates: any;
  } | null;
}

// Save a new property analysis
export const savePropertyAnalysis = async (
  userId: string,
  addressId: string,
  analysisResults: AnalysisResults,
  coordinates?: any,
  satelliteImageUrl?: string
): Promise<string | null> => {
  try {
    console.log('💾 Saving property analysis for user:', userId);
    
    // Calculate totals from analysis results
    let totalMonthlyRevenue = 0;
    let totalOpportunities = 0;

    if (analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
      totalMonthlyRevenue = analysisResults.topOpportunities.reduce(
        (sum, opp) => sum + (opp.monthlyRevenue || 0), 0
      );
      totalOpportunities = analysisResults.topOpportunities.length;
    } else {
      // Fallback: calculate from individual asset types
      const assetRevenues = [
        analysisResults.rooftop?.revenue || 0,
        analysisResults.parking?.revenue || 0,
        analysisResults.garden?.revenue || 0,
        analysisResults.pool?.revenue || 0,
        analysisResults.storage?.revenue || 0,
        analysisResults.bandwidth?.revenue || 0,
        (analysisResults as any).internet?.monthlyRevenue || 0
      ];
      
      totalMonthlyRevenue = assetRevenues.reduce((sum, revenue) => sum + revenue, 0);
      totalOpportunities = assetRevenues.filter(revenue => revenue > 0).length;
    }

    // Use the totalMonthlyRevenue from analysisResults if available
    if ((analysisResults as any).totalMonthlyRevenue && (analysisResults as any).totalMonthlyRevenue > totalMonthlyRevenue) {
      totalMonthlyRevenue = (analysisResults as any).totalMonthlyRevenue;
    }

    const insertData = {
      user_id: userId,
      address_id: addressId,
      analysis_results: analysisResults as any,
      total_monthly_revenue: totalMonthlyRevenue,
      total_opportunities: totalOpportunities,
      coordinates: coordinates,
      satellite_image_url: satelliteImageUrl,
      property_type: (analysisResults as any).propertyType || 'residential'
    };

    console.log('📊 Inserting analysis data:', insertData);

    const { data, error } = await supabase
      .from('user_property_analyses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving property analysis:', error);
      throw error;
    }

    console.log('✅ Property analysis saved with ID:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error in savePropertyAnalysis:', err);
    throw err;
  }
};

// Get or create an address record for the user
export const getOrCreateUserAddress = async (
  userId: string,
  address: string,
  coordinates?: any
): Promise<string | null> => {
  try {
    console.log('🏠 Getting/creating address for user:', userId, address);

    // First, try to find existing address
    const { data: existingAddress, error: searchError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .or(`address.eq.${address},formatted_address.eq.${address}`)
      .limit(1)
      .maybeSingle();

    if (searchError) {
      console.error('❌ Error searching for existing address:', searchError);
    }

    if (existingAddress) {
      console.log('✅ Found existing address:', existingAddress.id);
      return existingAddress.id;
    }

    // Create new address
    const { data: newAddress, error: insertError } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address: address,
        formatted_address: address,
        coordinates: coordinates,
        is_primary: false
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Error creating new address:', insertError);
      throw insertError;
    }

    console.log('✅ Created new address:', newAddress.id);
    return newAddress.id;
  } catch (err) {
    console.error('❌ Error in getOrCreateUserAddress:', err);
    throw err;
  }
};

// Enhanced function to save complete analysis with proper linking
export const saveCompleteAnalysis = async (
  userId: string,
  address: string,
  analysisResults: AnalysisResults,
  coordinates?: any,
  satelliteImageUrl?: string
): Promise<string | null> => {
  try {
    console.log('🚀 Starting complete analysis save process');
    
    // Step 1: Get or create address
    const addressId = await getOrCreateUserAddress(userId, address, coordinates);
    if (!addressId) {
      throw new Error('Failed to create or retrieve address');
    }

    // Step 2: Save the analysis
    const analysisId = await savePropertyAnalysis(
      userId,
      addressId,
      analysisResults,
      coordinates,
      satelliteImageUrl
    );

    if (!analysisId) {
      throw new Error('Failed to save property analysis');
    }

    console.log('✅ Complete analysis saved with ID:', analysisId);
    return analysisId;
  } catch (err) {
    console.error('❌ Error in saveCompleteAnalysis:', err);
    throw err;
  }
};

// Retrieve a property analysis by ID
export const getPropertyAnalysis = async (analysisId: string): Promise<PropertyAnalysisRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('user_property_analyses')
      .select(`
        *,
        user_addresses (
          address,
          formatted_address,
          coordinates
        )
      `)
      .eq('id', analysisId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching property analysis:', error);
      return null;
    }

    if (!data) return null;

    // Handle potential query error in user_addresses join
    const transformedData: PropertyAnalysisRecord = {
      ...data,
      user_addresses: (data.user_addresses && typeof data.user_addresses === 'object' && !('error' in (data.user_addresses as any))) 
        ? data.user_addresses as any 
        : null
    };

    return transformedData;
  } catch (err) {
    console.error('❌ Error in getPropertyAnalysis:', err);
    return null;
  }
};

// Get all analyses for a user
export const getUserAnalyses = async (userId: string): Promise<PropertyAnalysisRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('user_property_analyses')
      .select(`
        *,
        user_addresses (
          address,
          formatted_address,
          coordinates
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user analyses:', error);
      return [];
    }

    if (!data) return [];

    // Transform data to handle potential query errors in user_addresses join
    const transformedData: PropertyAnalysisRecord[] = data.map(item => ({
      ...item,
      user_addresses: (item.user_addresses && typeof item.user_addresses === 'object' && !('error' in (item.user_addresses as any))) 
        ? item.user_addresses as any 
        : null
    }));

    return transformedData;
  } catch (err) {
    console.error('❌ Error in getUserAnalyses:', err);
    return [];
  }
};