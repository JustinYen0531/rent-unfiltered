import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://pip.moi.gov.tw/asmx/WS1.asmx/GetG5?Year=&City=&DisputeOrigin=&DisputeCause=";
const OUTPUT_ROOT = path.resolve("data", "evidence", "moi-g5");

const RENTAL_TERMS = ["租屋", "租賃", "承租", "出租", "房東", "房客", "包租"];
const STRONG_RENTAL_TERMS = ["租屋", "房東", "房客", "住宅租賃", "包租", "套房", "租屋補助", "租金補貼"];
const PURCHASE_TERMS = ["購買", "買賣", "預售屋", "成屋", "建商", "售屋", "承買", "交屋", "斡旋金"];

const RISK_RULES = [
  {
    key: "viewing_payment_scam",
    label: "看屋前付款",
    terms: ["帶看前支付", "看屋前", "預約金"],
    rhirField: "leaseTerms.viewingPaymentRequirement",
    actionHints: ["看屋前不要支付名稱不明的預約金或押金", "先確認出租人身分與出租權限"],
    evidenceToKeep: ["租屋刊登截圖", "付款要求對話", "轉帳紀錄"]
  },
  {
    key: "electricity_overcharge",
    label: "電費計價",
    terms: ["電費", "每度平均電價", "用電"],
    rhirField: "cost.electricityRate",
    actionHints: ["要求寫明電費計價方式", "確認是否依當期電費單計算"],
    evidenceToKeep: ["租賃契約電費條款", "電費單", "房東收費明細"]
  },
  {
    key: "pet_policy_conflict",
    label: "寵物約定",
    terms: ["寵物", "飼養"],
    rhirField: "leaseTerms.petPolicy",
    actionHints: ["要求房東以文字確認是否可飼養寵物", "確認違反寵物約定的處理方式"],
    evidenceToKeep: ["租賃契約寵物條款", "房東或仲介文字確認"]
  },
  {
    key: "repair_delay",
    label: "修繕責任",
    terms: ["修繕", "漏水", "壁癌", "馬桶", "潮濕", "蟲", "設備損壞"],
    rhirField: "leaseTerms.repairResponsibility",
    actionHints: ["要求契約寫明修繕責任與處理期限", "入住前記錄屋況與既有瑕疵"],
    evidenceToKeep: ["入住前屋況照片", "報修對話", "修繕估價或收據"]
  },
  {
    key: "rental_subsidy_restriction",
    label: "租屋補助",
    terms: ["租屋補助", "租金補貼", "報稅", "戶籍"],
    rhirField: "rights.rentalSubsidyAllowed",
    actionHints: ["簽約前確認是否配合租金補貼或相關申報", "要求將雙方約定寫入契約"],
    evidenceToKeep: ["租賃契約", "房東文字回覆", "補貼申請資料"]
  },
  {
    key: "early_termination_dispute",
    label: "提前終止",
    terms: ["提前解除", "提前終止", "解除租賃契約", "終止租賃契約", "違約金"],
    rhirField: "leaseTerms.earlyTerminationClause",
    actionHints: ["簽約前確認提前終止條件與違約金", "以書面留下終止通知與協議"],
    evidenceToKeep: ["提前終止條款", "書面通知", "雙方協議紀錄"]
  },
  {
    key: "deposit_dispute",
    label: "押金返還",
    terms: ["押金", "押租金", "定金"],
    rhirField: "leaseTerms.depositRefundTerms",
    actionHints: ["要求寫明押金或定金的性質與返還條件", "付款前確認解約時的退款規則"],
    evidenceToKeep: ["租賃契約", "押金或定金收據", "退還款項對話"]
  }
];

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function readElement(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1]) : "";
}

