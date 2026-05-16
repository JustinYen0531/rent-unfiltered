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

function formFieldValue(value, disclosureStatus = "disclosed", sourceType = "manualInput", extra = {}) {
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
      sourcePlatform: formFieldValue("user-form", "disclosed", "manualInput"),
      listingStatus: formFieldValue("draft", "disclosed", "manualInput"),
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
      formFieldValue(normalizedValue, disclosureStatus, "manualInput")
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
      src: "manualInput",
    });
  });

  rhir.transparencyLayer = {
    disclosedFieldCount: formFieldValue(disclosedCount, "disclosed", "systemInference"),
    partialFieldCount: formFieldValue(partialCount, "disclosed", "systemInference"),
    missingFieldCount: formFieldValue(missingCount, "disclosed", "systemInference"),
    conflictFieldCount: formFieldValue(0, "disclosed", "systemInference"),
    inferredFieldCount: formFieldValue(0, "disclosed", "systemInference"),
    fieldsNeedingUserQuestion: formFieldValue(fieldsNeedingUserQuestion, "disclosed", "systemInference"),
    notes: formFieldValue("由使用者表單直接轉成 RHIR JSON。", "disclosed", "manualInput"),
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

function RHIRPreviewModal({ rhir, onClose }) {
  const { Icon, downloadJSON, getRhirRecordId, highlightJSON } = window.RU;
  const recordId = getRhirRecordId(rhir);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" style={{ width: "min(960px, calc(100vw - 32px))" }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>RHIR 預覽 <span className="mono" style={{ color: "#1652f0" }}>{recordId}</span></h3>
        </div>
        <div className="modal-body" style={{ maxHeight: "70vh", overflow: "auto" }}>
          <pre className="import-json" dangerouslySetInnerHTML={{ __html: highlightJSON(rhir) }} />
        </div>
        <div className="modal-foot" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
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

function detectDistrict(text, fallback) {
  const districts = ["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區", "中正區", "松山區", "萬華區", "士林區", "北投區", "內湖區", "南港區", "新店區", "三重區", "新莊區"];
  return districts.find((district) => text.includes(district)) || fallback;
}

function buildSeedFromCapture(capture, fallbackSeed) {
  const text = `${capture?.title || ""}\n${capture?.text || ""}`;
  const compact = text.replace(/[,\s]/g, "");
  const rent = pickFirstMatch(compact, [
    /租金(?:NT\$|NTD|\$)?(\d{4,6})/,
    /(?:NT\$|NTD|\$)(\d{4,6})(?:\/月|元|月)?/,
    /(\d{4,6})元\/月/,
  ]);
  const deposit = pickFirstMatch(compact, [
    /押金(?:NT\$|NTD|\$)?(\d{4,6})/,
    /押金(\d+)個月/,
  ]);
  const areaPing = pickFirstMatch(compact, [/(\d+(?:\.\d+)?)坪/]);
  const floor = pickFirstMatch(compact, [/(\d+)F(?:\/\d+F)?/, /(\d+)樓/]);
  const totalFloor = pickFirstMatch(compact, [/\d+F\/(\d+)F/, /共(\d+)樓/]);

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
    if (hasAny(text, yesWords)) return "yes";
    if (hasAny(text, noWords)) return "no";
    return fallback;
  };

  return {
    ...fallbackSeed,
    propertyType,
    buildingType,
    district: detectDistrict(text, fallbackSeed.district),
    floor: floor || fallbackSeed.floor,
    totalFloor: totalFloor || fallbackSeed.totalFloor,
    sizePing: areaPing || fallbackSeed.sizePing,
    rent: rent || fallbackSeed.rent,
    deposit: deposit ? (deposit.length <= 2 && rent ? String(Number(rent) * Number(deposit)) : deposit) : fallbackSeed.deposit,
    petAllowed: yesNoUnknown(["可寵", "可養寵物", "寵物可"], ["禁寵", "不可養寵物", "不可寵"], fallbackSeed.petAllowed),
    hasFurniture: yesNoUnknown(["附家具", "有家具", "家具"], ["無家具", "不附家具"], fallbackSeed.hasFurniture),
    eligibleForSubsidy: yesNoUnknown(["可租補", "可申請租補", "租金補貼"], ["不可租補", "不能租補"], fallbackSeed.eligibleForSubsidy),
    hasWrittenContract: yesNoUnknown(["有契約", "書面契約"], ["無契約", "沒有契約"], fallbackSeed.hasWrittenContract),
    taxRegistrationAllowed: yesNoUnknown(["可報稅", "可以報稅"], ["不可報稅", "不能報稅", "禁報稅"], fallbackSeed.taxRegistrationAllowed),
    householdRegistrationAllowed: yesNoUnknown(["可遷戶籍", "可以遷戶籍"], ["不可遷戶籍", "不能遷戶籍"], fallbackSeed.householdRegistrationAllowed),
    rooftopAddition: yesNoUnknown(["頂樓加蓋"], ["非頂加", "不是頂樓加蓋"], fallbackSeed.rooftopAddition),
    illegalPartition: yesNoUnknown(["違法隔間"], ["非隔間", "非違法隔間"], fallbackSeed.illegalPartition),
    electricityRate: pickFirstMatch(compact, [/電費(?:每度)?(\d+(?:\.\d+)?元?)/]) || fallbackSeed.electricityRate,
    managementFee: pickFirstMatch(compact, [/管理費(?:NT\$|NTD|\$)?(\d{2,5})/]) || fallbackSeed.managementFee,
    internetFee: pickFirstMatch(compact, [/網路費(?:NT\$|NTD|\$)?(\d{2,5})/]) || fallbackSeed.internetFee,
    notes: capture?.sourceUrl ? `由擴充功能匯入：${capture.sourceUrl}` : fallbackSeed.notes,
  };
}

function FormPage({ setRoute, mode = "new", versionLabel = "X", importId = "" }) {
  const { Icon } = window.RU;
  const [section, setSection] = useStateF("property");
  const [seed, setSeed] = useStateF(() => buildRandomFormSeed());
  const [formResetKey, setFormResetKey] = useStateF(0);
  const [previewRhir, setPreviewRhir] = useStateF(null);
  const [importInput, setImportInput] = useStateF(importId || "");
  const [importNotice, setImportNotice] = useStateF("");
  const formRef = useRefF(null);

  const SECTIONS = [
    { id: "property", title: "物件基本資訊", step: "01", filled: 6, total: 8 },
    { id: "cost", title: "租金與費用", step: "02", filled: 4, total: 7 },
    { id: "lease", title: "契約與條款", step: "03", filled: 3, total: 6 },
    { id: "safety", title: "安全與屋況", step: "04", filled: 2, total: 6 },
    { id: "rights", title: "權益限制", step: "05", filled: 2, total: 4 },
  ];

  const totalFilled = SECTIONS.reduce((a, s) => a + s.filled, 0);
  const totalFields = SECTIONS.reduce((a, s) => a + s.total, 0);
  const pct = Math.round((totalFilled / totalFields) * 100);

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
    setSeed(buildSeedFromCapture(imported.capture, buildRandomFormSeed()));
    setFormResetKey((value) => value + 1);
    setImportInput(cleanId);
    setImportNotice(`已載入 ${cleanId}，表單已先用可辨識資訊預填。`);
  };

  useEffectF(() => {
    if (importId) handleLoadImport(importId);
  }, [importId]);

  const handlePreviewRhir = () => {
    if (!formRef.current) return;
    const values = readFormValues(formRef.current);
    const { bundle } = buildFormRhirBundle({ values, versionLabel });
    setPreviewRhir(bundle.rhir);
  };

  const handleCreateVersion = () => {
    if (!formRef.current) return;
    const values = readFormValues(formRef.current);
    const { bundle, recordId } = buildFormRhirBundle({ values, versionLabel });
    window.RU_DATA.addImportedRecord(bundle);
    setRoute({ name: "detail", id: recordId });
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "#5a6573", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            NEW RECORD · INITIAL VERSION <span style={{ color: "#1652f0" }}>{versionLabel}</span>
          </div>
          <h1 className="page-title">新增租屋資訊</h1>
          <p className="page-sub">
            這份表單會直接被轉成一份完整的 RHIR JSON。未填寫的欄位會被標示為{" "}
            <span className="badge badge-missing"><span className="dot"></span>missing</span>，
            方便之後補齊與追蹤。
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => setRoute({ name: "home" })}>返回</button>
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
            建立版本 {versionLabel}
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

        <form key={formResetKey} ref={formRef}>
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

            <div className="row"><span className="l">已揭露</span><span className="v">17</span></div>
            <div className="row"><span className="l">部分揭露</span><span className="v">2</span></div>
            <div className="row"><span className="l">尚未確認</span><span className="v">12</span></div>
            <div className="row"><span className="l">推論欄位</span><span className="v">5</span></div>

            <h4 style={{ marginTop: 18 }}>完成後會發生什麼</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12, color: "#2a313b" }}>
              <li style={{ display: "flex", gap: 8, padding: "5px 0", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon name="check" size={13} className="mono" /> 表單會轉成 RHIR JSON
                </span>
                <button type="button" className="btn btn-sm" onClick={handlePreviewRhir}>預覽</button>
              </li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0" }}><Icon name="check" size={13} /> 可建立初始版本 X</li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0", color: "#5a6573" }}><Icon name="info" size={13} /> AI 分析報告仍是手動觸發</li>
            </ul>
          </div>
        </aside>
      </div>

      {previewRhir && <RHIRPreviewModal rhir={previewRhir} onClose={() => setPreviewRhir(null)} />}
    </div>
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
  return (
    <div className="field-input" data-schema-key={schemaKey} data-label={label}>
      <label>
        {label}{required && <span className="req">*</span>}
        <span className="key mono">{schemaKey}</span>
      </label>
      {children}
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
          {["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區"].map((d) => <option key={d}>{d}</option>)}
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
        ]} />
      </FieldInput>
      <FieldInput label="是否可遷戶籍" required schemaKey="leaseTerms.householdRegistrationAllowed">
        <Seg value={householdRegistrationAllowed} onChange={setHouseholdRegistrationAllowed} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
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



