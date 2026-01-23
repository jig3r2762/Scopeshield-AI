// ScopeShield AI - Side Panel Script

const API_BASE_URL = 'https://scopeshield-ai.vercel.app';

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthAndLoadData();
  setupEventListeners();

  // Listen for storage changes (new analysis)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.latestAnalysis) {
      displayAnalysis(changes.latestAnalysis.newValue);
    }
  });
});

async function checkAuthAndLoadData() {
  const { apiToken } = await chrome.storage.sync.get(['apiToken']);

  if (!apiToken) {
    showSection('not-auth-section');
    return;
  }

  // Load projects for linking
  await loadProjects();

  // Check for existing analysis
  const { latestAnalysis, analyzedAt } = await chrome.storage.local.get(['latestAnalysis', 'analyzedAt']);

  if (latestAnalysis && analyzedAt) {
    const age = Date.now() - analyzedAt;
    if (age < 3600000) { // Less than 1 hour old
      displayAnalysis(latestAnalysis);
      return;
    }
  }

  showSection('no-analysis-section');
}

function showSection(sectionId) {
  ['not-auth-section', 'no-analysis-section', 'analysis-section'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function displayAnalysis(analysis) {
  showSection('analysis-section');

  // Set risk badge
  const badge = document.getElementById('risk-badge');
  badge.className = 'risk-badge';

  const riskLabel = document.querySelector('.risk-label');
  const riskConfidence = document.querySelector('.risk-confidence');

  switch (analysis.riskLevel) {
    case 'LIKELY_IN_SCOPE':
      badge.classList.add('risk-low');
      riskLabel.textContent = 'Within Scope';
      break;
    case 'POSSIBLY_SCOPE_CREEP':
      badge.classList.add('risk-medium');
      riskLabel.textContent = 'Potential Scope Creep';
      break;
    case 'HIGH_RISK_SCOPE_CREEP':
      badge.classList.add('risk-high');
      riskLabel.textContent = 'Likely Outside Scope';
      break;
  }

  riskConfidence.textContent = `${analysis.confidenceScore}% confidence`;

  // Set reasoning
  document.getElementById('analysis-reasoning').textContent = analysis.reasoning;

  // Set replies
  const repliesSection = document.getElementById('replies-section');
  const repliesContainer = document.getElementById('replies-container');

  if (analysis.replies && analysis.replies.length > 0) {
    repliesSection.classList.remove('hidden');
    repliesContainer.innerHTML = analysis.replies.map(reply => createReplyCard(reply)).join('');

    // Add copy event listeners
    repliesContainer.querySelectorAll('.reply-copy-btn').forEach(btn => {
      btn.addEventListener('click', handleCopyReply);
    });
  } else {
    repliesSection.classList.add('hidden');
  }

  // Set timestamp
  document.getElementById('analysis-time').textContent = 'Just now';

  // Add to history
  addToHistory(analysis);
}

function createReplyCard(reply) {
  const typeClass = {
    'POLITE_BOUNDARY': 'boundary',
    'PAID_ADDON': 'addon',
    'NEGOTIATION_FRIENDLY': 'negotiate'
  }[reply.type] || 'boundary';

  const typeLabel = {
    'POLITE_BOUNDARY': 'Polite Boundary',
    'PAID_ADDON': 'Paid Add-on',
    'NEGOTIATION_FRIENDLY': 'Negotiation'
  }[reply.type] || reply.type;

  return `
    <div class="reply-card" data-content="${escapeHtml(reply.content)}">
      <div class="reply-header">
        <span class="reply-type reply-type-${typeClass}">${typeLabel}</span>
        <button class="reply-copy-btn" data-content="${escapeHtml(reply.content)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <p class="reply-content">${escapeHtml(reply.content)}</p>
    </div>
  `;
}

async function handleCopyReply(e) {
  const btn = e.currentTarget;
  const content = btn.dataset.content;

  try {
    await navigator.clipboard.writeText(content);

    const originalHTML = btn.innerHTML;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!
    `;
    btn.classList.add('copied');

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

async function loadProjects() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getProjects' });

    if (response.error) {
      console.error('Failed to load projects:', response.error);
      return;
    }

    const select = document.getElementById('project-select');
    select.innerHTML = '<option value="">Select a project...</option>';

    if (response.projects && response.projects.length > 0) {
      response.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

function addToHistory(analysis) {
  const historyList = document.getElementById('history-list');
  const emptyHistory = historyList.querySelector('.empty-history');
  if (emptyHistory) {
    emptyHistory.remove();
  }

  // Create history item
  const riskClass = {
    'LIKELY_IN_SCOPE': 'risk-low',
    'POSSIBLY_SCOPE_CREEP': 'risk-medium',
    'HIGH_RISK_SCOPE_CREEP': 'risk-high'
  }[analysis.riskLevel] || 'risk-low';

  const preview = analysis.clientMessage
    ? analysis.clientMessage.substring(0, 50) + (analysis.clientMessage.length > 50 ? '...' : '')
    : 'Analysis result';

  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <div class="history-risk-dot ${riskClass}"></div>
    <div class="history-content">
      <div class="history-preview">${escapeHtml(preview)}</div>
      <div class="history-time">Just now</div>
    </div>
  `;

  item.addEventListener('click', () => displayAnalysis(analysis));

  // Insert at the beginning
  historyList.insertBefore(item, historyList.firstChild);

  // Keep only last 10 items
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}

function setupEventListeners() {
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    await checkAuthAndLoadData();
  });

  // Link project button
  document.getElementById('link-project-btn').addEventListener('click', async () => {
    const projectId = document.getElementById('project-select').value;
    if (!projectId) {
      alert('Please select a project first');
      return;
    }

    const { latestAnalysis } = await chrome.storage.local.get(['latestAnalysis']);
    if (latestAnalysis && latestAnalysis.clientMessage) {
      // Re-analyze with project context
      const btn = document.getElementById('link-project-btn');
      btn.disabled = true;
      btn.textContent = 'Analyzing...';

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'analyze',
          data: {
            message: latestAnalysis.clientMessage,
            projectId
          }
        });

        if (response.error) {
          alert(response.error);
        }
      } catch (error) {
        console.error('Error re-analyzing:', error);
      }

      btn.disabled = false;
      btn.textContent = 'Link & Re-analyze';
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
