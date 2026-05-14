# Rent Unfiltered 專案 Git 大事記

更新日期：2026-05-13

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

## 目前專案狀態摘要

### 已完成

- MVP 前端原型
- 專案導引與名詞解釋
- API Key 設定入口
- 一鍵隨機生成測試資料
- RHIR 與 MVP 欄位三批整合
- 表單直接轉 RHIR JSON
- 建立版本後進入詳細頁查看內容

### 目前仍屬前端本地流程

- 版本資料目前寫在本地 `localStorage`
- 尚未接後端資料庫
- 尚未接正式 RHIR API
- 尚未接 AI 自動補值或分析生成

### 建議新組員先看的文件

- `docs/Rent-Unfiltered-介面流程與UX草案.md`
- `docs/RHIR-整合MVP計畫.md`
- `docs/RHIR/RHIR-v0.1-人類可讀規範.md`
- 本文件 `docs/專案Git大事記.md`
