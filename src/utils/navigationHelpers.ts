
export const navigateToChatbot = (analysisId: string, assetType?: string) => {
  const params = new URLSearchParams();
  params.set('analysisId', analysisId);
  
  if (assetType) {
    params.set('asset', assetType);
  }
  
  const url = `/dashboard/onboarding?${params.toString()}`;
  console.log('🔗 [NAVIGATION] Navigating to chatbot:', { analysisId, assetType, url });
  
  return url;
};

export const getChatbotUrl = (analysisId: string, assetType?: string) => {
  return navigateToChatbot(analysisId, assetType);
};
