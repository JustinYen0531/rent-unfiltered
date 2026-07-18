// XYZ lifecycle contracts, immutable event reducer and stage-aware field specs.

(function initLifecycle(global) {
  const STAGES = {
    X: { code: "X", group: "X", label: "刊登判讀", order: 0 },
    Y1: { code: "Y1", group: "Y", label: "預約與看房準備", order: 10 },
    Y2: { code: "Y2", group: "Y", label: "現場看房", order: 20 },
    Y3: { code: "Y3", group: "Y", label: "條件談判", order: 30 },
    Y4: { code: "Y4", group: "Y", label: "契約與付款前", order: 40 },
    Z1: { code: "Z1", group: "Z", label: "點交與入住", order: 50 },
    Z2: { code: "Z2", group: "Z", label: "入住後履約", order: 60 },
  };

  const SOURCE_TYPES = [
    { value: "user_input", label: "我自行補充" },
    { value: "landlord_statement", label: "房東／仲介說法" },
    { value: "on_site_observation", label: "現場觀察" },
    { value: "contract", label: "契約原文" },
    { value: "payment_record", label: "付款／收據" },
  ];

  const FIELD_SPECS = {
    Y1: [
      { key: "progress.contactPerson", label: "聯絡對象", type: "text", required: true },
      { key: "progress.contactRole", label: "對方身分", type: "select", options: ["房東", "仲介", "二房東", "代管", "尚未確認"], required: true },
      { key: "progress.appointmentAt", label: "預約看房時間", type: "datetime-local" },
      { key: "progress.addressConfirmed", label: "地址是否已確認", type: "select", options: ["是", "否", "部分確認"] },
      { key: "progress.promisedInformation", label: "對方承諾提供的資訊", type: "textarea" },
      { key: "progress.questionsToAsk", label: "準備詢問事項", type: "textarea" },
    ],
    Y2: [
      { key: "safety.onSiteCondition", label: "現場整體屋況", type: "textarea", required: true },
      { key: "property.applianceCondition", label: "家具與設備狀況", type: "textarea" },
      { key: "safety.visibleDefects", label: "漏水、壁癌或其他缺陷", type: "textarea" },
      { key: "safety.escapeRoute", label: "逃生動線", type: "text" },
      { key: "safety.fireEquipment", label: "消防設備", type: "text" },
      { key: "cost.meterReading", label: "水電表與計價觀察", type: "textarea" },
      { key: "progress.listingDifferences", label: "與刊登內容的差異", type: "textarea" },
      { key: "progress.photoNote", label: "照片／影像備註", type: "textarea" },
    ],
    Y3: [
      { key: "cost.monthlyRent", label: "談判後月租", type: "number" },
      { key: "cost.deposit", label: "談判後押金", type: "number" },
      { key: "cost.additionalFees", label: "其他費用與計價", type: "textarea" },
      { key: "leaseTerms.repairResponsibility", label: "修繕責任回覆", type: "textarea" },
      { key: "leaseTerms.earlyTerminationClause", label: "提前解約回覆", type: "textarea" },
      { key: "rights.restrictions", label: "租補、報稅、設籍或其他限制", type: "textarea" },
      { key: "progress.landlordResponse", label: "對方完整回覆", type: "textarea", required: true },
      { key: "progress.unresolvedIssues", label: "尚未談妥事項", type: "textarea" },
      { key: "progress.paymentPressure", label: "付款催促與期限", type: "textarea" },
    ],
    Y4: [
      { key: "contract.version", label: "契約版本／草稿名稱", type: "text", required: true },
      { key: "contract.lessorAuthority", label: "出租人身分與出租權限", type: "textarea" },
      { key: "leaseTerms.duration", label: "租期", type: "text" },
      { key: "cost.monthlyRent", label: "契約月租", type: "number" },
      { key: "cost.deposit", label: "契約押金", type: "number" },
      { key: "leaseTerms.repairResponsibility", label: "契約修繕責任", type: "textarea" },
      { key: "leaseTerms.earlyTerminationClause", label: "契約提前解約", type: "textarea" },
      { key: "leaseTerms.specialClauses", label: "特殊條款", type: "textarea" },
      { key: "payment.preContractStatus", label: "付款與收據狀態", type: "textarea" },
    ],
    Z1: [
      { key: "occupancy.handoverAt", label: "點交／入住時間", type: "datetime-local", required: true },
      { key: "occupancy.keys", label: "鑰匙與門禁數量", type: "text" },
      { key: "occupancy.inventory", label: "設備清冊", type: "textarea" },
      { key: "occupancy.existingDamage", label: "既有損傷", type: "textarea" },
      { key: "occupancy.meterReadings", label: "水電表讀數", type: "textarea" },
      { key: "occupancy.photoNote", label: "點交照片備註", type: "textarea" },
      { key: "payment.initialPayment", label: "首期付款與收據", type: "textarea" },
    ],
    Z2: [
      { key: "performance.paymentLog", label: "租金／費用繳納", type: "textarea" },
      { key: "performance.repairIssue", label: "修繕事件", type: "textarea" },
      { key: "performance.communication", label: "通知與重要對話", type: "textarea" },
      { key: "performance.entryRequest", label: "房東進屋要求", type: "textarea" },
      { key: "performance.privacyIssue", label: "隱私或使用干擾", type: "textarea" },
      { key: "performance.utilityDispute", label: "水電或其他費用爭議", type: "textarea" },
      { key: "performance.nextAction", label: "下一步處理", type: "textarea" },
    ],
  };

  const PREREQUISITES = {
    Y1: [
      { path: "property.district", label: "房源行政區" },
      { path: "cost.monthlyRent", label: "刊登租金" },
    ],
    Y2: [{ path: "progress.contactPerson", label: "聯絡對象" }],
    Y3: [{ path: "safety.onSiteCondition", label: "現場看房紀錄" }],
    Y4: [{ path: "progress.landlordResponse", label: "談判或房東回覆" }],
    Z1: [{ path: "contract.version", label: "契約版本" }],
    Z2: [{ path: "occupancy.handoverAt", label: "點交／入住紀錄" }],
  };

  function clone(value) {
    if (value == null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function readPath(root, path) {
    return String(path || "").split(".").reduce((value, key) => value?.[key], root);
  }

  function writePath(root, path, value) {
    const keys = String(path || "").split(".");
    const leaf = keys.pop();
    const parent = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object" || Array.isArray(current[key])) current[key] = {};
      return current[key];
    }, root);
    parent[leaf] = value;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function snapshotHash(snapshot, eventId = "") {
    const input = `${eventId}\u0000${stableStringify(snapshot || {})}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `ru1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function normalizeInputValue(value, type) {
    if (value == null || value === "") return null;
    if (type === "number") {
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    }
    return String(value).trim();
  }

  function createRhirDelta(stage, values, sourceType, occurredAt, eventId) {
    const delta = {};
    for (const spec of FIELD_SPECS[stage] || []) {
      const normalized = normalizeInputValue(values?.[spec.key], spec.type);
      if (normalized == null || normalized === "") continue;
      writePath(delta, spec.key, {
        value: normalized,
        disclosureStatus: "disclosed",
        sourceType: sourceType || "user_input",
        stage,
        eventId,
        observedAt: occurredAt,
        confidence: 1,
        reviewStatus: "confirmed",
      });
    }
    return delta;
  }

  function mergeField(previous, incoming) {
    if (!previous || typeof previous !== "object" || !Object.prototype.hasOwnProperty.call(previous, "value")) {
      return clone(incoming);
    }
    if (stableStringify(previous.value) === stableStringify(incoming.value)) {
      return { ...clone(incoming), disclosureStatus: incoming.disclosureStatus || previous.disclosureStatus };
    }
    const previousConflicts = Array.isArray(previous.conflicts) ? previous.conflicts : [];
    return {
      ...clone(incoming),
      disclosureStatus: "conflict",
      conflicts: [
        ...clone(previousConflicts),
        {
          value: clone(previous.value),
          sourceType: previous.sourceType || "unknown",
          eventId: previous.eventId || null,
          observedAt: previous.observedAt || null,
        },
      ],
    };
  }

  function mergeSnapshot(previousSnapshot, delta) {
    const next = clone(previousSnapshot || {});
    function visit(node, path) {
      for (const [key, value] of Object.entries(node || {})) {
        const nextPath = [...path, key];
        if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
          const fieldPath = nextPath.join(".");
          writePath(next, fieldPath, mergeField(readPath(next, fieldPath), value));
        } else if (value && typeof value === "object" && !Array.isArray(value)) {
          visit(value, nextPath);
        }
      }
    }
    visit(delta || {}, []);
    return next;
  }

  function getMissingPrerequisites(stage, snapshot) {
    return (PREREQUISITES[stage] || []).filter(item => {
      const field = readPath(snapshot, item.path);
      return !field || field.value == null || field.value === "" || field.disclosureStatus === "missing";
    });
  }

  function nextDisplayCode(stage, events) {
    const count = (events || []).filter(event => event.substage === stage).length + 1;
    return `${stage}-${String(count).padStart(2, "0")}`;
  }

  function createEvent({ stage, values, sourceType, currentSnapshot, existingEvents, occurredAt, title, sourceReferences, legacyLabel }) {
    if (!STAGES[stage]) throw new Error(`未知的 XYZ 階段：${stage}`);
    const timestamp = occurredAt || new Date().toISOString();
    const eventId = global.crypto?.randomUUID
      ? global.crypto.randomUUID()
      : `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const rhirDelta = createRhirDelta(stage, values || {}, sourceType, timestamp, eventId);
    const cumulativeRhirSnapshot = mergeSnapshot(currentSnapshot || {}, rhirDelta);
    const displayCode = nextDisplayCode(stage, existingEvents);
    return {
      id: eventId,
      stage: STAGES[stage].group,
      substage: stage,
      eventType: values?.eventType || `${stage.toLowerCase()}_progress`,
      displayCode,
      title: title || STAGES[stage].label,
      occurredAt: timestamp,
      inputPayload: clone(values || {}),
      rhirDelta,
      cumulativeRhirSnapshot,
      cumulativeRriSnapshot: null,
      snapshotHash: snapshotHash(cumulativeRhirSnapshot, eventId),
      sourceType: sourceType || "user_input",
      sourceReferences: clone(sourceReferences || []),
      legacyLabel: legacyLabel || null,
      createdAt: new Date().toISOString(),
    };
  }

  function legacyVersionsToEvents(versions, latestSnapshot) {
    const chronological = [...(versions || [])].reverse();
    return chronological.map((version, index) => {
      const id = `legacy-${String(version.id || index).replace(/[^a-z0-9_-]/gi, "-")}`;
      const snapshot = index === chronological.length - 1 ? clone(latestSnapshot || {}) : null;
      return {
        id,
        stage: "X",
        substage: "X",
        eventType: "legacy_import",
        displayCode: `X-${String(index + 1).padStart(2, "0")}`,
        title: version.title || "既有刊登版本",
        occurredAt: version.createdAt || null,
        inputPayload: {},
        rhirDelta: {},
        cumulativeRhirSnapshot: snapshot,
        cumulativeRriSnapshot: version.rri == null ? null : { score: version.rri, level: version.riskLevel },
        snapshotHash: snapshot ? snapshotHash(snapshot, id) : null,
        sourceType: "legacy_version",
        sourceReferences: [],
        legacyLabel: version.label || version.id || null,
        createdAt: version.createdAt || null,
      };
    });
  }

  global.RU_LIFECYCLE = {
    STAGES,
    SOURCE_TYPES,
    FIELD_SPECS,
    PREREQUISITES,
    createEvent,
    createRhirDelta,
    getMissingPrerequisites,
    legacyVersionsToEvents,
    mergeSnapshot,
    nextDisplayCode,
    readPath,
    snapshotHash,
    stableStringify,
  };
})(window);
