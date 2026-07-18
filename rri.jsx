// RRI — Rental Risk Index scoring engine
//
// Score direction: higher = more risk. Total max = 100.
//
// Output: { minScore, maxScore, midScore, levelMin, levelMax, dimensions }
//
// Missing fields contribute [0, fieldMax] to the uncertainty range.
// All other statuses contribute a fixed score (no range expansion).
// Final range = sum of all [min, max] contributions.

(function () {

  // ── helpers ──────────────────────────────────────────────────

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function st(fv)  { return fv?.disclosureStatus || "missing"; }
  function val(fv) { return fv?.value ?? null; }

  // Core scorer: converts (disclosureStatus, maxScore, disclosedScore) → { min, max }
  //   disclosed / inferred / supplemented → exact disclosedScore (known)
  //   partial    → 50% of max (incomplete but not unknown)
  //   missing    → [0, max]  (full uncertainty — the range widens here)
  //   conflict   → max       (worst case confirmed)
  function scoreStatus(status, max, disclosedScore) {
    const clamp = (v) => Math.min(Math.max(v, 0), max);
    switch (status) {
      case "disclosed":
      case "inferred":
      case "supplemented": { const s = clamp(disclosedScore); return { min: s, max: s }; }
      case "partial":      { const s = clamp(max * 0.5);      return { min: s, max: s }; }
      case "missing":      return { min: 0, max };
      case "conflict":     return { min: max, max };
      default:             return { min: 0, max: 0 };
    }
  }

  function field(fieldId, label, min, max, status, evidence) {
    return { fieldId, label, min, max, status, evidence };
  }

  // ── 契約透明度 (max 20) ──────────────────────────────────────

  function scoreHasWrittenContract(rhir) {
    const fv = get(rhir, "leaseTerms.hasWrittenContract");
    const s = st(fv); const v = val(fv);
    // true=signed contract, false=no contract
    const ds = v === true ? 0 : v === false ? 4 : 2;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("hasWrittenContract", "書面契約", min, max, s, v);
  }

  function scoreReviewPeriod(rhir) {
    const fv = get(rhir, "leaseTerms.reviewPeriod");
    const s = st(fv); const v = val(fv);
    const ds = v ? 0 : 3;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("reviewPeriod", "審閱期", min, max, s, v);
  }

  function scoreRepairResponsibility(rhir) {
    const fv = get(rhir, "leaseTerms.repairResponsibility");
    const s = st(fv); const v = String(val(fv) || "");
    // Disclosed: landlord-responsible → 0, vague split → 2, tenant-all → 4
    const ds = v.includes("房東") && !v.includes("房客") ? 0
             : v.includes("房客") && v.includes("房東") ? 2
             : v.includes("房客") ? 3
             : 1;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("repairResponsibility", "修繕責任", min, max, s, val(fv));
  }

  function scoreEarlyTermination(rhir) {
    const fv = get(rhir, "leaseTerms.earlyTerminationClause");
    const s = st(fv); const v = val(fv);
    const ds = v ? 0 : 3;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("earlyTerminationClause", "提前解約", min, max, s, v);
  }

  function scoreDepositRefund(rhir) {
    const fv = get(rhir, "leaseTerms.depositRefundTerms");
    const s = st(fv); const v = val(fv);
    const ds = v ? 0 : 3;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("depositRefundTerms", "押金退還", min, max, s, v);
  }

  // ── 費用透明度 (max 20) ──────────────────────────────────────

  function scoreMonthlyRent(rhir) {
    const fv = get(rhir, "cost.monthlyRent");
    const s = st(fv); const v = val(fv);
    const ds = (v && Number(v) > 0) ? 0 : 2;
    const { min, max } = scoreStatus(s, 3, ds);
    return field("monthlyRent", "月租金", min, max, s, v);
  }

  function scoreDeposit(rhir) {
    const fv = get(rhir, "cost.deposit");
    const s = st(fv); const v = val(fv);
    const rent = val(get(rhir, "cost.monthlyRent")) || 0;
    // Over 2 months = moderately high, over 3 months = high (法規上限)
    let ds = 0;
    if (v && rent > 0) {
      if (Number(v) > rent * 3) ds = 3;
      else if (Number(v) > rent * 2) ds = 2;
    }
    const { min, max } = scoreStatus(s, 3, ds);
    return field("deposit", "押金", min, max, s, v);
  }

  function scoreUtilities(rhir) {
    const elecFv = get(rhir, "cost.electricityRate");
    const waterFv = get(rhir, "cost.waterFee");
    const elecSt = st(elecFv); const waterSt = st(waterFv);
    const max = 5;

    // Conflict on electricity → immediate max
    if (elecSt === "conflict") return field("utilities", "水電費", max, max, "conflict", val(elecFv));

    // Both missing → [0, 5]
    if (elecSt === "missing" && waterSt === "missing") return field("utilities", "水電費", 0, max, "missing", null);

    // Compute each sub-contribution (electricity worth 3, water worth 2)
    let elecMin = 0, elecMax = 0;
    if (elecSt === "missing")           { elecMax = 3; }
    else if (elecSt === "partial")      { elecMin = elecMax = 1.5; }
    else if (elecSt === "conflict")     { elecMin = elecMax = 3; }
    else {
      // disclosed — check the rate value
      const elecStr = String(val(elecFv) || "");
      const rate = parseFloat(elecStr.match(/[\d.]+/)?.[0] || "0");
      // Taiwan residential peak: ~4.05 NT/kWh. >5 = clear overcharge, >6 = serious
      elecMin = elecMax = rate > 6 ? 3 : rate > 5 ? 2 : rate > 0 ? 0 : 1.5;
    }

    let waterMin = 0, waterMax = 0;
    if (waterSt === "missing")          { waterMax = 2; }
    else if (waterSt === "partial")     { waterMin = waterMax = 1; }
    else if (waterSt === "conflict")    { waterMin = waterMax = 2; }
    else                                { waterMin = waterMax = 0; }

    const combinedMin = Math.min(elecMin + waterMin, max);
    const combinedMax = Math.min(elecMax + waterMax, max);
    const combinedSt = elecSt === "missing" || waterSt === "missing" ? "missing" : elecSt;
    return field("utilities", "水電費", combinedMin, combinedMax, combinedSt, val(elecFv));
  }

  function scoreManagementFee(rhir) {
    const fv = get(rhir, "cost.managementFee");
    const s = st(fv); const v = val(fv);
    const { min, max } = scoreStatus(s, 3, 0);
    return field("managementFee", "管理費", min, max, s, v);
  }

  function scoreInternetFee(rhir) {
    const fv = get(rhir, "cost.internetFee");
    const s = st(fv); const v = val(fv);
    const { min, max } = scoreStatus(s, 2, 0);
    return field("internetFee", "網路費", min, max, s, v);
  }

  function scoreCleaningFee(rhir) {
    const fv = get(rhir, "cost.cleaningFee");
    const s = st(fv); const v = val(fv);
    // 0 = no cleaning fee disclosed → low risk; nonzero but clear → still low
    const ds = (v === 0 || v === null && s === "disclosed") ? 0 : 0;
    const { min, max } = scoreStatus(s, 2, ds);
    return field("cleaningFee", "清潔費", min, max, s, v);
  }

  // No RHIR field for "other fees" → always uncertain
  function scoreOtherFees() {
    return field("otherFees", "其他費用", 0, 2, "missing", null);
  }

  // ── 居住安全 (max 20) ────────────────────────────────────────

  function scoreRooftopAddition(rhir) {
    const fv = get(rhir, "safety.rooftopAddition");
    const s = st(fv); const v = val(fv);
    // true = rooftop addition (bad), false = not (good)
    const ds = v === false ? 0 : v === true ? 4 : 2;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("rooftopAddition", "頂樓加蓋", min, max, s, v);
  }

  function scoreIllegalPartition(rhir) {
    const fv = get(rhir, "safety.illegalPartition");
    const s = st(fv); const v = val(fv);
    const ds = v === false ? 0 : v === true ? 4 : 2;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("illegalPartition", "違法隔間", min, max, s, v);
  }

  function scoreEscapeRoute(rhir) {
    const fv = get(rhir, "safety.escapeRoute");
    const s = st(fv); const v = val(fv);
    // partial "僅一處主要逃生口" → will hit 50% = 2 (reasonable for single exit)
    const ds = v ? 0 : 3;
    const { min, max } = scoreStatus(s, 4, ds);
    return field("escapeRoute", "逃生動線", min, max, s, v);
  }

  function scoreFireEquipment(rhir) {
    const fv = get(rhir, "safety.fireEquipment");
    const s = st(fv); const v = val(fv);
    // partial "有滅火器、無偵煙器" → 50% = 1.5 (has some but not complete)
    const ds = v ? 0 : 2;
    const { min, max } = scoreStatus(s, 3, ds);
    return field("fireEquipment", "消防設備", min, max, s, v);
  }

  function scoreWaterLeak(rhir) {
    const fv = get(rhir, "safety.waterLeak");
    const s = st(fv); const v = val(fv);
    const ds = v === false ? 0 : v === true ? 2 : 1;
    const { min, max } = scoreStatus(s, 2, ds);
    return field("waterLeak", "漏水狀況", min, max, s, v);
  }

  function scoreElectricalSafety(rhir) {
    const fv = get(rhir, "safety.electricalSafety");
    const s = st(fv); const v = val(fv);
    // "獨立電表" is good
    const ds = v ? 0 : 1.5;
    const { min, max } = scoreStatus(s, 2, ds);
    return field("electricalSafety", "電線安全", min, max, s, v);
  }

  function scoreDoorLock(rhir) {
    const fv = get(rhir, "safety.doorLock");
    const s = st(fv); const v = val(fv);
    const ds = v ? 0 : 1;
    const { min, max } = scoreStatus(s, 1, ds);
    return field("doorLock", "門鎖安全", min, max, s, v);
  }

  // ── 租客權益 (max 20) ────────────────────────────────────────

  function scoreTaxRegistration(rhir) {
    const fv = get(rhir, "leaseTerms.taxRegistrationAllowed");
    const s = st(fv); const v = val(fv);
    // allowed=true → 0 risk, allowed=false → max risk
    const ds = v === true ? 0 : v === false ? 5 : 2.5;
    const { min, max } = scoreStatus(s, 5, ds);
    return field("taxRegistrationAllowed", "是否可報稅", min, max, s, v);
  }

  function scoreHouseholdRegistration(rhir) {
    const fv = get(rhir, "leaseTerms.householdRegistrationAllowed");
    const s = st(fv); const v = val(fv);
    const ds = v === true ? 0 : v === false ? 5 : 2.5;
    const { min, max } = scoreStatus(s, 5, ds);
    return field("householdRegistrationAllowed", "是否可遷戶籍", min, max, s, v);
  }

  function scoreTaxBurdenShift(rhir) {
    const fv = get(rhir, "rights.taxBurdenShift");
    const s = st(fv); const v = val(fv);
    // shift=true (bad), shift=false (good)
    const ds = v === true ? 5 : v === false ? 0 : 2.5;
    const { min, max } = scoreStatus(s, 5, ds);
    return field("taxBurdenShift", "稅負轉嫁", min, max, s, v);
  }

  function scoreUnfairTerms(rhir) {
    const fv = get(rhir, "rights.unfairTerms");
    const s = st(fv); const v = val(fv);
    // unfairTerms=truthy (bad), null/false (good)
    const ds = v ? 5 : 0;
    const { min, max } = scoreStatus(s, 5, ds);
    return field("unfairTerms", "不合理條款", min, max, s, v);
  }

  // ── 生活適配度 (max 20) ──────────────────────────────────────

  function scoreCommute(rhir) {
    const mrtFv = get(rhir, "locationContext.nearestMRT");
    const campusFv = get(rhir, "locationContext.nearbyCampus");
    const hasMrt    = st(mrtFv) !== "missing" && val(mrtFv);
    const hasCampus = st(campusFv) !== "missing" && val(campusFv);
    if (!hasMrt && !hasCampus) return field("commuteConvenience", "通勤便利", 0, 4, "missing", null);
    // Has some location info but not full distance data → treat as partial
    return field("commuteConvenience", "通勤便利", 2, 2, "partial", val(mrtFv));
  }

  function missingField(fieldId, label, maxScore) {
    return field(fieldId, label, 0, maxScore, "missing", null);
  }

  function scorePetsAllowed(rhir) {
    const fv = get(rhir, "leaseTerms.petsAllowed");
    const s = st(fv); const v = val(fv);
    // allowed=true → 0, allowed=false → 3 (restrictive), null → unknown
    const ds = v === true ? 0 : v === false ? 3 : 1.5;
    const { min, max } = scoreStatus(s, 3, ds);
    return field("petsAllowed", "寵物限制", min, max, s, v);
  }

  // ── aggregation ──────────────────────────────────────────────

  function sumFields(fields) {
    let min = 0, max = 0;
    for (const f of fields) { min += f.min; max += f.max; }
    return { min: Math.round(min * 4) / 4, max: Math.round(max * 4) / 4 };
  }

  const STAGE_RULES = {
    Y1: [
      ["progress.contactRole", "counterparty_identity_unknown", "對方身分尚未確認"],
      ["progress.addressConfirmed", "property_identity_uncertain", "看房地址尚未完整確認"],
    ],
    Y2: [
      ["safety.onSiteCondition", "on_site_condition_missing", "尚未保存現場屋況"],
      ["progress.listingDifferences", "listing_reality_gap_unknown", "尚未確認現場與刊登差異"],
    ],
    Y3: [
      ["progress.unresolvedIssues", "negotiation_unresolved", "仍有尚未談妥事項"],
      ["progress.paymentPressure", "payment_pressure", "存在付款催促或期限壓力"],
    ],
    Y4: [
      ["contract.lessorAuthority", "lessor_authority_unknown", "出租權限尚未確認"],
      ["leaseTerms.specialClauses", "special_clause_review", "特殊條款需要人工審閱"],
      ["payment.preContractStatus", "precontract_payment_unknown", "簽約前付款與收據狀態不清楚"],
    ],
    Z1: [
      ["occupancy.inventory", "handover_inventory_missing", "點交設備清冊尚未保存"],
      ["occupancy.existingDamage", "existing_damage_unknown", "入住前既有損傷尚未確認"],
      ["payment.initialPayment", "initial_receipt_missing", "首期付款或收據尚未確認"],
    ],
    Z2: [
      ["performance.repairIssue", "repair_performance_issue", "存在入住後修繕事件"],
      ["performance.privacyIssue", "occupancy_privacy_issue", "存在隱私或使用干擾"],
      ["performance.utilityDispute", "utility_performance_dispute", "存在水電或費用履約爭議"],
    ],
  };

  function buildStageAssessment(rhir, stage) {
    const rules = STAGE_RULES[stage] || [];
    const findings = rules.flatMap(([path, riskType, message]) => {
      const fieldValue = get(rhir, path);
      const status = st(fieldValue);
      const value = val(fieldValue);
      const isIncidentField = stage === "Z2" || path === "progress.paymentPressure" || path === "progress.unresolvedIssues";
      const active = isIncidentField ? Boolean(value) : status === "missing" || value == null || value === "";
      if (!active) return [];
      return [{
        rhirField: path,
        disclosureStatus: isIncidentField ? (status === "conflict" ? "conflict" : "disclosed") : "missing",
        riskType,
        severity: status === "conflict" || isIncidentField ? "attention" : "information-gap",
        message,
      }];
    });
    return {
      stage: stage || "X",
      ruleVersion: "xyz-stage-v1",
      findings,
    };
  }

  // ── public API ───────────────────────────────────────────────

  function calculate(rhirBundle, options = {}) {
    if (!rhirBundle) return null;

    const dims = {
      contractTransparency: {
        label: "契約透明度",
        fields: [
          scoreHasWrittenContract(rhirBundle),
          scoreReviewPeriod(rhirBundle),
          scoreRepairResponsibility(rhirBundle),
          scoreEarlyTermination(rhirBundle),
          scoreDepositRefund(rhirBundle),
        ],
      },
      costTransparency: {
        label: "費用透明度",
        fields: [
          scoreMonthlyRent(rhirBundle),
          scoreDeposit(rhirBundle),
          scoreUtilities(rhirBundle),
          scoreManagementFee(rhirBundle),
          scoreInternetFee(rhirBundle),
          scoreCleaningFee(rhirBundle),
          scoreOtherFees(),
        ],
      },
      housingSafety: {
        label: "居住安全",
        fields: [
          scoreRooftopAddition(rhirBundle),
          scoreIllegalPartition(rhirBundle),
          scoreEscapeRoute(rhirBundle),
          scoreFireEquipment(rhirBundle),
          scoreWaterLeak(rhirBundle),
          scoreElectricalSafety(rhirBundle),
          scoreDoorLock(rhirBundle),
        ],
      },
      tenantRights: {
        label: "租客權益",
        fields: [
          scoreTaxRegistration(rhirBundle),
          scoreHouseholdRegistration(rhirBundle),
          scoreTaxBurdenShift(rhirBundle),
          scoreUnfairTerms(rhirBundle),
        ],
      },
      lifestyleFit: {
        label: "生活適配度",
        fields: [
          scoreCommute(rhirBundle),
          missingField("noiseCondition",    "噪音",     4),
          missingField("lightingCondition", "採光",     3),
          missingField("garbageDisposal",   "垃圾處理", 3),
          missingField("roommateCondition", "室友條件", 3),
          scorePetsAllowed(rhirBundle),
        ],
      },
    };

    // Attach dim-level min/max
    for (const d of Object.values(dims)) {
      const { min, max } = sumFields(d.fields);
      d.min = min; d.max = max;
    }

    const allDims = Object.values(dims);
    const minScore = Math.round(allDims.reduce((s, d) => s + d.min, 0));
    const maxScore = Math.round(allDims.reduce((s, d) => s + d.max, 0));
    const midScore = Math.round((minScore + maxScore) / 2);

    return {
      minScore,
      maxScore,
      midScore,
      levelMin: levelLabel(minScore),
      levelMax: levelLabel(maxScore),
      isCertain: minScore === maxScore,
      dimensions: dims,
      stageAssessment: buildStageAssessment(rhirBundle, options.stage || "X"),
    };
  }

  function levelLabel(score) {
    if (score <= 20) return "低風險";
    if (score <= 40) return "中低風險";
    if (score <= 60) return "中風險";
    if (score <= 80) return "高風險";
    return "極高風險";
  }

  window.RU_RRI = { calculate, levelLabel, buildStageAssessment, STAGE_RULES };

})();
