# Rent Unfiltered 專案 Git 大事記

更新日期：2026-05-16

## 文件目的

這份文件用來讓新加入的組員快速理解：

- 專案最近做了哪些重要變更
- 每次變更大致發生在什麼時間點
- 變更屬於哪一種類型
- 目前專案狀態走到哪裡

原則：

- 依時間排序
- 同一個時間點只記一種類型的變更
- 不把文件、UI、RHIR、設定功能混寫在同一段

---

## 2026-05-12 16:51

### 類型：文件整理

commit：`d80516c`  
message：`docs: add MVP processing flow diagram`

本次重點：

- 新增 MVP 流程相關文件
- 補上處理流程圖，幫助團隊對齊資料流與頁面流程

影響：

- 專案開始有較清楚的文件化脈絡
- 後續 UI 與 RHIR 設計有共同參考基準

---

## 2026-05-12 16:59

### 類型：文件命名整理

commit：`6a1a032`  
message：`docs: align filenames with local workspace`

本次重點：

- 調整文件命名
- 讓 repo 內文件名稱與本地工作區名稱一致

影響：

- 降低文件混亂
- 後續引用文件時比較不容易指錯檔案

---

## 2026-05-12 18:22

### 類型：MVP UI 原型

commit：`78c2441`  
message：`feat: add MVP UI prototype`

本次重點：

- 建立 MVP 前端原型
- 初步具備首頁、表單、詳細頁等核心畫面骨架

影響：

- 專案從純文件進入可操作的畫面原型階段
- 後續 RHIR、版本管理、分析報告功能可以掛到既有頁面上

---

## 2026-05-12 18:31

### 類型：部署入口

commit：`57a3134`  
message：`chore: add static entrypoint for Vercel`

本次重點：

- 補上部署所需的靜態入口設定

影響：

- 專案可更順利部署到 Vercel
- 前端展示與測試流程更穩定

---

## 2026-05-12 18:57

### 類型：RHIR 規格頁面

commit：`2aa4d0e`  
message：`feat: add RHIR spec page`

本次重點：

- 新增 RHIR 規格展示頁
- 讓使用者與評審可以直接在產品中查看 RHIR 概念

影響：

- RHIR 不再只存在於文件
- 專案的資料標準開始有前台展示入口

---

## 2026-05-13 14:45

### 類型：導覽與說明頁

commit：`2596b2d`  
message：`Add project guide and glossary pages`

本次重點：

- 新增 `專案導引`
- 新增 `名詞解釋`
- `名詞解釋` 下整理 `RHIR 規格` 與 `RRI 指標`

影響：

- 評審或新組員進站後更容易理解專案
- 專案導覽從「功能展示」擴充成「可閱讀理解」

---

## 2026-05-13 14:53

### 類型：設定功能

commit：`8594357`  
message：`Add settings modal for API key`

本次重點：

- 新增頂部選單設定按鈕
- 新增 API Key 設定 modal
- 設定值會儲存在 `localStorage`

影響：

- 後續若接 AI 或外部 API，前端已有基本設定入口
- 目前屬於基礎設施，尚未直接接上 RHIR 生成流程

---

## 2026-05-13 14:59

### 類型：測試輔助工具

commit：`b881085`  
message：`Add random rental form generator`

本次重點：

- 新增 `一鍵隨機生成`
- 可快速灌入測試用租屋表單資料

影響：

- 方便快速測 UI
- 方便測 RHIR 轉換與版本建立流程

---

## 2026-05-13 15:36

### 類型：RHIR 整合 Batch 1

commit：`9494768`  
message：`Align MVP fields with RHIR batch 1`

本次重點：

- 進行第一批欄位名稱對齊
- 以 RHIR 正式欄位命名為主，修正表單與 demo RHIR 的 key

代表性調整：

- `cost.rent` → `cost.monthlyRent`
- `property.sizePing` → `property.areaPing`
- `cost.mgmtFee` → `cost.managementFee`
- `property.petAllowed` → `leaseTerms.petsAllowed`

影響：

- RHIR 與 MVP 表單開始正式收斂
- 後續語意轉換與 schema 整理有了穩定基礎

---

## 2026-05-13 15:48

### 類型：RHIR 整合 Batch 2

commit：`7217953`  
message：`Align MVP fields with RHIR batch 2`

本次重點：

- 處理反向布林與語意轉換
- 把負向欄位改為 RHIR 正向語意

代表性調整：

