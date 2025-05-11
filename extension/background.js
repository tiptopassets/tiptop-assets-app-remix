
// Background service worker for the TipTop Affiliate Sync extension

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Message received in background script:", message);
  
  if (message.action === "syncEarnings") {
    syncEarningsWithTipTop(message.service, message.earnings, message.userId)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required to use sendResponse asynchronously
  }
  
  if (message.action === "getCurrentTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        sendResponse({ url: tabs[0].url, tabId: tabs[0].id });
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true; // Required to use sendResponse asynchronously
  }
});

async function syncEarningsWithTipTop(service, earnings, userId) {
  try {
    // Get the API URL and token from storage
    const { apiUrl, token } = await new Promise((resolve, reject) => {
      chrome.storage.local.get(['apiUrl', 'token', 'userId'], function(data) {
        if (data.apiUrl && (data.token || data.userId)) {
          resolve(data);
        } else {
          reject(new Error("Extension not configured with API credentials"));
        }
      });
    });
    
    // Use the stored userId if none was provided
    userId = userId || storage.userId;
    
    if (!userId) {
      throw new Error("User ID not provided or stored");
    }
    
    // Call the TipTop API endpoint
    const response = await fetch(`${apiUrl}/functions/v1/sync_affiliate_earnings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        service: service,
        earnings: earnings,
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Sync failed");
    }
    
    console.log("Sync successful:", result);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Sync error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
