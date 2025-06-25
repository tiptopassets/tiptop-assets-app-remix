
// Stub implementation - affiliate system temporarily disabled
export const syncServiceEarnings = async (
  service: string,
  userId: string | undefined,
  toast: any,
  manualEarnings?: number,
  credentials?: { email: string; password: string }
) => {
  console.log('Affiliate earnings sync is temporarily disabled');
  return { success: false, error: new Error('Feature temporarily disabled') };
};

export const saveServiceCredentials = async (
  service: string,
  email: string,
  password: string,
  userId: string | undefined,
  toast: any
) => {
  console.log('Credential saving is temporarily disabled');
  return { success: false };
};

export const checkServiceCredentials = async (
  service: string,
  userId: string | undefined
) => {
  return { exists: false };
};

export const combineServicesWithEarnings = (
  services: any[],
  earningsData: any[] | null
) => {
  return services.map(service => ({
    ...service,
    earnings: 0,
    last_sync_status: 'disabled' as const,
    updated_at: null,
  }));
};
