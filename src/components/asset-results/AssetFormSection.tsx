
import { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SelectedAsset, FormField as AssetFormField } from "@/types/analysis";
import { LogIn } from "lucide-react";
import { glowColorMap } from "./AssetCard";

interface AssetFormSectionProps {
  selectedAssets: SelectedAsset[];
  opportunities: Array<any>; // Combined opportunities
  onComplete: () => void;
}

const AssetFormSection = ({ selectedAssets, opportunities, onComplete }: AssetFormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});
  
  // Helper function to get form fields for an asset
  const getFormFieldsForAsset = (assetTitle: string) => {
    const asset = opportunities.find(opp => opp.title === assetTitle);
    const defaultFields = [];
    
    if (assetTitle.toLowerCase().includes('solar') || assetTitle.toLowerCase().includes('roof')) {
      return [
        { type: "number", name: "roofArea", label: "Available Roof Area (sq ft)", value: 616 },
        { type: "number", name: "kwCapacity", label: "Potential kW Capacity", value: 5.23 },
        { type: "select", name: "roofType", label: "Roof Type", value: "Flat", 
          options: ["Flat", "Sloped", "Metal", "Tile"] }
      ];
    } else if (assetTitle.toLowerCase().includes('parking')) {
      return [
        { type: "number", name: "spaces", label: "Number of Spaces", value: 2 },
        { type: "select", name: "parkingType", label: "Parking Type", value: "Driveway",
          options: ["Driveway", "Garage", "Carport", "Street"] }
      ];
    }
    
    return asset?.formFields || defaultFields;
  };

  const handleFormChange = (assetTitle: string, fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [assetTitle]: {
        ...prev[assetTitle],
        [fieldName]: value
      }
    }));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 w-full md:max-w-3xl px-4 md:px-0"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg text-center md:text-left">
        Additional Information Needed
      </h2>
      
      <div className="space-y-8">
        {selectedAssets.map((asset, index) => {
          const iconType = asset.icon as keyof typeof glowColorMap;
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          const formFields = getFormFieldsForAsset(asset.title);
          
          return (
            <div 
              key={index}
              className="glass-effect rounded-lg p-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.8')}, ${glowColor.replace('0.5', '0.4')})`,
                boxShadow: `0 5px 20px ${glowColor.replace('0.5', '0.3')}`
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center">
                  <img 
                    src={`/lovable-uploads/${iconType === 'wifi' ? 'f5bf9c32-688f-4a52-8a95-4d803713d2ff.png' : 
                          iconType === 'storage' ? '417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png' :
                          iconType === 'solar' ? '8ba119f3-849f-4b91-8a99-2d737a12a8b7.png' :
                          iconType === 'parking' ? '55b3ec9d-11b2-4d20-8a7c-34161f2c03af.png' :
                          'ef52333e-7ea8-4692-aeed-9a222da95b75.png'}`}
                    alt={`${asset.title} Icon`}
                    className="w-8 h-8 object-contain"
                    style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{asset.title}</h3>
                  <p className="text-white">${asset.monthlyRevenue}/month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                {formFields.map((field: AssetFormField, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <label className="text-white text-sm font-medium">{field.label}</label>
                    
                    {field.type === 'select' ? (
                      <Select 
                        defaultValue={String(field.value)}
                        onValueChange={(value) => handleFormChange(asset.title, field.name, value)}
                      >
                        <SelectTrigger className="bg-white/30 border-white/20 backdrop-blur-sm text-white">
                          <SelectValue placeholder={String(field.value)} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type={field.type} 
                        defaultValue={field.value}
                        className="bg-white/30 border-white/20 backdrop-blur-sm text-white"
                        onChange={(e) => handleFormChange(
                          asset.title, 
                          field.name, 
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 flex justify-center">
        <Button 
          onClick={onComplete}
          className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl"
        >
          <span>Complete & Authenticate</span>
          <LogIn size={24} />
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetFormSection;
