
import { useState } from 'react';

export const useFlexOffersSubId = () => {
  const [flexoffersSubId] = useState<string | null>(null);
  const [isLoading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  return { flexoffersSubId, isLoading, error };
};
