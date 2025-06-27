
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

// Generate a unique session ID for tracking
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID from localStorage
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('tiptop_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('tiptop_session_id', sessionId);
  }
  return sessionId;
};

// Initialize journey tracking when user enters the site
export const initializeJourney = async (referrer?: string, landingPage?: string) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'site_entry',
      p_data: {
        referrer: referrer || document.referrer,
        landing_page: landingPage || window.location.href,
        user_agent: navigator.userAgent
      }
    });

    if (error) {
      console.error('❌ Error initializing journey:', error);
      return null;
    }

    console.log('✅ Journey initialized for session:', sessionId);
    return data;
  } catch (error) {
    console.error('❌ Error in initializeJourney:', error);
    return null;
  }
};

// Track when user enters an address
export const trackAddressEntered = async (address: string, coordinates?: any) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'address_entered',
      p_data: {
        property_address: address,
        property_coordinates: coordinates
      }
    });

    if (error) {
      console.error('❌ Error tracking address entered:', error);
      return null;
    }

    console.log('✅ Address entered tracked:', address);
    return data;
  } catch (error) {
    console.error('❌ Error in trackAddressEntered:', error);
    return null;
  }
};

// Enhanced analysis tracking with better user linking
export const trackAnalysisCompleted = async (
  address: string,
  analysisResults: AnalysisResults,
  coordinates?: any
) => {
  const sessionId = getSessionId();
  
  console.log('📊 Tracking analysis completion for:', address);
  console.log('📈 Analysis results:', analysisResults);
  
  // Calculate totals from analysis results
  let totalMonthlyRevenue = 0;
  let totalOpportunities = 0;

  // Extract address from analysis results
  const propertyAddress = (analysisResults as any).propertyAddress || 
                         (analysisResults as any).address || 
                         address;

  // Check if we have topOpportunities and calculate from there
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

  console.log('💰 Calculated totals:', { totalMonthlyRevenue, totalOpportunities });
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'analysis_completed',
      p_data: {
        property_address: propertyAddress,
        property_coordinates: coordinates,
        analysis_results: analysisResults as any,
        total_monthly_revenue: totalMonthlyRevenue,
        total_opportunities: totalOpportunities
      }
    });

    if (error) {
      console.error('❌ Error tracking analysis completed:', error);
      return null;
    }

    console.log('✅ Analysis completion tracked for:', propertyAddress);
    console.log('💰 Revenue tracked:', totalMonthlyRevenue);
    console.log('🎯 Opportunities tracked:', totalOpportunities);
    return data;
  } catch (error) {
    console.error('❌ Error in trackAnalysisCompleted:', error);
    return null;
  }
};

// Track when user views services
export const trackServicesViewed = async (viewedServices: string[]) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'services_viewed',
      p_data: {
        interested_services: viewedServices
      }
    });

    if (error) {
      console.error('❌ Error tracking services viewed:', error);
      return null;
    }

    console.log('✅ Services viewed tracked:', viewedServices);
    return data;
  } catch (error) {
    console.error('❌ Error in trackServicesViewed:', error);
    return null;
  }
};

// Track when user selects an option (manual/concierge)
export const trackOptionSelected = async (selectedOption: 'manual' | 'concierge') => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'options_selected',
      p_data: {
        selected_option: selectedOption
      }
    });

    if (error) {
      console.error('❌ Error tracking option selected:', error);
      return null;
    }

    console.log('✅ Option selection tracked:', selectedOption);
    return data;
  } catch (error) {
    console.error('❌ Error in trackOptionSelected:', error);
    return null;
  }
};

// Enhanced auth completion tracking with better session linking
export const trackAuthCompleted = async (userId: string) => {
  const sessionId = getSessionId();
  
  try {
    // First, link the journey to the authenticated user
    const { error: linkError } = await supabase.rpc('link_journey_to_user', {
      p_session_id: sessionId,
      p_user_id: userId
    });

    if (linkError) {
      console.error('❌ Error linking journey to user:', linkError);
    } else {
      console.log('✅ Journey linked to authenticated user:', userId);
    }

    // Also try to find and link any unlinked journey data for this user
    // This helps recover data from sessions before authentication
    const { error: recoveryError } = await supabase
      .from('user_journey_complete')
      .update({ user_id: userId })
      .is('user_id', null)
      .neq('property_address', '')
      .neq('analysis_results', null);

    if (recoveryError) {
      console.warn('⚠️ Could not recover unlinked journey data:', recoveryError);
    } else {
      console.log('🔄 Attempted to recover unlinked journey data');
    }

    return sessionId;
  } catch (error) {
    console.error('❌ Error in trackAuthCompleted:', error);
    return null;
  }
};

// Track when user accesses dashboard  
export const trackDashboardAccessed = async () => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'dashboard_accessed',
      p_data: {}
    });

    if (error) {
      console.error('❌ Error tracking dashboard accessed:', error);
      return null;
    }

    console.log('✅ Dashboard access tracked');
    return data;
  } catch (error) {
    console.error('❌ Error in trackDashboardAccessed:', error);
    return null;
  }
};

// Enhanced dashboard data retrieval with fallback logic
export const getUserDashboardData = async (userId: string) => {
  try {
    console.log('📊 Fetching dashboard data for user:', userId);
    
    // First try the RPC function
    const { data, error } = await supabase.rpc('get_user_dashboard_data', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error getting dashboard data via RPC:', error);
    }

    let result = data?.[0] || null;
    
    // If RPC didn't return data, try direct query as fallback
    if (!result) {
      console.log('🔄 Trying direct query as fallback...');
      
      const { data: directData, error: directError } = await supabase
        .from('user_journey_complete')
        .select('*')
        .eq('user_id', userId)
        .not('property_address', 'is', null)
        .not('property_address', 'eq', '')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (directError) {
        console.error('❌ Error with direct query:', directError);
      } else if (directData && directData.length > 0) {
        const journey = directData[0];
        result = {
          journey_id: journey.id,
          property_address: journey.property_address,
          analysis_results: journey.analysis_results,
          total_monthly_revenue: journey.total_monthly_revenue,
          total_opportunities: journey.total_opportunities,
          selected_services: journey.selected_services,
          selected_option: journey.selected_option,
          journey_progress: {
            steps_completed: [],
            current_step: journey.current_step,
            journey_start: journey.journey_start_at,
            last_activity: journey.updated_at
          }
        };
        console.log('✅ Found data via direct query:', result);
      }
    }

    console.log('📊 Raw dashboard data from DB:', result);
    
    if (result) {
      console.log('✅ Dashboard data retrieved successfully');
      console.log('🏠 Property address:', result.property_address);
      console.log('💰 Monthly revenue:', result.total_monthly_revenue);
      console.log('🎯 Total opportunities:', result.total_opportunities);
    } else {
      console.log('❌ No dashboard data found for user');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in getUserDashboardData:', error);
    return null;
  }
};

// Clear session data (for testing or logout)
export const clearSession = () => {
  localStorage.removeItem('tiptop_session_id');
  console.log('✅ Session cleared');
};
