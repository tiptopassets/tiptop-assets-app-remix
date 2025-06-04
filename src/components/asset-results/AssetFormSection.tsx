
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, SelectedAsset, Opportunity } from "@/types/analysis";
import { LogIn } from 'lucide-react';
import iconMap from './IconMap';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AssetFormSectionProps {
  selectedAssets: SelectedAsset[];
  opportunities: Opportunity[];
  onComplete: () => void;
}

const AssetFormSection = ({ 
  selectedAssets,
  opportunities,
  onComplete
}: AssetFormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, Record<string, string | number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Find form fields for an asset based on its title
  const findFormFields = (assetTitle: string): FormField[] => {
    const opportunity = opportunities.find(opp => opp.title === assetTitle);
    return opportunity?.formFields || [];
  };

  const handleInputChange = (assetTitle: string, fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [assetTitle]: {
        ...(prev[assetTitle] || {}),
        [fieldName]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically submit the form data
      console.log('Form data submitted:', formData);
      
      // Show success toast
      toast({
        title: "Information Saved",
        description: "Your asset information has been saved successfully."
      });
      
      // Navigate to options page after a short delay
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/options');
      }, 500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      
      toast({
        title: "Submission Error",
        description: "There was a problem saving your information. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (selectedAssets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 mb-16"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center">
        Additional Information Needed
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {selectedAssets.map((asset) => {
          const formFields = findFormFields(asset.title);
          const iconType = asset.icon as keyof typeof iconMap;
          
          // Always render each selected asset card, even if it has no form fields
          return (
            <div 
              key={asset.title}
              className="glass-effect p-6 rounded-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, rgba(155, 135, 245, 0.2), rgba(155, 135, 245, 0.1))`,
                boxShadow: '0 4px 15px rgba(155, 135, 245, 0.2)'
              }}
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="w-12 h-12 glass-effect flex items-center justify-center rounded-lg">
                  {iconMap[iconType] || (
                    <span className="text-white text-lg">{asset.title.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{asset.title}</h3>
                  <p className="text-gray-300">${asset.monthlyRevenue}/month</p>
                </div>
              </div>
              
              {formFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {formFields.map((field) => (
                    <div key={`${asset.title}-${field.name}`} className="form-field">
                      <Label htmlFor={`${asset.title}-${field.name}`} className="text-white mb-1 block">
                        {field.label}
                      </Label>
                      
                      {field.type === "select" ? (
                        <Select 
                          defaultValue={String(field.value)}
                          onValueChange={(value) => handleInputChange(asset.title, field.name, value)}
                        >
                          <SelectTrigger className="glass-effect border-white/20 text-white">
                            <SelectValue placeholder={String(field.value)} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`${asset.title}-${field.name}`}
                          type={field.type} 
                          defaultValue={field.value}
                          onChange={(e) => {
                            const value = field.type === "number" 
                              ? parseFloat(e.target.value) 
                              : e.target.value;
                            handleInputChange(asset.title, field.name, value);
                          }}
                          className="glass-effect border-white/20 text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-gray-200 italic">
                  No additional information needed for this asset.
                </div>
              )}
              
              {/* Enhanced glossy effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
              
              {/* Additional glossy and glow effects */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-lg pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/10 to-transparent rounded-b-lg pointer-events-none"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl blur-lg -z-10 pointer-events-none"></div>
            </div>
          );
        })}
        
        <div className="flex justify-center mt-8">
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl transition-all"
            style={{ 
              boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
            }}
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Processing...</span>
                <div className="h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                <span>Complete & Authenticate</span>
                <LogIn size={24} />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AssetFormSection;
