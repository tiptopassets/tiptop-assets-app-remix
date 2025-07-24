
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import ContinueButton from './ContinueButton';

interface AssetResultListProps {
  propertyData: PropertyAnalysisData | null;
  onAssetSelect: (assetId: string, selected: boolean) => void;
  selectedAssets?: string[];
}

interface SelectedAsset {
  asset_id: string;
  asset_type: string;
  monthly_revenue: number;
}

const AssetResultList = ({ propertyData, onAssetSelect, selectedAssets = [] }: AssetResultListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [allAssetsSelected, setAllAssetsSelected] = useState(false);

  useEffect(() => {
    if (propertyData && propertyData.availableAssets) {
      setFilteredAssets(propertyData.availableAssets);
    }
  }, [propertyData]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredAssets(
        propertyData?.availableAssets?.filter(asset =>
          asset.name.toLowerCase().includes(term) || asset.type.toLowerCase().includes(term)
        ) || []
      );
    } else if (propertyData) {
      setFilteredAssets(propertyData.availableAssets);
    }
  }, [searchTerm, propertyData]);

  useEffect(() => {
    if (propertyData && selectedAssets) {
      const selectedData = propertyData.availableAssets
        ?.filter(asset => selectedAssets.includes(asset.type))
        .map(asset => ({
          asset_id: asset.type,
          asset_type: asset.type,
          monthly_revenue: asset.monthlyRevenue
        })) || [];
      setSelectedAssetsData(selectedData);
    }
  }, [selectedAssets, propertyData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAssetCheckboxChange = (assetType: string, checked: boolean) => {
    onAssetSelect(assetType, checked);
  };

  const handleSelectAllChange = (checked: boolean) => {
    setAllAssetsSelected(checked);

    if (propertyData && propertyData.availableAssets) {
      propertyData.availableAssets.forEach(asset => {
        onAssetSelect(asset.type, checked);
      });
    }
  };

  const handleContinue = () => {
    console.log("Continue button clicked with selected assets:", selectedAssets);
  };

  const hasSelections = selectedAssets.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Select All Checkbox */}
      {propertyData?.availableAssets && propertyData.availableAssets.length > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allAssetsSelected}
            onCheckedChange={(checked) => handleSelectAllChange(!!checked)}
          />
          <Label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select All
          </Label>
        </div>
      )}

      {/* Asset List */}
      <ScrollArea className="rounded-md border h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Select</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Potential Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => {
              const assetKey = asset.type;
              const isSelected = selectedAssets.includes(assetKey);
              return (
                <TableRow key={assetKey}>
                  <TableCell className="font-medium">
                    <Checkbox
                      id={`asset-${assetKey}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleAssetCheckboxChange(assetKey, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell className="text-right">${asset.monthlyRevenue}/month</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Continue Button */}
      <ContinueButton
        selectedAssets={selectedAssets}
        onContinue={handleContinue}
        isLoading={false}
      />
    </div>
  );
};

export default AssetResultList;
