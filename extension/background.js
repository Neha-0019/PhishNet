// Configuration: Pointing to your live backend API URL on Render
const API_BASE_URL = 'https://phishnet-backend-api.onrender.com/api';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get_status" && sender.tab) {
    let tabId = sender.tab.id;
    chrome.storage.local.get([tabId.toString()], (result) => {
      sendResponse(result[tabId.toString()]);
    });
    return true; 
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://') || tab.url.includes('localhost') || tab.url.includes('127.0.0.1')) {
      return;
    }

    // Updated: Fetching prediction from your live Render server
    fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url })
    })
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({ [tabId]: data });

      if (data.is_phishing) {
        chrome.action.setBadgeText({ text: "⚠", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: tabId });
        
        let urlTrunc = tab.url.length > 60 ? tab.url.substring(0, 60) + '...' : tab.url;
        
        chrome.notifications.create(`phish_${tabId}`, {
          type: 'basic',
          iconUrl: 'icons/icon_phishing.png',
          title: "PhishNet Warning ⚠",
          message: `${data.risk_level} — Confidence: ${data.confidence.toFixed(1)}%\n${urlTrunc}`
        });

        chrome.tabs.sendMessage(tabId, { type: "phishing_alert", data: data }).catch(e => {});
      } else {
        chrome.action.setBadgeText({ text: "✓", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#22c55e", tabId: tabId });
      }
    })
    .catch(err => console.error("PhishNet Scan Error:", err));
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(tabId.toString());
});