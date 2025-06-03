
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun } from 'lucide-react';

interface PropertyTabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PropertyTabsNavigation = ({ activeTab, setActiveTab }: PropertyTabsNavigationProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-3 bg-black/40">
        <TabsTrigger value="overview" className="text-white data-[state=active]:bg-tiptop-purple">Overview</TabsTrigger>
        <TabsTrigger value="solar" className="text-white data-[state=active]:bg-tiptop-purple">
          <Sun className="h-4 w-4 mr-1" />
          Solar Analysis
        </TabsTrigger>
        <TabsTrigger value="opportunities" className="text-white data-[state=active]:bg-tiptop-purple">All Assets</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default PropertyTabsNavigation;
