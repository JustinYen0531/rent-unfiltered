# RHIR 整合 MVP 計畫

更新日期：2026-05-13

## 文件目的

這份文件用來記錄 Rent Unfiltered 在「以 RHIR 規範為主」的整合路線下，如何逐步把：

- MVP 表單欄位
- demo RHIR
- RHIR schema
- RHIR 人類可讀規範

收斂成同一套正式資料命名與結構。

目前採用原則：

- RHIR 是正式資料標準
- 表單欄位配合 RHIR
- 不一次全改完，而是分三個批次處理

## RHIR 交付策略

RHIR 的長期方向可以參考 FHIR 的概念，也就是把資料整理成標準格式後，進一步支援伺服器上傳、查詢、交換與版本管理。

但在 Rent Unfiltered 的 MVP 階段，不需要一開始就做到完整的「RHIR Server」或標準 API。

MVP 目前先採用的策略是：

- 使用者輸入或整理租屋資訊
- 系統將資料轉成 RHIR JSON
- 使用者可在畫面上預覽 RHIR
- 使用者可下載並保存 `.json` 檔案
- 系統可根據 RHIR 產生透明度分析報告

這代表 RHIR 在第一階段先作為「可攜式租屋資料檔」存在，先驗證資料整理、欄位收斂、分析輸出與可讀性是否成立。

## RHIR 發展階段

### Phase 1：Local RHIR / File-based RHIR

這是目前 MVP 應優先完成的範圍。

功能重點：

- 建立租屋紀錄
- 轉成 RHIR JSON
- 在畫面查看 RHIR
- 下載 RHIR JSON
- 依 RHIR 生成分析報告

此階段先不要求：

- RHIR Server
- 標準 API 查詢
- 多使用者共享交換
- 完整資料庫版本管理

### Phase 2：App Storage / Project Database

當 RHIR 結構穩定後，可進入第二階段，把 RHIR 從單一檔案提升為 App 內可管理的紀錄。

可擴充方向：

- 使用者建立與保存多筆租屋紀錄
- 每筆紀錄管理 `X`、`X-1`、`X-2` 等版本
- 可重新開啟、編輯、比較與保存分析報告
- 導入資料庫或後端儲存

### Phase 3：RHIR Server / API

第三階段才是最接近 FHIR 的做法。

可擴充方向：

- `POST /rhir-records`
- `GET /rhir-records/:id`
- `PUT /rhir-records/:id`
- `GET /rhir-records/:id/versions`
- `POST /rhir-records/:id/analyze`

此時 RHIR 才會成為真正可被其他系統上傳、查詢、交換與版本管理的資料標準。

## 未來可擴充方向：瀏覽器插件擷取

除了手動填表與貼上文字之外，未來也可發展瀏覽器插件，讓使用者在自己正在瀏覽的租屋頁面上，主動擷取公開資訊並送入 Rent Unfiltered。

這個方向的核心原則是：

- 由使用者主動觸發
- 只處理使用者當前可見的頁面內容
- 不進行平台級批量爬取
- 不繞過登入、反爬機制或存取限制

預期流程：

- 使用者打開租屋平台、社團貼文或文字頁面
- 點擊瀏覽器插件按鈕
- 插件擷取目前頁面的可見文字
- 針對租屋關鍵資訊做初步過濾與整理
- 將整理後的 raw text 送入 Rent Unfiltered parser
- 轉成 RHIR JSON 與分析報告

此方向的價值：

- 比後端大量爬蟲更適合 MVP
- 可支援多平台文字頁面，而不必先為每個平台客製爬蟲
- 可保留來源資訊，例如 `sourceUrl`、`capturedAt`、`sourceType`
- 與 RHIR 的資料來源可追溯設計一致

技術上可先從最小版本開始：

- 第一階段：使用者手動貼上頁面文字分析
- 第二階段：瀏覽器插件擷取 `document.body.innerText`
- 第三階段：再針對常見平台逐步微調 DOM 擷取品質

限制與風險：

- 並非所有網站都能穩定抓到完整文字
- 圖片文字、動態載入、iframe 與需展開內容可能造成遺漏
- 第一版不應承諾所有平台皆能完美辨識

因此較穩妥的產品表述是：

插件會協助擷取使用者目前頁面的可見文字，並盡可能辨識租屋相關欄位，作為 RHIR 與透明度分析的輸入來源。

## 分批規劃總覽

### 第一批：純改名與同語意欄位搬移

這一批要做的事：

- 把 MVP 表單欄位名稱改成較正式的 RHIR 欄位名
- 把 demo RHIR 與欄位檢視一起同步改名
- 只做純改名，或同語意欄位搬移到更適合的 block
- 不處理反向布林
- 不處理 `safety`、`rights` top-level block 結構是否保留

本次已完成：

