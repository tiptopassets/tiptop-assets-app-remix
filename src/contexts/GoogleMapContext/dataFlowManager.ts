
// Centralized data flow management for consistent property analysis
import { AnalysisResults, AssetOpportunity } from './types';
import { ensureCoordinates, getValidatedMarketData, CoordinateResult } from './coordinateService';
import { validateRevenue, validateParkingRevenue } from '@/utils/revenueValidator';
import { getMarketData } from '@/utils/marketDataService';

export interface AnalysisContext {
  address: string;
  coordinates?: google.maps.LatLngLiteral | null;
  propertyType?: string;
  useRealData?: boolean;
}

export interface ProcessedAnalysisResult {
  analysisResults: AnalysisResults;
  coordinateResult: CoordinateResult;
  validationLog: string[];
}

export const processPropertyAnalysis = async (
  rawAnalysis: AnalysisResults,
  context: AnalysisContext
): Promise<ProcessedAnalysisResult> => {
  console.log('🔄 Processing property analysis for consistency');
  const validationLog: string[] = [];
  
  // Step 1: Ensure coordinates are always available
  const coordinateResult = await ensureCoordinates(context.address, context.coordinates);
  validationLog.push(`Coordinates: ${coordinateResult.source} (confidence: ${coordinateResult.confidence})`);
  
  // Step 2: Get validated market data
  const marketData = getValidatedMarketData(coordinateResult);
  validationLog.push(`Market data confidence: ${marketData.confidence}`);
  
  // Step 3: Process and validate each asset type
  const processedAnalysis = { ...rawAnalysis };
  
  // Process parking with consistent market rates
  if (processedAnalysis.parking) {
    const parkingValidation = validateParkingRevenue(
      processedAnalysis.parking.spaces,
      marketData.parkingRates,
      processedAnalysis.propertyType,
      20 // 20 days per month
    );
    
    processedAnalysis.parking = {
      ...processedAnalysis.parking,
      rate: marketData.parkingRates,
      revenue: parkingValidation.validatedRevenue
    };
    
    validationLog.push(`Parking: ${parkingValidation.wasAdjusted ? 'adjusted' : 'validated'} revenue: $${parkingValidation.validatedRevenue}`);
  }
  
  // Process solar with validation
  if (processedAnalysis.rooftop) {
    const solarValidation = validateRevenue(processedAnalysis.rooftop.revenue, {
      propertyType: processedAnalysis.propertyType,
      assetType: 'solar',
      coordinates: coordinateResult.coordinates
    });
    
    processedAnalysis.rooftop = {
      ...processedAnalysis.rooftop,
      revenue: solarValidation.validatedRevenue
    };
    
    validationLog.push(`Solar: ${solarValidation.wasAdjusted ? 'adjusted' : 'validated'} revenue: $${solarValidation.validatedRevenue}`);
  }
  
  // Process pool with validation
  if (processedAnalysis.pool && processedAnalysis.pool.present) {
    const poolValidation = validateRevenue(processedAnalysis.pool.revenue, {
      propertyType: processedAnalysis.propertyType,
      assetType: 'pool'
    });
    
    processedAnalysis.pool = {
      ...processedAnalysis.pool,
      revenue: poolValidation.validatedRevenue
    };
    
    validationLog.push(`Pool: ${poolValidation.wasAdjusted ? 'adjusted' : 'validated'} revenue: $${poolValidation.validatedRevenue}`);
  }
  
  // Step 4: Update top opportunities with consistent data
  processedAnalysis.topOpportunities = updateTopOpportunities(
    processedAnalysis, 
    marketData, 
    validationLog
  );
  
  console.log('✅ Property analysis processing complete:', {
    validationLog,
    coordinateSource: coordinateResult.source,
    marketConfidence: marketData.confidence
  });
  
  return {
    analysisResults: processedAnalysis,
    coordinateResult,
    validationLog
  };
};

const updateTopOpportunities = (
  analysis: AnalysisResults,
  marketData: any,
  validationLog: string[]
): AssetOpportunity[] => {
  const opportunities: AssetOpportunity[] = [];
  
  // Solar opportunity
  if (analysis.rooftop?.revenue > 0) {
    opportunities.push({
      icon: 'solar',
      title: 'Solar Panel Installation',
      monthlyRevenue: analysis.rooftop.revenue,
      description: `Install solar panels on ${analysis.rooftop.area} sq ft roof`,
      provider: 'Tesla Energy',
      setupCost: analysis.rooftop.setupCost || Math.round(analysis.rooftop.area * 8),
      roi: Math.ceil((analysis.rooftop.setupCost || Math.round(analysis.rooftop.area * 8)) / analysis.rooftop.revenue),
      formFields: [
        {
          type: 'number',
          name: 'roofSize',
          label: 'Roof Size (sq ft)',
          value: analysis.rooftop.area
        }
      ]
    });
  }
  
  // Parking opportunity with consistent market rate
  if (analysis.parking?.spaces > 0) {
    opportunities.push({
      icon: 'parking',
      title: 'Parking Space Rental',
      monthlyRevenue: analysis.parking.revenue,
      description: `Rent out ${analysis.parking.spaces} parking spaces at $${analysis.parking.rate}/day when not in use.`,
      provider: 'SpotHero',
      setupCost: 0,
      roi: 1,
      formFields: [
        {
          type: 'number',
          name: 'spaces',
          label: 'Available Spaces',
          value: analysis.parking.spaces
        }
      ]
    });
    
    validationLog.push(`Parking opportunity: $${analysis.parking.revenue}/month using market rate $${analysis.parking.rate}/day`);
  }
  
  // Pool opportunity
  if (analysis.pool?.present && analysis.pool.revenue > 0) {
    opportunities.push({
      icon: 'pool',
      title: 'Pool Rental',
      monthlyRevenue: analysis.pool.revenue,
      description: `Rent out your ${analysis.pool.type} pool by the hour`,
      provider: 'Swimply',
      setupCost: 500,
      roi: Math.ceil(500 / analysis.pool.revenue),
      formFields: [
        {
          type: 'number',
          name: 'poolSize',
          label: 'Pool Size (sq ft)',
          value: analysis.pool.area
        }
      ]
    });
  }
  
  // Garden opportunity
  if (analysis.garden?.revenue > 0) {
    opportunities.push({
      icon: 'garden',
      title: 'Garden Space Rental',
      monthlyRevenue: analysis.garden.revenue,
      description: `${analysis.garden.opportunity} potential on ${analysis.garden.area} sq ft`,
      provider: 'SharedEarth',
      setupCost: 200,
      roi: Math.ceil(200 / analysis.garden.revenue),
      formFields: [
        {
          type: 'number',
          name: 'gardenArea',
          label: 'Garden Area (sq ft)',
          value: analysis.garden.area
        }
      ]
    });
  }
  
  // Bandwidth opportunity
  if (analysis.bandwidth?.revenue > 0) {
    opportunities.push({
      icon: 'wifi',
      title: 'Internet Bandwidth Sharing',
      monthlyRevenue: analysis.bandwidth.revenue,
      description: `Share ${analysis.bandwidth.available} Mbps unused bandwidth`,
      provider: 'Honeygain',
      setupCost: 0,
      roi: 1,
      formFields: [
        {
          type: 'number',
          name: 'bandwidth',
          label: 'Available Bandwidth (GB)',
          value: 500
        }
      ]
    });
  }
  
  // Sort by monthly revenue (highest first)
  return opportunities.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 5);
};
