document.addEventListener('DOMContentLoaded', () => {
  const viewSavedNotesButton = document.getElementById('viewSavedNotes');

  viewSavedNotesButton.addEventListener('click', () => {
    chrome.tabs.create({url: 'management.html'});
  });
});
