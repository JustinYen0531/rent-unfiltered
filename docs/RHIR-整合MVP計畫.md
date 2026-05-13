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

預計處理項目：

- `rights.forbidsTaxFiling` → `leaseTerms.taxRegistrationAllowed`
- `rights.forbidsHouseholdRegistration` → `leaseTerms.householdRegistrationAllowed`

第二批要特別注意：

- 不是只改欄位名
- 布林值也要反向
- UI 顯示文字也要一起改
- demo RHIR 與報告文案引用也要一起同步

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
