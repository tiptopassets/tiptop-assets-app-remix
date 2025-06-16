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
    console.log('📱 Saved unauthenticated analysis to localStorage:', analysis.id);
    
  } catch (error) {
    console.error('❌ Failed to save unauthenticated analysis:', error);
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
        console.log('📱 Saved analysis after clearing localStorage');
      } catch (retryError) {
        console.error('❌ Failed to save even after clearing localStorage:', retryError);
      }
    }
  }
};

export const getUnauthenticatedAnalyses = (): UnauthenticatedAnalysis[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const analyses: UnauthenticatedAnalysis[] = JSON.parse(stored);
    
    // Filter out expired analyses
    const now = Date.now();
    const valid = analyses.filter(analysis => 
      (now - analysis.timestamp) < MAX_STORAGE_AGE
    );
    
    // Update storage if we filtered anything out
    if (valid.length !== analyses.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    
    return valid;
  } catch (error) {
    console.error('❌ Failed to get unauthenticated analyses:', error);
    return [];
  }
};

export const clearUnauthenticatedAnalyses = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 Cleared unauthenticated analyses from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear unauthenticated analyses:', error);
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
      console.log(`🧹 Cleaned up ${analyses.length - valid.length} old analyses`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup old analyses:', error);
  }
};

export const recoverAnalysesToDatabase = async (userId: string): Promise<{
  recovered: number;
  failed: number;
  errors: string[];
}> => {
  const analyses = getUnauthenticatedAnalyses();
  console.log(`🔄 Starting recovery of ${analyses.length} analyses for user:`, userId);
  
  if (analyses.length === 0) {
    return { recovered: 0, failed: 0, errors: [] };
  }
  
  let recovered = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const analysis of analyses) {
    try {
      console.log(`💾 Recovering analysis: ${analysis.id} for address: ${analysis.address}`);
      
      // Save address first
      const addressId = await saveAddress(
        userId,
        analysis.address,
        analysis.coordinates,
        analysis.formattedAddress || analysis.address,
        recovered === 0 // Set first recovered address as primary
      );
      
      if (!addressId) {
        throw new Error('Failed to save address');
      }
      
      console.log(`✅ Address saved with ID: ${addressId}`);
      
      // Save analysis results
      const analysisId = await savePropertyAnalysis(
        userId,
        addressId,
        analysis.analysisResults,
        analysis.coordinates
      );
      
      if (!analysisId) {
        throw new Error('Failed to save analysis');
      }
      
      console.log(`✅ Analysis saved with ID: ${analysisId}`);
      recovered++;
      
    } catch (error) {
      console.error(`❌ Failed to recover analysis ${analysis.id}:`, error);
      failed++;
      errors.push(`Failed to recover analysis for ${analysis.address}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Clear localStorage after successful recovery
  if (recovered > 0) {
    clearUnauthenticatedAnalyses();
    console.log(`✅ Recovery complete: ${recovered} recovered, ${failed} failed`);
  }
  
  return { recovered, failed, errors };
};

export const hasUnauthenticatedAnalyses = (): boolean => {
  return getUnauthenticatedAnalyses().length > 0;
};
