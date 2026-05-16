# Rent Unfiltered

Rent Unfiltered 是一個租屋資訊透明化 MVP。專案會把租屋資訊整理成 RHIR 結構，保留欄位來源、揭露狀態與版本紀錄，並用 RRI 輔助使用者理解租屋風險。

## 快速啟動

```bash
npm install
npm run dev
```

開啟：

```text
http://127.0.0.1:5500
```

## Chrome 擴充插件 Demo 版

專案內已準備好測試用擴充插件壓縮檔：

```text
downloads/rent-unfiltered-capture-extension-v0.1.0.zip
```

這個插件可以擷取目前租屋頁面的可見文字，並把資料送回 Rent Unfiltered 表單，讓使用者先匯入，再補齊 RHIR 欄位。

### 安裝方式

1. 下載 `rent-unfiltered-capture-extension-v0.1.0.zip`。
2. 解壓縮 zip。
3. 打開 Chrome，進入 `chrome://extensions`。
4. 開啟右上角「開發人員模式」。
5. 按「載入未封裝項目」。
6. 選擇解壓縮後、裡面有 `manifest.json` 的資料夾。
7. Chrome 工具列會出現 `Rent Unfiltered Capture`。

### 使用方式

1. 先確認 Rent Unfiltered 正在本機執行：`http://127.0.0.1:5500`。
2. 開啟任一租屋頁面。
3. 點 Chrome 工具列的 `Rent Unfiltered Capture`。
4. 按「擷取目前頁面」。
5. 確認文字有抓到後，按「送到 Rent Unfiltered」。
6. Rent Unfiltered 會開啟新增表單，並把可辨識欄位先預填。

### 目前限制

- 這是 demo 安裝方式，需要使用者開啟 Chrome 開發人員模式。
- 目前插件送回網址是本機測試用的 `http://127.0.0.1:5500`。
- 正式給一般使用者前，應改成正式部署網址，並上架 Chrome Web Store。
- 插件只擷取使用者主動點擊時該頁面的可見文字，不會自動背景追蹤瀏覽內容。

## 正式公開下載的方向

短期 demo 可以把 zip 放在 GitHub Release、雲端硬碟或專案頁面，讓測試者下載後手動安裝。

正式產品建議上架 Chrome Web Store。通過審核後，使用者就能直接按「加到 Chrome」，不用手動解壓縮或開發人員模式。
