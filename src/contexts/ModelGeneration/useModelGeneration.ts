
import { supabase } from '@/integrations/supabase/client';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { generateMapImageUrls, imageUrlToBase64 } from './utils';
import { ModelGenerationStatus } from './types';

export const usePropertyAnalysis = (
  setStatus: (status: ModelGenerationStatus) => void,
  setProgress: (progress: number) => void,
  updateProgress: (newProgress: (prev: number) => number) => void,
  setErrorMessage: (error: string | null) => void,
  propertyImages: { satellite: string | null; streetView: string | null },
  setHomeModelVisible: (visible: boolean) => void,
  setContentFromGPT: (content: string | null) => void,
  setGoogleImages: (images: string[]) => void
) => {
  const { address, addressCoordinates, setAnalysisResults } = useGoogleMap();

  const generateModel = async () => {
    if (!address || !addressCoordinates) {
      setErrorMessage('Please enter a valid address first.');
      return;
    }

    setStatus('generating');
    setProgress(0);
    setErrorMessage(null);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        updateProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 2;
        });
      }, 500);

      // Only get satellite image if it's not already captured
      let satelliteImageBase64 = propertyImages.satellite;
      if (!satelliteImageBase64 && addressCoordinates) {
        const mapUrls = await generateMapImageUrls(addressCoordinates);
        satelliteImageBase64 = await imageUrlToBase64(mapUrls.satelliteImageUrl);
      }

      // Process the property with GPT analysis
      console.log('Analyzing property with AI...');

      // Call the analyze-property function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-property',
        {
          body: {
            address,
            coordinates: addressCoordinates,
            satelliteImage: satelliteImageBase64,
          },
        }
      );

      if (analysisError) {
        console.error('Error analyzing property:', analysisError);
        throw new Error(analysisError.message || 'Failed to analyze property');
      }

      clearInterval(interval);

      // Extract content from GPT and fetch Google Images
      if (analysisData?.success && analysisData.analysis) {
        console.log('Analysis successful:', analysisData);
        
        // Set the analysis results
        setAnalysisResults(analysisData.analysis);
        
        // Generate GPT content about the property's monetization potential
        const contentSummary = `Based on our comprehensive analysis of ${address}, we've identified several monetization opportunities with detailed valuation:
        
1. Solar potential: The property has approximately ${analysisData.analysis.rooftop.area} sq ft of roof space with ${analysisData.analysis.rooftop.solarPotential ? 'excellent' : 'moderate'} solar potential. 
   - Solar capacity: ${analysisData.analysis.rooftop.solarCapacity || 'N/A'} kW
   - Monthly revenue: $${analysisData.analysis.rooftop.revenue}
   - Setup costs: ${analysisData.analysis.rooftop.providers && analysisData.analysis.rooftop.providers[0] ? '$' + analysisData.analysis.rooftop.providers[0].setupCost : 'Variable'}

2. Parking: With ${analysisData.analysis.parking.spaces} parking spaces available at $${analysisData.analysis.parking.rate}/day.
   - Monthly revenue: $${analysisData.analysis.parking.revenue}
   - EV charger potential: ${analysisData.analysis.parking.evChargerPotential ? 'Yes (additional revenue opportunity)' : 'No'}

3. Garden/Yard: The property features ${analysisData.analysis.garden.area} sq ft of outdoor space with ${analysisData.analysis.garden.opportunity} potential.
   - Monthly revenue: $${analysisData.analysis.garden.revenue}
   - Opportunity level: ${analysisData.analysis.garden.opportunity}

${analysisData.analysis.pool && analysisData.analysis.pool.present ? `4. Swimming Pool: Your ${analysisData.analysis.pool.type} pool (${analysisData.analysis.pool.area} sq ft) could generate $${analysisData.analysis.pool.revenue}/month when rented out during swimming season.` : ''}

${analysisData.analysis.bandwidth ? `5. Internet Bandwidth Sharing: With ${analysisData.analysis.bandwidth.available} Mbps available, you could earn approximately $${analysisData.analysis.bandwidth.revenue}/month through bandwidth sharing services.` : ''}

Property valuation summary:
- Total monthly potential: $${analysisData.analysis.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}/month
- Most profitable opportunity: ${analysisData.analysis.topOpportunities[0]?.title || 'N/A'} ($${analysisData.analysis.topOpportunities[0]?.monthlyRevenue || 0}/month)
- ROI timeline: ${analysisData.analysis.topOpportunities[0]?.roi || 'Varies'} months for primary opportunity
${analysisData.analysis.restrictions ? `\nImportant note: ${analysisData.analysis.restrictions}` : ''}`;

        setContentFromGPT(contentSummary);

        // Use placeholder images until we can implement a real Google Images API connection
        // In a production app, this would be replaced with an actual Google Image search API
        const sampleImages = [
          'https://lovable.dev/opengraph-image-p98pqg.png',
          'https://picsum.photos/id/1018/800/600',
          'https://picsum.photos/id/1015/800/600',
        ];
        
        setGoogleImages(sampleImages);

        // Complete the process
        setProgress(100);
        setStatus('completed');
        setHomeModelVisible(true);
      } else {
        throw new Error('No analysis results returned');
      }
    } catch (error) {
      console.error('Error generating model:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  };

  return { generateModel };
};
