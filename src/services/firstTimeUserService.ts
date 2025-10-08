const TUTORIAL_STEPS = {
  WELCOME_SHOWN: 'tiptop_welcome_shown',
  ASSET_SELECTION_SHOWN: 'tiptop_asset_selection_shown', 
  DASHBOARD_OPTIONS_SHOWN: 'tiptop_dashboard_options_shown'
};

// Legacy key for backwards compatibility
const FIRST_TIME_USER_KEY = 'tiptop_first_time_user';

export const shouldShowWelcomeTutorial = (): boolean => {
  try {
    return !localStorage.getItem(TUTORIAL_STEPS.WELCOME_SHOWN);
  } catch (error) {
    console.error('Error checking welcome tutorial status:', error);
    return false;
  }
};

export const markWelcomeTutorialSeen = (): void => {
  try {
    localStorage.setItem(TUTORIAL_STEPS.WELCOME_SHOWN, 'true');
  } catch (error) {
    console.error('Error marking welcome tutorial as seen:', error);
  }
};

export const shouldShowAssetSelectionTutorial = (): boolean => {
  try {
    return !localStorage.getItem(TUTORIAL_STEPS.ASSET_SELECTION_SHOWN);
  } catch (error) {
    console.error('Error checking asset selection tutorial status:', error);
    return false;
  }
};

export const markAssetSelectionTutorialSeen = (): void => {
  try {
    localStorage.setItem(TUTORIAL_STEPS.ASSET_SELECTION_SHOWN, 'true');
  } catch (error) {
    console.error('Error marking asset selection tutorial as seen:', error);
  }
};

export const shouldShowDashboardOptionsBanner = (): boolean => {
  try {
    return !localStorage.getItem(TUTORIAL_STEPS.DASHBOARD_OPTIONS_SHOWN);
  } catch (error) {
    console.error('Error checking dashboard options banner status:', error);
    return false;
  }
};

export const markDashboardOptionsBannerSeen = (): void => {
  try {
    localStorage.setItem(TUTORIAL_STEPS.DASHBOARD_OPTIONS_SHOWN, 'true');
  } catch (error) {
    console.error('Error marking dashboard options banner as seen:', error);
  }
};

// Legacy function - marks all tutorials as seen
export const isFirstTimeUser = (): boolean => {
  try {
    const hasVisited = localStorage.getItem(FIRST_TIME_USER_KEY);
    return hasVisited === null;
  } catch (error) {
    console.error('Error checking first-time user status:', error);
    return false;
  }
};

export const markUserAsReturning = (): void => {
  try {
    localStorage.setItem(FIRST_TIME_USER_KEY, 'visited');
    markWelcomeTutorialSeen();
    markAssetSelectionTutorialSeen();
    markDashboardOptionsBannerSeen();
  } catch (error) {
    console.error('Error marking user as returning:', error);
  }
};

export const resetFirstTimeUser = (): void => {
  try {
    localStorage.removeItem(FIRST_TIME_USER_KEY);
    localStorage.removeItem(TUTORIAL_STEPS.WELCOME_SHOWN);
    localStorage.removeItem(TUTORIAL_STEPS.ASSET_SELECTION_SHOWN);
    localStorage.removeItem(TUTORIAL_STEPS.DASHBOARD_OPTIONS_SHOWN);
  } catch (error) {
    console.error('Error resetting first-time user:', error);
  }
};
