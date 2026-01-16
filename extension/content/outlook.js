// ScopeShield AI - Outlook Content Script

let buttonInjected = false;

// Main initialization
function init() {
  observeEmailChanges();
  injectFloatingButton();
}

// Observe for email view changes
function observeEmailChanges() {
  const observer = new MutationObserver(() => {
    if (!buttonInjected) {
      injectFloatingButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Extract email content from Outlook
function extractEmailContent() {
  // Outlook Web uses different selectors
  const emailBody = document.querySelector('[aria-label="Message body"]') ||
                    document.querySelector('.XbIp4.jmmB7.GNqVo') ||
                    document.querySelector('[data-testid="message-body"]');

  if (emailBody) {
    const text = emailBody.innerText || emailBody.textContent;
    return text.trim().replace(/\s+/g, ' ').substring(0, 5000);
  }

  return null;
}

// Extract sender email from Outlook
function extractSenderEmail() {
  const senderElement = document.querySelector('[data-testid="sender-email"]') ||
                        document.querySelector('.OZZZK') ||
                        document.querySelector('[aria-label*="From:"]');

  if (senderElement) {
    // Try to extract email from the text or title
    const text = senderElement.textContent || senderElement.getAttribute('title') || '';
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : null;
  }

  return null;
}

// Inject floating button
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
  buttonInjected = true;
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
    const message = extractEmailContent();
    const senderEmail = extractSenderEmail();

    if (!message) {
      showNotification('Please open an email to analyze', 'error');
      button.disabled = false;
      button.innerHTML = originalContent;
      return;
    }

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
  const existing = document.getElementById('scopeshield-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'scopeshield-notification';
  notification.className = `scopeshield-notification scopeshield-notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('scopeshield-notification-hide');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
