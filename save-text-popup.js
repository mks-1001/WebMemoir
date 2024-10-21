function createSaveTextPopup(selectedText, pageUrl) {
  const popup = document.createElement('div');
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
      date: new Date().toISOString(),
      url: pageUrl
    };

    chrome.storage.sync.get('savedTexts', (data) => {
      const savedTexts = data.savedTexts || [];
      savedTexts.push(savedText);
      chrome.storage.sync.set({savedTexts: savedTexts}, () => {
        alert('Text saved successfully!');
        document.body.removeChild(popup);
      });
    });
  });

  closeButton.addEventListener('click', () => {
    document.body.removeChild(popup);
  });

  return popup;
}

document.addEventListener('DOMContentLoaded', () => {
    const textNameInput = document.getElementById('textName');
    const selectedTextArea = document.getElementById('selectedText');
    const notesTextArea = document.getElementById('notes');
    const saveButton = document.getElementById('saveButton');
    const closeButton = document.getElementById('closeButton');

    // Retrieve data passed from the background script
    chrome.runtime.sendMessage({action: "getPopupData"}, (response) => {
        selectedTextArea.value = response.selectedText;
        document.querySelector('input[name="pageUrl"]').value = response.pageUrl;
    });

    saveButton.addEventListener('click', () => {
        const savedText = {
            name: textNameInput.value,
            content: selectedTextArea.value,
            notes: notesTextArea.value,
            date: new Date().toISOString(),
            url: document.querySelector('input[name="pageUrl"]').value
        };

        chrome.storage.sync.get('savedTexts', (data) => {
            const savedTexts = data.savedTexts || [];
            savedTexts.push(savedText);
            chrome.storage.sync.set({savedTexts: savedTexts}, () => {
                alert('Text saved successfully!');
                window.close();
            });
        });
    });

    closeButton.addEventListener('click', () => {
        window.close();
    });
});
