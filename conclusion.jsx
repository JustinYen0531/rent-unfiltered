// RRI Conclusion — Layer 2: deterministic template assembly
//
// Takes the structured output of rri.jsx and produces a fixed-format conclusion.
// No AI, no API, no token cost. Pure string templating.
//
// Bucket rules:
//   topIssues       = fields whose min ≥ 75% of their max (confirmed high risk)
//   conflictFields  = fields with status="conflict" (information contradicts itself)
//   uncertainFields = fields with status="missing" (information absent)
//
// missing and conflict are NEVER mixed — they are different problems.

(function () {

  // Threshold for a field to count as a confirmed top issue.
  // Lower threshold = catches more fields, higher = more conservative.
  const HIGH_RISK_THRESHOLD = 0.75;

  // ── Field descriptors ─────────────────────────────────────────
  // Each entry:
  //   label        — short Chinese name (used in lists)
  //   questionText — suggested simulation question for "簽約前確認"
  //   issueText(f) — returns a topIssue string when this field is confirmed-high-risk,
  //                  or null if it should not appear as a top issue.
  //                  f = { fieldId, label, min, max, status, evidence }
  //
  // The issueText uses format C: short label + parenthetical evidence/explanation.

  const FIELD_DESCRIPTORS = {

    // 契約透明度
    hasWrittenContract: {
      label: "是否有書面契約",
      questionText: "是否會簽正式書面契約？是否提供契約文本供簽前審閱？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === false) return "無書面契約（房東僅口頭約定）";
        if (f.status === "conflict") return "書面契約資訊衝突";
        return null;
      },
    },
    reviewPeriod: {
      label: "審閱期",
      questionText: "是否提供契約審閱期？是否可帶回契約閱讀？",
      issueText: (f) => f.status === "conflict" ? "審閱期資訊衝突" : null,
    },
    repairResponsibility: {
      label: "修繕責任",
      questionText: "設備自然耗損由誰負責修繕？人為損壞認定標準為何？",
      issueText: (f) => {
        const v = String(f.evidence || "");
        if (f.status === "disclosed" && v.includes("房客") && !v.includes("房東")) {
          return `修繕責任全由租客承擔（${v}）`;
        }
        if (f.status === "conflict") return "修繕責任資訊衝突";
        return null;
      },
    },
    earlyTerminationClause: {
      label: "提前解約條件",
      questionText: "提前解約是否會扣押金？通知期間多久？違約金多少？",
      issueText: (f) => f.status === "conflict" ? "提前解約條件資訊衝突" : null,
    },
    depositRefundTerms: {
      label: "押金退還方式",
      questionText: "押金何時退還？哪些項目可扣款？扣款標準為何？",
      issueText: (f) => f.status === "conflict" ? "押金退還方式資訊衝突" : null,
    },

    // 費用透明度
    monthlyRent: {
      label: "月租金",
      questionText: "確認月租金實際金額，是否與廣告或標題一致？",
      issueText: (f) => f.status === "conflict" ? "租金資訊前後不一致" : null,
    },
    deposit: {
      label: "押金",
      questionText: "押金金額與押月數，是否符合法定 2 個月上限？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.min >= 2) return "押金可能超出法定上限（>2 個月租金）";
        if (f.status === "conflict") return "押金資訊衝突";
        return null;
      },
    },
    utilities: {
      label: "水電費",
      questionText: "電費是否依台電計價？每度多少？水費如何計算？",
      issueText: (f) => {
        if (f.status === "conflict") return `水電費資訊衝突（${f.evidence || "電費單價疑似超收"}）`;
        if (f.status === "disclosed" && f.min >= 2) return `電費單價偏高（${f.evidence || "高於台電上限"}）`;
        return null;
      },
    },
    managementFee: {
      label: "管理費",
      questionText: "管理費每月多少？是否已包含在租金內？",
      issueText: (f) => f.status === "conflict" ? "管理費資訊衝突" : null,
    },
    internetFee: {
      label: "網路費",
      questionText: "網路是否包含？速度為何？是否與其他住戶共用？",
      issueText: (f) => f.status === "conflict" ? "網路費資訊衝突" : null,
    },
    cleaningFee: {
      label: "清潔費",
      questionText: "退租清潔費如何計算？是否從押金扣除？標準為何？",
      issueText: (f) => f.status === "conflict" ? "清潔費資訊衝突" : null,
    },
    otherFees: {
      label: "其他額外費用",
      questionText: "是否還有其他費用（仲介費、垃圾代收、車位費、寵物費等）？",
      issueText: () => null,
    },

    // 居住安全
    rooftopAddition: {
      label: "頂樓加蓋",
      questionText: "是否為頂樓加蓋或鐵皮加蓋？是否有合法建物登記？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === true) return "頂樓加蓋（未提供合法性說明）";
        if (f.status === "conflict") return "頂樓加蓋資訊衝突";
        return null;
      },
    },
    illegalPartition: {
      label: "違法隔間",
      questionText: "是否為隔套或分租？隔間材質為何？是否有對外窗與獨立逃生口？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === true) return "疑似違法隔間";
        if (f.status === "conflict") return "隔間資訊衝突";
        return null;
      },
    },
    escapeRoute: {
      label: "逃生動線",
      questionText: "是否有兩方向逃生出口？鐵窗是否可開啟？",
      issueText: (f) => f.status === "conflict" ? "逃生動線資訊衝突" : null,
    },
    fireEquipment: {
      label: "消防設備",
      questionText: "是否有偵煙器、滅火器、警報器？社區消防是否完善？",
      issueText: (f) => f.status === "conflict" ? "消防設備資訊衝突" : null,
    },
    waterLeak: {
      label: "漏水狀況",
      questionText: "是否曾有漏水、壁癌或潮濕？是否已完成修繕？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === true) return "明確有漏水或壁癌";
        if (f.status === "conflict") return "漏水狀況資訊衝突";
        return null;
      },
    },
    electricalSafety: {
      label: "電線安全",
      questionText: "電線是否更新？是否有獨立迴路與專用插座？",
      issueText: (f) => f.status === "conflict" ? "電線安全資訊衝突" : null,
    },
    doorLock: {
      label: "門鎖安全",
      questionText: "是否有獨立門鎖？社區是否有門禁或監視器？",
      issueText: (f) => f.status === "conflict" ? "門鎖安全資訊衝突" : null,
    },

    // 租客權益
    taxRegistrationAllowed: {
      label: "是否可報稅",
      questionText: "是否可依法申報租金支出？是否可申請租金補貼？若不行，原因為何？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === false) return "禁止報稅（房東明示不可申報）";
        if (f.status === "conflict") return "報稅權益資訊衝突";
        return null;
      },
    },
    householdRegistrationAllowed: {
      label: "是否可遷戶籍",
      questionText: "是否可遷戶籍或設籍？若不行，是否影響居住權益主張？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === false) return "禁止遷戶籍（房東明示不可設籍）";
        if (f.status === "conflict") return "遷戶籍權益資訊衝突";
        return null;
      },
    },
    taxBurdenShift: {
      label: "稅負轉嫁",
      questionText: "報稅或申請租補時，是否會被加租或要求補貼房東稅金？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === true) return "存在稅負轉嫁條款（報稅成本由租客負擔）";
        if (f.status === "conflict") return "稅負轉嫁資訊衝突";
        return null;
      },
    },
    unfairTerms: {
      label: "不合理條款",
      questionText: "契約中是否有單方終止、任意進入、押金不退、設備全由租客負責等疑似不利條款？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence && f.evidence !== false) {
          const ev = typeof f.evidence === "string" && f.evidence.length < 40 ? f.evidence : "依契約內容";
          return `存在疑似不利條款（${ev}）`;
        }
        if (f.status === "conflict") return "不合理條款資訊衝突";
        return null;
      },
    },

    // 生活適配度
    commuteConvenience: {
      label: "通勤便利性",
      questionText: "到學校 / 工作地點 / 捷運站的實際距離與時間為何？",
      issueText: (f) => f.status === "conflict" ? "通勤資訊與地圖矛盾" : null,
    },
    noiseCondition: {
      label: "噪音狀況",
      questionText: "周邊是否有大馬路、商圈、夜市、施工區？窗戶隔音如何？",
      issueText: () => null,
    },
    lightingCondition: {
      label: "採光狀況",
      questionText: "是否有對外窗？朝向為何？白天是否需要開燈？",
      issueText: () => null,
    },
    garbageDisposal: {
      label: "垃圾處理",
      questionText: "是否有垃圾代收？社區垃圾間或固定時段為何？",
      issueText: () => null,
    },
    roommateCondition: {
      label: "室友 / 鄰居",
      questionText: "是否分租？室友人數、性別、共用空間規則為何？",
      issueText: () => null,
    },
    petsAllowed: {
      label: "寵物限制",
      questionText: "是否可養寵物？種類、體型、押金或清潔費為何？",
      issueText: (f) => {
        if (f.status === "disclosed" && f.evidence === false) return "禁止寵物";
        if (f.status === "conflict") return "寵物政策資訊衝突";
        return null;
      },
    },
  };

  // ── helpers ───────────────────────────────────────────────────

  function flattenFields(rri) {
    const out = [];
    for (const [dimId, dim] of Object.entries(rri.dimensions)) {
      for (const f of dim.fields) {
        out.push({ ...f, dimensionId: dimId, dimensionLabel: dim.label });
      }
    }
    return out;
  }

  function joinChinese(arr, sep = "、") {
    return arr.join(sep);
  }

  // ── public: conclusionFromRri ─────────────────────────────────

  function conclusionFromRri(rri) {
    if (!rri) return null;

    const allFields = flattenFields(rri);

    // 1. Top risk dimensions: sorted by max contribution
    const topRiskDimensions = Object.values(rri.dimensions)
      .filter(d => d.max > 0)
      .sort((a, b) => b.max - a.max)
      .slice(0, 2)
      .map(d => d.label);

    // 2. Top issues: confirmed-high-risk fields (min ≥ 75% of max),
    //    each translated via FIELD_DESCRIPTORS.issueText()
    const topIssues = allFields
      .filter(f => f.max > 0 && f.min >= HIGH_RISK_THRESHOLD * f.max)
      .sort((a, b) => b.min - a.min)
      .map(f => {
        const desc = FIELD_DESCRIPTORS[f.fieldId];
        return desc?.issueText ? desc.issueText(f) : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // 3. Conflict fields: status="conflict" (own bucket, never mixed with missing)
    const conflictFields = allFields
      .filter(f => f.status === "conflict")
      .map(f => FIELD_DESCRIPTORS[f.fieldId]?.label || f.label);

    // 4. Uncertain fields: status="missing" (own bucket, never mixed with conflict)
    //    Sort by the size of uncertainty contribution (bigger gaps first)
    const uncertainFields = allFields
      .filter(f => f.status === "missing")
      .sort((a, b) => b.max - a.max)
      .map(f => FIELD_DESCRIPTORS[f.fieldId]?.label || f.label)
      .slice(0, 8);

    // 5. Suggested questions: priority order is conflict → high-risk → biggest missing
    const seen = new Set();
    const pickQuestion = (f) => {
      const desc = FIELD_DESCRIPTORS[f.fieldId];
      if (!desc?.questionText) return null;
      if (seen.has(desc.questionText)) return null;
      seen.add(desc.questionText);
      return { field: f.fieldId, q: desc.questionText, dimension: f.dimensionLabel };
    };
    const conflictQuestions = allFields.filter(f => f.status === "conflict").map(pickQuestion);
    const highRiskQuestions = allFields
      .filter(f => f.max > 0 && f.min >= HIGH_RISK_THRESHOLD * f.max && f.status !== "conflict")
      .map(pickQuestion);
    const missingQuestions = allFields
      .filter(f => f.status === "missing")
      .sort((a, b) => b.max - a.max)
      .slice(0, 6)
      .map(pickQuestion);
    const suggestedQuestions = [...conflictQuestions, ...highRiskQuestions, ...missingQuestions]
      .filter(Boolean)
      .slice(0, 5);

    // 6. Assemble finalText (固定格式，不可重排)
    const scoreText = rri.isCertain
      ? `${rri.midScore}/100`
      : `${rri.minScore}–${rri.maxScore}/100`;
    const levelText = rri.levelMin === rri.levelMax
      ? rri.levelMin
      : `${rri.levelMin}～${rri.levelMax}`;

    const parts = [];

    // 1) score + level
    parts.push(`根據目前可取得的租屋資訊，本物件的 RRI 為 ${scoreText}，屬於${levelText}。`);

    // 2) top risk
    if (topIssues.length > 0) {
      parts.push(`主要風險來自${joinChinese(topRiskDimensions, "與")}，其中最需要注意的是${joinChinese(topIssues)}。`);
    } else {
      parts.push(`目前未發現高風險集中項目。主要不確定性集中在${joinChinese(topRiskDimensions, "與")}面向。`);
    }

    // 3) conflicts (separate from missing)
    if (conflictFields.length > 0) {
      parts.push(`另有 ${conflictFields.length} 項資訊前後不一致，包括${joinChinese(conflictFields)}。建議優先釐清，因為矛盾資訊比缺漏更需要立即確認。`);
    }

    // 4) missing — the signature line of Rent Unfiltered
    if (uncertainFields.length > 0) {
      parts.push(`目前仍有 ${uncertainFields.length} 項重要資訊未揭露或不完整，包括${joinChinese(uncertainFields)}。這些資訊未揭露不代表一定存在問題，但會提高簽約前的不確定性。`);
    }

    // 5) action items
    if (suggestedQuestions.length > 0) {
      parts.push(`建議使用者在簽約前優先確認：${joinChinese(suggestedQuestions.map(q => q.q))}`);
    }

    // 6) disclaimer
    parts.push(`本分析僅根據目前提供的資訊與 RHIR / RRI 規則產生，作為租屋決策輔助，不代表法律判定或最終租屋建議。`);

    const finalText = parts.join("\n\n");

    // 7) shortText for list views
    const shortText = topIssues.length > 0
      ? `RRI ${scoreText}（${levelText}）· 主要風險：${joinChinese(topIssues.slice(0, 2))}`
      : `RRI ${scoreText}（${levelText}）· ${uncertainFields.length} 項資訊待補`;

    return {
      totalScore: rri.midScore,
      scoreRange: { min: rri.minScore, max: rri.maxScore },
      riskLevel: levelText,
      topRiskDimensions,
      topIssues,
      conflictFields,
      uncertainFields,
      suggestedQuestions,
      finalText,
      shortText,
    };
  }

  window.RU_CONCLUSION = { conclusionFromRri, FIELD_DESCRIPTORS };

})();