- `rights.forbidsTaxFiling` → `leaseTerms.taxRegistrationAllowed`
- `rights.forbidsHouseholdRegistration` → `leaseTerms.householdRegistrationAllowed`

影響：

- RHIR 欄位語意更一致
- 之後做報告、規則判讀時比較不容易出現布林反向錯誤

---

## 2026-05-13 17:14

### 類型：RHIR 整合 Batch 3

commit：`a4fd387`  
message：`Align MVP fields with RHIR batch 3`

本次重點：

- 正式整理 RHIR top-level block
- schema 加入 `safety`、`rights`
- 補齊規範中未明列、但 MVP 實際使用中的欄位

代表性補齊：

- `property.buildingType`
- `property.hasFurniture`
- `leaseTerms.hasWrittenContract`
- `leaseTerms.reviewPeriod`
- `leaseTerms.notes`
- `cost.electricityRate`
- `cost.eligibleForSubsidy`

影響：

- 表單、demo RHIR、schema、RHIR 規範完成同一輪收斂
- RHIR 已不只是展示概念，而是能支撐 MVP 欄位結構的正式資料格式

---

## 2026-05-13 17:58

### 類型：表單建立版本功能

commit：`d35f85b`  
message：`Add RHIR preview and form version creation`

本次重點：

- `建立版本 X` 按鈕正式生效
- 表單可直接一一對應轉成 RHIR JSON
- 新增 `RHIR 預覽` 按鈕
- 建立版本後會寫入本地資料並跳到詳細頁

這一版的特性：

- 不需要 AI 介入
- 先用純表單值對應 RHIR
- 適合 MVP 展示、評審 demo、測試版本流程

影響：

- 專案從「靜態 RHIR 展示」進一步變成「可由表單真實產生 RHIR」
- 版本建立流程已經打通最小可用版本

---

## 2026-05-16

### 類型：擴充匯入與補件流程

代表 commits：

- `16c3df9`：`Add RHIR preview download flow`
- `ddabb0c`：`Add Chrome capture extension prototype`
- `59ec68e`：`Add capture ID import flow`
- `ae6c0d4`：`Improve imported district detection`
- `27d1ad7`：`Keep unknown imported fields missing`
- `2e8b025`：`Add RHIR followup question guidance`
- `e24802a`：`Add 一鍵補齊: 10 lease templates + fill-missing handler`
- `3983781`：`Add 一鍵補齊 button to RHIR preview modal followup section`
- `24e707e`：`Wire form page for sub-version edit + per-field pencil navigation`
- `9b429e3`：`Fix fill-missing gap + sub-versions append + custom version name`

本次重點：

- 建立 Chrome 擴充功能雛形，可從租屋頁面擷取資訊
- 新增匯入 ID 流程，讓表單可以載入擴充功能抓到的租屋文字
- 改善匯入資料的行政區判斷
- 不確定的欄位維持 `missing`，避免系統硬猜造成誤導
- RHIR 預覽加入下載流程與待追問欄位提示
- 新增一鍵補齊空白欄位，並支援 10 種租約模板
- 支援從詳細頁指定欄位回到表單補件
- 子版本可追加到原紀錄，並支援自訂版本名稱

影響：

- 使用者不只可以手填資料，也可以從租屋頁面擷取資訊後再補件
- RHIR 從一次性建立，擴充成「匯入、追問、補件、建立子版本」的流程
- 專案開始更接近真實租屋判斷場景，而不是單純表單 demo

---

## 2026-05-16

### 類型：資料庫與雲端保存雛形

commit：`8bae795`
message：`Add Phase 2.5: Supabase upload + admin page`

本次重點：

- 新增 Supabase 上傳相關流程
- 新增管理頁面雛形
- 開始把本地資料流程往雲端保存方向推進

影響：

- 專案不再只停留在純前端 localStorage 概念
- 後續若要做正式多人資料、審核或管理功能，已有雛形入口

---

## 2026-05-16

### 類型：RRI 風險分數與 AI 分析報告

代表 commits：

- `f3d7974`：`Add RRI scoring engine with uncertainty range output`
- `afb05eb`：`Add Layer 2 template conclusion + Layer 3 AI Insight stub`
- `a00363f`：`Wire AI Insight to OpenRouter (test only)`
- `254ae88`：`Switch model to deepseek-v4-pro + make form stats live`
- `4b3fed2`：`Add AI consultant chat grounded in RRI result`
- `84bb9c8`：`docs: add RRI analysis report plan`

