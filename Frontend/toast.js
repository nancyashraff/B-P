function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${type === 'success' ? '✓' : '✕'}</div>
    <span class="toast-message">${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('toast-show'), 10);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Backwards-compatible alias used across the codebase
function showPopup(message, type = 'success') {
  showToast(message, type);
}