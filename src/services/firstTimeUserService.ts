
const FIRST_TIME_USER_KEY = 'tiptop_first_time_user';

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
  } catch (error) {
    console.error('Error marking user as returning:', error);
  }
};

export const resetFirstTimeUser = (): void => {
  try {
    localStorage.removeItem(FIRST_TIME_USER_KEY);
  } catch (error) {
    console.error('Error resetting first-time user:', error);
  }
};
