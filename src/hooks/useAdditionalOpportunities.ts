
import { useMemo } from 'react';
import { AdditionalOpportunity } from '@/types/analysis';

export function useAdditionalOpportunities() {
  // Sample additional asset opportunities
  const additionalOpportunities: AdditionalOpportunity[] = useMemo(() => [
    {
      title: "Smart Home Hub",
      icon: "wifi",
      monthlyRevenue: 25,
      description: "Rent smart home management system access to tenants.",
      formFields: [
        { type: "select", name: "hubType", label: "Hub Type", value: "Basic", options: ["Basic", "Premium", "Advanced"] },
        { type: "number", name: "connections", label: "Max Connections", value: 10 }
      ]
    },
    {
      title: "Bike Storage",
      icon: "storage",
      monthlyRevenue: 15,
      description: "Secure bike storage for apartment residents.",
      formFields: [
        { type: "number", name: "capacity", label: "Storage Capacity", value: 4 },
        { type: "select", name: "storageType", label: "Storage Type", value: "Outdoor", options: ["Indoor", "Outdoor", "Covered"] }
      ]
    },
    {
      title: "Laundry Space",
      icon: "storage",
      monthlyRevenue: 80,
      description: "Convert unused space to laundry facilities.",
      formFields: [
        { type: "number", name: "machines", label: "Number of Machines", value: 2 },
        { type: "select", name: "paymentSystem", label: "Payment System", value: "Coin", options: ["Coin", "App-based", "Card"] }
      ]
    },
    {
      title: "Pet Amenities",
      icon: "garden",
      monthlyRevenue: 40,
      description: "Pet-friendly areas with services for residents.",
      formFields: [
        { type: "select", name: "amenityType", label: "Amenity Type", value: "Play Area", options: ["Play Area", "Washing Station", "Both"] },
        { type: "number", name: "areaSize", label: "Area Size (sq ft)", value: 100 }
      ]
    },
    {
      title: "Workshop Space",
      icon: "storage",
      monthlyRevenue: 120,
      description: "Shared workshop for DIY projects and repairs.",
      formFields: [
        { type: "number", name: "toolsProvided", label: "Tools Provided", value: 5 },
        { type: "select", name: "workspaceType", label: "Workspace Type", value: "General", options: ["General", "Woodworking", "Automotive", "Electronics"] }
      ]
    },
    {
      title: "Event Space",
      icon: "garden",
      monthlyRevenue: 200,
      description: "Dedicated space for community events and gatherings.",
      formFields: [
        { type: "number", name: "capacity", label: "Capacity (people)", value: 30 },
        { type: "select", name: "amenities", label: "Included Amenities", value: "Basic", options: ["Basic", "Standard", "Premium"] }
      ]
    }
  ], []);

  return { additionalOpportunities };
}
