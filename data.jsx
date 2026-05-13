// Sample data + RHIR builder for Rent Unfiltered prototype

const STATUS = {
  disclosed: { ko: "已揭露", label: "disclosed" },
  partial: { ko: "部分揭露", label: "partial" },
  missing: { ko: "未揭露", label: "missing" },
  inferred: { ko: "推論", label: "inferred" },
  conflict: { ko: "資料衝突", label: "conflict" },
  supplemented: { ko: "已補件", label: "supplemented" },
  unknown: { ko: "未知", label: "unknown" },
};

// helper for FieldValue
const fv = (value, disclosureStatus = "disclosed", sourceType = "manualInput", extra = {}) => ({
  value,
  disclosureStatus,
  sourceType,
  ...extra,
});

// ---------- Three sample records, with versions ----------

const SAMPLE_RECORDS = [
  {
    id: "RHIR-2026-0142",
    title: "文山區指南路三段 5F-2 套房",
    address: "台北市文山區指南路三段 · 近政大正門",
    district: "文山區",
    summary: "套房 · 電梯大樓 · 5F / 12F · 8 坪",
    rent: 13500,
    updatedAt: "2026-05-10 14:22",
    createdAt: "2026-04-21",
    versions: ["X", "X-1", "X-2"],
    rri: 62,
    riskLevel: "中度風險",
    hasReport: true,
    completion: 0.78,
  },
  {
    id: "RHIR-2026-0138",
    title: "大安區師大路 4F 雅房",
    address: "台北市大安區師大路 · 師大夜市旁",
    district: "大安區",
    summary: "雅房 · 公寓 · 4F / 5F · 4.5 坪",
    rent: 9800,
    updatedAt: "2026-05-08 09:14",
    createdAt: "2026-04-18",
    versions: ["X", "X-1"],
    rri: 41,
    riskLevel: "高度風險",
    hasReport: true,
    completion: 0.62,
  },
  {
    id: "RHIR-2026-0151",
    title: "信義區松山路 3F 整層住家",
    address: "台北市信義區松山路 · 永春捷運站 5 分鐘",
    district: "信義區",
    summary: "整層住家 · 公寓 · 3F / 5F · 26 坪",
    rent: 32000,
    updatedAt: "2026-05-11 18:40",
    createdAt: "2026-05-05",
    versions: ["X"],
    rri: null,
    riskLevel: "未分析",
    hasReport: false,
    completion: 0.55,
  },
  {
    id: "RHIR-2026-0099",
    title: "中正區羅斯福路 7F-3 分租套房",
    address: "台北市中正區羅斯福路 · 公館商圈",
    district: "中正區",
    summary: "分租套房 · 電梯大樓 · 7F / 14F · 6 坪",
    rent: 11200,
    updatedAt: "2026-05-02 10:01",
    createdAt: "2026-03-28",
    versions: ["X", "X-1", "X-2", "X-3"],
    rri: 78,
    riskLevel: "低度風險",
    hasReport: true,
    completion: 0.91,
  },
];

