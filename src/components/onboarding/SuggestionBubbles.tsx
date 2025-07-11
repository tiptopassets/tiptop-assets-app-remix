
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface ExtendedPropertyData extends PropertyAnalysisData {
  selectedAssets?: Array<{
    asset_type: string;
    asset_data: any;
  }>;
}

interface SuggestionBubblesProps {
  propertyData: ExtendedPropertyData | null;
  showSuggestions: boolean;
  onSuggestedAction: (action: string) => void;
  isLoading: boolean;
}

const SuggestionBubbles = ({ 
  propertyData, 
  showSuggestions, 
  onSuggestedAction, 
  isLoading 
}: SuggestionBubblesProps) => {
  // Quick start suggestions based on property data
  const quickStartSuggestions = React.useMemo(() => {
    if (!propertyData || !propertyData.availableAssets.length) {
      return [
        'Tell me about property monetization',
        'What services are available?',
        'How can I start earning money?'
      ];
    }

    const topAssets = propertyData.availableAssets
      .filter(asset => asset.hasRevenuePotential)
      .slice(0, 3);

    return topAssets.length > 0 
      ? topAssets.map(asset => `Set up my ${asset.name?.toLowerCase?.() || 'asset'}`)
      : [
          'What are my options?',
          'How do I get started?',
          'Show me requirements'
        ];
  }, [propertyData]);

  console.log('🎈 [SUGGESTION_BUBBLES] Rendering with:', {
    showSuggestions,
    suggestionsCount: quickStartSuggestions.length,
    isLoading,
    hasPropertyData: !!propertyData
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-32 left-0 right-0 z-[98] px-3 md:px-6 pointer-events-none"
    >
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-effect backdrop-blur-xl border border-border/20 rounded-2xl p-3 md:p-4 shadow-lg pointer-events-auto"
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickStartSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🎈 [SUGGESTION_BUBBLES] Button clicked:', suggestion);
                          onSuggestedAction(suggestion);
                        }}
                        disabled={isLoading}
                        className="bg-background/50 backdrop-blur-sm border-primary/20 hover:border-[hsl(267,83%,60%)] hover:bg-[hsl(267,83%,60%)]/10 text-xs md:text-sm px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap"
                      >
                        {suggestion}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestionBubbles;
