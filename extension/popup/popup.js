// ScopeShield AI - Popup Script

const API_BASE_URL = 'https://scopeshield-ai.vercel.app';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status
  await checkAuthStatus();

  // Set up event listeners
  setupEventListeners();
});

async function checkAuthStatus() {
  const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });

  if (response.authenticated) {
    showConnectedState(response.user);
  } else {
    showAuthState();
  }
}

function showAuthState() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('connected-section').classList.add('hidden');
}

function showConnectedState(user) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('connected-section').classList.remove('hidden');

  if (user) {
    document.getElementById('user-name').textContent = user.name || 'Connected';
    document.getElementById('user-email').textContent = user.email || '';
  }
}

function setupEventListeners() {
  // Connect button
  document.getElementById('connect-btn').addEventListener('click', handleConnect);

  // Disconnect button
  document.getElementById('disconnect-btn').addEventListener('click', handleDisconnect);

  // Open side panel
  document.getElementById('open-sidepanel-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
    window.close();
  });

  // Open dashboard
  document.getElementById('open-dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` });
    window.close();
  });

  // Dashboard link in auth section
  document.getElementById('dashboard-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/settings` });
  });

  // Help link
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_BASE_URL}/help` });
  });

  // Allow Enter key to submit token
  document.getElementById('api-token').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  });
}

async function handleConnect() {
  const tokenInput = document.getElementById('api-token');
  const errorDiv = document.getElementById('auth-error');
  const connectBtn = document.getElementById('connect-btn');

  const token = tokenInput.value.trim();

  if (!token) {
    showError('Please enter your API token');
    return;
  }

  // Show loading state
  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';
  errorDiv.classList.add('hidden');

  try {
    // Verify the token with the API
    const response = await fetch(`${API_BASE_URL}/api/extension/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    const user = await response.json();

    // Store the token
    await chrome.storage.sync.set({ apiToken: token });

    // Show connected state
    showConnectedState(user);
  } catch (error) {
    showError('Invalid token. Please check and try again.');
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect Account';
  }
}

async function handleDisconnect() {
  await chrome.storage.sync.remove(['apiToken']);
  showAuthState();
  document.getElementById('api-token').value = '';
}

function showError(message) {
  const errorDiv = document.getElementById('auth-error');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}
