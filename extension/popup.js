const captureBtn = document.getElementById("captureBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const sourceUrl = document.getElementById("sourceUrl");
const meta = document.getElementById("meta");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function captureVisibleText() {
  const text = document.body.innerText || "";
  return {
    sourceUrl: location.href,
    capturedAt: new Date().toISOString(),
    title: document.title,
    text: text.replace(/\n{3,}/g, "\n\n").trim(),
  };
}

captureBtn.addEventListener("click", async () => {
  setStatus("正在擷取目前頁面...");
  copyBtn.disabled = true;

  try {
    const tab = await getActiveTab();
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: captureVisibleText,
    });

    const payload = result.result;
    const textLength = payload.text.length;
    sourceUrl.textContent = payload.sourceUrl;
    meta.textContent = `${payload.title || "未命名頁面"} · ${textLength.toLocaleString()} 字元`;
    output.value = JSON.stringify(payload, null, 2);
    copyBtn.disabled = textLength === 0;
    setStatus(textLength ? "擷取完成，可以複製後貼到 Rent Unfiltered。" : "擷取完成，但這個頁面沒有可見文字。");
  } catch (error) {
    setStatus("擷取失敗。請確認目前分頁是一般網頁，不是 Chrome 設定頁或擴充功能頁。");
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("已複製擷取資料。");
  } catch (error) {
    output.select();
    document.execCommand("copy");
    setStatus("已複製擷取資料。");
  }
});
