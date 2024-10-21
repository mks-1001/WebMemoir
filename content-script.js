let popup = null;
let saveTextForm = null;
let saveTextPopup = null;

console.log("Content script loaded");
console.log("Storage object available:", typeof storage !== 'undefined');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "showPopup") {
    showPopup(request.selectedText);
    sendResponse({status: "Popup shown"});
  } else if (request.action === "showSaveTextForm") {
    showSaveTextForm(request.selectedText, request.pageUrl);
  } else if (request.action === "showSaveTextPopup") {
    showSaveTextPopup(request.selectedText, request.pageUrl);
    sendResponse({status: "Popup shown"});
  }
  return true; // Indicates that the response is sent asynchronously
});

function showPopup(selectedText) {
  if (popup) {
    document.body.removeChild(popup);
  }

  popup = document.createElement('div');
  popup.className = 'web-text-saver-popup';
  popup.innerHTML = `
    <h2>Save Selected Text</h2>
    <label for="textName">Name for the Saved Text:</label>
    <input type="text" id="textName" placeholder="Enter a name for this text">
    
    <label for="selectedText">Selected Text:</label>
    <textarea id="selectedText" readonly></textarea>
    
    <label for="notes">Notes/Thoughts:</label>
    <textarea id="notes" placeholder="Add your notes here"></textarea>
    
    <button id="saveButton">Save</button>
    <button id="closeButton">Close</button>
  `;

  document.body.appendChild(popup);

  const textNameInput = popup.querySelector('#textName');
  const selectedTextArea = popup.querySelector('#selectedText');
  const notesTextArea = popup.querySelector('#notes');
  const saveButton = popup.querySelector('#saveButton');
  const closeButton = popup.querySelector('#closeButton');

  selectedTextArea.value = selectedText;

  saveButton.addEventListener('click', () => {
    const savedText = {
      name: textNameInput.value,
      content: selectedTextArea.value,
      notes: notesTextArea.value,
      date: new Date().toISOString()
    };

    chrome.storage.sync.get('savedTexts', (data) => {
      const savedTexts = data.savedTexts || [];
      savedTexts.push(savedText);
      chrome.storage.sync.set({savedTexts: savedTexts}, () => {
        alert('Text saved successfully!');
        document.body.removeChild(popup);
        popup = null;
      });
    });
  });

  closeButton.addEventListener('click', () => {
    document.body.removeChild(popup);
    popup = null;
  });
}

function showSaveTextForm(selectedText, pageUrl) {
  if (saveTextForm) {
    document.body.removeChild(saveTextForm);
  }

  saveTextForm = document.createElement('div');
  saveTextForm.className = 'web-text-saver-form';
  saveTextForm.innerHTML = `
    <h2>Save Selected Text</h2>
    <label for="textName">Name for the Saved Text:</label>
    <input type="text" id="textName" placeholder="Enter a name for this text">
    
    <label for="selectedText">Selected Text:</label>
    <textarea id="selectedText" readonly></textarea>
    
    <label for="notes">Notes/Thoughts:</label>
    <textarea id="notes" placeholder="Add your notes here"></textarea>
    
    <button id="saveButton">Save</button>
    <button id="closeButton">Close</button>
  `;

  document.body.appendChild(saveTextForm);

  const textNameInput = saveTextForm.querySelector('#textName');
  const selectedTextArea = saveTextForm.querySelector('#selectedText');
  const notesTextArea = saveTextForm.querySelector('#notes');
  const saveButton = saveTextForm.querySelector('#saveButton');
  const closeButton = saveTextForm.querySelector('#closeButton');

  selectedTextArea.value = selectedText;

  saveButton.addEventListener('click', () => {
    const savedText = {
      name: textNameInput.value,
      content: selectedTextArea.value,
      notes: notesTextArea.value,
      date: new Date().toISOString(),
      url: pageUrl
    };

    chrome.storage.sync.get('savedTexts', (data) => {
      const savedTexts = data.savedTexts || [];
      savedTexts.push(savedText);
      chrome.storage.sync.set({savedTexts: savedTexts}, () => {
        alert('Text saved successfully!');
        document.body.removeChild(saveTextForm);
        saveTextForm = null;
      });
    });
  });

  closeButton.addEventListener('click', () => {
    document.body.removeChild(saveTextForm);
    saveTextForm = null;
  });
}

function showSaveTextPopup(selectedText, pageUrl) {
  console.log("Showing save text popup");
  if (saveTextPopup) {
    document.body.removeChild(saveTextPopup);
  }

  saveTextPopup = document.createElement('div');
  saveTextPopup.className = 'web-text-saver-popup';
  saveTextPopup.innerHTML = `
    <h2>Save Selected Text</h2>
    <label for="textName">Name for the Saved Text:</label>
    <input type="text" id="textName" placeholder="Enter a name for this text">
    
    <label for="selectedText">Selected Text:</label>
    <div id="selectedText" contenteditable="true"></div>
    
    <label for="notes">Notes/Thoughts:</label>
    <textarea id="notes" placeholder="Add your notes here"></textarea>
    
    <label for="tags">Tags (comma-separated):</label>
    <input type="text" id="tags" placeholder="Enter tags">
    
    <button id="saveButton"><i class="fas fa-save"></i> Save</button>
    <button id="closeButton">Close</button>
  `;

  document.body.appendChild(saveTextPopup);

  const textNameInput = saveTextPopup.querySelector('#textName');
  const selectedTextDiv = saveTextPopup.querySelector('#selectedText');
  const notesTextArea = saveTextPopup.querySelector('#notes');
  const tagsInput = saveTextPopup.querySelector('#tags');
  const saveButton = saveTextPopup.querySelector('#saveButton');
  const closeButton = saveTextPopup.querySelector('#closeButton');

  selectedTextDiv.innerHTML = selectedText;

  saveButton.addEventListener('click', async () => {
    console.log("Save button clicked");
    const savedText = {
      name: textNameInput.value,
      content: selectedTextDiv.innerHTML,
      notes: notesTextArea.value,
      tags: tagsInput.value.split(',').map(tag => tag.trim()),
      date: new Date().toISOString(),
      url: pageUrl
    };
    console.log("Text to save:", savedText);

    try {
      console.log("Initializing storage");
      await storage.init();
      console.log("Storage initialized");
      console.log("Saving text");
      const result = await storage.saveText(savedText);
      console.log("Text saved successfully, result:", result);
      alert('Text saved successfully!');
      document.body.removeChild(saveTextPopup);
      saveTextPopup = null;
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Failed to save text. Please try again.');
    }
  });

  closeButton.addEventListener('click', () => {
    document.body.removeChild(saveTextPopup);
    saveTextPopup = null;
  });
}

// Add this line to check if the content script is loaded
console.log("Web Text Saver content script loaded");
