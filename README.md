# Rent Unfiltered

Rent Unfiltered 是一個租屋資訊透明化 MVP。專案會把租屋資訊整理成 RHIR 結構，保留欄位來源、揭露狀態與版本紀錄，並用 RRI 輔助使用者理解租屋風險。

## 專案簡介

租屋資訊常常分散在平台頁面、房東說法、看房筆記和截圖裡。很多重要條件不一定會被清楚揭露，例如能不能報稅、能不能遷戶籍、押金怎麼退、水電費怎麼算、消防與逃生是否安全。

Rent Unfiltered 想做的不是替使用者決定要不要租，而是把資訊攤開，讓使用者更容易看懂一間房子的條件與風險。

目前 MVP 主要包含：

- **租屋表單**：把房源資訊整理成固定欄位。
- **RHIR**：把表單轉成 Rental Housing Information Record，保留欄位值、揭露狀態與資料來源。
- **版本紀錄**：同一物件可以建立初始版本與補件子版本，方便追蹤資訊如何被補齊。
- **RRI**：用 Rental Risk Index 輔助判讀租屋風險，並標示不確定性。
- **AI 分析報告**：以 RHIR 與 RRI 為基礎，產生比較有脈絡的租屋風險說明；正式站可透過 Vercel 後端代理使用 OpenRouter。
- **Chrome 擴充插件 Demo**：從租屋頁面擷取可見文字，送回表單作為預填資料。

這是一個比賽型 MVP，重點是驗證「租屋資訊透明化」的流程是否能被清楚呈現。它不是法律認定工具，也不是簽約保證，比較像是一個租屋資訊整理與風險輔助閱讀工具。

## 進入網站後可以看什麼

網站內已經放了幾個適合第一次使用者閱讀的頁面：

- **首頁**：查看目前的租屋紀錄、欄位完整度、RRI 狀態與版本資訊。
- **新增租屋資訊**：建立新的租屋表單，送出後會轉成 RHIR 紀錄。
- **專案導引**：用比較短的方式說明專案動機、問題、解法與 MVP 定位。
- **擴充插件**：查看 Chrome 擴充插件的安裝方式、使用方式與下載說明。
- **名詞解釋**：理解 RHIR、RRI、`disclosureStatus`、`sourceType` 等專案核心名詞。
- **資料庫**：查看 Supabase 上傳與管理頁雛形。

如果只是想快速理解專案，建議順序是：

1. 先看 **專案導引**。
2. 回到 **首頁**，點一筆租屋紀錄看詳細頁。
3. 到 **新增租屋資訊** 建立一筆測試資料。
4. 再看 **名詞解釋** 與 **擴充插件**。

## 快速啟動

```bash
npm install
npm run dev
```

開啟：

```text
http://127.0.0.1:5500
```

## AI Insight 設定

正式部署站的 AI Insight 會優先使用 Vercel 環境變數 `OPENROUTER_API_KEY`。這樣評審或訪客不需要在瀏覽器貼 API Key，也能按下「生成 AI Insight」測試報告。

本機開發時，如果沒有 Vercel 函式環境，也可以從右上角設定視窗貼入自己的 OpenRouter API Key；該設定只會存在目前瀏覽器的 `localStorage`。

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

1. 開啟任一租屋頁面。
2. 確認 Rent Unfiltered 正式網站可開啟：`https://rent-unfiltered.vercel.app`。
3. 點 Chrome 工具列的 `Rent Unfiltered Capture`。
4. 按「擷取目前頁面」。
5. 確認文字有抓到後，按「送到 Rent Unfiltered」。
6. Rent Unfiltered 會開啟新增表單，並把可辨識欄位先預填。

### 目前限制

- 這是 demo 安裝方式，需要使用者開啟 Chrome 開發人員模式。
- 目前插件送回網址是正式部署站：`https://rent-unfiltered.vercel.app`。
- 正式給一般使用者前，仍建議上架 Chrome Web Store。
- 插件只擷取使用者主動點擊時該頁面的可見文字，不會自動背景追蹤瀏覽內容。

## 正式公開下載的方向

短期 demo 可以把 zip 放在 GitHub Release、雲端硬碟或專案頁面，讓測試者下載後手動安裝。

正式產品建議上架 Chrome Web Store。通過審核後，使用者就能直接按「加到 Chrome」，不用手動解壓縮或開發人員模式。
