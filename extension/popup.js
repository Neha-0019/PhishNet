// Configuration: Pointing to your live Render backend and frontend dashboard URLs
const API_BASE_URL = 'https://phishnet-backend-api.onrender.com/api';
const DASHBOARD_URL = 'https://phishnet-dashboard.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tab = tabs[0];
    if (!tab) return;
    
    let url = tab.url;
    document.getElementById('urlDisplay').textContent = url.length > 60 ? url.substring(0, 60) + '...' : url;
    
    chrome.storage.local.get([tab.id.toString()], (result) => {
      let data = result[tab.id.toString()];
      if (data) {
        document.getElementById('statusIcon').src = data.is_phishing ? 'icons/icon_phishing.png' : 'icons/icon_safe.png';
        let badge = document.getElementById('statusBadge');
        badge.textContent = data.risk_level;
        badge.className = `badge ${data.is_phishing ? 'danger' : 'safe'}`;
        document.getElementById('confidence').textContent = `Confidence: ${data.confidence.toFixed(1)}%`;
        
        if (!data.is_phishing) {
          document.getElementById('reportBtn').style.display = 'block';
        }
      } else {
        document.getElementById('statusBadge').textContent = 'Not Scanned';
      }
    });

    document.getElementById('rescanBtn').addEventListener('click', () => {
      document.getElementById('statusBadge').textContent = 'Scanning...';
      document.getElementById('statusBadge').className = 'badge pending';
      document.getElementById('statusIcon').src = 'icons/icon48.png';
      document.getElementById('confidence').textContent = '';
      
      // Updated: Fetching prediction from your live Render server
      fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url })
      })
      .then(r => r.json())
      .then(data => {
        chrome.storage.local.set({ [tab.id]: data });
        document.getElementById('statusIcon').src = data.is_phishing ? 'icons/icon_phishing.png' : 'icons/icon_safe.png';
        let badge = document.getElementById('statusBadge');
        badge.textContent = data.risk_level;
        badge.className = `badge ${data.is_phishing ? 'danger' : 'safe'}`;
        document.getElementById('confidence').textContent = `Confidence: ${data.confidence.toFixed(1)}%`;
      });
    });

    document.getElementById('reportBtn').addEventListener('click', () => {
      // Updated: Sending report request to your live Render server
      fetch(`${API_BASE_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url })
      }).then(() => {
        alert('URL reported. Thank you!');
      });
    });

    document.getElementById('dashboardLink').addEventListener('click', () => {
      // Updated: Redirecting user to your live deployed dashboard website
      chrome.tabs.create({ url: DASHBOARD_URL });
    });
  });
});