// Detailed RHIR for record 0142 (the primary demo record)
function buildRecord0142() {
  return {
    metadata: {
      rhirRecordId: fv("RHIR-2026-0142", "disclosed", "platform"),
      rhirVersion: fv("0.1", "disclosed", "platform"),
      createdAt: fv("2026-04-21", "disclosed", "platform"),
      updatedAt: fv("2026-05-10", "disclosed", "platform"),
      sourcePlatform: fv("user-form", "disclosed", "manualInput"),
      listingStatus: fv("active", "disclosed", "manualInput"),
    },
    property: {
      propertyType: fv("套房", "disclosed", "manualInput", { sourceText: "表單填寫：房型 = 套房" }),
      buildingType: fv("電梯大樓", "disclosed", "manualInput"),
      floor: fv(5, "disclosed", "manualInput"),
      totalFloors: fv(12, "disclosed", "manualInput"),
      areaPing: fv(8, "disclosed", "manualInput"),
      hasFurniture: fv(true, "disclosed", "manualInput"),
      hasAppliances: fv("冷氣、冰箱、洗衣機", "partial", "manualInput", {
        sourceText: "提供品項列表不完整，未指明是否為共用",
      }),
      district: fv("?????", "disclosed", "manualInput"),
      cookingAllowed: fv(false, "disclosed", "manualInput"),
    },
    locationContext: {
      district: fv("文山區", "disclosed", "manualInput"),
      nearestMRT: fv("動物園站 / 約 14 分鐘", "inferred", "systemInference", {
        sourceText: "依地址自動推算步行時間",
        confidence: 0.82,
      }),
      nearbyCampus: fv("政治大學", "disclosed", "manualInput"),
    },
    cost: {
      monthlyRent: fv(13500, "disclosed", "manualInput"),
      deposit: fv(27000, "disclosed", "manualInput", { sourceText: "兩個月押金" }),
      utilities: fv("自付", "disclosed", "manualInput"),
      electricityRate: fv("5 元 / 度", "conflict", "manualInput", {
        sourceText: "表單填寫 5 元 / 度",
        conflicts: [
          { sourceType: "publicData", value: "台電夏季最高 4.05 元 / 度", note: "高於台電上限，疑似超收" },
        ],
      }),
      waterFee: fv("包含", "disclosed", "manualInput"),
      managementFee: fv(null, "missing", "manualInput"),
      internetFee: fv(null, "missing", "manualInput"),
      cleaningFee: fv(0, "disclosed", "manualInput"),
      eligibleForSubsidy: fv(null, "missing", "manualInput"),
      eligibleForTaxFiling: fv(false, "disclosed", "manualInput", {
        sourceText: "屋主表示不可報稅",
      }),
    },
    leaseTerms: {
      hasWrittenContract: fv(true, "disclosed", "manualInput"),
      reviewPeriod: fv(null, "missing", "manualInput"),
      petsAllowed: fv(null, "missing", "manualInput"),
      taxRegistrationAllowed: fv(false, "disclosed", "manualInput", {
        sourceText: "????????????",
      }),
      householdRegistrationAllowed: fv(false, "disclosed", "manualInput", {
        sourceText: "屋主表示不可遷戶籍",
      }),
      repairResponsibility: fv("房客負擔小型維修", "partial", "manualInput", {
        sourceText: "界線定義不清",
      }),
      earlyTerminationClause: fv(null, "missing", "manualInput"),
      depositRefundTerms: fv("退租後 30 日內", "disclosed", "manualInput"),
    },
    safety: {
      rooftopAddition: fv(false, "disclosed", "manualInput"),
      illegalPartition: fv(null, "missing", "manualInput"),
      escapeRoute: fv("僅一處主要逃生口", "partial", "manualInput"),
      fireEquipment: fv("有滅火器、無偵煙器", "partial", "manualInput"),
      waterLeak: fv(null, "missing", "manualInput"),
      electricalSafety: fv("獨立電表", "disclosed", "manualInput"),
      doorLock: fv("獨立門禁 + 房門鎖", "disclosed", "manualInput"),
    },
    rights: {
      taxBurdenShift: fv(null, "missing", "manualInput"),
      unfairTerms: fv(null, "missing", "manualInput"),
    },
    transparencyLayer: {
      disclosedFieldCount: fv(22, "disclosed", "systemInference"),
      partialFieldCount: fv(5, "disclosed", "systemInference"),
      missingFieldCount: fv(9, "disclosed", "systemInference"),
      conflictFieldCount: fv(1, "disclosed", "systemInference"),
      inferredFieldCount: fv(1, "disclosed", "systemInference"),
      fieldsNeedingUserQuestion: fv(
        ["cost.managementFee", "safety.illegalPartition", "leaseTerms.reviewPeriod"],
        "disclosed",
        "systemInference"
      ),
      notes: fv("此版本由使用者於 2026-05-10 手動補件後重新分類", "disclosed", "manualInput"),
    },
  };
}

