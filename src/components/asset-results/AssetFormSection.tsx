
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, SelectedAsset, Opportunity } from "@/types/analysis";
import { LogIn } from 'lucide-react';
import iconMap from './IconMap';

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
    
    // Here you would typically submit the form data
    console.log('Form data submitted:', formData);
    
    // Navigate to authentication
    onComplete();
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
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg text-center">
        Additional Information Needed
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {selectedAssets.map((asset) => {
          const formFields = findFormFields(asset.title);
          const iconType = asset.icon as keyof typeof iconMap;
          
          if (formFields.length === 0) return null;
          
          return (
            <div 
              key={asset.title}
              className="glass-effect p-6 rounded-lg relative overflow-hidden backdrop-blur-md"
              style={{
                background: `linear-gradient(to bottom right, rgba(155, 135, 245, 0.3), rgba(155, 135, 245, 0.1))`,
                boxShadow: '0 8px 32px rgba(155, 135, 245, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 rounded-lg"></div>
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
              
              <div className="mb-4 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 glass-effect flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/30">
                  {iconMap[iconType] || (
                    <span className="text-white text-lg">{asset.title.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white drop-shadow-md">{asset.title}</h3>
                  <p className="text-gray-300">${asset.monthlyRevenue}/month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative z-10">
                {formFields.map((field) => (
                  <div key={`${asset.title}-${field.name}`} className="form-field">
                    <Label htmlFor={`${asset.title}-${field.name}`} className="text-white mb-1 block font-medium">
                      {field.label}
                    </Label>
                    
                    {field.type === "select" ? (
                      <Select 
                        defaultValue={String(field.value)}
                        onValueChange={(value) => handleInputChange(asset.title, field.name, value)}
                      >
                        <SelectTrigger className="glass-effect border-white/20 text-white bg-white/10 backdrop-blur-md">
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
                        className="glass-effect border-white/20 text-white bg-white/10 backdrop-blur-md"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="flex justify-center mt-12">
          <Button 
            type="submit"
            className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl"
            style={{ 
              boxShadow: '0 0 30px rgba(155, 135, 245, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="text-white drop-shadow-md">Complete & Authenticate</span>
            <LogIn size={24} className="text-white drop-shadow-md" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AssetFormSection;
