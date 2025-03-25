let popupData = {};
// 从popup接收并转发到content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.from === "popup" && request.to === "content") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      console.log("tabs: ==》", tabs);
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      if (!tabs || tabs.length === 0) {
        console.error("No active tab found");
        return;
      }

      const activeTab = tabs[0];
      if (!activeTab?.id) {
        console.error("Active tab has no ID");
        return;
      }

      chrome.tabs.sendMessage(activeTab?.id, request);
    });
  }

  // 从content script接收并转发到popup
  if (request.from === "content" && request.to === "popup") {
    chrome.runtime.sendMessage({
      from: "content",
      to: "popup",
      data: request.data,
    });
  }

  // 从popup接收到background
  if (request.from === "popup" && request.to === "background") {
    let data = request.data;
    if (data.key === "save_data") {
      popupData = {
        ...popupData,
        ...data.data,
      };
    } else if (data.key === "get_data") {
      sendResponse(popupData);
    }
  }
  // 从popup接收到background
  if (request.from === "content" && request.to === "background") {
    let data = request.data;
    if (data.key === "save_data") {
      popupData = {
        ...popupData,
        ...data.data,
      };
    } else if (data.key === "get_data") {
      sendResponse(popupData);
    }
  }
});
