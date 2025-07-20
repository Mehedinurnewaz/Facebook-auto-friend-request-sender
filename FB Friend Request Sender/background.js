let currentTabId = null;
let runningProcess = false;

async function startProcess() {
  if (runningProcess) return; // Prevent overlapping calls
  runningProcess = true;

  const {
    uidList,
    delay,
    running,
    successList = [],
    failedList = []
  } = await chrome.storage.local.get([
    "uidList",
    "delay",
    "running",
    "successList",
    "failedList"
  ]);

  if (!running || !uidList || uidList.length === 0) {
    chrome.storage.local.set({ running: false }); // Auto stop when finished
    runningProcess = false;
    return;
  }

  const uid = uidList[0];
  const url = `https://facebook.com/profile.php?id=${uid}`;

  try {
    if (!currentTabId) {
      const tab = await chrome.tabs.create({ url, active: false });
      currentTabId = tab.id;
    } else {
      try {
        await chrome.tabs.get(currentTabId);
        await chrome.tabs.update(currentTabId, { url });
      } catch (e) {
        const tab = await chrome.tabs.create({ url, active: false });
        currentTabId = tab.id;
      }
    }

    setTimeout(async () => {
      let success = false;

      try {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: currentTabId },
          func: () => {
            const btn = Array.from(document.querySelectorAll('span, button'))
              .find(el => el.textContent.trim().toLowerCase() === 'add friend');
            if (btn) {
              btn.click();
              return true;
            }
            return false;
          }
        });

        success = result;
      } catch (e) {
        console.warn("Script error:", e.message);
      }

      const newList = uidList.slice(1);
      const updatedSuccess = success ? [...successList, uid] : successList;
      const updatedFailed = !success ? [...failedList, uid] : failedList;

      await chrome.storage.local.set({
        uidList: newList,
        successList: updatedSuccess,
        failedList: updatedFailed
      });

      runningProcess = false;
      // Delay before next call
      if (running) {
        setTimeout(startProcess, delay * 1000);
      }
    }, 5000);

  } catch (err) {
    console.error("Execution failed:", err.message);
    runningProcess = false;
  }
}

// Start polling loop removed

// Instead, listen to changes in running flag and start once
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.running) {
    if (changes.running.newValue === true) {
      startProcess();
    }
  }
});
