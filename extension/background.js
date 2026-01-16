// ScopeShield AI Background Service Worker

const API_BASE_URL = 'http://localhost:3000'; // Change to production URL when deployed

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    handleAnalyze(request.data, sender.tab?.id)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }

  if (request.action === 'getProjects') {
    handleGetProjects()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'openSidePanel') {
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'checkAuth') {
    handleCheckAuth()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Handle quick analyze (no project context)
async function handleAnalyze(data, tabId) {
  const { apiToken } = await chrome.storage.sync.get(['apiToken']);

  if (!apiToken) {
    throw new Error('Not authenticated. Please connect your ScopeShield account.');
  }

  const response = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    body: JSON.stringify({
      message: data.message,
      senderEmail: data.senderEmail,
      projectId: data.projectId
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      await chrome.storage.sync.remove(['apiToken']);
      throw new Error('Session expired. Please reconnect your account.');
    }
    throw new Error('Analysis failed. Please try again.');
  }

  const result = await response.json();

  // Store latest analysis for side panel
  await chrome.storage.local.set({
    latestAnalysis: result,
    analyzedAt: Date.now()
  });

  // Open side panel to show results
  if (tabId) {
    chrome.sidePanel.open({ tabId });
  }

  return result;
}

// Get user's projects
async function handleGetProjects() {
  const { apiToken } = await chrome.storage.sync.get(['apiToken']);

  if (!apiToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/extension/projects`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

// Check if user is authenticated
async function handleCheckAuth() {
  const { apiToken } = await chrome.storage.sync.get(['apiToken']);

  if (!apiToken) {
    return { authenticated: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/me`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    if (!response.ok) {
      await chrome.storage.sync.remove(['apiToken']);
      return { authenticated: false };
    }

    const user = await response.json();
    return { authenticated: true, user };
  } catch {
    return { authenticated: false };
  }
}

// Update API URL from storage if set
chrome.storage.sync.get(['apiBaseUrl'], ({ apiBaseUrl }) => {
  if (apiBaseUrl) {
    // This would be used in production
  }
});
