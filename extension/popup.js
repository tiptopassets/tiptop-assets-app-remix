
document.addEventListener('DOMContentLoaded', function() {
  const currentSiteCard = document.getElementById('current-site-card');
  const currentSiteInfo = document.getElementById('current-site-info');
  const syncCurrentBtn = document.getElementById('sync-current-btn');
  const loginCard = document.getElementById('login-card');
  const loginInfo = document.getElementById('login-info');
  const apiUrlInput = document.getElementById('api-url');
  const userIdInput = document.getElementById('user-id');
  const apiKeyInput = document.getElementById('api-key');
  const loginBtn = document.getElementById('login-btn');
  const settingsLink = document.getElementById('settings-link');
  const messageDiv = document.getElementById('message');
  
  // Initialize extension
  initialize();
  
  function initialize() {
    // Load stored settings
    chrome.storage.local.get(['apiUrl', 'userId', 'token'], function(data) {
      if (data.apiUrl && data.userId && data.token) {
        // Settings are saved, check current site
        loginCard.style.display = 'none';
        apiUrlInput.value = data.apiUrl;
        userIdInput.value = data.userId;
        apiKeyInput.value = data.token;
        checkCurrentSite();
      } else {
        // Settings need to be entered
        loginCard.style.display = 'block';
        currentSiteCard.style.display = 'none';
        loginInfo.textContent = 'Please enter your TipTop account details';
      }
    });
  }
  
  function checkCurrentSite() {
    chrome.runtime.sendMessage({ action: 'getCurrentTab' }, function(response) {
      if (response.error) {
        showError(response.error);
        return;
      }
      
      const url = response.url;
      let detected = false;
      
      // Simple detection for known sites
      if (url.includes('honeygain.com')) {
        setupServiceCard('Honeygain', response.tabId);
        detected = true;
      } else if (url.includes('mysteriumnetwork.com')) {
        setupServiceCard('Mysterium Network', response.tabId);
        detected = true;
      } else if (url.includes('swimply.com')) {
        setupServiceCard('Swimply', response.tabId);
        detected = true;
      } else if (url.includes('neighbor.com')) {
        setupServiceCard('Neighbor', response.tabId);
        detected = true;
      }
      
      if (!detected) {
        currentSiteCard.style.display = 'block';
        currentSiteInfo.textContent = 'No supported affiliate service detected on this page.';
        syncCurrentBtn.disabled = true;
      }
    });
  }
  
  function setupServiceCard(serviceName, tabId) {
    currentSiteCard.style.display = 'block';
    currentSiteInfo.textContent = `Detected: ${serviceName}`;
    syncCurrentBtn.disabled = false;
    
    // Update the button to handle this specific service
    syncCurrentBtn.onclick = function() {
      syncEarningsFromSite(serviceName, tabId);
    };
  }
  
  function syncEarningsFromSite(serviceName, tabId) {
    showMessage('Attempting to extract earnings data...', 'status');
    
    // Inject content script to extract data if not already there
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractEarningsData,
      args: [serviceName]
    }, (results) => {
      if (chrome.runtime.lastError) {
        showError(`Script injection failed: ${chrome.runtime.lastError.message}`);
        return;
      }
      
      if (results && results[0]) {
        const data = results[0].result;
        
        if (data.error) {
          showError(`Failed to extract earnings: ${data.error}`);
          return;
        }
        
        if (data.earnings !== undefined) {
          syncEarnings(serviceName.toLowerCase().replace(' ', '_'), data.earnings);
        } else {
          showError('Could not find earnings data on this page.');
        }
      }
    });
  }
  
  function extractEarningsData(serviceName) {
    // This function runs in the context of the page
    try {
      let earnings = null;
      
      // Service-specific extraction logic
      if (serviceName === 'Honeygain') {
        // Example: extract from Honeygain dashboard
        const earningsElement = document.querySelector('.dashboard-balance-amount');
        if (earningsElement) {
          // Remove currency symbol and parse as float
          const text = earningsElement.textContent.trim();
          earnings = parseFloat(text.replace(/[^0-9.]/g, ''));
        }
      } else if (serviceName === 'Mysterium Network') {
        // Example: extract from Mysterium dashboard
        const earningsElement = document.querySelector('.earnings-total');
        if (earningsElement) {
          earnings = parseFloat(earningsElement.textContent.trim());
        }
      } else if (serviceName === 'Swimply') {
        // Example: extract from Swimply dashboard
        const earningsElement = document.querySelector('.total-earnings');
        if (earningsElement) {
          earnings = parseFloat(earningsElement.textContent.trim().replace(/[^0-9.]/g, ''));
        }
      } else if (serviceName === 'Neighbor') {
        // Example: extract from Neighbor dashboard
        const earningsElement = document.querySelector('.earnings-total');
        if (earningsElement) {
          earnings = parseFloat(earningsElement.textContent.trim().replace(/[^0-9.]/g, ''));
        }
      }
      
      if (earnings === null) {
        return { error: 'Could not locate earnings information on this page' };
      }
      
      return { earnings };
    } catch (error) {
      return { error: error.toString() };
    }
  }
  
  function syncEarnings(service, earnings) {
    chrome.storage.local.get(['apiUrl', 'userId', 'token'], function(data) {
      if (!data.apiUrl || !data.userId || !data.token) {
        showError('Extension not configured. Please enter your TipTop account details.');
        loginCard.style.display = 'block';
        return;
      }
      
      showMessage(`Syncing ${service} earnings: $${earnings}...`, 'status');
      
      chrome.runtime.sendMessage({
        action: 'syncEarnings',
        service: service,
        earnings: earnings,
        userId: data.userId
      }, function(response) {
        if (response.success) {
          showSuccess(`Successfully synced ${service} earnings to TipTop!`);
        } else {
          showError(`Failed to sync: ${response.error}`);
        }
      });
    });
  }
  
  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
  }
  
  function showSuccess(message) {
    showMessage(message, 'success');
  }
  
  function showError(message) {
    showMessage(message, 'error');
  }
  
  // Event listeners for the login card
  loginBtn.addEventListener('click', function() {
    const apiUrl = apiUrlInput.value.trim();
    const userId = userIdInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiUrl || !userId || !apiKey) {
      showError('Please fill in all fields');
      return;
    }
    
    // Save the settings
    chrome.storage.local.set({
      apiUrl: apiUrl,
      userId: userId,
      token: apiKey
    }, function() {
      if (chrome.runtime.lastError) {
        showError(`Failed to save settings: ${chrome.runtime.lastError.message}`);
      } else {
        showSuccess('Settings saved!');
        setTimeout(initialize, 1000);
      }
    });
  });
  
  settingsLink.addEventListener('click', function(event) {
    event.preventDefault();
    loginCard.style.display = loginCard.style.display === 'none' ? 'block' : 'none';
  });
});
