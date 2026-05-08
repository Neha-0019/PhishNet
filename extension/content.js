let bannerInjected = false;

function showPhishingBanner(data) {
  if (bannerInjected) return;
  bannerInjected = true;

  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: -100px;
    left: 0;
    width: 100%;
    background-color: #ef4444;
    color: white;
    z-index: 2147483647;
    padding: 16px 24px;
    box-sizing: border-box;
    font-family: sans-serif;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: top 0.5s ease-in-out;
  `;

  const text = document.createElement('div');
  text.innerHTML = `⚠ PhishNet detected this site as potentially phishing. Confidence: ${data.confidence.toFixed(1)}%`;
  
  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '12px';

  const dismissBtn = document.createElement('button');
  dismissBtn.innerText = 'Dismiss';
  dismissBtn.style.cssText = 'background: transparent; border: 1px solid white; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
  dismissBtn.onclick = () => {
    banner.style.top = '-100px';
    setTimeout(() => banner.remove(), 500);
  };

  const reportBtn = document.createElement('button');
  reportBtn.innerText = 'Report & Leave';
  reportBtn.style.cssText = 'background: white; border: none; color: #ef4444; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;';
  reportBtn.onclick = () => {
    fetch('http://localhost:5000/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.href })
    }).catch(()=>{}).finally(() => {
      window.history.back();
      setTimeout(() => { window.location.href = "about:blank"; }, 500);
    });
  };

  btnGroup.appendChild(dismissBtn);
  btnGroup.appendChild(reportBtn);
  banner.appendChild(text);
  banner.appendChild(btnGroup);

  document.body.appendChild(banner);
  
  setTimeout(() => {
    banner.style.top = '0px';
  }, 100);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "phishing_alert") {
    showPhishingBanner(message.data);
  }
});

try {
  chrome.runtime.sendMessage({ type: "get_status" }, (data) => {
    if (data && data.is_phishing) {
      showPhishingBanner(data);
    }
  });
} catch(e) {}
