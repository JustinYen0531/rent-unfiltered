# RRI 證據層與四階段實作計畫

> 狀態：新增草案  
> 目的：將 Rent Unfiltered 從「風險分析工具」推進為「有真實證據支撐的租客決策支援系統」

---

## 一、目標定義

本文件整理本次需求升級後的實作方向，作為後續產品、文件與程式開發的共同參考。

此次升級的關鍵，不是單純讓 AI 多講幾句，而是把系統的輸出邏輯改成：

```text
RHIR
-> RRI Rule Engine
-> Evidence Matching Engine
-> Recommendation Engine
-> AI Insight / Action Plan
```

核心原則如下：

* AI 不是第一層判斷者
* 建議必須盡量回溯到真實數據、過往案例與法規依據
* 產品最終輸出不是只有分析，而是可執行的 `Action Plan`
* 第一版先追求「有證據的建議」，不是一開始就追求全自動最優解

---

## 二、四階段實作計畫

### Phase 1：建立最小可行的 Evidence Mapping

這一階段的目標，不是做完整案例系統，而是先證明：RRI 的欄位可以連到真實案例，並產出比現在更可信的建議。

**目標**

* 為第一批高價值欄位建立 evidence map
* 讓高風險欄位可以對應到至少 1 到 3 筆真實案例或統計依據
* 先把「有風險」升級成「為什麼這裡有風險」

**建議先做的欄位**

* `depositRefundTerms`
* `electricityRate`
* `repairResponsibility`
* `earlyTerminationClause`
* `taxRegistrationAllowed`

**資料結構範例**

```json
{
  "field": "leaseTerms.depositRefundTerms",
  "patterns": [
    {
      "match": "missing",
      "riskType": "deposit_dispute",
      "evidenceIds": ["gov_deposit_001", "court_deposit_014"],
      "commonOutcome": "退租時容易發生押金扣抵爭議",
      "confidence": "high"
    }
  ]
}
```

**完成標準**

* 系統可根據欄位狀態找到對應 evidence
* 每筆 evidence 至少有來源類型、摘要、對應欄位、常見結果
* UI 或報告中可出現第一版 `Related Cases`

---

### Phase 2：把分析結果改造成 Recommendation / Action Plan

Evidence 找到了之後，下一步不是停在展示，而是要把案例轉成現實建議。

**目標**

* 為每個高風險欄位建立 recommendation template
* 產生可追問、可保留證據、可談判、可退出的建議
* 把目前偏摘要式的報告升級成行動導向輸出

**每個欄位建議至少輸出**

* `riskSummary`
* `whatToAsk`
* `evidenceToKeep`
* `nextAction`
* `copyMessage`

**範例**

```json
{
  "field": "cost.electricityRate",
  "riskSummary": "電費計價方式不透明，歷史上常導致超收或公共電費轉嫁。",
  "whatToAsk": [
    "是否依台電計價？",
    "是否為獨立電表？",
    "公共電費如何分攤？"
  ],
  "evidenceToKeep": [
    "房東對電費計價的文字說明",
    "廣告截圖",
    "契約中的電費條款"
  ],
  "nextAction": [
    "要求在契約中寫明計價方式",
    "若拒絕寫明，將此欄位視為高爭議成本條件"
  ]
}
```

**完成標準**

* 第一批欄位都能輸出一致格式的建議
* 詳細頁不再只有風險說明，而是開始出現 `Action Plan`

---

### Phase 3：把 AI 限制在 Evidence-aware 說明層

這一階段的目標，是避免系統看起來像在「亂講得很有自信」。

**目標**

* 重新定義 AI Insight 的角色
* 讓 AI 只能根據 RRI、Evidence、Recommendation 已有內容整理輸出
* 禁止 AI 在沒有證據時虛構案例、法規結論或勝敗預測

**AI 應負責的工作**

* 摘要相關案例的共同模式
* 解釋為何這些案例與當前物件有關
* 把 recommendation 改寫成更自然、較不生硬的文字
* 生成可複製的房東詢問話術

