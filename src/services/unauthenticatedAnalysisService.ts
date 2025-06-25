import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { supabase } from '@/integrations/supabase/client';
import { saveAddress } from './userAddressService';
import { savePropertyAnalysis } from './userAnalysisService';

export interface UnauthenticatedAnalysis {
  id: string;
  address: string;
  coordinates?: google.maps.LatLngLiteral;
  analysisResults: AnalysisResults;
  timestamp: number;
  formattedAddress?: string;
}

const STORAGE_KEY = 'tiptop_unauthenticated_analysis';
const MAX_STORAGE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const saveUnauthenticatedAnalysis = (
  address: string,
  analysisResults: AnalysisResults,
  coordinates?: google.maps.LatLngLiteral,
  formattedAddress?: string
): void => {
  try {
    console.log('💾 [UNAUTHENTICATED] Saving analysis to localStorage:', {
      address,
      formattedAddress,
      coordinates,
      analysisResults: {
        propertyType: analysisResults.propertyType,
        topOpportunities: analysisResults.topOpportunities?.length || 0,
        totalRevenue: analysisResults.topOpportunities?.reduce((sum, opp) => sum + (opp.monthlyRevenue || 0), 0) || 0
      }
    });

    const analysis: UnauthenticatedAnalysis = {
      id: crypto.randomUUID(),
      address,
      coordinates,
      analysisResults,
      timestamp: Date.now(),
      formattedAddress
    };

    // Clean up old analyses first
    cleanupOldAnalyses();

    // Get existing analyses
    const existing = getUnauthenticatedAnalyses();
    
    // Add new analysis (keep only the most recent 3 to avoid localStorage limits)
    const updated = [analysis, ...existing].slice(0, 3);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ [UNAUTHENTICATED] Successfully saved analysis to localStorage:', {
      analysisId: analysis.id,
      totalStored: updated.length,
      storageKey: STORAGE_KEY
    });
    
  } catch (error) {
    console.error('❌ [UNAUTHENTICATED] Failed to save analysis:', error);
    // If localStorage is full, try to clear old data and retry
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        clearUnauthenticatedAnalyses();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([{
          id: crypto.randomUUID(),
          address,
          coordinates,
          analysisResults,
          timestamp: Date.now(),
          formattedAddress
        }]));
        console.log('📱 [UNAUTHENTICATED] Saved analysis after clearing localStorage');
      } catch (retryError) {
        console.error('❌ [UNAUTHENTICATED] Failed to save even after clearing localStorage:', retryError);
      }
    }
  }
};

export const getUnauthenticatedAnalyses = (): UnauthenticatedAnalysis[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('📱 [UNAUTHENTICATED] No analyses found in localStorage');
      return [];
    }
    
    const analyses: UnauthenticatedAnalysis[] = JSON.parse(stored);
    console.log('📱 [UNAUTHENTICATED] Found analyses in localStorage:', {
      count: analyses.length,
      storageKey: STORAGE_KEY,
      analyses: analyses.map(a => ({
        id: a.id,
        address: a.address,
        timestamp: new Date(a.timestamp).toISOString(),
        hasAnalysisResults: !!a.analysisResults,
        opportunitiesCount: a.analysisResults?.topOpportunities?.length || 0
      }))
    });
    
    // Filter out expired analyses
    const now = Date.now();
    const valid = analyses.filter(analysis => 
      (now - analysis.timestamp) < MAX_STORAGE_AGE
    );
    
    // Update storage if we filtered anything out
    if (valid.length !== analyses.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      console.log('🧹 [UNAUTHENTICATED] Cleaned up expired analyses:', {
        original: analyses.length,
        remaining: valid.length
      });
    }
    
    return valid;
  } catch (error) {
    console.error('❌ [UNAUTHENTICATED] Failed to get analyses:', error);
    return [];
  }
};

