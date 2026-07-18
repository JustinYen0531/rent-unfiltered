# RHIR 與 Risk Type 字典

## 目的

本字典把 Rent Unfiltered 人工審核過的案例欄位轉成 AI 與程式可以共同理解的查詢語言。

機器可讀來源：

`data/evidence/rhir-risk-dictionary.v1.json`

這份字典不是案例 migration，也不是重新分類工具。它不修改 Supabase `evidence_cases` 的 `rhir_fields` 或 `risk_types`。

## 資料基準

字典以 2026-07-18 的 Supabase 唯讀盤點為基準：

- `evidence_cases`：94 筆
- `verified`：91 筆
- `rejected`：3 筆
- 人工審核後 RHIR 欄位：19 種
- 人工審核後 `riskType`：28 種

Git 內的自動同步檔案只有 93 筆候選；資料庫另有後續人工加入與修改的案例。因此字典以資料庫已審核值為準，但不把完整資料庫內容複製回 repo。

## 三鍵查詢契約

案例輔助查詢必須同時保留三個維度：

```text
rhirField + disclosureStatus + riskType
```

- `rhirField`：正在檢查哪一項租屋資訊。
- `disclosureStatus`：該資訊是已揭露、缺漏、部分揭露或來源衝突。
- `riskType`：這個資訊狀態可能形成哪一種可重複使用的風險脈絡。

三者不是互相翻譯。RHIR 保存事實與來源，RRI／`riskType` 描述風險，`disclosureStatus` 描述目前資訊品質。

第一順位必須用資料庫原值精確查詢。只有沒有精確 mapping 時，才能依字典的 `relatedRiskTypes`、`relatedFields` 或 `knownRelationships` 擴大候選，而且必須記錄 fallback 原因。

## 不變性規則

1. 不重新命名人工審核過的 `riskType`。
2. 不把自訂 RHIR 欄位改寫成既有欄位。
3. 不因兩個值語意接近就合併。
4. 不使用中文 label 或 AI 翻譯取代資料庫 key。
5. 字典發現差異時只建立關係，不回寫案例。

例如：

```text
rental_subsidy_dispute
rent_subsidy_dispute
```

兩者都保留。字典可以標記它們同屬租金補貼父類，RAG 也可以在精確查詢沒有足夠結果時把另一個列為擴大候選，但不能把資料庫中的一個改成另一個。

## 欄位狀態

- `stable`：目前產品已直接使用的主要 RHIR 欄位。
- `stable-fallback`：正式存在，但只適合沒有專用欄位時暫存補充內容。
- `reviewed-extension`：人工審核案例已使用，因此是有效原值；尚未決定是否納入核心 RHIR UI。

`reviewed-extension` 不是錯誤，也不是待刪除值。它表示案例已證明此欄位有實務需求，但產品表單、規格頁與 RRI 規則是否要正式支援，仍需另行決定。

## AI 使用方式

AI 不直接看到一串難以理解的 key。後端應用原值查完案例後，再把字典內容組成 context：

```json
{
  "finding": {
    "rhirField": "leaseTerms.depositRefundTerms",
    "disclosureStatus": "conflict",
    "riskType": "deposit_dispute"
  },
  "dictionary": {
    "fieldLabel": "押金／定金返還條件",
    "fieldMeaning": "記錄款項性質、返還時間與扣款規則",
    "riskLabel": "押金／定金返還爭議",
    "riskMeaning": "付款、扣款或解約後退款發生爭議",
    "questions": [
      "這筆款項的性質是什麼？",
      "何時返還，哪些項目可以扣除？"
    ],
    "caution": "不得因案例結果包含退款，就忽略真正的主風險。"
  },
  "verifiedCases": []
}
```

AI 可依字典產生：

- 優先詢問房東或仲介的問題
- 簽約前或入住前的執行步驟
- 應保存的契約、照片、帳單與對話
- 資訊衝突或資料不足提醒
- Related Cases 的白話脈絡

AI 不可：

- 改寫 RHIR、RRI 或案例原值
- 自行把 related 值視為 equivalent
- 重算 RRI 分數
- 使用未通過審核的案例作為高可信度依據
- 把個案協調結果寫成普遍法律結論

## 新欄位與新 Risk Type

未來人工審核可以繼續建立新值，不需要先硬塞進舊分類。

新增後的流程：

1. 案例仍保存審核者選定的原始 key。
2. 字典驗證會指出新值尚未有條目。
3. 人工為新值補上名稱、AI 定義、適用情境、詢問、行動、證據與限制。
4. 若與既有值相關，新增 `relatedRiskTypes` 或 `relatedFields`。
5. 只有團隊另行決定 schema 升版時，才把 `reviewed-extension` 升成核心 `stable` 欄位。

Git 的自動候選資料可能仍有尚未進入人工審核字典的舊說法。這些值記錄在
`unreviewedSourceValueRelationships`，只用來說明來源關係，不列入 19 個人工 RHIR
欄位或 28 個人工 `riskType`，也不會被自動替換。

## 已知結構差異

目前 RHIR JSON Schema 的 `fieldGroup` 允許任意 leaf field，因此 schema 只固定第一層區塊，沒有完整限制 `leaseTerms.*`、`cost.*` 等正式 leaf key。

這份字典因此同時扮演 leaf-field registry，但不會讓舊資料失效。

目前 `evidence_mappings.disclosure_status` 只接受：

```text
missing / disclosed / conflict / unknown
```

完整 RHIR 則另有：

```text
partial / inferred / supplemented
```

在實作三鍵查詢前，需要另行決定 mapping table 是否擴充這三個狀態。字典已保留全部七種狀態，但本次不修改資料庫 schema。

## 驗證

執行：

```powershell
npm run evidence:dictionary:validate
```

驗證器會檢查：

- JSON 可以解析。
- 每個欄位與風險都有 AI 定義。
- 字典宣告的 19 個 RHIR 欄位與 28 個 `riskType` 數量一致。
- 關係中引用的人工原值都存在。
- 本地案例資料中使用的欄位與風險都有字典條目。

驗證器只讀檔案，不修改案例或資料庫。
