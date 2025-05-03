
// Define types for the asset analysis
export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    solarPotential?: boolean;
  };
  parking: {
    spaces: number;
    evChargerPotential?: boolean;
  };
  topOpportunities: Opportunity[];
  restrictions: string | null;
}

export interface Opportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
}

export interface AdditionalOpportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
}
