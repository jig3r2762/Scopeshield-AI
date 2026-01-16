# ScopeShield AI Browser Extension

Analyze client emails for scope creep directly from your inbox.

## Features

- **One-Click Analysis**: Analyze emails without leaving Gmail or Outlook
- **Quick Scope Check**: Works even without a project setup
- **Smart Linking**: Auto-links emails to your projects by sender address
- **Side Panel Results**: See analysis results in a convenient side panel
- **Copy Replies**: One-click copy of suggested responses

## Installation

### Development Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder

### Connect Your Account

1. Click the ScopeShield extension icon in Chrome toolbar
2. Go to your ScopeShield dashboard → Settings
3. Generate an API token
4. Paste the token in the extension popup and click "Connect"

## Usage

### Analyzing Emails

1. Open any email in Gmail or Outlook
2. Click the "Check Scope" button that appears
3. View results in the side panel

### Analyzing Selected Text

1. Select any text in an email
2. A "Analyze Selection" popup will appear
3. Click to analyze just the selected text

### Linking Projects

1. Go to a project's Settings in the dashboard
2. Add the client's email address
3. Future emails from that address will use the project's scope automatically

## Configuration

The extension connects to your ScopeShield instance. For local development, it defaults to `http://localhost:3000`.

To change the API URL for production:
1. Update `API_BASE_URL` in `background.js`
2. Update `API_BASE_URL` in `popup/popup.js`
3. Update `API_BASE_URL` in `sidepanel/sidepanel.js`

## Files Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content/
│   ├── gmail.js          # Gmail integration
│   ├── outlook.js        # Outlook integration
│   └── styles.css        # Injected styles
├── popup/
│   ├── popup.html        # Extension popup
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── sidepanel/
│   ├── sidepanel.html    # Analysis results panel
│   ├── sidepanel.css     # Panel styles
│   └── sidepanel.js      # Panel logic
└── icons/                 # Extension icons (add PNGs here)
```

## Adding Icons

To add extension icons:
1. Create PNG files: 16x16, 32x32, 48x48, 128x128
2. Save them as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` in `icons/`
3. Uncomment the icon references in `manifest.json`

## Troubleshooting

**Extension not connecting:**
- Make sure the ScopeShield app is running
- Check that the API URL is correct
- Verify your API token is valid

**Button not appearing in Gmail:**
- Refresh the Gmail page
- Check console for errors
- Make sure the extension is enabled

**Analysis failing:**
- Check if you're logged into the dashboard
- Verify API token hasn't expired
- Check network tab for API errors
