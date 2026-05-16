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

  // ── OpenRouter config ────────────────────────────────────────
  // WARNING: API key is exposed to anyone who opens this page in DevTools.
  // For testing only. Replace with backend proxy before production.

  const OPENROUTER_API_KEY = "";
  const OPENROUTER_MODEL   = "deepseek/deepseek-v4-pro";
  const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";

  function stripCodeFence(s) {
    return String(s || "")
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  // ── Real generator: calls OpenRouter and parses JSON output ───

  async function generateInsight(rriResult, userProfile) {
    if (!rriResult) {
      return { status: "error", message: "缺少 RRI 結果，無法產生 Insight。" };
    }

    const payload = buildPromptPayload(rriResult, userProfile);

    const userPrompt =
      `以下是 rule engine 產出的結構化 RRI 結果。請依照系統指示產生 AI Insight，僅輸出 JSON（不要 markdown code fence、不要前後文）。\n\n` +
      `### 結構化資料\n${payload.user}\n\n` +
      `### 輸出 schema（必須完全符合）\n${JSON.stringify(payload.expectedOutputSchema, null, 2)}`;

    let response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "https://rent-unfiltered.local",
          "X-Title": "Rent Unfiltered",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: payload.system },
            { role: "user",   content: userPrompt },
          ],
          temperature: 0.4,
          response_format: { type: "json_object" },
        }),
      });
    } catch (e) {
      return { status: "error", message: `網路錯誤：${e.message}` };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        status: "error",
        message: `OpenRouter API ${response.status}：${text.slice(0, 400) || response.statusText}`,
      };
    }

    let data;
    try { data = await response.json(); }
    catch (e) { return { status: "error", message: `回應解析失敗：${e.message}` }; }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { status: "error", message: "AI 沒有回傳內容。", raw: data };
    }

    let parsed;
    try {
      parsed = JSON.parse(stripCodeFence(content));
    } catch (e) {
      return {
        status: "error",
        message: `AI 回傳的不是合法 JSON。原始輸出：\n${content.slice(0, 500)}`,
      };
    }

    return {
      status: "ok",
      model: data.model || OPENROUTER_MODEL,
      usage: data.usage || null,
      ...parsed,
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

  // ── Chat consultant ──────────────────────────────────────────
  // Multi-turn Q&A grounded in the same structured RRI result.
  // No score recalculation, no legal judgment, no value overrides.

  const CHAT_SYSTEM_PROMPT = `你是 Rent Unfiltered 的租屋風險顧問。
使用者已經看過 RRI 分數與 AI Insight，現在想針對這個物件問你更多問題。

回答原則：
- 只能根據對話開頭提供的結構化 RRI 資料回答。
- 不重新計算 RRI 分數，不修改風險等級。
- 不做法律判定，不說房東違法、惡意、詐騙。
- missing 不代表一定有問題，只能說「資訊不確定」「需要確認」。
- 若使用者問的內容 RRI 沒涵蓋，請說「目前 RRI 資料中沒有這項資訊，建議簽約前現場確認」，不要自行推測。
- 中性、具體、可行動。避免空泛形容詞與恐嚇語氣。
- 回答以繁體中文為主，保持簡短（1–3 段話），除非使用者要求展開。
- 若使用者問如何議價、如何溝通房東、如何寫信，可給範例句，但要提醒「依實際情況調整」。`;

  async function chatWithRri(rriResult, conversation, newUserMessage) {
    if (!rriResult) return { status: "error", message: "缺少 RRI 結果，無法開始對話。" };
    if (!newUserMessage || !newUserMessage.trim()) return { status: "error", message: "請輸入問題。" };

    const contextBlock =
      `以下是 rule engine 產出的結構化 RRI 資料（僅供你參考；不要重算）：\n` +
      `\`\`\`json\n${JSON.stringify({
        totalScore:        rriResult.totalScore,
        scoreRange:        rriResult.scoreRange,
        riskLevel:         rriResult.riskLevel,
        topRiskDimensions: rriResult.topRiskDimensions,
        topIssues:         rriResult.topIssues,
        conflictFields:    rriResult.conflictFields,
        uncertainFields:   rriResult.uncertainFields,
        suggestedQuestions: rriResult.suggestedQuestions,
      }, null, 2)}\n\`\`\``;

    const messages = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      { role: "system", content: contextBlock },
      ...(Array.isArray(conversation) ? conversation : []),
      { role: "user", content: newUserMessage },
    ];

    let response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "https://rent-unfiltered.local",
          "X-Title": "Rent Unfiltered Chat",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages,
          temperature: 0.5,
        }),
      });
    } catch (e) {
      return { status: "error", message: `網路錯誤：${e.message}` };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { status: "error", message: `OpenRouter API ${response.status}：${text.slice(0, 400) || response.statusText}` };
    }

    let data;
    try { data = await response.json(); }
    catch (e) { return { status: "error", message: `回應解析失敗：${e.message}` }; }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return { status: "error", message: "AI 沒有回傳內容。" };

    return {
      status: "ok",
      content: content.trim(),
      model: data.model || OPENROUTER_MODEL,
      usage: data.usage || null,
    };
  }

  window.RU_INSIGHT = {
    generateInsight,
    chatWithRri,
    buildPromptPayload,
    SYSTEM_PROMPT,
    CHAT_SYSTEM_PROMPT,
    INPUT_SCHEMA,
    OUTPUT_SCHEMA,
  };

})();
