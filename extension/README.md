# PhishNet Chrome Extension

This extension integrates directly with the local PhishNet API to scan URLs in real-time as you browse.

## Features
- Background scanning of all page loads.
- Threat level icon badge.
- Interactive popup showing SHAP confidence and direct report buttons.
- Dangerous site warning injected into the DOM (Top Banner).

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Toggle **Developer Mode** on (top right corner).
3. Click **Load unpacked**.
4. Select this `extension` folder.
5. The extension is now loaded! Pin it to your toolbar.

## Usage
- Visit any site to trigger an automatic scan.
- Click the PhishNet shield icon to view confidence metrics.
- Click **Open PhishNet Dashboard** to jump into your local React UI.
