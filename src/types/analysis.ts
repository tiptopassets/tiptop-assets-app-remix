
// Define types for the asset analysis
export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    solarPotential?: boolean;
    roofType?: string;
  };
  parking: {
    spaces: number;
    evChargerPotential?: boolean;
    parkingType?: string;
  };
  topOpportunities: Opportunity[];
  restrictions: string | null;
}

export interface Opportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  formFields?: FormField[];
}

export interface FormField {
  type: "text" | "number" | "select";
  name: string;
  label: string;
  value: string | number;
  options?: string[];
}

export interface AdditionalOpportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  formFields?: FormField[];
}

export interface SelectedAsset {
  title: string;
  icon: string;
  monthlyRevenue: number;
  formData?: Record<string, string | number>;
}