本次重點：

- 新增 RRI 風險分數引擎
- 風險結果加入不確定性範圍，避免把缺漏資訊誤判成絕對結論
- 建立分析報告分層概念：RRI 分數、模板結論、AI Insight
- 串接 OpenRouter 測試 AI Insight
- 切換模型設定至 `deepseek-v4-pro`
- 新增以 RRI 結果為基礎的 AI 顧問對話
- 補上 RRI 與分析報告實踐計畫文件

影響：

- 專案從「整理租屋資料」進一步走向「解釋租屋風險」
- AI 不再只是泛泛聊天，而是被約束在 RRI 結果與 RHIR 資料脈絡中
- 評審展示時可以說明：分數、原因、缺漏、不確定性與建議如何一起產生

---

## 2026-05-16

### 類型：安全性與設定清理

commit：`0af67fc`
message：`fix: remove hardcoded OpenRouter key`

本次重點：

- 移除硬編碼的 OpenRouter API key
- 改為從使用者本機設定讀取 API key
- 重新整理 Git 歷史後推送，避免敏感金鑰留在遠端紀錄中

影響：

- 降低 API key 外洩風險
- 專案更接近可公開展示與協作的安全狀態

---

## 2026-05-16

### 類型：MVP 文件與功能盤點

代表 commits：

- `a46bb1a`：`docs: add post-MVP feature inventory`
- `6e80030`：`docs: move post-MVP inventory to MVP spec`

本次重點：

- 整理目前已超出原始 MVP 的功能
- 依使用者要求，將額外功能盤點移到 MVP 穩健版本的最後面
- 保留「MVP 已規劃但尚未完成」與「已超出 MVP 的功能」之間的差異

影響：

- 文件更貼近目前真實專案狀態
- 後續決定比賽展示範圍時，比較不會把 MVP、穩健版、決賽版混在一起

---

## 2026-05-16

### 類型：表單驗證、匯入解析與 RHIR 命名一致

代表 commits：

- `a4bcebe`：`feat: validate form inputs and align source type`
- `29a541c`：`chore: ignore Claude worktrees`
- `6d75f94`：`fix: complete form validation and capture parsing`
- `66b8250`：`docs: align source type naming`

本次重點：

- 表單新增提交前阻擋式驗證
- 錯誤欄位會以紅框與提示文字呈現
- 表單送出前會檢查必填、選項值、資料型別與樓層邏輯
- 改善匯入房源文字解析，可辨識押金、水費、管理費、網路費、電費與家具狀態
- 將 RHIR 的 `sourceType` 命名統一為 `user_input`
- JSON Schema 與人類可讀規範同步移除舊名稱 `manualInput`
- 忽略 `.claude/worktrees/`，避免工具產物被誤提交

影響：

- 表單資料品質更穩，不會把明顯錯誤的欄位直接寫入 RHIR
- 文件、程式與 schema 對 `sourceType` 的命名一致
- Git 歷史被整理成較清楚的功能提交，不再讓未提交工作留在本機

---

## 目前專案狀態摘要

### 已完成

- MVP 前端原型
- 專案導引與名詞解釋
- API Key 設定入口
- 一鍵隨機生成測試資料
- RHIR 與 MVP 欄位三批整合
- 表單直接轉 RHIR JSON
- 建立版本後進入詳細頁查看內容
- Chrome 擴充匯入雛形
- RHIR 預覽下載與待追問提示
- 一鍵補齊空白欄位
- 子版本補件與版本歷史追加
- RRI 風險分數引擎
- AI 分析報告與 AI 顧問對話雛形
- Supabase 上傳與管理頁雛形
- 表單提交前阻擋式驗證
- RHIR `sourceType` 命名與 schema 對齊

### 目前仍屬前端本地流程

- 主要版本資料目前仍以本地 `localStorage` 為主
- Supabase 目前屬雛形整合，尚未取代完整資料流程
- 尚未接正式 RHIR API
- AI 分析已可測試，但仍需要正式金鑰、錯誤處理與產品化流程

### 建議新組員先看的文件

- `docs/Rent-Unfiltered-MVP版本規格.md`
- `docs/RHIR-整合MVP計畫.md`
- `docs/RHIR/RHIR-v0.1-人類可讀規範.md`
- `docs/RRI/RRI與分析報告實踐計畫.md`
- 本文件 `docs/專案Git大事記.md`
