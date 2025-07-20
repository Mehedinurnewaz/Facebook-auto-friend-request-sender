document.getElementById("startBtn").addEventListener("click", () => {
  const uids = document.getElementById("uidInput").value.trim().split("\n").filter(Boolean);
  const delay = parseInt(document.getElementById("delayInput").value);

  chrome.storage.local.set({
    uidList: uids,
    delay: delay,
    running: true,
    successList: [],
    failedList: []
  });

  document.getElementById("status").innerText = "Started...";
});

document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.storage.local.set({ running: false });
  document.getElementById("status").innerText = "Stopped.";
});

document.getElementById("showHistoryBtn").addEventListener("click", () => {
  chrome.storage.local.get(["successList", "failedList"], ({ successList, failedList }) => {
    const div = document.getElementById("history");
    div.innerHTML = `
      ✅ <b>Success (${successList?.length || 0})</b>:<br>${(successList || []).join("<br>")}<br><br>
      ❌ <b>Failed (${failedList?.length || 0})</b>:<br>${(failedList || []).join("<br>")}
    `;
  });
});