function parseRows(xml) {
  return [...xml.matchAll(/<Table1(?:\s[^>]*)?>([\s\S]*?)<\/Table1>/g)].map((match) => ({
    rocYear: readElement(match[1], "年度"),
    city: readElement(match[1], "發生縣市"),
    disputeOrigin: readElement(match[1], "糾紛來源"),
    disputeCause: readElement(match[1], "糾紛原因"),
    caseDescription: readElement(match[1], "案例說明"),
    handlingAndLegalBasis: readElement(match[1], "辦理情形及法令依據")
  }));
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function classifyRentalRelevance(row) {
  const text = row.caseDescription;
  if (!includesAny(text, RENTAL_TERMS)) return null;

  const hasStrongRentalSignal = includesAny(text, STRONG_RENTAL_TERMS);
  const hasPurchaseSignal = includesAny(text, PURCHASE_TERMS);
  if (hasPurchaseSignal && !hasStrongRentalSignal) return null;
  if (hasStrongRentalSignal && !hasPurchaseSignal) return "high";
  if (hasStrongRentalSignal) return "medium";
  return "medium";
}

function chooseRiskRule(row) {
  const text = `${row.disputeCause} ${row.caseDescription} ${row.handlingAndLegalBasis}`;
  return RISK_RULES.find((rule) => includesAny(text, rule.terms)) || null;
}

function extractLegalBasis(text) {
  const matches = text.match(/[^。；，]{0,28}(?:法第\s*\d+\s*條|應記載事項第\s*\d+\s*點)[^。；，]{0,28}/g) || [];
  return [...new Set(matches.map((item) => item.trim()))].slice(0, 3);
}

function detectOutcome(text) {
  if (/返還.*押金|押金.*返還/.test(text)) return "經協調後返還全部或部分押金。";
  if (/退還.*(?:定金|款項|費用)|返還.*(?:定金|款項|費用)/.test(text)) return "經協調後退還全部或部分款項。";
  if (/解除.*租賃契約|終止.*租賃契約/.test(text)) return "租賃契約經協調後解除或終止。";
  if (/和解|達成協議|達成共識/.test(text)) return "案件經協調後達成和解或協議。";
  return "官方資料記載處理結果，仍需組員確認可重複使用的結論。";
}

function stableId(row) {
  const fingerprint = [
    row.rocYear,
    row.city,
    row.disputeOrigin,
    row.disputeCause,
    row.caseDescription,
    row.handlingAndLegalBasis
  ].join("|");
  return `gov_moi_rental_${createHash("sha256").update(fingerprint).digest("hex").slice(0, 12)}`;
}

function toGregorianYear(rocYear) {
  const value = Number.parseInt(rocYear, 10);
  return Number.isFinite(value) ? value + 1911 : null;
}

function buildCandidate(row, rentalRelevance) {
  const rule = chooseRiskRule(row);
  const id = stableId(row);
  const topic = rule?.label || row.disputeCause || "租賃糾紛";
  const matchedKeywords = RENTAL_TERMS.filter((term) => `${row.caseDescription} ${row.handlingAndLegalBasis}`.includes(term));
  const keywords = [...new Set([row.disputeCause, topic, ...matchedKeywords].filter(Boolean))].slice(0, 8);

  return {
    id,
    sourceType: "gov",
    sourceName: "內政部不動產資訊平台 GetG5／地方政府糾紛案例",
    sourceUrl: SOURCE_URL,
    title: `${topic}｜${row.city || "縣市未載"}｜民國 ${row.rocYear || "年份未載"} 年`,
    year: toGregorianYear(row.rocYear),
    keywords,
    rhirFields: rule ? [rule.rhirField] : [],
    riskTypes: rule ? [rule.key] : [],
    summary: row.caseDescription,
    commonOutcome: detectOutcome(row.handlingAndLegalBasis),
    legalBasis: extractLegalBasis(row.handlingAndLegalBasis),
    actionHints: rule?.actionHints || ["由第二位組員依官方案情補上可執行建議"],
    evidenceToKeep: rule?.evidenceToKeep || ["租賃契約", "雙方文字或通知紀錄"],
    confidence: "high",
    notes: `自動同步候選；租屋關聯度為 ${rentalRelevance}。來源為官方混合型房地產糾紛資料，尚未人工確認 RHIR 對應與法律措辭，不得直接升為 verified。`,
    automation: {
      status: "draft",
      rentalRelevance,
      matchedRule: rule?.key || null
    },
    rawSource: row
  };
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlArray(values) {
  if (!values.length) return "'{}'::text[]";
  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

function toSeedSql(candidates) {
  const rows = candidates.map((record) => `(
    ${sqlString(record.id)},
    'gov',
    ${sqlString(record.sourceName)},
    ${sqlString(record.sourceUrl)},
    ${sqlString(record.title)},
    ${record.year ?? "null"},
    ${sqlArray(record.keywords)},
    ${sqlArray(record.rhirFields)},
    ${sqlArray(record.riskTypes)},
    ${sqlString(record.summary)},
    ${sqlString(record.commonOutcome)},
    ${sqlArray(record.legalBasis)},
    ${sqlArray(record.actionHints)},
    ${sqlArray(record.evidenceToKeep)},
    'high',
    'draft',
    ${sqlString(record.notes)},
    ${sqlString(JSON.stringify(record))}::jsonb
  )`).join(",\n");

  return `-- Auto-generated by scripts/sync-moi-rental-cases.mjs
-- All records remain draft until a second team member reviews them.
begin;

insert into public.evidence_cases (
  id, source_type, source_name, source_url, title, year,
  keywords, rhir_fields, risk_types, summary, common_outcome,
  legal_basis, action_hints, evidence_to_keep, confidence,
  review_status, notes, case_record
) values
${rows}
on conflict (id) do update set
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  title = excluded.title,
  year = excluded.year,
  keywords = excluded.keywords,
  rhir_fields = excluded.rhir_fields,
  risk_types = excluded.risk_types,
  summary = excluded.summary,
  common_outcome = excluded.common_outcome,
  legal_basis = excluded.legal_basis,
  action_hints = excluded.action_hints,
  evidence_to_keep = excluded.evidence_to_keep,
  confidence = excluded.confidence,
  notes = excluded.notes,
  case_record = excluded.case_record,
  updated_at = now()
where public.evidence_cases.review_status = 'draft';

commit;
`;
}

function markdownCell(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function toCandidateIndexMarkdown(candidates, report) {
  const rows = candidates.map((record, index) =>
    `| ${index + 1} | \`${record.id}\` | ${markdownCell(record.title)} | ${record.automation.rentalRelevance} | ${markdownCell(record.riskTypes.join(", ") || "待配對")} | ${markdownCell(record.rhirFields.join(", ") || "待配對")} |`
  ).join("\n");

  return `# 內政部租屋候選總覽

本次共讀取 ${report.totalOfficialCases} 筆官方案例，篩出 ${report.rentalCandidates} 筆租屋候選。此清單只是索引；需要人工判斷的完整內容請看 \`needs-review.md\`。

| # | Case ID | 標題 | 關聯度 | Risk Type | RHIR 欄位 |
|---:|---|---|---|---|---|
${rows}

## 資料來源與授權

資料來源：內政部國土管理署「房地產消費糾紛案例」。原始資料依政府資料開放授權條款第 1 版提供。Rent Unfiltered 所作的租屋篩選、RHIR 分類與風險標籤為衍生整理，不代表原資料提供機關之立場或法律意見。
`;
}

function toReviewQueueMarkdown(candidates, report) {
  const cards = candidates.map((record, index) => `## ${index + 1}. ${record.title}

- Case ID：\`${record.id}\`
- 租屋關聯度：\`${record.automation.rentalRelevance}\`
- 自動 Risk Type：\`${record.riskTypes[0] || "待配對"}\`
- 自動 RHIR 欄位：\`${record.rhirFields[0] || "待配對"}\`
- 原始分類：${record.rawSource.disputeCause || "未填"}
- 縣市／來源：${record.rawSource.city || "未填"}／${record.rawSource.disputeOrigin || "未填"}

**官方案例說明**

${record.rawSource.caseDescription}

**官方辦理情形與法令依據**

${record.rawSource.handlingAndLegalBasis}

**審核勾選**

- [ ] 確認是住宅租屋案件
- [ ] 確認 Risk Type 正確
- [ ] 確認 RHIR 欄位正確
- [ ] 確認摘要與建議沒有超出官方資料

**審核決定**：\`verified / reject / revise\`

**審核備註**：

---`).join("\n\n");

  return `# 內政部租屋候選待審核清單

本次共有 ${report.needsReview} 筆需要人工確認。這些資料仍是 \`draft\`，不會直接成為 RRI 證據。

審核時只需要確認租屋關聯、Risk Type、RHIR 欄位與措辭；不需要重新搜尋來源。

${cards}

## 資料來源與授權

資料來源：內政部國土管理署「房地產消費糾紛案例」。原始資料依政府資料開放授權條款第 1 版提供。Rent Unfiltered 所作的租屋篩選、RHIR 分類與風險標籤為衍生整理，不代表原資料提供機關之立場或法律意見。
`;
}

function secondPassDecision(record) {
  const description = record.rawSource.caseDescription;
  if (description.includes("停車位")) {
    return { status: "excluded", reason: "停車位租賃，不是住宅租屋案件。" };
  }

  const purchaseSignal = includesAny(description, ["購買", "買賣", "預售屋", "成屋", "出售", "建商"]);
  const actualRentalSignal = includesAny(description, ["租屋", "租賃房屋", "承租房屋", "向房東租賃", "包租業者", "房東", "房客"]);
  if (purchaseSignal && !actualRentalSignal) {
    return { status: "excluded", reason: "案情主體是購屋、買賣或出售，不是住宅租屋。" };
  }

  return { status: "accepted", reason: "案情明確涉及住宅租屋、房東、房客或租賃契約，可先進入 draft 案例庫。" };
}

async function main() {
  const response = await fetch(SOURCE_URL, { headers: { "user-agent": "Rent-Unfiltered-Evidence-Sync/1.0" } });
  if (!response.ok) throw new Error(`MOI GetG5 request failed: ${response.status} ${response.statusText}`);

  const xml = await response.text();
  const rows = parseRows(xml);
  if (!rows.length) throw new Error("MOI GetG5 returned no case rows; source format may have changed.");

  const candidatesWithDuplicates = rows
    .map((row) => ({ row, rentalRelevance: classifyRentalRelevance(row) }))
    .filter((item) => item.rentalRelevance)
    .map((item) => buildCandidate(item.row, item.rentalRelevance));

  const candidates = [...new Map(candidatesWithDuplicates.map((item) => [item.id, item])).values()]
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  const report = {
    sourceUrl: SOURCE_URL,
    syncedAt: new Date().toISOString(),
    totalOfficialCases: rows.length,
    rentalCandidates: candidates.length,
    duplicateCandidatesRemoved: candidatesWithDuplicates.length - candidates.length,
    highRelevance: candidates.filter((item) => item.automation.rentalRelevance === "high").length,
    needsReview: candidates.filter((item) => item.automation.rentalRelevance !== "high").length,
    secondPassAccepted: null,
    secondPassExcluded: null,
    byYear: Object.fromEntries(
      [...new Set(candidates.map((item) => item.year))]
        .filter(Boolean)
        .sort((a, b) => b - a)
        .map((year) => [year, candidates.filter((item) => item.year === year).length])
    )
  };

  const highRelevanceCandidates = candidates.filter((item) => item.automation.rentalRelevance === "high");
  const reviewQueue = candidates.filter((item) => item.automation.rentalRelevance !== "high");
  const secondPass = reviewQueue.map((record) => ({ record, decision: secondPassDecision(record) }));
  const secondPassAccepted = secondPass
    .filter((item) => item.decision.status === "accepted")
    .map((item) => ({
      ...item.record,
      automation: { ...item.record.automation, secondPass: "accepted" },
      notes: `${item.record.notes} 第二次篩選：${item.decision.reason}`
    }));
  const secondPassExcluded = secondPass
    .filter((item) => item.decision.status === "excluded")
    .map((item) => ({
      id: item.record.id,
      title: item.record.title,
      reason: item.decision.reason,
      rawSource: item.record.rawSource
    }));

  report.secondPassAccepted = secondPassAccepted.length;
  report.secondPassExcluded = secondPassExcluded.length;

  await mkdir(OUTPUT_ROOT, { recursive: true });
  await Promise.all([
    writeFile(path.join(OUTPUT_ROOT, "raw-latest.xml"), xml, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "rental-candidates.json"), `${JSON.stringify(candidates, null, 2)}\n`, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "high-relevance.json"), `${JSON.stringify(highRelevanceCandidates, null, 2)}\n`, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "high-relevance.seed.sql"), toSeedSql(highRelevanceCandidates), "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "needs-review.json"), `${JSON.stringify(reviewQueue, null, 2)}\n`, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "needs-review-accepted.json"), `${JSON.stringify(secondPassAccepted, null, 2)}\n`, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "needs-review-accepted.seed.sql"), toSeedSql(secondPassAccepted), "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "needs-review-excluded.json"), `${JSON.stringify(secondPassExcluded, null, 2)}\n`, "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "all-candidates.md"), toCandidateIndexMarkdown(candidates, report), "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "needs-review.md"), toReviewQueueMarkdown(reviewQueue, report), "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "rental-candidates.seed.sql"), toSeedSql(candidates), "utf8"),
    writeFile(path.join(OUTPUT_ROOT, "sync-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8")
  ]);

  console.log(`MOI cases: ${report.totalOfficialCases}`);
  console.log(`Rental candidates: ${report.rentalCandidates}`);
  console.log(`High relevance: ${report.highRelevance}`);
  console.log(`Needs review: ${report.needsReview}`);
  console.log(`Second-pass accepted: ${secondPassAccepted.length}`);
  console.log(`Second-pass excluded: ${secondPassExcluded.length}`);
  console.log(`Accepted seed: ${path.join(OUTPUT_ROOT, "needs-review-accepted.seed.sql")}`);
  console.log(`High-relevance seed: ${path.join(OUTPUT_ROOT, "high-relevance.seed.sql")}`);
  console.log(`Review list: ${path.join(OUTPUT_ROOT, "needs-review.md")}`);
  console.log(`Output: ${OUTPUT_ROOT}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
