
// Content script for Honeygain dashboard
console.log("TipTop Affiliate Sync: Honeygain content script loaded");

// Function to extract earnings from the page
function extractEarningsData() {
  try {
    // Wait for the dashboard to load completely
    const checkInterval = setInterval(() => {
      const earningsElement = document.querySelector('.dashboard__total-earnings');
      
      if (earningsElement) {
        clearInterval(checkInterval);
        
        // Extract the earnings amount
        const text = earningsElement.textContent.trim();
        const earnings = parseFloat(text.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(earnings)) {
          console.log(`TipTop Affiliate Sync: Detected Honeygain earnings: $${earnings}`);
          
          // Send the data to the extension background script
          chrome.runtime.sendMessage({
            action: 'detectedEarnings',
            service: 'honeygain',
            earnings: earnings
          });
        }
      }
    }, 1000);
    
    // Stop checking after 10 seconds to prevent infinite loop
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  } catch (error) {
    console.error("TipTop Affiliate Sync: Error extracting Honeygain earnings", error);
  }
}

// Run the extraction function
extractEarningsData();

// Listen for manual sync requests from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractEarnings') {
    try {
      const earningsElement = document.querySelector('.dashboard__total-earnings');
      
      if (earningsElement) {
        const text = earningsElement.textContent.trim();
        const earnings = parseFloat(text.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(earnings)) {
          sendResponse({ success: true, earnings: earnings });
        } else {
          sendResponse({ success: false, error: 'Could not parse earnings amount' });
        }
      } else {
        sendResponse({ success: false, error: 'Earnings element not found on page' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.toString() });
    }
    return true;
  }
});