**AI 不應負責的工作**

* 自行生成不存在的案例
* 在沒有依據時宣稱「法院通常都會怎樣」
* 把未揭露直接說成違法
* 取代 RRI 或 Recommendation 的決策邏輯

**完成標準**

* AI prompt 與輸出格式清楚限制資料來源
* 報告中的 AI 段落可以回溯到 evidence ids 或 rule ids

**行動建議來源分級**

* `mixed`：AI 對目前物件的判斷與 verified 案例方向一致，最優先、使用最醒目的顏色
* `evidence_backed`：建議主要直接來自過去案例，排序第二
* `ai_assessment`：AI 根據 RHIR / RRI 作出的綜合判讀，沒有直接案例支持，排序第三
* 有案例支持的行動卡預設收合案例依據，使用者需要時再展開
* 程式會驗證每筆案例 ID 與標題；AI 判讀不得偽裝成案例支持

**AI Insight 保存方式**

* 使用者確認內容後，手動將 Insight 保存到 `ai_insights`，不因重新整理而遺失
* 每次保存新增一筆不可變的歷史紀錄；目前報告自動載入同一物件、同一版本的最新一筆
* 保存內容包含當次 RRI snapshot、Evidence Context、完整 Insight 結果、模型與產生時間，方便日後追溯
* 尚未導入登入系統前，以瀏覽器本機保存的匿名 owner token 限制讀取範圍；不同瀏覽器或清除網站資料後不會自動取得舊紀錄
* 資料表與 RLS 定義位於 `docs/RRI/ai_insights.sql`

---

### Phase 4：獨立的策略分析

Phase 4 不再視為分析報告的擴充，而是接在 RHIR、RRI 與 AI Insight 之後的
個人化決策工作區。它會加入使用者自己的預算彈性、搬家急迫度、必要條件、
可談判條件與紅線，再產生個人行動策略。

Step 1–5 已完成，Step 6 延後實作；整個階段與前三階段保持清楚資料邊界：

* 不修改 RHIR、RRI 或人工審核過的 Risk Type
* 不把個人偏好包裝成客觀風險
* 已將「詢問 AI 顧問」移入策略分析，並接入個人情境、保存的 AI Insight 與 verified cases
* 已完成個人策略輸出、可收合 Strategy Trace 與正式 session 保存
* 使用獨立的 `strategy_sessions` 保存個人情境、snapshot、策略與後續對話
* 以策略依據追蹤器說明每項個人建議如何由條件、風險、Insight 與案例形成
* 顧問追問只在策略生成並保存後開放，不在對話中暗中改寫策略

完整區域安排、資料模型與未來實作順序見：

* [`策略分析-個人化決策工作區計畫.md`](策略分析-個人化決策工作區計畫.md)

---

## 三、建議的資料模組

後續若進入實作，建議將資料拆成以下幾個模組：

* `rule-engine`
  負責 RHIR -> RRI 分數與風險欄位

* `case-library`
  存放政府糾紛、法院裁判、社群案例、統計資料的結構化摘要

* `evidence-mapping`
  存放哪一個欄位狀態應對應哪些 evidence

* `recommendation-templates`
  存放各欄位的行動建議模板

* `ai-insight`
  只負責整合與語言生成，不直接定義風險邏輯

---

## 四、資料分層架構與導入順序

除了功能模組外，資料本身也建議拆成四層，避免原始來源、產品輸出與後續 RAG 混在一起。

### Layer 1：原始來源庫 `raw-source-archive`

這一層保存原始連結、原始裁判、原始政府案例、原始統計來源與原始摘錄。

**用途**

* 作為可追溯 archive
* 保留日後回查、複核與補充摘要的依據
* 不直接提供給產品前台使用者閱讀

**內容範例**

* 原始網址
* PDF / HTML / 截圖 / 手動摘錄
* 來源日期
* 抓取日期
* 備註與初步判讀

### Layer 2：結構化案例庫 `case-library`

這一層是產品核心。每一份來源都應被整理成統一格式的 JSON case record，方便前台直接顯示、規則對接與後續 embedding。

