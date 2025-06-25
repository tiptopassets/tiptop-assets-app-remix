
import { useState } from 'react';

export const useAffiliateData = (userId: string | undefined) => {
  const [earnings] = useState([]);
  const [services] = useState([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  const loadData = async () => {
    console.log('Affiliate data loading is temporarily disabled');
  };

  return {
    earnings,
    services,
    loading,
    error,
    refreshData: loadData,
    setEarnings: () => {},
    setServices: () => {}
  };
};
