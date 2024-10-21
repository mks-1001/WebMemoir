let popupData = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveText",
    title: "Save Text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveText") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showSaveTextPopup",
          selectedText: info.selectionText,
          pageUrl: tabs[0].url
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
            // Try injecting the content script
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['storage.js', 'content-script.js']
            }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error injecting script:", chrome.runtime.lastError.message);
              } else {
                // Retry sending the message after injecting the script
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: "showSaveTextPopup",
                  selectedText: info.selectionText,
                  pageUrl: tabs[0].url
                });
              }
            });
          } else {
            console.log("Message sent successfully, response:", response);
          }
        });
      } else {
        console.error("No active tab found");
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPopupData") {
    sendResponse(popupData);
  }
});