**用途**

* 提供 `Related Cases`
* 提供 `Common Outcome`
* 提供 `Action Hints`
* 提供前台與 AI 可安全引用的結構化內容

### Layer 3：證據對應層 `evidence-mapping`

這一層定義「哪一個 RHIR 欄位 + 哪一種狀態」應連到哪類風險與哪批案例。

**用途**

* 讓 RRI 能接上 Evidence
* 讓系統可從欄位直接找到相對應的案例群
* 讓 recommendation engine 不必每次從零判斷

**範例**

```json
{
  "field": "leaseTerms.depositRefundTerms",
  "status": "missing",
  "riskType": "deposit_dispute",
  "evidenceIds": ["gov_deposit_001", "court_deposit_014"]
}
```

### Layer 4：RAG / Embedding Index `embedding-index`

這一層將第二層的結構化案例做向量化，用來支援語意搜尋、相似案例比對與未來更靈活的查詢。

**用途**

* 查詢「押金沒寫清楚怎麼辦」這種自然語言問題
* 補強關鍵字搜尋不足的地方
* 支援未來更大的案例庫

### 建議導入順序

這次專案不建議一開始就走即時上網搜尋。較穩定的順序應為：

1. **先做 Layer 2：完全內建資料庫**
   先把高價值案例整理成結構化 JSON，讓前台、UI、Action Plan 都能穩定使用。
2. **再做 Layer 3：混合式**
   也就是前台查內建庫，後台才進行人工或半人工更新，不讓使用者主流程依賴即時網路搜尋。
3. **最後再做 Layer 4：RAG / embedding**
   等第二層整理成熟後，再把結構化案例做向量索引，避免 RAG 直接吃混亂原始資料。

因此，目前最推薦的策略不是「每次 live search」，而是：

* 前台內建
* 後台更新
* 後續再做語意索引

---

## 五、第一版建議範圍

若要做最小可行版本，建議不要一次全做，先聚焦在三到五個最痛的議題：

* 押金返還
* 電費計價
* 修繕責任
* 提前解約
* 報稅 / 租補 / 戶籍權益

這幾項最適合當第一版，因為：

* 歷史資料容易找到
* 與租客損失高度相關
* 可被寫成具體追問與行動
* Demo 時最好懂，也最能打到評審

---

## 六、案例整理的最小欄位建議

若要讓他人協助整理案例，建議每筆結構化案例至少包含以下欄位：

```json
{
  "id": "court_deposit_014",
  "sourceType": "court",
  "sourceName": "司法院裁判書",
  "title": "押金扣抵爭議",
  "year": 2023,
  "keywords": ["押金", "退租", "折舊", "清潔費"],
  "rhirFields": ["leaseTerms.depositRefundTerms", "cost.deposit"],
  "riskTypes": ["deposit_dispute"],
  "summary": "房東以清潔與折舊為由扣留押金，法院認為自然折舊不應由租客負擔。",
  "commonOutcome": "退租時發生押金返還爭議",
  "legalBasis": ["民法租賃相關規定"],
  "actionHints": [
    "要求寫明押金返還期限",
    "要求寫明可扣款項目",
    "要求排除自然折舊"
  ],
  "evidenceToKeep": [
    "契約押金條款",
    "入住與退租照片",
    "房東文字說明"
  ],
  "confidence": "high"
}
```

重點不是一開始追求完美，而是先讓每筆資料都能：

* 被分類
* 被欄位對應
* 被前台取用
* 被後續 embedding

---

## 七、這份文件的用途

本文件不是取代既有的 `RRI與分析報告實踐計畫`，而是補上「證據層、建議層、AI 約束層」的後續實作路線圖。

之後若繼續開發，可把它當成：

* 文件更新時的設計基準
* UI / 資料模型調整時的共同語言
* 實作排程時的分階段里程碑
* 評審簡報時說明「未來如何從分析工具升級成決策支援系統」的依據

---

*最後更新：2026-07-18*
