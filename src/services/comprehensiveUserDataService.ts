import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/types/analysis';

// Types for comprehensive user data
export interface PropertyImageData {
  type: 'satellite' | 'street_view' | 'aerial' | 'user_uploaded';
  url?: string;
  base64?: string;
  metadata?: any;
}

export interface SupplierConnection {
  supplierName: string;
  assetType: string;
  connectionStatus: 'interested' | 'contacted' | 'connected' | 'active';
  estimatedRevenue: number;
  setupCost: number;
  supplierData: any;
  referralLink?: string;
  notes?: string;
}

export interface SolarApiData {
  solarPotentialKwh?: number;
  panelCount?: number;
  roofAreaSqft?: number;
  annualSavings?: number;
  setupCost?: number;
  usingRealData: boolean;
  rawApiResponse?: any;
  formattedData?: any;
}

export interface ComprehensiveAnalysisData {
  userId: string;
  addressId: string;
  analysisResults: AnalysisResults;
  coordinates?: any;
  propertyImages?: PropertyImageData[];
  supplierConnections?: SupplierConnection[];
  solarApiData?: SolarApiData;
  earningsBreakdown?: any;
  propertyInsights?: any;
}

// Save comprehensive analysis with all workflow data
export const saveComprehensiveAnalysis = async (data: ComprehensiveAnalysisData): Promise<string | null> => {
  try {
    console.log('💾 [COMPREHENSIVE] Starting comprehensive analysis save:', {
      userId: data.userId,
      addressId: data.addressId,
      hasImages: !!data.propertyImages?.length,
      hasSuppliers: !!data.supplierConnections?.length,
      hasSolarData: !!data.solarApiData
    });

    // Calculate totals
    const totalRevenue = data.analysisResults.topOpportunities?.reduce(
      (sum, opp) => sum + (opp.monthlyRevenue || 0), 0
    ) || 0;

    // Prepare enhanced analysis data for storage
    const enhancedAnalysisData = {
      user_id: data.userId,
      address_id: data.addressId,
      analysis_results: data.analysisResults as any, // Cast to Json type for Supabase
      total_monthly_revenue: totalRevenue,
      total_opportunities: data.analysisResults.topOpportunities?.length || 0,
      property_type: data.analysisResults.propertyType,
      coordinates: data.coordinates,
      
      // Enhanced data fields
      satellite_image_base64: data.propertyImages?.find(img => img.type === 'satellite')?.base64,
      street_view_image_url: data.propertyImages?.find(img => img.type === 'street_view')?.url,
      property_images: data.propertyImages ? { images: data.propertyImages } as any : {} as any,
      supplier_info: data.supplierConnections ? { suppliers: data.supplierConnections } as any : {} as any,
      solar_api_data: (data.solarApiData || {}) as any,
      earnings_breakdown: (data.earningsBreakdown || {}) as any,
      property_insights: (data.propertyInsights || {}) as any,
      using_real_solar_data: data.solarApiData?.usingRealData || false,
      last_solar_update: data.solarApiData ? new Date().toISOString() : null
    };

    // Insert main analysis record
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('user_property_analyses')
      .insert(enhancedAnalysisData)
      .select()
      .single();

    if (analysisError) {
      console.error('❌ [COMPREHENSIVE] Failed to save analysis:', analysisError);
      throw analysisError;
    }

    const analysisId = analysisRecord.id;
    console.log('✅ [COMPREHENSIVE] Saved main analysis:', analysisId);

    // Save property images
    if (data.propertyImages && data.propertyImages.length > 0) {
      const imageRecords = data.propertyImages.map(image => ({
        user_id: data.userId,
        analysis_id: analysisId,
        image_type: image.type,
        image_url: image.url,
        image_base64: image.base64,
        image_metadata: (image.metadata || {}) as any
      }));

      const { error: imageError } = await supabase
        .from('user_property_images')
        .insert(imageRecords);

      if (imageError) {
        console.error('❌ [COMPREHENSIVE] Failed to save images:', imageError);
      } else {
        console.log('✅ [COMPREHENSIVE] Saved property images:', imageRecords.length);
      }
    }

    // Save supplier connections
    if (data.supplierConnections && data.supplierConnections.length > 0) {
      const supplierRecords = data.supplierConnections.map(supplier => ({
        user_id: data.userId,
        analysis_id: analysisId,
        supplier_name: supplier.supplierName,
        asset_type: supplier.assetType,
        connection_status: supplier.connectionStatus,
        estimated_revenue: supplier.estimatedRevenue,
        setup_cost: supplier.setupCost,
        supplier_data: (supplier.supplierData || {}) as any,
        referral_link: supplier.referralLink,
        notes: supplier.notes
      }));

      const { error: supplierError } = await supabase
        .from('user_supplier_connections')
        .insert(supplierRecords);

      if (supplierError) {
        console.error('❌ [COMPREHENSIVE] Failed to save suppliers:', supplierError);
      } else {
        console.log('✅ [COMPREHENSIVE] Saved supplier connections:', supplierRecords.length);
      }
    }

    // Save enhanced solar data
    if (data.solarApiData && data.coordinates) {
      const solarCacheData = {
        property_address: data.analysisResults.propertyType || 'Unknown',
        coordinates: data.coordinates,
        raw_solar_response: data.solarApiData.rawApiResponse || {},
        formatted_solar_data: data.solarApiData.formattedData || {},
        solar_potential_kwh: data.solarApiData.solarPotentialKwh,
        panel_count: data.solarApiData.panelCount,
        roof_area_sqft: data.solarApiData.roofAreaSqft,
        annual_savings: data.solarApiData.annualSavings,
        setup_cost: data.solarApiData.setupCost,
        using_real_data: data.solarApiData.usingRealData
      };

      const { error: solarError } = await supabase
        .from('enhanced_solar_cache')
        .insert(solarCacheData);

      if (solarError) {
        console.error('❌ [COMPREHENSIVE] Failed to save solar data:', solarError);
      } else {
        console.log('✅ [COMPREHENSIVE] Saved enhanced solar data');
      }
    }

    console.log('🎉 [COMPREHENSIVE] Successfully saved all workflow data');
    return analysisId;

  } catch (error) {
    console.error('❌ [COMPREHENSIVE] Critical error saving comprehensive data:', error);
    throw error;
  }
};

