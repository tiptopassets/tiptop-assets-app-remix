
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssetStatus = 'active' | 'pending' | 'inactive';

interface Asset {
  id: string;
  type: string;
  status: AssetStatus;
  revenue: number;
  partner: string;
  actionRequired?: string;
}

interface AssetsTableProps {
  assets: Asset[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, action: string) => void;
}

export const AssetsTable = ({ 
  assets, 
  onEdit, 
  onView, 
  onDelete,
  onAction
}: AssetsTableProps) => {
  const getStatusBadge = (status: AssetStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center";
    switch (status) {
      case 'active':
        return <span className={cn(baseClasses, "bg-green-100 text-green-800")}>
          <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
          Active
        </span>;
      case 'pending':
        return <span className={cn(baseClasses, "bg-yellow-100 text-yellow-800")}>
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
          Pending
        </span>;
      case 'inactive':
        return <span className={cn(baseClasses, "bg-red-100 text-red-800")}>
          <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
          Inactive
        </span>;
      default:
        return <span className={baseClasses}>Unknown</span>;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border shadow-md bg-white">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-white/5 pointer-events-none"></div>
      
      <div className="overflow-x-auto relative z-10">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[150px]">Asset Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Revenue</TableHead>
              <TableHead className="w-[150px]">Partner</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No assets found
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{asset.type}</TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>${asset.revenue.toFixed(2)}</TableCell>
                  <TableCell>{asset.partner}</TableCell>
                  <TableCell>
                    {asset.actionRequired ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => onAction(asset.id, asset.actionRequired || '')}
                      >
                        {asset.actionRequired}
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => onEdit(asset.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => onView(asset.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      onClick={() => onDelete(asset.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
