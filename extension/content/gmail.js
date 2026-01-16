// ScopeShield AI - Gmail Content Script

let currentEmailContent = null;
let currentSenderEmail = null;
let buttonInjected = false;

// Main initialization
function init() {
  observeEmailChanges();
  injectAnalyzeButton();
}

// Observe for email view changes
function observeEmailChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if we're viewing an email
    const emailView = document.querySelector('[data-message-id]');
    if (emailView && !buttonInjected) {
      setTimeout(() => injectAnalyzeButton(), 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Extract email content from Gmail
function extractEmailContent() {
  // Try to get the email body from the current open email
  const emailBody = document.querySelector('.a3s.aiL') ||
                    document.querySelector('[data-message-id] .ii.gt');

  if (emailBody) {
    // Get text content, cleaning up extra whitespace
    const text = emailBody.innerText || emailBody.textContent;
    return text.trim().replace(/\s+/g, ' ').substring(0, 5000); // Limit to 5000 chars
  }

  return null;
}

// Extract sender email
function extractSenderEmail() {
  // Gmail sender email is usually in a span with email attribute or data-hovercard-id
  const senderElement = document.querySelector('[email]') ||
                        document.querySelector('[data-hovercard-id*="@"]');

  if (senderElement) {
    return senderElement.getAttribute('email') ||
           senderElement.getAttribute('data-hovercard-id');
  }

  // Try the From field
  const fromField = document.querySelector('.gD');
  if (fromField) {
    return fromField.getAttribute('email');
  }

  return null;
}

// Inject the analyze button into Gmail toolbar
function injectAnalyzeButton() {
  // Don't inject if already exists
  if (document.getElementById('scopeshield-analyze-btn')) {
    return;
  }

  // Find Gmail's toolbar (the action buttons area)
  const toolbars = document.querySelectorAll('.iH > div, .ade');

  if (toolbars.length === 0) {
    // Try alternative: inject floating button
    injectFloatingButton();
    return;
  }

  const toolbar = toolbars[0];
  const button = createAnalyzeButton();
  toolbar.appendChild(button);
  buttonInjected = true;
}

// Create floating button as fallback
function injectFloatingButton() {
  if (document.getElementById('scopeshield-floating-btn')) {
    return;
  }

  const floatingBtn = document.createElement('div');
  floatingBtn.id = 'scopeshield-floating-btn';
  floatingBtn.innerHTML = `
    <button class="scopeshield-btn scopeshield-btn-floating" title="Analyze with ScopeShield">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Check Scope</span>
    </button>
  `;

  floatingBtn.querySelector('button').addEventListener('click', handleAnalyzeClick);
  document.body.appendChild(floatingBtn);
}

// Create the analyze button element
function createAnalyzeButton() {
  const container = document.createElement('div');
  container.id = 'scopeshield-analyze-btn';
  container.className = 'scopeshield-toolbar-container';

  container.innerHTML = `
    <button class="scopeshield-btn" title="Analyze for Scope Creep">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Check Scope</span>
    </button>
  `;

  container.querySelector('button').addEventListener('click', handleAnalyzeClick);
  return container;
}

// Handle analyze button click
async function handleAnalyzeClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const button = e.currentTarget;
  const originalContent = button.innerHTML;

  // Show loading state
  button.disabled = true;
  button.innerHTML = `
    <svg class="scopeshield-spinner" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-linecap="round"/>
    </svg>
    <span>Analyzing...</span>
  `;

  try {
    // Extract email content
    const message = extractEmailContent();
    const senderEmail = extractSenderEmail();

    if (!message) {
      showNotification('Please open an email to analyze', 'error');
      button.disabled = false;
      button.innerHTML = originalContent;
      return;
    }

    // Send to background script for analysis
    const response = await chrome.runtime.sendMessage({
      action: 'analyze',
      data: {
        message,
        senderEmail
      }
    });

    if (response.error) {
      showNotification(response.error, 'error');
    } else {
      showNotification('Analysis complete! Check the side panel.', 'success');
      // Side panel will be opened by background script
    }
  } catch (error) {
    showNotification('Failed to analyze. Please try again.', 'error');
    console.error('ScopeShield analysis error:', error);
  }

  button.disabled = false;
  button.innerHTML = originalContent;
}

// Show notification toast
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.getElementById('scopeshield-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'scopeshield-notification';
  notification.className = `scopeshield-notification scopeshield-notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.classList.add('scopeshield-notification-hide');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add context menu for selected text
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 50) {
    // Show quick analyze option for selected text
    showQuickAnalyzePopup(e, selection);
  }
});

// Quick analyze popup for selected text
function showQuickAnalyzePopup(e, text) {
  // Remove existing popup
  const existing = document.getElementById('scopeshield-quick-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'scopeshield-quick-popup';
  popup.className = 'scopeshield-quick-popup';
  popup.style.left = `${e.pageX}px`;
  popup.style.top = `${e.pageY + 10}px`;

  popup.innerHTML = `
    <button class="scopeshield-quick-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Analyze Selection
    </button>
  `;

  popup.querySelector('button').addEventListener('click', async () => {
    popup.remove();

    const response = await chrome.runtime.sendMessage({
      action: 'analyze',
      data: {
        message: text.substring(0, 5000),
        senderEmail: extractSenderEmail()
      }
    });

    if (response.error) {
      showNotification(response.error, 'error');
    } else {
      showNotification('Analysis complete!', 'success');
    }
  });

  document.body.appendChild(popup);

  // Remove popup on click outside
  setTimeout(() => {
    document.addEventListener('click', function removePopup(event) {
      if (!popup.contains(event.target)) {
        popup.remove();
        document.removeEventListener('click', removePopup);
      }
    });
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