// Load comprehensive user data for dashboard
export const loadComprehensiveUserData = async (userId: string) => {
  try {
    console.log('📊 [COMPREHENSIVE] Loading comprehensive data for user:', userId);

    // Get main analysis data
    const { data: analyses, error: analysisError } = await supabase
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

    if (analysisError) {
      console.error('❌ [COMPREHENSIVE] Failed to load analyses:', analysisError);
      throw analysisError;
    }

    if (!analyses || analyses.length === 0) {
      console.log('ℹ️ [COMPREHENSIVE] No analyses found for user');
      return null;
    }

    const latestAnalysis = analyses[0];
    const analysisId = latestAnalysis.id;

    // Load property images
    const { data: images } = await supabase
      .from('user_property_images')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    // Load supplier connections
    const { data: suppliers } = await supabase
      .from('user_supplier_connections')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    // Load enhanced solar data
    const { data: solarData } = await supabase
      .from('enhanced_solar_cache')
      .select('*')
      .eq('property_address', latestAnalysis.user_addresses?.address || '')
      .order('created_at', { ascending: false })
      .limit(1);

    const comprehensiveData = {
      analysis: latestAnalysis,
      images: images || [],
      suppliers: suppliers || [],
      solarData: solarData?.[0] || null,
      address: latestAnalysis.user_addresses
    };

    console.log('✅ [COMPREHENSIVE] Loaded comprehensive data:', {
      analysisId,
      imagesCount: images?.length || 0,
      suppliersCount: suppliers?.length || 0,
      hasSolarData: !!solarData?.[0],
      address: latestAnalysis.user_addresses?.address
    });

    return comprehensiveData;

  } catch (error) {
    console.error('❌ [COMPREHENSIVE] Error loading comprehensive data:', error);
    throw error;
  }
};

// Update supplier connection status
export const updateSupplierConnection = async (
  supplierId: string,
  status: 'interested' | 'contacted' | 'connected' | 'active',
  notes?: string
) => {
  try {
    const { error } = await supabase
      .from('user_supplier_connections')
      .update({ 
        connection_status: status,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', supplierId);

    if (error) throw error;
    
    console.log('✅ [COMPREHENSIVE] Updated supplier connection:', supplierId, status);
    return true;
  } catch (error) {
    console.error('❌ [COMPREHENSIVE] Failed to update supplier:', error);
    throw error;
  }
};

// Add new property image
export const addPropertyImage = async (
  userId: string,
  analysisId: string,
  imageData: PropertyImageData
) => {
  try {
    const { data, error } = await supabase
      .from('user_property_images')
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        image_type: imageData.type,
        image_url: imageData.url,
        image_base64: imageData.base64,
        image_metadata: (imageData.metadata || {}) as any
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ [COMPREHENSIVE] Added property image:', data.id);
    return data;
  } catch (error) {
    console.error('❌ [COMPREHENSIVE] Failed to add image:', error);
    throw error;
  }
};