// Versions metadata (timeline)
const VERSIONS_0142 = [
  {
    id: "X-2",
    label: "X-2",
    title: "補件後重新分析",
    createdAt: "2026-05-10 14:22",
    author: "你",
    diff: { added: 5, changed: 2, removed: 0 },
    completion: 0.78,
    rri: 62,
    riskLevel: "中度風險",
    hasReport: true,
    note: "補件水電費規則、寢室隔間方式；重新觸發 AI 分析。",
  },
  {
    id: "X-1",
    label: "X-1",
    title: "補充契約條件欄位",
    createdAt: "2026-05-02 11:08",
    author: "你",
    diff: { added: 3, changed: 0, removed: 0 },
    completion: 0.66,
    rri: 54,
    riskLevel: "中度風險",
    hasReport: true,
    note: "補充修繕責任與押金退還方式，未重新分析。",
  },
  {
    id: "X",
    label: "X",
    title: "初始版本",
    createdAt: "2026-04-21 22:51",
    author: "你",
    diff: { added: 24, changed: 0, removed: 0 },
    completion: 0.55,
    rri: 48,
    riskLevel: "中度風險",
    hasReport: true,
    note: "首次建立的完整基準資料，作為後續所有子版本的對照基礎。",
  },
];

// Field groups — definitions used for the Field Completion view
const FIELD_GROUPS = [
  {
    id: "property",
    title: "物件基本資料",
    fields: [
      { key: "property.propertyType", label: "房型", value: "套房", status: "disclosed", src: "manualInput" },
      { key: "property.buildingType", label: "物件類型", value: "電梯大樓", status: "disclosed", src: "manualInput" },
      { key: "property.floor", label: "樓層", value: "5F", status: "disclosed", src: "manualInput" },
      { key: "property.totalFloors", label: "總樓層", value: "12F", status: "disclosed", src: "manualInput" },
      { key: "property.areaPing", label: "坪數", value: "8 坪", status: "disclosed", src: "manualInput" },
      { key: "property.district", label: "行政區", value: "文山區", status: "disclosed", src: "manualInput" },
      { key: "property.hasAppliances", label: "附設備清單", value: "冷氣、冰箱、洗衣機", status: "partial", src: "manualInput" },
      { key: "leaseTerms.petsAllowed", label: "是否可養寵物", value: null, status: "missing", src: "manualInput" },
    ],
  },
  {
    id: "cost",
    title: "房屋與費用",
    fields: [
      { key: "cost.monthlyRent", label: "租金", value: "NT$ 13,500 / 月", status: "disclosed", src: "manualInput" },
      { key: "cost.deposit", label: "押金", value: "NT$ 27,000（2 個月）", status: "disclosed", src: "manualInput" },
      { key: "cost.electricityRate", label: "電費單價", value: "5 元 / 度", status: "conflict", src: "manualInput" },
      { key: "cost.waterFee", label: "水費", value: "包含於租金", status: "disclosed", src: "manualInput" },
      { key: "cost.managementFee", label: "管理費", value: null, status: "missing", src: "manualInput" },
      { key: "cost.internetFee", label: "網路費", value: null, status: "missing", src: "manualInput" },
      { key: "cost.eligibleForSubsidy", label: "是否可申請租補", value: null, status: "missing", src: "manualInput" },
    ],
  },
  {
    id: "lease",
    title: "契約條件",
    fields: [
      { key: "leaseTerms.hasWrittenContract", label: "是否有書面契約", value: "是", status: "disclosed", src: "manualInput" },
      { key: "leaseTerms.reviewPeriod", label: "是否有審閱期", value: null, status: "missing", src: "manualInput" },
      { key: "leaseTerms.petsAllowed", label: "是否可養寵物", value: null, status: "missing", src: "manualInput" },
      { key: "leaseTerms.taxRegistrationAllowed", label: "是否可報稅", value: "否", status: "disclosed", src: "manualInput" },
      { key: "leaseTerms.householdRegistrationAllowed", label: "是否可遷戶籍", value: "否", status: "disclosed", src: "manualInput" },
      { key: "leaseTerms.repairResponsibility", label: "修繕責任", value: "房客負擔小型維修", status: "partial", src: "manualInput" },
      { key: "leaseTerms.earlyTerminationClause", label: "提前解約條件", value: null, status: "missing", src: "manualInput" },
      { key: "leaseTerms.depositRefundTerms", label: "押金退還方式", value: "退租後 30 日內", status: "disclosed", src: "manualInput" },
    ],
  },
  {
    id: "safety",
    title: "居住安全",
    fields: [
      { key: "safety.rooftopAddition", label: "是否頂樓加蓋", value: "否", status: "disclosed", src: "manualInput" },
      { key: "safety.illegalPartition", label: "是否違法隔間", value: null, status: "missing", src: "manualInput" },
      { key: "safety.escapeRoute", label: "逃生動線", value: "僅一處主要逃生口", status: "partial", src: "manualInput" },
      { key: "safety.fireEquipment", label: "消防設備", value: "有滅火器、無偵煙器", status: "partial", src: "manualInput" },
      { key: "safety.waterLeak", label: "漏水狀況", value: null, status: "missing", src: "manualInput" },
      { key: "locationContext.nearestMRT", label: "最近捷運", value: "動物園站 / 約 14 分鐘", status: "inferred", src: "systemInference" },
    ],
  },
  {
    id: "rights",
    title: "租客權益",
    fields: [
      { key: "rights.taxBurdenShift", label: "是否有稅負轉嫁", value: null, status: "missing", src: "manualInput" },
      { key: "rights.unfairTerms", label: "是否存在不合理條款", value: null, status: "missing", src: "manualInput" },
    ],
  },
];

