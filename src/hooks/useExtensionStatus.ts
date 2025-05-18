
import { useState, useEffect } from 'react';

export const useExtensionStatus = (extensionId: string = 'extension-id-here') => {
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  // Check if Chrome extension is installed
  useEffect(() => {
    // Only check for extension in browser environment
    const checkExtension = () => {
      if (typeof window !== 'undefined') {
        try {
          // Safe check for chrome object and its properties
          const chromeObj = window as any;
          if (chromeObj.chrome && chromeObj.chrome.runtime) {
            chromeObj.chrome.runtime.sendMessage(
              extensionId,
              { action: 'checkInstalled' },
              (response: any) => {
                if (response && !chromeObj.chrome.runtime.lastError) {
                  setExtensionInstalled(true);
                }
              }
            );
          }
        } catch (err) {
          console.log('Extension not installed or error checking:', err);
        }
      }
    };

    // Safely attempt to check extension
    try {
      checkExtension();
    } catch (err) {
      console.log('Error checking extension status:', err);
    }
  }, [extensionId]);

  return extensionInstalled;
};
