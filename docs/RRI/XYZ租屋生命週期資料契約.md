# XYZ 租屋生命週期資料契約

> 狀態：正式實作契約
>
> 原則：事件不可變、快照可重建、原文不可被抽取結果覆蓋、人工審核過的 Risk Type 不修改。

## 階段字典

| 代碼 | 名稱 | 第一版事件 |
|---|---|---|
| `X` | 刊登判讀 | 刊登匯入、刊登補充 |
| `Y1` | 預約與看房準備 | 聯絡、身分確認、預約、待問清單 |
| `Y2` | 現場看房 | 屋況、設備、安全、缺陷、現場說法 |
| `Y3` | 條件談判 | 費用、責任、限制、回覆、期限 |
| `Y4` | 契約與付款前 | 契約草稿、條款校對、付款與收據 |
| `Z1` | 點交與入住 | 鑰匙、設備清冊、既有損傷、水電表 |
| `Z2` | 入住後履約 | 繳費、修繕、通知、進屋、隱私與爭議 |

事件顯示碼採 `{substage}-{sequence}`，例如 `Y2-01`。既有 `X`、`X-1` 等版本轉為 `legacy_import` 事件並保存 `legacyLabel`。

## 公開資料型別

```text
RentalRecord
  id, ownerToken, title, currentStage, latestEventId
  latestRhirSnapshot, latestRriSnapshot, latestSnapshotHash
  createdAt, updatedAt

RentalEvent
  id, recordId, ownerToken, stage, substage, eventType, displayCode
  occurredAt, inputPayload, rhirDelta
  cumulativeRhirSnapshot, cumulativeRriSnapshot, snapshotHash
  sourceReferences, legacyLabel, createdAt

SourceDocument
  id, recordId, eventId, ownerToken, storagePath
  originalFilename, mimeType, sizeBytes, checksum, version
  processingStatus, reviewStatus, createdAt

DocumentExtraction
  id, documentId, ownerToken, engine, parserHash
  extractedText, candidates, status, failureReason, createdAt

FieldCandidate
  id, rhirField, value, disclosureStatus
  sourceText, sourceLocator, confidence
  reviewStatus: pending | accepted | edited | rejected
```

## 快照與衝突

1. 每次新增事件只保存本次 `rhirDelta`，不修改舊事件。
2. reducer 依事件順序重建累積 RHIR。
3. 新值與既有已揭露值不同時，產生 `conflict`，同時保留舊值、新值與來源。
4. 使用者確認採信值時新增 `conflict_resolution` 事件，不回寫舊事件。
5. `snapshotHash` 由穩定排序後的累積 RHIR、RRI 與事件 ID 計算，用於判斷 Insight／策略是否過期。

## 文件與人工校對

原始文件放在私人 bucket `rental-source-documents`：

```text
{ownerToken}/{recordId}/{documentId}/{filename}
```

只接受 PDF、JPG、JPEG、PNG，單檔上限 20 MB。解析先使用免費 `cloudflare-ai`；內容不足時必須由使用者明確同意，才能改用付費 `mistral-ocr`。只有 `accepted` 或 `edited` 候選可以形成 RHIR event。

## AI 與案例邊界

案例查詢維持精確三欄位：

```text
rhirField + disclosureStatus + riskType
```

AI Insight 與個人策略都保存 `basisEventId` 與 `snapshotHash`。最新案件 hash 改變時只標示舊結果過期，不自動覆蓋或重新生成。

## 第一版所有權邊界

本次不實作登入與帳號遷移。案件草稿與 XYZ event 留在 localStorage；正式保存的原始文件、解析、AI Insight 與策略沿用目前瀏覽器 owner token：

* 私有 Storage 路徑第一層必須等於本機 owner token。
* `source_documents`、`document_extractions`、AI Insight 與策略以相同 header token 隔離。
* 不認領公開舊 `rhir_uploads`。
* 清除瀏覽器資料可能失去原 token；跨裝置登入與復原保留為日後獨立工程。
