// New rental form - create the initial version X

const { useEffect: useEffectF, useMemo: useMemoF, useRef: useRefF, useState: useStateF } = React;

const FORM_FIELD_SPECS = [
  { key: "property.propertyType", label: "房型", group: "property", type: "text" },
  { key: "property.buildingType", label: "物件類型", group: "property", type: "text" },
  { key: "property.floor", label: "樓層", group: "property", type: "number" },
  { key: "property.totalFloors", label: "總樓層", group: "property", type: "number" },
  { key: "property.areaPing", label: "坪數", group: "property", type: "number" },
  { key: "property.district", label: "行政區", group: "property", type: "text" },
  { key: "property.hasFurniture", label: "是否附家具", group: "property", type: "enum" },
  { key: "leaseTerms.petsAllowed", label: "是否可養寵物", group: "lease", type: "boolean" },
  { key: "cost.monthlyRent", label: "租金", group: "cost", type: "number" },
  { key: "cost.deposit", label: "押金", group: "cost", type: "number" },
  { key: "cost.electricityRate", label: "電費計價", group: "cost", type: "text" },
  { key: "cost.waterFee", label: "水費", group: "cost", type: "text" },
  { key: "cost.managementFee", label: "管理費", group: "cost", type: "text" },
  { key: "cost.internetFee", label: "網路費", group: "cost", type: "text" },
  { key: "cost.eligibleForSubsidy", label: "是否可申請租補", group: "cost", type: "boolean" },
  { key: "leaseTerms.hasWrittenContract", label: "是否有書面契約", group: "lease", type: "boolean" },
  { key: "leaseTerms.reviewPeriod", label: "是否有審閱期", group: "lease", type: "text" },
  { key: "leaseTerms.repairResponsibility", label: "修繕責任", group: "lease", type: "text" },
  { key: "leaseTerms.earlyTerminationClause", label: "提前解約條件", group: "lease", type: "text" },
  { key: "leaseTerms.depositRefundTerms", label: "押金退還方式", group: "lease", type: "text" },
  { key: "leaseTerms.notes", label: "其他契約備註", group: "lease", type: "text" },
  { key: "safety.rooftopAddition", label: "是否頂樓加蓋", group: "safety", type: "boolean" },
  { key: "safety.illegalPartition", label: "是否違法隔間", group: "safety", type: "boolean" },
  { key: "safety.escapeRoute", label: "逃生動線", group: "safety", type: "text" },
  { key: "safety.fireEquipment", label: "消防設備", group: "safety", type: "text" },
  { key: "safety.waterLeak", label: "漏水狀況", group: "safety", type: "text" },
  { key: "safety.doorLock", label: "門鎖與出入安全", group: "safety", type: "text" },
  { key: "leaseTerms.taxRegistrationAllowed", label: "是否可報稅", group: "lease", type: "boolean" },
  { key: "leaseTerms.householdRegistrationAllowed", label: "是否可遷戶籍", group: "lease", type: "boolean" },
  { key: "rights.taxBurdenShift", label: "是否有稅負轉嫁條款", group: "rights", type: "boolean" },
  { key: "rights.unfairTerms", label: "是否存在不合理條款", group: "rights", type: "boolean" },
];

const FIELD_GROUP_TITLES = {
  property: "物件基本資訊",
  cost: "租金與費用",
  lease: "契約條件",
  safety: "居住安全",
  rights: "權益限制",
};

// Visual section → list of schema keys actually rendered in that UI section.
// (Note: this differs from FORM_FIELD_SPECS.group because petsAllowed sits in
//  the property section visually but is grouped as "lease" in the spec, and
//  tax/household registration sit in the rights section but are "lease" too.)
const SECTION_FIELD_KEYS = {
  property: [
    "property.propertyType", "property.buildingType",
    "property.floor", "property.totalFloors", "property.areaPing",
    "property.district", "property.hasFurniture", "leaseTerms.petsAllowed",
  ],
  cost: [
    "cost.monthlyRent", "cost.deposit", "cost.electricityRate",
    "cost.waterFee", "cost.managementFee", "cost.internetFee",
    "cost.eligibleForSubsidy",
  ],
  lease: [
    "leaseTerms.hasWrittenContract", "leaseTerms.reviewPeriod",
    "leaseTerms.repairResponsibility", "leaseTerms.earlyTerminationClause",
    "leaseTerms.depositRefundTerms", "leaseTerms.notes",
  ],
  safety: [
    "safety.rooftopAddition", "safety.illegalPartition", "safety.escapeRoute",
    "safety.fireEquipment", "safety.waterLeak", "safety.doorLock",
  ],
  rights: [
    "leaseTerms.taxRegistrationAllowed", "leaseTerms.householdRegistrationAllowed",
    "rights.taxBurdenShift", "rights.unfairTerms",
  ],
};

const FORM_SPEC_BY_KEY = Object.fromEntries(
  (typeof FORM_FIELD_SPECS !== "undefined" ? FORM_FIELD_SPECS : []).map(s => [s.key, s])
);

const FormValidationContext = React.createContext({});

const REQUIRED_FORM_KEYS = new Set([
  "property.propertyType",
  "property.buildingType",
  "property.floor",
  "property.totalFloors",
  "property.areaPing",
  "property.district",
  "cost.monthlyRent",
  "cost.deposit",
  "leaseTerms.hasWrittenContract",
  "safety.rooftopAddition",
  "leaseTerms.taxRegistrationAllowed",
  "leaseTerms.householdRegistrationAllowed",
]);

const FIELD_ALLOWED_VALUES = {
  "property.propertyType": ["套房", "雅房", "整層住家", "分租住宅"],
  "property.buildingType": ["公寓", "電梯大樓", "透天"],
  "property.hasFurniture": ["yes", "no", "partial"],
  "leaseTerms.petsAllowed": ["yes", "no", "null"],
  "cost.eligibleForSubsidy": ["yes", "no", "null"],
  "leaseTerms.hasWrittenContract": ["yes", "no", "null"],
  "safety.rooftopAddition": ["yes", "no", "null"],
  "safety.illegalPartition": ["yes", "no", "null"],
  "leaseTerms.taxRegistrationAllowed": ["yes", "no", "null"],
  "leaseTerms.householdRegistrationAllowed": ["yes", "no", "null"],
  "rights.taxBurdenShift": ["yes", "no", "null"],
  "rights.unfairTerms": ["yes", "no", "null"],
};

const SCHEMA_PREFIX_TO_FORM_SECTION = {
  property: "property",
  cost: "cost",
  leaseTerms: "lease",
  safety: "safety",
  rights: "rights",
};

function sectionFromSchemaKey(key) {
  const prefix = String(key || "").split(".")[0];
  return SCHEMA_PREFIX_TO_FORM_SECTION[prefix] || "property";
}

function isBlankFormValue(value) {
  return value == null || value === "" || value === "null";
}

function numberFromFormValue(value) {
  if (isBlankFormValue(value)) return null;
  const normalized = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : NaN;
}

function validateFormValues(values) {
  const errors = {};

  FORM_FIELD_SPECS.forEach((spec) => {
    const rawValue = values?.[spec.key];
    const label = spec.label || spec.key;
    const blank = isBlankFormValue(rawValue);

    if (REQUIRED_FORM_KEYS.has(spec.key) && blank) {
      errors[spec.key] = "這是必填欄位，請先填寫或選擇。";
      return;
    }

    if (blank) return;

    const allowed = FIELD_ALLOWED_VALUES[spec.key];
    if (allowed && !allowed.includes(String(rawValue))) {
      errors[spec.key] = "這個欄位只能使用系統提供的選項。";
      return;
    }

    if (spec.type === "boolean" && !["yes", "no", "null"].includes(String(rawValue))) {
      errors[spec.key] = "請選擇是、否或未確認。";
      return;
    }

    if (spec.type === "enum" && !["yes", "no", "partial"].includes(String(rawValue))) {
      errors[spec.key] = "請選擇是、否或部分。";
      return;
    }

    if (spec.type === "number") {
      const value = numberFromFormValue(rawValue);
      if (!Number.isFinite(value)) {
        errors[spec.key] = `${label} 必須是數字。`;
        return;
      }
      if (value <= 0) {
        errors[spec.key] = `${label} 必須大於 0。`;
        return;
      }
      if ((spec.key === "property.floor" || spec.key === "property.totalFloors") && !Number.isInteger(value)) {
        errors[spec.key] = `${label} 必須是整數。`;
      }
    }
  });

  const floor = numberFromFormValue(values?.["property.floor"]);
  const totalFloors = numberFromFormValue(values?.["property.totalFloors"]);
  if (Number.isFinite(floor) && Number.isFinite(totalFloors) && floor > totalFloors) {
    errors["property.floor"] = "樓層不能大於總樓層。";
    errors["property.totalFloors"] = "總樓層必須大於或等於樓層。";
  }

  return errors;
}

