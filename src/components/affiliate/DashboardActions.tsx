
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface DashboardActionsProps {
  isSyncing: boolean;
  refreshData: () => void;
  hasFlexOffers: boolean;
  extensionInstalled: boolean;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  isSyncing,
  refreshData,
  hasFlexOffers,
  extensionInstalled
}) => {
  return (
    <div className="flex justify-between items-center">
      <Button onClick={refreshData} disabled={isSyncing}>
        {isSyncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Earnings
          </>
        )}
      </Button>
      {hasFlexOffers && (
        <Button variant="outline" onClick={() => window.open('https://publishers.flexoffers.com', '_blank')}>
          FlexOffers Dashboard <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      )}
      {!extensionInstalled && (
        <Button variant="destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          Extension Required
        </Button>
      )}
    </div>
  );
};

export default DashboardActions;
