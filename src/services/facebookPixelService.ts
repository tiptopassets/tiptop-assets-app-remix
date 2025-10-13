/**
 * Facebook Pixel Service
 * Centralizes all Facebook Pixel tracking events for the TipTop application
 */

// Extend the Window interface to include fbq
declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Check if Facebook Pixel is loaded and available
 */
const isPixelAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Safe wrapper for fbq calls with error handling
 */
const trackEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  try {
    if (isPixelAvailable()) {
      window.fbq!('track', eventName, params);
      console.log(`📊 [FB Pixel] ${eventName}`, params || {});
    } else {
      console.warn('⚠️ [FB Pixel] Pixel not available (may be blocked by ad blocker)');
    }
  } catch (error) {
    console.error('❌ [FB Pixel] Error tracking event:', error);
  }
};

/**
 * Initialize Facebook Pixel
 * Call this once when the app starts
 */
export const initFacebookPixel = (): void => {
  console.log('🚀 [FB Pixel] Initializing Facebook Pixel');
  // Pixel is initialized in index.html, this just logs confirmation
  if (isPixelAvailable()) {
    console.log('✅ [FB Pixel] Facebook Pixel is ready');
  } else {
    console.warn('⚠️ [FB Pixel] Facebook Pixel script not loaded');
  }
};

/**
 * Track page view
 * Use this for manual page view tracking in SPA navigation
 */
export const trackPageView = (): void => {
  trackEvent('PageView');
};

/**
 * Track search event
 * Called when user enters an address to analyze
 */
export const trackSearch = (searchQuery: string): void => {
  trackEvent('Search', {
    search_string: searchQuery,
    content_category: 'Property Search'
  });
};

/**
 * Track content view event
 * Called when analysis results are displayed
 */
export const trackViewContent = (
  contentName: string,
  opportunityCount?: number
): void => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: 'Analysis Results',
    value: opportunityCount || 0
  });
};

/**
 * Track lead capture event
 * Called when user submits email or phone
 */
export const trackLead = (contactType: 'email' | 'phone'): void => {
  trackEvent('Lead', {
    content_name: 'Lead Capture',
    content_category: contactType
  });
};

/**
 * Track registration completion
 * Called when user successfully signs up
 */
export const trackCompleteRegistration = (method: string = 'Google'): void => {
  trackEvent('CompleteRegistration', {
    content_name: 'User Registration',
    registration_method: method
  });
};

/**
 * Track custom event
 * Use this for any custom tracking needs
 */
export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  try {
    if (isPixelAvailable()) {
      window.fbq!('trackCustom', eventName, params);
      console.log(`📊 [FB Pixel] Custom: ${eventName}`, params || {});
    }
  } catch (error) {
    console.error('❌ [FB Pixel] Error tracking custom event:', error);
  }
};