- `property.totalFloor` → `property.totalFloors`
- `property.sizePing` → `property.areaPing`
- `locationContext.district` → `property.district`
- `property.petAllowed` → `leaseTerms.petsAllowed`
- `cost.rent` → `cost.monthlyRent`
- `cost.mgmtFee` → `cost.managementFee`
- `cost.eligibleForTaxFiling` → `leaseTerms.taxRegistrationAllowed`
- `leaseTerms.earlyTerminationTerms` → `leaseTerms.earlyTerminationClause`
- `leaseTerms.depositReturnTerms` → `leaseTerms.depositRefundTerms`

這一批同步更新的範圍：

- `form.jsx` 的 `schemaKey`
- `data.jsx` 的 demo RHIR
- `data.jsx` 的欄位檢視 key
- `data.jsx` 的 follow-up field 參照

這一批刻意不處理：

- `rights.forbidsTaxFiling`
- `rights.forbidsHouseholdRegistration`
- `rights.taxBurdenShift`
- `rights.unfairTerms`
- `safety.*`
- `property.hasFurniture`
- `cost.electricityRate`

原因：

- 這些不是單純改名
- 會牽涉到反向布林
- 會牽涉到 block 結構重整
- 會牽涉到 RHIR 正式欄位字典補寫

### 第二批：語意轉換與反向布林

第二批要做的事：

- 把目前用負向語意的欄位，改成 RHIR 正式的正向語意欄位
- 同步處理欄位名稱、值、顯示文案

本次已完成：

- `rights.forbidsTaxFiling` → `leaseTerms.taxRegistrationAllowed`
- `rights.forbidsHouseholdRegistration` → `leaseTerms.householdRegistrationAllowed`

這一批同步處理了：

- 表單欄位名稱
- 表單顯示文案
- 隨機測試 seed 欄位
- demo RHIR 結構
- demo 欄位檢視

第二批處理原則：

- 不只改欄位名
- 布林值同步反向
- UI 顯示文字改成正向語意
- 既有風險文案可暫時保留自然語句，不強制同步改寫

### 第三批：top-level block 與正式欄位字典收斂

第三批要做的事：

- 決定 `safety` 是否保留為 RHIR 正式 top-level block
- 決定 `rights` 是否完全回收進 `leaseTerms`
- 針對目前還沒正式列入規範、但 MVP 已經在用的欄位，補進 RHIR 欄位字典
- 視需要更新 `rhir-v0.1.schema.json` 與人類可讀規範

預計處理項目：

- `safety.rooftopAddition`
- `safety.illegalPartition`
- `safety.escapeRoute`
- `safety.fireEquipment`
- `safety.waterLeak`
- `safety.doorLock`
- `rights.taxBurdenShift`
- `rights.unfairTerms`
- `property.hasFurniture`
- `cost.eligibleForSubsidy`
- `leaseTerms.hasWrittenContract`
- `leaseTerms.reviewPeriod`
- `leaseTerms.notes`

## 目前整合狀態

目前專案狀態可以概括為：

- 第一批命名收斂已開始進行
- 表單與 demo RHIR 的欄位名稱比之前更接近 RHIR 正式命名
- 但 schema 與 top-level block 結構還沒有完全定稿

也就是說：

- 命名正在收斂
- 結構還在收斂中

## 接下來的原則

後續每一批都要遵守同一個原則：

- schema
- 表單
- demo RHIR
- 欄位檢視
- 說明文件

要一起收斂，不再各自長出一套欄位命名。

補充原則：

- MVP 先證明 RHIR 能作為資料整理與分析格式，不先為了 server 交付而增加實作負擔
- 若 RHIR schema 與欄位字典穩定，再進一步評估伺服器上傳、查詢與 API 交換
- 若未來導入瀏覽器插件，仍以「使用者主動擷取」而非「平台批量蒐集」為原則

## 第三批完成紀錄

本次已完成：

- 將 `schemas/rhir-v0.1.schema.json` 正式加入 `safety`、`rights` top-level block
- 將 RHIR 人類可讀規範補上 `safety`、`rights` 區塊與正式欄位清單
- 補齊目前 MVP 已在使用、但規範先前未明列的欄位：
  - `property.buildingType`
  - `property.hasFurniture`
  - `leaseTerms.hasWrittenContract`
  - `leaseTerms.reviewPeriod`
  - `leaseTerms.notes`
  - `cost.electricityRate`
  - `cost.eligibleForSubsidy`
- 清除 batch 1 / batch 2 殘留的欄位錯位：
  - 移除 `cost.eligibleForTaxFiling`
  - 移除表單中重複出現在 cost 區塊的 `leaseTerms.taxRegistrationAllowed`
- 同步更新 demo RHIR 與欄位檢視，補回：
  - `property.hasFurniture`
  - `leaseTerms.notes`

第三批完成後，目前 MVP 表單、demo RHIR、RHIR schema、RHIR 人類可讀規範已完成同一輪收斂。
