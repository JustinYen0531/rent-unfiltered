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

---

### Phase 4：擴充成可持續演化的 Decision Support System

當前三階段穩定後，才適合談更強的推薦與近似「最優解」。

**目標**

* 擴大 case library
* 引入 evidence confidence 與 recommendation priority
* 依使用者情境排序建議，例如學生、上班族、短租、家庭
* 發展更完整的 Evidence Tracer / Case Card / Action Plan UI

**可擴充方向**

* 案例相似度排序
* 欄位與案例的多對多映射
* 不同使用者 persona 的權重微調
* 從統計資料反推 recommendation priority
* 將高頻建議轉成契約條款範本或房東溝通模板

**完成標準**

* 產品不再只是顯示風險，而是能提供有依據的決策支援流程
* 使用者可以看見「風險 -> 證據 -> 建議 -> 下一步」的完整鏈條

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

## 四、第一版建議範圍

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

## 五、這份文件的用途

本文件不是取代既有的 `RRI與分析報告實踐計畫`，而是補上「證據層、建議層、AI 約束層」的後續實作路線圖。

之後若繼續開發，可把它當成：

* 文件更新時的設計基準
* UI / 資料模型調整時的共同語言
* 實作排程時的分階段里程碑
* 評審簡報時說明「未來如何從分析工具升級成決策支援系統」的依據

---

*最後更新：2026-07-10*
