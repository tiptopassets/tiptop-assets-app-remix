
import { supabase } from '@/integrations/supabase/client';

interface NetworkAnalysisData {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  testHistory?: Array<{
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    timestamp: Date;
  }>;
}

export interface AIEarningsResponse {
  monthlyEarnings: {
    conservative: number;
    average: number;
    optimistic: number;
  };
  confidenceScore: number;
  reasoning: string;
  optimizationTips: string[];
  marketFactors: {
    locationPremium: number;
    demandLevel: 'low' | 'medium' | 'high';
    competitionLevel: 'low' | 'medium' | 'high';
  };
  bestSharingSchedule: {
    peakHours: string[];
    offPeakHours: string[];
    recommendedUptime: number;
  };
}

export class AIEarningsService {
  async analyzeEarningsPotential(networkData: NetworkAnalysisData): Promise<AIEarningsResponse> {
    try {
      console.log('🤖 Requesting AI earnings analysis for network data:', networkData);
      
      const { data, error } = await supabase.functions.invoke('analyze-bandwidth-earnings', {
        body: {
          networkData,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('AI earnings analysis error:', error);
        return this.getFallbackPrediction(networkData);
      }

      console.log('✅ AI earnings analysis completed:', data);
      return data;
    } catch (error) {
      console.error('Failed to get AI earnings analysis:', error);
      return this.getFallbackPrediction(networkData);
    }
  }

  private getFallbackPrediction(networkData: NetworkAnalysisData): AIEarningsResponse {
    // Basic fallback calculation when AI is unavailable
    const shareableBandwidth = networkData.downloadSpeed * 0.25;
    const baseEarnings = shareableBandwidth * 0.02 * 30;
    
    // Apply simple quality adjustments
    const qualityMultiplier = networkData.ping <= 20 ? 1.2 : networkData.ping <= 50 ? 1.0 : 0.8;
    const adjustedEarnings = baseEarnings * qualityMultiplier;

    return {
      monthlyEarnings: {
        conservative: Math.round(adjustedEarnings * 0.7 * 100) / 100,
        average: Math.round(adjustedEarnings * 100) / 100,
        optimistic: Math.round(adjustedEarnings * 1.4 * 100) / 100,
      },
      confidenceScore: 0.6,
      reasoning: 'Basic calculation based on bandwidth and network quality. For more accurate predictions, AI analysis is recommended.',
      optimizationTips: [
        'Run speed tests at different times to identify peak performance windows',
        'Consider router placement optimization for better signal strength',
        'Monitor network stability for consistent sharing performance'
      ],
      marketFactors: {
        locationPremium: 1.0,
        demandLevel: 'medium',
        competitionLevel: 'medium'
      },
      bestSharingSchedule: {
        peakHours: ['20:00-22:00', '12:00-14:00'],
        offPeakHours: ['02:00-06:00', '10:00-12:00'],
        recommendedUptime: 18
      }
    };
  }

  async getMarketIntelligence(location?: string): Promise<{
    averageRates: { low: number; medium: number; high: number };
    demandTrends: string[];
    competitorAnalysis: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-bandwidth-earnings', {
        body: {
          requestType: 'market_intelligence',
          location,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data.marketIntelligence;
    } catch (error) {
      console.error('Failed to get market intelligence:', error);
      return {
        averageRates: { low: 0.015, medium: 0.02, high: 0.025 },
        demandTrends: ['Increasing demand for bandwidth sharing', 'Peak usage during evening hours'],
        competitorAnalysis: 'Moderate competition in the bandwidth sharing market'
      };
    }
  }
}

export const aiEarningsService = new AIEarningsService();
