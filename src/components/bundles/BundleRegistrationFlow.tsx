
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BundleRecommendation, ServiceProvider } from '@/contexts/ServiceProviders/types';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

interface BundleRegistrationFlowProps {
  selectedBundle: BundleRecommendation;
  propertyAddress: string;
  onComplete: () => void;
  onBack: () => void;
}

const BundleRegistrationFlow: React.FC<BundleRegistrationFlowProps> = ({
  selectedBundle,
  propertyAddress,
  onComplete,
  onBack
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { registerWithProvider } = useServiceProviders();
  
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    selectedBundle.providers.map(p => p.id)
  );
  const [registering, setRegistering] = useState(false);
  const [registeredProviders, setRegisteredProviders] = useState<string[]>([]);

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleRegisterAll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register with providers",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);

    try {
      // Create bundle selection record
      const bundleSelectionData = {
        user_id: user.id,
        bundle_id: selectedBundle.bundle.id,
        property_address: propertyAddress,
        selected_assets: selectedBundle.matchingAssets,
        selected_providers: selectedProviders,
        status: 'pending' as const
      };

      // Register with each selected provider
      for (const providerId of selectedProviders) {
        const provider = selectedBundle.providers.find(p => p.id === providerId);
        if (!provider) continue;

        try {
          await registerWithProvider({
            providerId,
            userEmail,
            propertyAddress,
            assetType: provider.category
          });

          setRegisteredProviders(prev => [...prev, providerId]);
        } catch (error) {
          console.error(`Failed to register with ${provider.name}:`, error);
          toast({
            title: `Registration Failed`,
            description: `Could not register with ${provider.name}`,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Registration Complete",
        description: `Successfully registered with ${registeredProviders.length} providers`,
      });

      onComplete();
    } catch (error) {
      console.error('Bundle registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to complete bundle registration",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  const getProvidersByCategory = () => {
    const categories: Record<string, ServiceProvider[]> = {};
    selectedBundle.providers.forEach(provider => {
      if (!categories[provider.category]) {
        categories[provider.category] = [];
      }
      categories[provider.category].push(provider);
    });
    return categories;
  };

  const providersByCategory = getProvidersByCategory();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-tiptop-purple/20">
        <CardHeader>
          <CardTitle className="text-white">Complete Your Bundle Registration</CardTitle>
          <p className="text-gray-300">
            Register with multiple providers to maximize your earning potential
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="glass-effect border-white/20 text-white"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <Label className="text-white">Property Address</Label>
              <Input
                value={propertyAddress}
                readOnly
                className="glass-effect border-white/20 text-white bg-white/5"
              />
            </div>
          </div>

          {/* Provider Selection by Category */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Providers</h3>
            
            {Object.entries(providersByCategory).map(([category, providers]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-md font-medium text-tiptop-purple capitalize">
                  {category.replace('_', ' ')} Providers
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {providers.map(provider => (
                    <div
                      key={provider.id}
                      className={`p-3 border rounded-lg transition-all cursor-pointer ${
                        selectedProviders.includes(provider.id)
                          ? 'border-tiptop-purple bg-tiptop-purple/10'
                          : 'border-white/20 bg-white/5'
                      }`}
                      onClick={() => handleProviderToggle(provider.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onChange={() => handleProviderToggle(provider.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{provider.name}</span>
                            {registeredProviders.includes(provider.id) && (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">{provider.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-green-400 text-sm font-medium">
                              ${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/mo
                            </span>
                            <span className="text-gray-400 text-xs">
                              {provider.commission_rate}% commission
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-tiptop-purple/10 rounded-lg border border-tiptop-purple/20">
            <h4 className="text-white font-medium mb-2">Bundle Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Selected Providers:</span>
                <span className="text-white ml-2">{selectedProviders.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Potential Monthly:</span>
                <span className="text-green-400 ml-2 font-medium">
                  ${selectedBundle.totalEarnings.low}-${selectedBundle.totalEarnings.high}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
              disabled={registering}
            >
              Back to Bundles
            </Button>
            
            <Button
              onClick={handleRegisterAll}
              disabled={selectedProviders.length === 0 || registering || !userEmail}
              className="flex-1 bg-gradient-to-r from-tiptop-purple to-purple-600"
            >
              {registering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  Register with {selectedProviders.length} Providers
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BundleRegistrationFlow;