function computeFormStats(values) {
  const sections = {};
  const overall = { disclosed: 0, partial: 0, missing: 0, inferred: 0, total: 0 };
  for (const [sectionId, keys] of Object.entries(SECTION_FIELD_KEYS)) {
    let filled = 0, partial = 0, missing = 0;
    for (const key of keys) {
      const type = FORM_SPEC_BY_KEY[key]?.type || "text";
      const status = getDisclosureStatus(values?.[key], type);
      overall[status] = (overall[status] || 0) + 1;
      overall.total += 1;
      if (status === "disclosed") filled += 1;
      else if (status === "partial") partial += 1;
      else missing += 1;
    }
    sections[sectionId] = { filled, partial, missing, total: keys.length };
  }
  return { sections, overall };
}

function formFieldValue(value, disclosureStatus = "disclosed", sourceType = "user_input", extra = {}) {
  return {
    value,
    disclosureStatus,
    sourceType,
    ...extra,
  };
}

function coerceFieldValue(rawValue, type) {
  if (rawValue == null || rawValue === "") return null;
  if (rawValue === "null") return null;
  if (type === "boolean") {
    if (rawValue === "yes") return true;
    if (rawValue === "no") return false;
    return null;
  }
  if (type === "enum") {
    return rawValue;
  }
  if (type === "number") {
    const normalized = Number(String(rawValue).replace(/[^\d.-]/g, ""));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return rawValue;
}

function getDisclosureStatus(rawValue, type) {
  if (rawValue == null || rawValue === "" || rawValue === "null") return "missing";
  if (rawValue === "partial") return "partial";
  if (type === "text" && String(rawValue).includes("尚未確認")) return "missing";
  return "disclosed";
}

function formatFieldGroupValue(value) {
  if (value == null) return null;
  if (typeof value === "boolean") return value ? "是" : "否";
  if (value === "yes") return "是";
  if (value === "no") return "否";
  if (value === "partial") return "部分";
  return String(value);
}

function setRhirGroupField(root, key, fieldValue) {
  const [group, leaf] = key.split(".");
  if (!root[group]) root[group] = {};
  root[group][leaf] = fieldValue;
}

function readFormValues(formEl) {
  const values = {};
  formEl.querySelectorAll("[data-schema-key]").forEach((node) => {
    const schemaKey = node.getAttribute("data-schema-key");
    const activeSeg = node.querySelector(".seg button.active");
    if (activeSeg) {
      values[schemaKey] = activeSeg.getAttribute("data-seg-value");
      return;
    }
    const input = node.querySelector("input, select, textarea");
    values[schemaKey] = input ? input.value.trim() : null;
  });
  return values;
}

function buildFormRhirBundle({ values, versionLabel = "X" }) {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const isoMinute = `${isoDate} ${now.toTimeString().slice(0, 5)}`;
  const recordId = `RHIR-FORM-${now.getTime()}`;
  const propertyType = values["property.propertyType"] || "租屋物件";
  const district = values["property.district"] || "未標示行政區";
  const buildingType = values["property.buildingType"] || "";
  const rentNumber = Number(values["cost.monthlyRent"] || 0);

  const rhir = {
    metadata: {
      rhirRecordId: formFieldValue(recordId, "disclosed", "platform"),
      rhirVersion: formFieldValue("0.1", "disclosed", "platform"),
      createdAt: formFieldValue(isoDate, "disclosed", "platform"),
      updatedAt: formFieldValue(isoDate, "disclosed", "platform"),
      sourcePlatform: formFieldValue("user-form", "disclosed", "user_input"),
      listingStatus: formFieldValue("draft", "disclosed", "user_input"),
    },
    property: {},
    cost: {},
    leaseTerms: {},
    safety: {},
    rights: {},
    transparencyLayer: {},
  };

  const fieldGroupsMap = {};
  const fieldsNeedingUserQuestion = [];
  let disclosedCount = 0;
  let partialCount = 0;
  let missingCount = 0;

  FORM_FIELD_SPECS.forEach((spec) => {
    const rawValue = values[spec.key];
    const disclosureStatus = getDisclosureStatus(rawValue, spec.type);
    const normalizedValue = coerceFieldValue(rawValue, spec.type);

    setRhirGroupField(
      rhir,
      spec.key,
      formFieldValue(normalizedValue, disclosureStatus, "user_input")
    );

    if (disclosureStatus === "disclosed") disclosedCount += 1;
    if (disclosureStatus === "partial") partialCount += 1;
    if (disclosureStatus === "missing") {
      missingCount += 1;
      fieldsNeedingUserQuestion.push(spec.key);
    }

    if (!fieldGroupsMap[spec.group]) {
      fieldGroupsMap[spec.group] = {
        id: spec.group,
        title: FIELD_GROUP_TITLES[spec.group] || spec.group,
        fields: [],
      };
    }

    fieldGroupsMap[spec.group].fields.push({
      key: spec.key,
      label: spec.label,
      value: formatFieldGroupValue(normalizedValue),
      status: disclosureStatus,
      src: "user_input",
    });
  });

  const followupQuestions = window.RU.createFollowupQuestions(fieldsNeedingUserQuestion);

  rhir.transparencyLayer = {
    disclosedFieldCount: formFieldValue(disclosedCount, "disclosed", "systemInference"),
    partialFieldCount: formFieldValue(partialCount, "disclosed", "systemInference"),
    missingFieldCount: formFieldValue(missingCount, "disclosed", "systemInference"),
    conflictFieldCount: formFieldValue(0, "disclosed", "systemInference"),
    inferredFieldCount: formFieldValue(0, "disclosed", "systemInference"),
    fieldsNeedingUserQuestion: formFieldValue(fieldsNeedingUserQuestion, "disclosed", "systemInference"),
    followupQuestions: formFieldValue(followupQuestions, "disclosed", "systemInference"),
    notes: formFieldValue("由使用者表單直接轉成 RHIR JSON。", "disclosed", "user_input"),
  };

  const fieldGroups = ["property", "cost", "lease", "safety", "rights"]
    .map((groupId) => fieldGroupsMap[groupId])
    .filter(Boolean);
  const completion = FORM_FIELD_SPECS.length
    ? (disclosedCount + partialCount) / FORM_FIELD_SPECS.length
    : 0;

  return {
    recordId,
    bundle: {
      record: {
        id: recordId,
        title: `${district} ${propertyType}${buildingType ? ` ${buildingType}` : ""}`.trim(),
        address: district,
        district,
        summary: `${propertyType}${buildingType ? ` / ${buildingType}` : ""}`,
        rent: rentNumber,
        updatedAt: isoMinute,
        createdAt: isoDate,
        versions: [versionLabel],
        rri: null,
        riskLevel: "尚未分析",
        hasReport: false,
        completion,
      },
      versions: [
        {
          id: versionLabel,
          label: versionLabel,
          title: "表單建立的初始版本",
          createdAt: isoMinute,
          author: "使用者",
          diff: { added: disclosedCount + partialCount, changed: 0, removed: 0 },
          completion,
          rri: null,
          riskLevel: "尚未分析",
          hasReport: false,
          note: "由表單欄位一一對應轉成 RHIR JSON。",
        },
      ],
      fieldGroups,
      rhir,
      report: null,
    },
  };
}

function RHIRPreviewModal({ rhir, onClose, onFillMissing }) {
  const { Icon, downloadJSON, getRhirRecordId, highlightJSON } = window.RU;
  const recordId = getRhirRecordId(rhir);
  const followupQuestions = window.RU.getFollowupQuestionsFromRhir(rhir);
  const [uploadState, setUploadState] = useStateF("idle"); // "idle" | "uploading" | "success" | "error"
  const [uploadError, setUploadError] = useStateF(null);

  async function handleUpload() {
    if (!window.RU_SUPABASE?.isConfigured()) {
      setUploadState("error");
      setUploadError("Supabase 尚未設定，請先在 supabase.jsx 填入 Project URL 和 Anon Key，然後重新整理頁面。");
      return;
    }
    setUploadState("uploading");
    setUploadError(null);
    try {
      await window.RU_SUPABASE.uploadRhir(rhir);
      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setUploadError(err.message);
    }
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" style={{ width: "min(960px, calc(100vw - 32px))" }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>RHIR 預覽 <span className="mono" style={{ color: "#1652f0" }}>{recordId}</span></h3>
        </div>
        <div className="modal-body" style={{ maxHeight: "70vh", overflow: "auto" }}>
          {followupQuestions.length > 0 && (
            <div className="callout" style={{ marginBottom: 12 }}>
              <span className="ic"><Icon name="info" size={14} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <strong>下一次看房或詢問時建議補齊：</strong>
                  {onFillMissing && (
                    <button
                      className="btn btn-sm"
                      style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                      onClick={() => { onFillMissing(); onClose(); }}
                    >
                      <Icon name="sparkle" size={12} />
                      一鍵補齊
                    </button>
                  )}
                </div>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {followupQuestions.slice(0, 6).map((item) => (
                    <li key={item.field} style={{ marginBottom: 4 }}>
                      {item.question}
                      <span className="mono" style={{ color: "#8a93a0", marginLeft: 6 }}>{item.field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {uploadState === "error" && uploadError && (
            <div className="callout" style={{ marginBottom: 12, background: "var(--s-missing-bg)" }}>
              <span className="ic" style={{ color: "var(--s-missing-ink)" }}>
                <Icon name="alert" size={14} />
              </span>
              <div style={{ color: "var(--s-missing-ink)" }}>{uploadError}</div>
            </div>
          )}
          <pre className="import-json" dangerouslySetInnerHTML={{ __html: highlightJSON(rhir) }} />
        </div>
        <div className="modal-foot" style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
          {uploadState === "success" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--s-disclosed-ink)", fontSize: 13, marginRight: 4 }}>
              <Icon name="check" size={14} />
              已上傳至 RHIR 資料庫
            </span>
          ) : (
            <button
              className="btn"
              onClick={handleUpload}
              disabled={uploadState === "uploading"}
            >
              {uploadState === "uploading" ? (
                "上傳中..."
              ) : (
                <>
                  <Icon name="database" size={14} />
                  上傳到 RHIR 資料庫
                </>
              )}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => downloadJSON(rhir, recordId)}>
            <Icon name="download" size={14} />
            下載 RHIR JSON
          </button>
          <button className="btn" onClick={onClose}>
            <Icon name="x" size={14} />
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

// 10 租約人格範本 — 「一鍵補齊」從這裡隨機抽一份填入空白欄位
const LEASE_TEMPLATES = [
  {
    _name: "友善透明型",
    electricityRate: "台電計價（獨立電表）",
    waterFee: "台水計價（獨立水表）",
    managementFee: "1500",
    internetFee: "含網路（光纖 100M）",
    eligibleForSubsidy: "yes",
    hasWrittenContract: "yes",
    reviewPeriod: "7 天",
    repairResponsibility: "主要設備（冷氣、熱水器、冰箱）由房東負擔，耗材由房客自理",
    earlyTermination: "提前 30 天書面通知，不收違約金",
    depositReturnTerms: "退租後 7 日內退還，扣除實際損耗",
    notes: "房東提供完整合約草稿可先審閱，歡迎攜帶親友一同看房。",
    rooftopAddition: "no",
    illegalPartition: "no",
    escapeRoute: "走廊暢通，有兩處逃生出口，鐵窗可開啟",
    fireEquipment: "每層有偵煙器與滅火器，每年定期檢查",
    waterLeak: "目前無漏水，牆面無壁癌",
    doorLock: "電子鎖 + 大樓磁扣門禁，進出有記錄",
    taxRegistrationAllowed: "yes",
    householdRegistrationAllowed: "yes",
    taxBurdenShift: "no",
    unfairTerms: "no",
  },
  {
    _name: "常見普通型",
    electricityRate: "5 元 / 度",
    waterFee: "均分",
    managementFee: "800",
    internetFee: "含網路",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "3 天",
    repairResponsibility: "依情況協商",
    earlyTermination: "提前 1 個月告知",
    depositReturnTerms: "退租後 14 日內退還",
    notes: "網路速度未說明，報稅、租補資格需另行確認。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "有主要逃生出口",
    fireEquipment: "未揭露",
    waterLeak: "實地看房時確認",
    doorLock: "傳統鑰匙門鎖",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "費用模糊型",
    electricityRate: "另計",
    waterFee: "均分",
    managementFee: "另計",
    internetFee: "另計",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "尚未確認",
    repairResponsibility: "尚未確認",
    earlyTermination: "尚未確認",
    depositReturnTerms: "尚未確認",
    notes: "電費、管理費、網路費均未明確說明計算方式，垃圾代收費、清潔費未揭露。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "",
    fireEquipment: "",
    waterLeak: "",
    doorLock: "",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "偏向房東條款型",
    electricityRate: "5.5 元 / 度",
    waterFee: "固定 300",
    managementFee: "1200",
    internetFee: "300",
    eligibleForSubsidy: "no",
    hasWrittenContract: "yes",
    reviewPeriod: "尚未確認",
    repairResponsibility: "設備故障一律由房客負責維修或賠償",
    earlyTermination: "提前解約須沒收全額押金",
    depositReturnTerms: "扣除清潔費、維修費後退還，標準由房東認定",
    notes: "房東保留定期進入查看房間的權利，需簽署同意書。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "有逃生出口",
    fireEquipment: "未揭露",
    waterLeak: "未揭露",
    doorLock: "傳統門鎖",
    taxRegistrationAllowed: "no",
    householdRegistrationAllowed: "no",
    taxBurdenShift: "yes",
    unfairTerms: "yes",
  },
  {
    _name: "不合理條款型",
    electricityRate: "6 元 / 度",
    waterFee: "固定 500",
    managementFee: "另計",
    internetFee: "另計",
    eligibleForSubsidy: "no",
    hasWrittenContract: "yes",
    reviewPeriod: "no",
    repairResponsibility: "所有損壞一律由房客全額負擔",
    earlyTermination: "提前解約押金全額沒收，另需賠償剩餘租期租金 50%",
    depositReturnTerms: "退租後 60 日內退還，扣除清潔費、重新粉刷費、維修費",
    notes: "合約有大量罰款條款：晚繳 1 天罰 1000 元，擅帶訪客罰 2000 元，禁止辦公及業務使用。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "未揭露",
    fireEquipment: "未揭露",
    waterLeak: "未揭露",
    doorLock: "傳統門鎖，房東保留鑰匙",
    taxRegistrationAllowed: "no",
    householdRegistrationAllowed: "no",
    taxBurdenShift: "yes",
    unfairTerms: "yes",
  },
  {
    _name: "學生套房型",
    electricityRate: "4.8 元 / 度",
    waterFee: "均分",
    managementFee: "0",
    internetFee: "含網路",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "尚未確認",
    repairResponsibility: "依情況協商，小型修繕房客自理",
    earlyTermination: "提前 1 個月通知，違約金 1 個月租金",
    depositReturnTerms: "退租後 14 日內退還",
    notes: "限學生優先租賃，需提供學生證。不可報稅或戶籍遷入未明確說明。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "未揭露",
    fireEquipment: "未揭露",
    waterLeak: "未揭露",
    doorLock: "磁扣門禁",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "頂樓加蓋疑慮型",
    electricityRate: "另計（夏季冷氣費用較高）",
    waterFee: "均分",
    managementFee: "0",
    internetFee: "另計",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "3 天",
    repairResponsibility: "屋頂漏水維修責任不明確",
    earlyTermination: "提前 1 個月告知",
    depositReturnTerms: "退租後 30 日內退還",
    notes: "位於頂樓，夏季可能悶熱，是否為合法使用空間未揭露。",
    rooftopAddition: "yes",
    illegalPartition: null,
    escapeRoute: "未揭露",
    fireEquipment: "未揭露",
    waterLeak: "未揭露",
    doorLock: "傳統門鎖",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "老公寓分租型",
    electricityRate: "台電計價均分",
    waterFee: "均分",
    managementFee: "0",
    internetFee: "共用網路均分",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "3 天",
    repairResponsibility: "公共區域修繕責任不明確，私有空間自理",
    earlyTermination: "提前 1 個月告知",
    depositReturnTerms: "退租後 14 日內退還",
    notes: "多人分租，共用衛浴與廚房，公共區域清潔由租客輪流負責。房東不同住。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "走廊有出口，但公共區域雜物較多",
    fireEquipment: "未揭露",
    waterLeak: "實地看房時確認",
    doorLock: "傳統鑰匙，公共大門有門禁",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "寵物友善費用不透明型",
    electricityRate: "5 元 / 度",
    waterFee: "台水計價",
    managementFee: "800",
    internetFee: "含網路",
    eligibleForSubsidy: null,
    hasWrittenContract: "yes",
    reviewPeriod: "3 天",
    repairResponsibility: "寵物造成損壞由房客全額負擔，標準由房東認定",
    earlyTermination: "提前 1 個月告知",
    depositReturnTerms: "扣除清潔費（寵物清潔費用標準不明確）後退還",
    notes: "可養寵物，但需額外繳交寵物押金，金額未明確說明。入住前需確認押金扣除標準。",
    rooftopAddition: null,
    illegalPartition: null,
    escapeRoute: "有逃生出口",
    fireEquipment: "未揭露",
    waterLeak: "實地看房時確認",
    doorLock: "電子鎖",
    taxRegistrationAllowed: null,
    householdRegistrationAllowed: null,
    taxBurdenShift: null,
    unfairTerms: null,
  },
  {
    _name: "包租代管型",
    electricityRate: "台電計價（獨立電表）",
    waterFee: "台水計價",
    managementFee: "2000（含代管服務費）",
    internetFee: "300",
    eligibleForSubsidy: "yes",
    hasWrittenContract: "yes",
    reviewPeriod: "5 天",
    repairResponsibility: "通報代管公司，由專業人員處理，24 小時緊急服務",
    earlyTermination: "提前 1 個月書面通知，需支付代管手續費",
    depositReturnTerms: "退租後 14 日內退還，有正式清點程序",
    notes: "由包租代管公司統一管理，聯絡窗口明確。管理費含行政費與清潔費，請確認細項。仲介費另計。",
    rooftopAddition: "no",
    illegalPartition: "no",
    escapeRoute: "公共逃生動線清楚標示",
    fireEquipment: "符合消防法規，定期送檢",
    waterLeak: "目前無異常",
    doorLock: "智慧型門禁 + 監視系統",
    taxRegistrationAllowed: "yes",
    householdRegistrationAllowed: "yes",
    taxBurdenShift: "no",
    unfairTerms: "no",
  },
];

// schema key (from readFormValues) → seed key
const SCHEMA_TO_SEED = {
  "property.propertyType": "propertyType",
  "property.buildingType": "buildingType",
  "property.floor": "floor",
  "property.totalFloors": "totalFloor",
  "property.areaPing": "sizePing",
  "property.district": "district",
  "property.hasFurniture": "hasFurniture",
  "leaseTerms.petsAllowed": "petAllowed",
  "cost.monthlyRent": "rent",
  "cost.deposit": "deposit",
  "cost.electricityRate": "electricityRate",
  "cost.waterFee": "waterFee",
  "cost.managementFee": "managementFee",
  "cost.internetFee": "internetFee",
  "cost.eligibleForSubsidy": "eligibleForSubsidy",
  "leaseTerms.hasWrittenContract": "hasWrittenContract",
  "leaseTerms.reviewPeriod": "reviewPeriod",
  "leaseTerms.repairResponsibility": "repairResponsibility",
  "leaseTerms.earlyTerminationClause": "earlyTermination",
  "leaseTerms.depositRefundTerms": "depositReturnTerms",
  "leaseTerms.notes": "notes",
  "safety.rooftopAddition": "rooftopAddition",
  "safety.illegalPartition": "illegalPartition",
  "safety.escapeRoute": "escapeRoute",
  "safety.fireEquipment": "fireEquipment",
  "safety.waterLeak": "waterLeak",
  "safety.doorLock": "doorLock",
  "leaseTerms.taxRegistrationAllowed": "taxRegistrationAllowed",
  "leaseTerms.householdRegistrationAllowed": "householdRegistrationAllowed",
  "rights.taxBurdenShift": "taxBurdenShift",
  "rights.unfairTerms": "unfairTerms",
};

function schemaValuesToSeed(schemaValues) {
  const seed = buildEmptyImportSeed();
  for (const [schemaKey, seedKey] of Object.entries(SCHEMA_TO_SEED)) {
    const val = schemaValues[schemaKey];
    if (val !== null && val !== undefined) seed[seedKey] = val;
  }
  return seed;
}

// Schema keys whose RHIR value is a boolean (true/false) but whose form seed
// uses "yes"/"no" strings (because the form's Seg components store option keys).
const BOOLEAN_SCHEMA_KEYS = new Set([
  "property.hasFurniture",
  "leaseTerms.petsAllowed",
  "leaseTerms.hasWrittenContract",
  "safety.rooftopAddition",
  "safety.illegalPartition",
  "leaseTerms.taxRegistrationAllowed",
  "leaseTerms.householdRegistrationAllowed",
  "rights.taxBurdenShift",
  "rights.unfairTerms",
  "cost.eligibleForSubsidy",
]);

// Convert an RHIR bundle back into a form seed so the form can pre-fill
// when editing or creating a sub-version.
function seedFromRhirBundle(rhir) {
  const seed = buildEmptyImportSeed();
  if (!rhir) return seed;
  for (const [schemaKey, seedKey] of Object.entries(SCHEMA_TO_SEED)) {
    const fv = schemaKey.split(".").reduce((o, k) => (o == null ? undefined : o[k]), rhir);
    if (!fv) continue;
    const v = fv.value;
    if (v === null || v === undefined) continue;
    if (BOOLEAN_SCHEMA_KEYS.has(schemaKey)) {
      seed[seedKey] = v === true ? "yes" : v === false ? "no" : v;
    } else {
      seed[seedKey] = typeof v === "number" ? String(v) : v;
    }
  }
  return seed;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildRandomFormSeed() {
  const propertyType = pick(["套房", "雅房", "整層住家", "分租住宅"]);
  const buildingType = pick(["公寓", "電梯大樓", "透天"]);
  const district = pick(["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區"]);
  const floor = randInt(2, 12);
  const totalFloor = Math.max(floor, randInt(floor, floor + 10));
  const sizePing = randInt(4, 18);
  const rent = randInt(8500, 32000);
  const depositMonths = pick([1, 2]);
  const managementFee = pick(["500", "800", "1200", "尚未確認", "0"]);
  const internetFee = pick(["0", "300", "500", "尚未確認"]);
  const reviewPeriod = pick(["3 天", "5 天", "7 天", "尚未確認"]);
  const earlyTermination = pick(["提前 30 天通知", "違約金 1 個月租金", "提前 14 天通知", "尚未確認"]);
  const notes = pick([
    "可先線上看合約重點，入住前再確認清潔費與垃圾代收。",
    "房東表示可談短租，但需另外確認是否加價。",
    "目前僅確認基本條件，水電與修繕責任還要二次確認。",
    "房源主打近學區與捷運，但未提供完整附家具清單。",
  ]);

  return {
    propertyType,
    buildingType,
    floor: String(floor),
    totalFloor: String(totalFloor),
    sizePing: String(sizePing),
    district,
    hasFurniture: pick(["yes", "no", "partial"]),
    petAllowed: pick(["yes", "no", null]),

    rent: String(rent),
    deposit: String(rent * depositMonths),
    electricityRate: pick(["台電計價", "4.8 元 / 度", "5 元 / 度", "5.5 元 / 度"]),
    waterFee: pick(["台水計價", "固定 100", "均分"]),
    managementFee,
    internetFee,
    eligibleForSubsidy: pick(["yes", "no", null]),

    hasWrittenContract: pick(["yes", "no"]),
    reviewPeriod,
    repairResponsibility: pick([
      "房客負擔小型維修",
      "房東負擔主要設備維修",
      "依合約條款分工",
      "尚未確認",
    ]),
    earlyTermination,
    depositReturnTerms: pick(["退租後 7 日內", "退租後 14 日內", "退租後 30 日內"]),
    notes,

    rooftopAddition: pick(["yes", "no", null]),
    illegalPartition: pick(["yes", "no", null]),
    escapeRoute: pick(["兩處逃生動線", "僅一處主要逃生口", "後陽台可作為第二出口"]),
    fireEquipment: pick(["有滅火器、無偵煙器", "有滅火器與偵煙器", "公共區域有消防設備"]),
    waterLeak: pick(["目前未見漏水", "浴室牆角疑似有水痕", "實地看房時確認"]),
    doorLock: pick(["獨立門禁 + 房門鎖", "磁扣門禁 + 電子鎖", "傳統門鎖 + 公共大門感應"]),

    taxRegistrationAllowed: pick(["yes", "no"]),
    householdRegistrationAllowed: pick(["yes", "no"]),
    taxBurdenShift: pick(["yes", "no", null]),
    unfairTerms: pick(["yes", "no", null]),
  };
}

function buildEmptyFormSeed() {
  return {
    propertyType: undefined,
    buildingType: undefined,
    floor: "",
    totalFloor: "",
    sizePing: "",
    district: "",
    hasFurniture: undefined,
    petAllowed: undefined,

    rent: "",
    deposit: "",
    electricityRate: "",
    waterFee: "",
    managementFee: "",
    internetFee: "",
    eligibleForSubsidy: undefined,

    hasWrittenContract: undefined,
    reviewPeriod: "",
    repairResponsibility: "",
    earlyTermination: "",
    depositReturnTerms: "",
    notes: "",

    rooftopAddition: undefined,
    illegalPartition: undefined,
    escapeRoute: "",
    fireEquipment: "",
    waterLeak: "",
    doorLock: "",

    taxRegistrationAllowed: undefined,
    householdRegistrationAllowed: undefined,
    taxBurdenShift: undefined,
    unfairTerms: undefined,
  };
}

function pickFirstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeCaptureText(text) {
  return String(text || "")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[，,]/g, "")
    .replace(/\s+/g, "");
}

function parseChineseNumber(value) {
  const map = { 一: 1, 二: 2, 兩: 2, 两: 2, 三: 3, 四: 4, 五: 5 };
  return map[value] || Number(value);
}

function extractDeposit(compact, rent) {
  const cash = pickFirstMatch(compact, [
    /押金(?:NT\$|NTD|\$)?(\d{4,6})/,
    /押(?:金)?(?:為|:|：)?(\d{4,6})/,
  ]);
  if (cash) return cash;

  const monthText = pickFirstMatch(compact, [
    /押金(?:為)?([一二兩两三四五\d])個月/,
    /押([一二兩两三四五\d])(?:個月|月)/,
    /押金([一二兩两三四五\d])個月/,
  ]);
  const months = parseChineseNumber(monthText);
  if (months && rent) return String(Number(rent) * months);
  return null;
}

function extractFee(compact, label) {
  const zero = new RegExp(`${label}(?:費)?(?:0元?|無|免|免費|已含|包含|含)`);
  if (zero.test(compact)) return compact.includes(`${label}已含`) || compact.includes(`${label}包含`) || compact.includes(`${label}含`) ? "包含" : "0";

  const separate = new RegExp(`${label}(?:費)?(?:另計|另收|自付|依帳單|照帳單)`);
  if (separate.test(compact)) return "另計";

  return pickFirstMatch(compact, [
    new RegExp(`${label}(?:費)?(?:NT\\$|NTD|\\$)?(\\d{1,5})(?:元)?`),
  ]);
}

function extractElectricityRate(compact) {
  if (/電費(?:依)?台電|台電計價|照台電/.test(compact)) return "台電計價";
  if (/電費(?:另計|另收|自付|依帳單|照帳單)/.test(compact)) return "另計";
  return pickFirstMatch(compact, [
    /電費(?:每度|一度|1度)?(\d+(?:\.\d+)?元?(?:\/度|一度|每度)?)/,
    /(\d+(?:\.\d+)?)元\/度/,
  ]);
}

function extractFurnitureStatus(text) {
  if (hasAny(text, ["無家具", "不附家具", "未附家具", "沒有家具"])) return "no";
  if (hasAny(text, ["附家具", "有家具", "提供家具", "家具齊全"])) return "yes";
  if (hasAny(text, ["部分家具", "基本家具", "家具"])) return "partial";
  return null;
}

function detectDistrictFromCapture(capture, fallback) {
  const title = capture?.title || "";
  const body = capture?.text || "";
  const text = `${title}\n${body}`;
  const districts = ["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區", "中正區", "松山區", "萬華區", "士林區", "北投區", "內湖區", "南港區", "新店區", "三重區", "新莊區"];
  const scored = districts
    .map((district) => {
      const firstIndex = text.indexOf(district);
      if (firstIndex < 0) return null;

      const occurrences = text.split(district).length - 1;
      const titleHit = title.includes(district) ? 120 : 0;
      const earlyHit = firstIndex < 600 ? 50 : firstIndex < 1400 ? 20 : 0;
      const contextPattern = new RegExp(`(地址|地區|區域|行政區|位置|地點).{0,30}${district}|${district}.{0,40}(租金|套房|雅房|整層|公寓|大樓|地址)`);
      const contextHit = contextPattern.test(text) ? 80 : 0;

      return {
        district,
        firstIndex,
        score: titleHit + earlyHit + contextHit + occurrences * 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.firstIndex - b.firstIndex);

  return scored[0]?.district || fallback;
}

function buildSeedFromCapture(capture, fallbackSeed) {
  const text = `${capture?.title || ""}\n${capture?.text || ""}`;
  const compact = normalizeCaptureText(text);
  const rent = pickFirstMatch(compact, [
    /租金(?:NT\$|NTD|\$)?(\d{4,6})/,
    /(?:NT\$|NTD|\$)(\d{4,6})(?:\/月|元|月)?/,
    /(\d{4,6})元\/月/,
  ]);
  const deposit = extractDeposit(compact, rent);
  const areaPing = pickFirstMatch(compact, [/(\d+(?:\.\d+)?)坪/]);
  const floor = pickFirstMatch(compact, [/(\d+)F(?:\/\d+F)?/, /(\d+)樓/]);
  const totalFloor = pickFirstMatch(compact, [/\d+F\/(\d+)F/, /共(\d+)樓/]);
  const electricityRate = extractElectricityRate(compact);
  const waterFee = extractFee(compact, "水");
  const managementFee = extractFee(compact, "管理");
  const internetFee = extractFee(compact, "網路");
  const furnitureStatus = extractFurnitureStatus(text);

  const propertyType = hasAny(text, ["雅房"]) ? "雅房" :
    hasAny(text, ["整層", "整層住家"]) ? "整層住家" :
    hasAny(text, ["分租"]) ? "分租住宅" :
    hasAny(text, ["套房"]) ? "套房" :
    fallbackSeed.propertyType;

  const buildingType = hasAny(text, ["電梯", "大樓"]) ? "電梯大樓" :
    hasAny(text, ["透天"]) ? "透天" :
    hasAny(text, ["公寓"]) ? "公寓" :
    fallbackSeed.buildingType;

  const yesNoUnknown = (yesWords, noWords, fallback) => {
    if (hasAny(text, noWords)) return "no";
    if (hasAny(text, yesWords)) return "yes";
    return fallback;
  };

  return {
    ...fallbackSeed,
    propertyType,
    buildingType,
    district: detectDistrictFromCapture(capture, fallbackSeed.district),
    floor: floor || fallbackSeed.floor,
    totalFloor: totalFloor || fallbackSeed.totalFloor,
    sizePing: areaPing || fallbackSeed.sizePing,
    rent: rent || fallbackSeed.rent,
    deposit: deposit || fallbackSeed.deposit,
    petAllowed: yesNoUnknown(["可寵", "可養寵物", "寵物可"], ["禁寵", "不可養寵物", "不可寵"], fallbackSeed.petAllowed),
    hasFurniture: furnitureStatus || fallbackSeed.hasFurniture,
    eligibleForSubsidy: yesNoUnknown(["可租補", "可申請租補", "租金補貼"], ["不可租補", "不能租補"], fallbackSeed.eligibleForSubsidy),
    hasWrittenContract: yesNoUnknown(["有契約", "書面契約"], ["無契約", "沒有契約"], fallbackSeed.hasWrittenContract),
    taxRegistrationAllowed: yesNoUnknown(["可報稅", "可以報稅"], ["不可報稅", "不能報稅", "禁報稅"], fallbackSeed.taxRegistrationAllowed),
    householdRegistrationAllowed: yesNoUnknown(["可遷戶籍", "可以遷戶籍"], ["不可遷戶籍", "不能遷戶籍"], fallbackSeed.householdRegistrationAllowed),
    rooftopAddition: yesNoUnknown(["頂樓加蓋"], ["非頂加", "不是頂樓加蓋"], fallbackSeed.rooftopAddition),
    illegalPartition: yesNoUnknown(["違法隔間"], ["非隔間", "非違法隔間"], fallbackSeed.illegalPartition),
    electricityRate: electricityRate || fallbackSeed.electricityRate,
    waterFee: waterFee || fallbackSeed.waterFee,
    managementFee: managementFee || fallbackSeed.managementFee,
    internetFee: internetFee || fallbackSeed.internetFee,
    notes: capture?.sourceUrl ? `由擴充功能匯入：${capture.sourceUrl}` : fallbackSeed.notes,
  };
}

function FormPage({ setRoute, mode = "new", versionLabel = "X", importId = "", editRecordId = "", initialSection = "" }) {
  const { Icon } = window.RU;
  const isEditMode = !!editRecordId;
  const [section, setSection] = useStateF(initialSection || "property");
  const [seed, setSeed] = useStateF(() => {
    if (editRecordId) {
      const bundle = window.RU_DATA?.getRecordBundle?.(editRecordId);
      if (bundle?.rhir) return seedFromRhirBundle(bundle.rhir);
    }
    return buildEmptyFormSeed();
  });
  const [formResetKey, setFormResetKey] = useStateF(0);
  const [previewRhir, setPreviewRhir] = useStateF(null);
  const [importInput, setImportInput] = useStateF(importId || "");
  const [importNotice, setImportNotice] = useStateF("");
  const [formErrors, setFormErrors] = useStateF({});
  const formRef = useRefF(null);

  // Reactive form stats. Recomputed whenever the form is interacted with,
  // the seed is replaced (regenerate / fill missing / import / edit-mode),
  // or React commits (via formResetKey).
  const [tick, setTick] = useStateF(0);
  const [stats, setStats] = useStateF(() => computeFormStats({}));

  // Version name (user-editable). Default depends on mode.
  const [versionTitle, setVersionTitle] = useStateF(
    editRecordId ? `補件版本 ${versionLabel}` : "初始版本"
  );

  useEffectF(() => {
    if (!formRef.current) return;
    const values = readFormValues(formRef.current);
    setStats(computeFormStats(values));
  }, [tick, formResetKey, seed]);

  const bumpTick = () => setTick((t) => t + 1);

  const handleFormInteraction = (event) => {
    bumpTick();
    const fieldNode = event.target?.closest?.("[data-schema-key]");
    const schemaKey = fieldNode?.getAttribute("data-schema-key");
    if (!schemaKey) return;
    setFormErrors((current) => {
      if (!current[schemaKey]) return current;
      const next = { ...current };
      delete next[schemaKey];
      return next;
    });
  };

  const focusFirstInvalidField = (errors) => {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    setSection(sectionFromSchemaKey(firstKey));
    window.setTimeout(() => {
      const node = formRef.current?.querySelector(`[data-schema-key="${firstKey}"]`);
      node?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      node?.querySelector?.("input, select, textarea, button")?.focus?.();
    }, 0);
  };

  useEffectF(() => {
    if (editRecordId) {
      const bundle = window.RU_DATA?.getRecordBundle?.(editRecordId);
      if (bundle?.rhir) {
        setSeed(seedFromRhirBundle(bundle.rhir));
        setFormResetKey((k) => k + 1);
      }
    }
  }, [editRecordId]);

  const SECTION_META = [
    { id: "property", title: "物件基本資訊", step: "01" },
    { id: "cost",     title: "租金與費用",   step: "02" },
    { id: "lease",    title: "契約與條款",   step: "03" },
    { id: "safety",   title: "安全與屋況",   step: "04" },
    { id: "rights",   title: "權益限制",     step: "05" },
  ];

  const SECTIONS = SECTION_META.map(s => ({
    ...s,
    filled: stats.sections[s.id]?.filled ?? 0,
    total:  stats.sections[s.id]?.total  ?? 0,
  }));

  const totalFilled = stats.overall.disclosed + stats.overall.partial;
  const totalFields = stats.overall.total;
  const pct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  const handleGenerate = () => {
    setSeed(buildRandomFormSeed());
    setFormResetKey((value) => value + 1);
  };

  const handleLoadImport = (id = importInput) => {
    const cleanId = String(id || "").trim();
    if (!cleanId) {
      setImportNotice("請先輸入匯入 ID。");
      return;
    }
    const imported = window.RU_DATA.getCaptureImport(cleanId);
    if (!imported) {
      setImportNotice("找不到這個匯入 ID。請確認擴充功能已經打開過 Rent Unfiltered。");
      return;
    }
    setSeed(buildSeedFromCapture(imported.capture, buildEmptyFormSeed()));
    setFormResetKey((value) => value + 1);
    setImportInput(cleanId);
    setImportNotice(`已載入 ${cleanId}，表單已先用可辨識資訊預填。`);
  };

  useEffectF(() => {
    if (importId) handleLoadImport(importId);
  }, [importId]);

  const handleFillMissing = () => {
    if (!formRef.current) return;
    const schemaValues = readFormValues(formRef.current);
    const currentSeed = schemaValuesToSeed(schemaValues);
    const template = LEASE_TEMPLATES[Math.floor(Math.random() * LEASE_TEMPLATES.length)];
    const fallback = buildRandomFormSeed();
    const isEmpty = (v) => v === null || v === undefined || v === "" || v === "null";
    const merged = { ...currentSeed };
    // First pass: use template values (skip null entries — some templates
    // intentionally don't have an opinion on certain fields)
    for (const [key, val] of Object.entries(template)) {
      if (key === "_name") continue;
      if (isEmpty(merged[key]) && !isEmpty(val)) merged[key] = val;
    }
    // Second pass: fill anything still empty with random seed values so the
    // form reaches 100% — no field is left missing.
    for (const [key, val] of Object.entries(fallback)) {
      if (isEmpty(merged[key]) && !isEmpty(val)) merged[key] = val;
    }
    setSeed(merged);
    setFormResetKey((k) => k + 1);
  };

  const handlePreviewRhir = () => {
    if (!formRef.current) return;
    const values = readFormValues(formRef.current);
    const { bundle } = buildFormRhirBundle({ values, versionLabel });
    setPreviewRhir(bundle.rhir);
  };

  const handleCreateVersion = () => {
    if (!formRef.current) return;
    const values = readFormValues(formRef.current);
    const errors = validateFormValues(values);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      focusFirstInvalidField(errors);
      return;
    }
    setFormErrors({});
    const title = (versionTitle || "").trim() || (isEditMode ? `補件版本 ${versionLabel}` : "初始版本");
    const completion = totalFields > 0 ? (totalFilled / totalFields) : 0;

    if (isEditMode) {
      // Build a fresh RHIR but keep the existing record id, appending a new
      // version entry instead of replacing.
      const { bundle: tmp } = buildFormRhirBundle({ values, versionLabel });
      window.RU_DATA.addSubVersion(editRecordId, tmp.rhir, {
        label: versionLabel,
        title,
        completion,
        note: `由表單於 ${new Date().toISOString().slice(0,10)} 建立`,
      });
      setRoute({ name: "detail", id: editRecordId });
    } else {
      const { bundle, recordId } = buildFormRhirBundle({ values, versionLabel });
      // Stamp user-chosen title onto the first version entry
      if (bundle.versions?.[0]) bundle.versions[0].title = title;
      if (bundle.record) bundle.record.title = bundle.record.title; // (record title is property summary, leave alone)
      window.RU_DATA.addImportedRecord(bundle);
      setRoute({ name: "detail", id: recordId });
    }
  };

  return (
    <FormValidationContext.Provider value={formErrors}>
    <div className="page">
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "#5a6573", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            {isEditMode ? "EDIT / SUB-VERSION" : "NEW RECORD · INITIAL VERSION"} <span style={{ color: "#1652f0" }}>{versionLabel}</span>
            {isEditMode && <span style={{ color: "#5a6573", marginLeft: 10 }}>· 基於 {editRecordId}</span>}
          </div>
          <h1 className="page-title">{isEditMode ? "編輯租屋資訊" : "新增租屋資訊"}</h1>
          <p className="page-sub">
            {isEditMode
              ? <>表單已預填現有版本的欄位內容。可直接修改、補件或刪改後建立<strong>新版本</strong>。原版本會保留為歷史紀錄。</>
              : <>這份表單會直接被轉成一份完整的 RHIR JSON。未填寫的欄位會被標示為{" "}
                  <span className="badge badge-missing"><span className="dot"></span>missing</span>，
                  方便之後補齊與追蹤。</>
            }
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => isEditMode ? setRoute({ name: "detail", id: editRecordId }) : setRoute({ name: "home" })}>返回</button>
          <button className="btn" onClick={handleGenerate}>
            <Icon name="sparkle" size={14} />
            一鍵隨機生成
          </button>
          <button className="btn">
            <Icon name="file" size={14} />
            暫存草稿
          </button>
          <button className="btn" onClick={handlePreviewRhir}>
            <Icon name="code" size={14} />
            預覽 RHIR
          </button>
          <button className="btn btn-primary" onClick={handleCreateVersion}>
            <Icon name="check" size={14} />
            {isEditMode ? `建立子版本 ${versionLabel}` : `建立版本 ${versionLabel}`}
          </button>
        </div>
      </div>

      <div className="form-shell">
        <aside className="form-side">
          <div className="side-title">表單章節</div>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a className={section === s.id ? "active" : ""} onClick={() => setSection(s.id)}>
                  <span><span className="mono" style={{ color: "#8a93a0", marginRight: 8, fontSize: 11 }}>{s.step}</span>{s.title}</span>
                  <span className="ok mono">{s.filled}/{s.total}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="side-title" style={{ marginTop: 24 }}>待詢問欄位補齊</div>
          <div style={{ fontSize: 11, color: "#5a6573", lineHeight: 1.7, padding: "4px 10px", marginBottom: 8 }}>
            從 10 種租約人格中隨機抽一份，只補入尚未填寫的欄位，已填的內容不會更動。
          </div>
          <div style={{ padding: "0 10px", marginBottom: 8 }}>
            <button type="button" className="btn btn-sm" style={{ width: "100%" }} onClick={handleFillMissing}>
              <Icon name="sparkle" size={12} />
              一鍵補齊空白欄位
            </button>
          </div>

          <div className="side-title" style={{ marginTop: 24 }}>測試說明</div>
          <div style={{ fontSize: 11, color: "#5a6573", lineHeight: 1.7, padding: "4px 10px" }}>
            按下「一鍵隨機生成」會自動灌入一組測試資料，方便快速驗證 RHIR 轉換、版本建立與報告流程。
          </div>

          <div className="side-title" style={{ marginTop: 24 }}>擴充匯入</div>
          <div style={{ padding: "4px 10px" }}>
            <input
              className="mono"
              value={importInput}
              onChange={(event) => setImportInput(event.target.value)}
              placeholder="RU-CAP-..."
              style={{ width: "100%", height: 32, marginBottom: 8 }}
            />
            <button type="button" className="btn btn-sm" style={{ width: "100%" }} onClick={() => handleLoadImport()}>
              <Icon name="download" size={12} />
              載入匯入 ID
            </button>
            {importNotice && <div style={{ fontSize: 11, color: "#5a6573", lineHeight: 1.6, marginTop: 8 }}>{importNotice}</div>}
          </div>
        </aside>

        <form key={formResetKey} ref={formRef} onInput={handleFormInteraction} onClick={handleFormInteraction} onChange={handleFormInteraction}>
          {SECTIONS.map((item) => (
            <div key={item.id} style={{ display: item.id === section ? "block" : "none" }}>
              <FormSection section={item} seed={seed} />
            </div>
          ))}
        </form>

        <aside>
          <div className="form-summary">
            <h4>表單填寫進度</h4>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{pct}<span style={{ fontSize: 14, color: "#8a93a0" }}>%</span></div>
              <div className="mono" style={{ fontSize: 11, color: "#5a6573" }}>{totalFilled}/{totalFields} 欄位</div>
            </div>
            <div className="meter"><div className="fill" style={{ width: `${pct}%` }} /></div>

            <div className="row"><span className="l">已揭露</span><span className="v">{stats.overall.disclosed}</span></div>
            <div className="row"><span className="l">部分揭露</span><span className="v">{stats.overall.partial}</span></div>
            <div className="row"><span className="l">尚未確認</span><span className="v">{stats.overall.missing}</span></div>
            <div className="row"><span className="l">推論欄位</span><span className="v">{stats.overall.inferred}</span></div>

            <h4 style={{ marginTop: 18 }}>版本資訊</h4>
            <div style={{ fontSize: 12, color: "#5a6573", marginBottom: 6 }}>
              版本編號 <span className="mono" style={{ color: "#1652f0", marginLeft: 4 }}>{versionLabel}</span>
              <span style={{ color: "#8a93a0", marginLeft: 6, fontSize: 11 }}>（系統自動編號）</span>
            </div>
            <div style={{ fontSize: 12, color: "#2a313b", marginBottom: 4 }}>版本名稱</div>
            <input
              type="text"
              value={versionTitle}
              onChange={(e) => setVersionTitle(e.target.value)}
              placeholder={isEditMode ? `補件版本 ${versionLabel}` : "初始版本"}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: 12,
                fontFamily: "inherit",
                border: "1px solid var(--hairline)",
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <div style={{ fontSize: 11, color: "#8a93a0", marginBottom: 10 }}>
              建立後會顯示在版本歷史，例如「補件後重新分析」「房東確認後」
            </div>

            <h4 style={{ marginTop: 18 }}>完成後會發生什麼</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12, color: "#2a313b" }}>
              <li style={{ display: "flex", gap: 8, padding: "5px 0", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon name="check" size={13} className="mono" /> 表單會轉成 RHIR JSON
                </span>
                <button type="button" className="btn btn-sm" onClick={handlePreviewRhir}>預覽</button>
              </li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                <Icon name="check" size={13} />
                {isEditMode
                  ? <>會新增子版本 <span className="mono" style={{ color: "#1652f0", marginLeft: 4 }}>{versionLabel}</span>，原版本保留</>
                  : <>可建立初始版本 <span className="mono" style={{ color: "#1652f0", marginLeft: 4 }}>{versionLabel}</span></>
                }
              </li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0", color: "#5a6573" }}><Icon name="info" size={13} /> AI 分析報告仍是手動觸發</li>
            </ul>
          </div>
        </aside>
      </div>

      {previewRhir && <RHIRPreviewModal rhir={previewRhir} onClose={() => setPreviewRhir(null)} onFillMissing={handleFillMissing} />}
    </div>
    </FormValidationContext.Provider>
  );
}

function FormSection({ section, seed }) {
  if (!section) return null;
  return (
    <div className="form-section">
      <div className="form-section-head">
        <h3>{section.title}</h3>
        <span className="step mono">SECTION {section.step} · {section.filled}/{section.total}</span>
      </div>
      <div className="form-section-body">
        {section.id === "property" && <PropertySection seed={seed} />}
        {section.id === "cost" && <CostSection seed={seed} />}
        {section.id === "lease" && <LeaseSection seed={seed} />}
        {section.id === "safety" && <SafetySection seed={seed} />}
        {section.id === "rights" && <RightsSection seed={seed} />}
      </div>
    </div>
  );
}

function FieldInput({ label, hint, required, schemaKey, children }) {
  const errors = React.useContext(FormValidationContext);
  const error = errors?.[schemaKey];
  return (
    <div className={`field-input ${error ? "field-input-invalid" : ""}`} data-schema-key={schemaKey} data-label={label}>
      <label>
        {label}{required && <span className="req">*</span>}
        <span className="key mono">{schemaKey}</span>
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={String(o.v)}
          className={value === o.v ? "active" : ""}
          onClick={() => onChange(o.v)}
          type="button"
          data-seg-value={o.v == null ? "null" : String(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function PropertySection({ seed }) {
  const [propType, setPropType] = useStateF(seed.propertyType);
  const [bldg, setBldg] = useStateF(seed.buildingType);
  const [furniture, setFurniture] = useStateF(seed.hasFurniture);
  const [pet, setPet] = useStateF(seed.petAllowed);

  return (
    <>
      <FieldInput label="房型" required schemaKey="property.propertyType">
        <Seg value={propType} onChange={setPropType} options={[
          { v: "套房", l: "套房" },
          { v: "雅房", l: "雅房" },
          { v: "整層住家", l: "整層住家" },
          { v: "分租住宅", l: "分租住宅" },
        ]} />
      </FieldInput>
      <FieldInput label="物件類型" required schemaKey="property.buildingType">
        <Seg value={bldg} onChange={setBldg} options={[
          { v: "公寓", l: "公寓" },
          { v: "電梯大樓", l: "電梯大樓" },
          { v: "透天", l: "透天" },
        ]} />
      </FieldInput>
      <FieldInput label="樓層" required schemaKey="property.floor">
        <input defaultValue={seed.floor} />
      </FieldInput>
      <FieldInput label="總樓層" required schemaKey="property.totalFloors">
        <input defaultValue={seed.totalFloor} />
      </FieldInput>
      <FieldInput label="坪數" required schemaKey="property.areaPing" hint="室內實際坪數，不含公設">
        <input defaultValue={seed.sizePing} />
      </FieldInput>
      <FieldInput label="行政區" required schemaKey="property.district">
        <select defaultValue={seed.district}>
          <option value="">未確認</option>
          {["文山區", "大安區", "信義區", "中山區", "中正區", "松山區", "萬華區", "士林區", "北投區", "內湖區", "南港區", "板橋區", "永和區", "新店區", "三重區", "新莊區"].map((d) => <option key={d}>{d}</option>)}
        </select>
      </FieldInput>
      <FieldInput label="是否附家具" schemaKey="property.hasFurniture">
        <Seg value={furniture} onChange={setFurniture} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: "partial", l: "部分" },
        ]} />
      </FieldInput>
      <FieldInput label="是否可養寵物" schemaKey="leaseTerms.petsAllowed" hint="若未確認，會被記錄為 missing">
        <Seg value={pet} onChange={setPet} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
    </>
  );
}

function CostSection({ seed }) {
  const [subsidy, setSubsidy] = useStateF(seed.eligibleForSubsidy);

  return (
    <>
      <FieldInput label="租金" required schemaKey="cost.monthlyRent">
        <div className="field-input with-prefix" style={{ margin: 0 }}>
          <span className="prefix mono">NT$</span>
          <input defaultValue={seed.rent} />
        </div>
      </FieldInput>
      <FieldInput label="押金" required schemaKey="cost.deposit" hint="通常為 1 到 2 個月租金">
        <div className="field-input with-prefix" style={{ margin: 0 }}>
          <span className="prefix mono">NT$</span>
          <input defaultValue={seed.deposit} />
        </div>
      </FieldInput>
      <FieldInput label="電費計價" schemaKey="cost.electricityRate" hint="若不是台電計價，請填每度單價">
        <input defaultValue={seed.electricityRate} />
      </FieldInput>
      <FieldInput label="水費" schemaKey="cost.waterFee">
        <input defaultValue={seed.waterFee} />
      </FieldInput>
      <FieldInput label="管理費" schemaKey="cost.managementFee" hint="若尚未說明，先保留 missing">
        <input defaultValue={seed.managementFee} />
      </FieldInput>
      <FieldInput label="網路費" schemaKey="cost.internetFee">
        <input defaultValue={seed.internetFee} />
      </FieldInput>
      <FieldInput label="是否可申請租補" schemaKey="cost.eligibleForSubsidy">
        <Seg value={subsidy} onChange={setSubsidy} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "尚未確認" },
        ]} />
      </FieldInput>
    </>
  );
}

function LeaseSection({ seed }) {
  const [writtenContract, setWrittenContract] = useStateF(seed.hasWrittenContract);

  return (
    <>
      <FieldInput label="是否有書面契約" required schemaKey="leaseTerms.hasWrittenContract">
        <Seg value={writtenContract} onChange={setWrittenContract} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否有審閱期" schemaKey="leaseTerms.reviewPeriod">
        <input defaultValue={seed.reviewPeriod} />
      </FieldInput>
      <FieldInput label="修繕責任" schemaKey="leaseTerms.repairResponsibility" hint="若界線模糊，會被記為 partial">
        <input defaultValue={seed.repairResponsibility} />
      </FieldInput>
      <FieldInput label="提前解約條件" schemaKey="leaseTerms.earlyTerminationClause">
        <input defaultValue={seed.earlyTermination} />
      </FieldInput>
      <FieldInput label="押金退還方式" schemaKey="leaseTerms.depositRefundTerms">
        <input defaultValue={seed.depositReturnTerms} />
      </FieldInput>
      <div className="full">
        <FieldInput label="其他契約備註" schemaKey="leaseTerms.notes">
          <textarea defaultValue={seed.notes} />
        </FieldInput>
      </div>
    </>
  );
}

function SafetySection({ seed }) {
  const [rooftopAddition, setRooftopAddition] = useStateF(seed.rooftopAddition);
  const [illegalPartition, setIllegalPartition] = useStateF(seed.illegalPartition);

  return (
    <>
      <FieldInput label="是否頂樓加蓋" required schemaKey="safety.rooftopAddition">
        <Seg value={rooftopAddition} onChange={setRooftopAddition} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否違法隔間" schemaKey="safety.illegalPartition">
        <Seg value={illegalPartition} onChange={setIllegalPartition} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="逃生動線" schemaKey="safety.escapeRoute">
        <input defaultValue={seed.escapeRoute} />
      </FieldInput>
      <FieldInput label="消防設備" schemaKey="safety.fireEquipment">
        <input defaultValue={seed.fireEquipment} />
      </FieldInput>
      <FieldInput label="漏水狀況" schemaKey="safety.waterLeak">
        <input defaultValue={seed.waterLeak} />
      </FieldInput>
      <FieldInput label="門鎖與出入安全" schemaKey="safety.doorLock">
        <input defaultValue={seed.doorLock} />
      </FieldInput>
    </>
  );
}

function RightsSection({ seed }) {
  const [taxRegistrationAllowed, setTaxRegistrationAllowed] = useStateF(seed.taxRegistrationAllowed);
  const [householdRegistrationAllowed, setHouseholdRegistrationAllowed] = useStateF(seed.householdRegistrationAllowed);
  const [taxBurdenShift, setTaxBurdenShift] = useStateF(seed.taxBurdenShift);
  const [unfairTerms, setUnfairTerms] = useStateF(seed.unfairTerms);

  return (
    <>
      <FieldInput label="是否可報稅" required schemaKey="leaseTerms.taxRegistrationAllowed">
        <Seg value={taxRegistrationAllowed} onChange={setTaxRegistrationAllowed} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否可遷戶籍" required schemaKey="leaseTerms.householdRegistrationAllowed">
        <Seg value={householdRegistrationAllowed} onChange={setHouseholdRegistrationAllowed} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否有稅負轉嫁條款" schemaKey="rights.taxBurdenShift">
        <Seg value={taxBurdenShift} onChange={setTaxBurdenShift} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否存在不合理條款" schemaKey="rights.unfairTerms">
        <Seg value={unfairTerms} onChange={setUnfairTerms} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
    </>
  );
}
window.FormPage = FormPage;



