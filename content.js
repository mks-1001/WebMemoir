// Global variable to store the selected text
let selectedText = '';

// Function to get the currently selected text
function getSelectedText() {
  return window.getSelection().toString();
}

// Function to handle opening the popup
function handleOpenPopup(selectedText) {
  // You can implement custom behavior here if needed
  // For example, you could highlight the selected text on the page
  console.log('Popup opened with selected text:', selectedText);
}

// Function to handle messages from the background script or popup
function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case 'getSelectedText':
      sendResponse({ selectedText: getSelectedText() });
      break;
    case 'openPopup':
      handleOpenPopup(request.selectedText);
      break;
    default:
      console.log('Unknown action:', request.action);
  }
}

// Add event listener for text selection
document.addEventListener('mouseup', () => {
  selectedText = getSelectedText();
});

// Add message listener
chrome.runtime.onMessage.addListener(handleMessage);

// Optional: Add custom styles for highlighting (if you decide to implement this feature)
function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .web-text-saver-highlight {
      background-color: yellow;
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);
}

// Call this function when the content script loads
addCustomStyles();

// Optional: Function to highlight text (if you decide to implement this feature)
function highlightText(text) {
  if (!text) return;

  const range = window.getSelection().getRangeAt(0);
  const span = document.createElement('span');
  span.className = 'web-text-saver-highlight';
  range.surroundContents(span);
}

// Optional: Function to remove highlights (if you decide to implement this feature)
function removeHighlights() {
  const highlights = document.querySelectorAll('.web-text-saver-highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    parent.removeChild(highlight);
  });
}