export const recoverAnalysesToDatabase = async (userId: string): Promise<{
  recovered: number;
  failed: number;
  errors: string[];
}> => {
  console.log('🔄 [RECOVERY] Starting analysis recovery process for user:', userId);
  
  const analyses = getUnauthenticatedAnalyses();
  console.log(`🔍 [RECOVERY] Found ${analyses.length} analyses to recover`);
  
  if (analyses.length === 0) {
    console.log('ℹ️ [RECOVERY] No analyses to recover');
    return { recovered: 0, failed: 0, errors: [] };
  }
  
  let recovered = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const [index, analysis] of analyses.entries()) {
    console.log(`💾 [RECOVERY] Processing analysis ${index + 1}/${analyses.length}:`, {
      analysisId: analysis.id,
      address: analysis.address,
      hasCoordinates: !!analysis.coordinates,
      hasAnalysisResults: !!analysis.analysisResults,
      opportunitiesCount: analysis.analysisResults?.topOpportunities?.length || 0,
      totalRevenue: analysis.analysisResults?.topOpportunities?.reduce((sum, opp) => sum + (opp.monthlyRevenue || 0), 0) || 0
    });
    
    try {
      // Validate analysis data
      if (!analysis.analysisResults) {
        throw new Error('Missing analysis results');
      }
      
      if (!analysis.address) {
        throw new Error('Missing address');
      }
      
      // Validate analysis results structure
      if (!analysis.analysisResults.topOpportunities || !Array.isArray(analysis.analysisResults.topOpportunities)) {
        console.warn('⚠️ [RECOVERY] Invalid topOpportunities structure, fixing...');
        analysis.analysisResults.topOpportunities = [];
      }
      
      // Save address first
      console.log('📍 [RECOVERY] Saving address to database...');
      const addressId = await saveAddress(
        userId,
        analysis.address,
        analysis.coordinates,
        analysis.formattedAddress || analysis.address,
        recovered === 0 // Set first recovered address as primary
      );
      
      if (!addressId) {
        throw new Error('Failed to save address - no addressId returned');
      }
      
      console.log(`✅ [RECOVERY] Address saved successfully with ID: ${addressId}`);
      
      // Save analysis results
      console.log('📊 [RECOVERY] Saving analysis results to database...');
      const analysisId = await savePropertyAnalysis(
        userId,
        addressId,
        analysis.analysisResults,
        analysis.coordinates
      );
      
      if (!analysisId) {
        throw new Error('Failed to save analysis - no analysisId returned');
      }
      
      console.log(`✅ [RECOVERY] Analysis saved successfully with ID: ${analysisId}`);
      recovered++;
      
    } catch (error) {
      console.error(`❌ [RECOVERY] Failed to recover analysis ${analysis.id}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        analysisId: analysis.id,
        address: analysis.address,
        userId
      });
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to recover analysis for ${analysis.address}: ${errorMessage}`);
    }
  }
  
  console.log(`📊 [RECOVERY] Recovery summary:`, {
    totalAnalyses: analyses.length,
    recovered,
    failed,
    errors: errors.length,
    userId
  });
  
  // Clear localStorage after successful recovery (even if some failed)
  if (recovered > 0) {
    console.log('🧹 [RECOVERY] Clearing localStorage after successful recovery');
    clearUnauthenticatedAnalyses();
    console.log(`✅ [RECOVERY] Recovery complete: ${recovered} recovered, ${failed} failed`);
  } else {
    console.log(`❌ [RECOVERY] No analyses recovered: 0 recovered, ${failed} failed`);
  }
  
  return { recovered, failed, errors };
};

export const clearUnauthenticatedAnalyses = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 [UNAUTHENTICATED] Cleared analyses from localStorage');
  } catch (error) {
    console.error('❌ [UNAUTHENTICATED] Failed to clear analyses:', error);
  }
};

const cleanupOldAnalyses = (): void => {
  try {
    const analyses = getUnauthenticatedAnalyses();
    const now = Date.now();
    const valid = analyses.filter(analysis => 
      (now - analysis.timestamp) < MAX_STORAGE_AGE
    );
    
    if (valid.length !== analyses.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      console.log(`🧹 [UNAUTHENTICATED] Cleaned up ${analyses.length - valid.length} old analyses`);
    }
  } catch (error) {
    console.error('❌ [UNAUTHENTICATED] Failed to cleanup old analyses:', error);
  }
};

export const hasUnauthenticatedAnalyses = (): boolean => {
  const count = getUnauthenticatedAnalyses().length;
  console.log(`🔍 [UNAUTHENTICATED] Checking for analyses: ${count} found`);
  return count > 0;
};
