// AI Insight Layer — Layer 3 (stub)
//
// This layer does NOT calculate scores, change risk levels, or override rule engine output.
// Its only job is to read the structured RRI result and produce
// contextual interpretation: risk pattern, priority questions, beginner-friendly
// explanation, and (eventually) user-personalized commentary.
//
// Status: not yet connected to any AI API. The contract (input schema, output
// schema, system prompt) is defined here so the UI can wire up a button now.

(function () {

  // ── System prompt ─────────────────────────────────────────────
  // This is the exact instruction the AI must follow. Strict, with hard limits.

  const SYSTEM_PROMPT = `你是 Rent Unfiltered 的租屋風險解讀助手。

你的任務不是重新計算 RRI，也不是替使用者做決定。
RRI 分數、風險等級與欄位判斷已由 rule engine 完成，請以輸入 JSON 為唯一依據。

請只根據輸入的結構化 JSON，產生一段「AI Insight」，完成以下 5 件事：

1. 用白話解釋此物件最主要的風險組合。
2. 找出欄位之間的關聯（例如費用不透明是否同時伴隨租客權益限制）。
3. 選出簽約前最優先確認的 3–5 個問題。
4. 若有使用者背景（userProfile），請說明哪些風險對此使用者特別重要。
5. 用中性、謹慎語氣提醒：此分析是決策輔助，不是法律判定。

硬性限制：
- 不得更改 RRI 分數。
- 不得更改風險等級。
- 不得自行推測輸入 JSON 沒有的資訊。
- 不得說房東惡意、違法或詐騙，除非輸入 evidence 明確寫出。
- missing 不代表一定有問題，只能說「資訊不確定」「需要確認」。
- 輸出要具體、可行動，不要使用恐嚇語氣，不要使用空泛形容詞。
- 嚴格依照輸出 JSON 結構。`;

  // ── Input schema (for documentation; passed verbatim to the AI) ──

  const INPUT_SCHEMA = {
    totalScore: "number, 0–100, midpoint of RRI range",
    scoreRange: { min: "number", max: "number" },
    riskLevel: "string, one of: 低風險 / 中低風險 / 中風險 / 高風險 / 極高風險",
    topRiskDimensions: "string[], top 1–3 dimensions sorted by max contribution",
    topIssues: "string[], confirmed high-risk fields with evidence (already pre-formatted)",
    conflictFields: "string[], fields whose info contradicts itself",
    uncertainFields: "string[], fields with missing info (NOT mixed with conflicts)",
    suggestedQuestions: "{field, q, dimension}[], priority-ordered questions from rule engine",
    userProfile: {
      isStudent: "boolean?",
      needsRentalSubsidy: "boolean?",
      hasPet: "boolean?",
      noiseSensitive: "boolean?",
      budgetTight: "boolean?",
    },
  };

  // ── Output schema (strict) ────────────────────────────────────

  const OUTPUT_SCHEMA = {
    insightSummary: "string — 1–3 sentences explaining the main risk pattern in plain Chinese",
    riskPattern: [
      { title: "string — short pattern name", explanation: "string — why these signals combine into a pattern" },
    ],
    priorityQuestions: "string[] — 3–5 most important questions, more specific than the rule engine's generic ones",
    beginnerExplanation: "string — same as insightSummary but for first-time renters, plain language",
    personalNote: "string? — only if userProfile provided; otherwise omit",
    cautionNote: "string — fixed disclaimer about decision aid, not legal judgment",
  };

  // ── Generation stub ───────────────────────────────────────────
  // Returns a sentinel result indicating "not yet implemented".
  // When an API is wired up, replace the body with a real fetch + JSON parse.

  async function generateInsight(/* rriResult, userProfile */) {
    return {
      status: "not_implemented",
      message: "AI Insight 尚未啟用。所有結論目前皆由 rule engine + template 產生。未來接上 API 後，此區會顯示 AI 對風險組合的解讀。",
    };
  }

  // Build the prompt payload that would be sent to the API once connected.
  // Useful for inspection / debugging.
  function buildPromptPayload(rriResult, userProfile) {
    return {
      system: SYSTEM_PROMPT,
      user: JSON.stringify({
        totalScore:        rriResult?.totalScore,
        scoreRange:        rriResult?.scoreRange,
        riskLevel:         rriResult?.riskLevel,
        topRiskDimensions: rriResult?.topRiskDimensions,
        topIssues:         rriResult?.topIssues,
        conflictFields:    rriResult?.conflictFields,
        uncertainFields:   rriResult?.uncertainFields,
        suggestedQuestions: rriResult?.suggestedQuestions,
        userProfile:       userProfile || null,
      }, null, 2),
      expectedOutputSchema: OUTPUT_SCHEMA,
    };
  }

  window.RU_INSIGHT = {
    generateInsight,
    buildPromptPayload,
    SYSTEM_PROMPT,
    INPUT_SCHEMA,
    OUTPUT_SCHEMA,
  };

})();