// AI report content for X-2
const REPORT_X2 = {
  rri: 62,
  level: "中度風險",
  axes: [
    { id: "contract", name: "契約透明度", score: 58 },
    { id: "cost", name: "費用透明度", score: 45 },
    { id: "safety", name: "居住安全", score: 70 },
    { id: "rights", name: "租客權益", score: 38 },
  ],
  explanation:
    "這個物件的整體風險屬於中度。最值得注意的是費用與權益這兩塊：屋主明示「不能報稅、不能遷戶籍」，這代表你即使住進去，也很難主張自己是合法承租人，未來想申請租金補貼或扣抵綜所稅都會被擋下。電費單價 5 元 / 度，比台電夏季最高的 4.05 元高，屬於常見的超收狀況，可以在簽約前直接和房東確認帳單依據。其餘居住條件（樓層、隔間、消防）並沒有立即危險訊號，但「是否違法隔間」與「漏水狀況」目前還沒有資料，建議在實際看房時親自確認。",
  drivers: [
    { id: 1, title: "屋主明示不可報稅、不可遷戶籍", why: "影響租金補貼資格與住戶權益主張，屬於高度風險條件。", axis: "rights" },
    { id: 2, title: "電費單價高於台電上限", why: "5 元 / 度 vs. 台電夏季最高 4.05 元 / 度，疑似超收。", axis: "cost" },
    { id: 3, title: "管理費、網路費未揭露", why: "每月實際支出可能超出表面租金，建議在看房時逐項確認。", axis: "cost" },
    { id: 4, title: "違法隔間與漏水狀況未填寫", why: "兩項與居住安全直接相關的欄位仍為 missing。", axis: "safety" },
  ],
  checklist: [
    "請房東出示最近一期台電帳單，確認電費計價依據",
    "在書面契約中明確寫入「修繕責任分界」與「審閱期條款」",
    "看房當天檢查浴室、廚房有無漏水痕跡（牆角、天花板）",
    "確認房屋是否為違法隔間（觀察牆面厚度、消防出口）",
    "若無法報稅、遷戶籍，請房東於契約備註明示，避免之後爭議",
  ],
  followups: [
    { q: "管理費每月實際金額？", field: "cost.managementFee" },
    { q: "是否有審閱期？通常為 3 日。", field: "leaseTerms.reviewPeriod" },
    { q: "提前解約是否需付違約金？倍率？", field: "leaseTerms.earlyTerminationClause" },
    { q: "牆面是否為輕隔間？建材為？", field: "safety.illegalPartition" },
  ],
};

window.RU_DATA = {
  STATUS,
  SAMPLE_RECORDS,
  VERSIONS_0142,
  FIELD_GROUPS,
  REPORT_X2,
  RECORD_0142_RHIR: buildRecord0142(),
};
