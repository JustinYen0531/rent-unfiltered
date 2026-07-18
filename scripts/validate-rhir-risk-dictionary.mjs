import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dictionaryPath = path.join(rootDir, "data", "evidence", "rhir-risk-dictionary.v1.json");
const localCasesPath = path.join(rootDir, "data", "evidence", "moi-g5", "rental-candidates.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function addError(errors, condition, message) {
  if (!condition) errors.push(message);
}

const dictionary = readJson(dictionaryPath);
const localCases = readJson(localCasesPath);
const errors = [];

const rhirEntries = Object.entries(dictionary.rhirFields || {});
const riskEntries = Object.entries(dictionary.riskTypes || {});
const expectedRhirCount = dictionary.generatedFrom?.reviewedRhirFieldCount;
const expectedRiskCount = dictionary.generatedFrom?.reviewedRiskTypeCount;

addError(errors, dictionary.immutabilityPolicy?.preserveReviewedCaseValues === true,
  "immutabilityPolicy.preserveReviewedCaseValues 必須為 true");
addError(errors, dictionary.immutabilityPolicy?.rewriteCaseRhirFields === false,
  "immutabilityPolicy.rewriteCaseRhirFields 必須為 false");
addError(errors, dictionary.immutabilityPolicy?.rewriteCaseRiskTypes === false,
  "immutabilityPolicy.rewriteCaseRiskTypes 必須為 false");
addError(errors, rhirEntries.length === expectedRhirCount,
  `RHIR 字典數量 ${rhirEntries.length} 與快照 ${expectedRhirCount} 不一致`);
addError(errors, riskEntries.length === expectedRiskCount,
  `riskType 字典數量 ${riskEntries.length} 與快照 ${expectedRiskCount} 不一致`);

for (const [key, entry] of rhirEntries) {
  addError(errors, Boolean(entry.labelZh), `RHIR ${key} 缺少 labelZh`);
  addError(errors, Boolean(entry.definitionForAI), `RHIR ${key} 缺少 definitionForAI`);
  addError(errors, Boolean(entry.dictionaryStatus), `RHIR ${key} 缺少 dictionaryStatus`);
  addError(errors, Number.isInteger(entry.observedVerifiedCases), `RHIR ${key} 缺少 observedVerifiedCases`);
  addError(errors, Array.isArray(entry.questionsForAI) && entry.questionsForAI.length > 0,
    `RHIR ${key} 缺少 questionsForAI`);
  addError(errors, Boolean(entry.doNotAssume), `RHIR ${key} 缺少 doNotAssume`);
}

for (const [key, entry] of riskEntries) {
  addError(errors, Boolean(entry.labelZh), `riskType ${key} 缺少 labelZh`);
  addError(errors, Boolean(entry.definitionForAI), `riskType ${key} 缺少 definitionForAI`);
  addError(errors, entry.dictionaryStatus === "reviewed", `riskType ${key} 必須保留 reviewed 狀態`);
  addError(errors, Number.isInteger(entry.observedVerifiedCases), `riskType ${key} 缺少 observedVerifiedCases`);
  addError(errors, Array.isArray(entry.primaryRhirFields) && entry.primaryRhirFields.length > 0,
    `riskType ${key} 缺少 primaryRhirFields`);
  addError(errors, Array.isArray(entry.ask) && entry.ask.length > 0, `riskType ${key} 缺少 ask`);
  addError(errors, Array.isArray(entry.actions) && entry.actions.length > 0, `riskType ${key} 缺少 actions`);
  addError(errors, Array.isArray(entry.evidenceToKeep) && entry.evidenceToKeep.length > 0,
    `riskType ${key} 缺少 evidenceToKeep`);
  addError(errors, Boolean(entry.caution), `riskType ${key} 缺少 caution`);
}

for (const relation of dictionary.knownRelationships || []) {
  for (const value of relation.values || []) {
    const exists = Object.hasOwn(dictionary.riskTypes, value) || Object.hasOwn(dictionary.rhirFields, value);
    const documentedExternalField = value === "property.areaPing";
    addError(errors, exists || documentedExternalField, `knownRelationships 引用了未知值 ${value}`);
  }
}

const localRhirFields = new Set(localCases.flatMap(item => item.rhirFields || []));
const localRiskTypes = new Set(localCases.flatMap(item => item.riskTypes || []));
const sourceRelationships = dictionary.unreviewedSourceValueRelationships || [];
const documentedSourceRhirFields = new Set(
  sourceRelationships
    .filter(item => item.valueType === "rhirField")
    .map(item => item.sourceValue)
);
const documentedSourceRiskTypes = new Set(
  sourceRelationships
    .filter(item => item.valueType === "riskType")
    .map(item => item.sourceValue)
);

for (const relation of sourceRelationships) {
  const targetExists = relation.valueType === "rhirField"
    ? Object.hasOwn(dictionary.rhirFields, relation.relatedReviewedValue)
    : Object.hasOwn(dictionary.riskTypes, relation.relatedReviewedValue);
  addError(errors, targetExists,
    `unreviewedSourceValueRelationships 的目標 ${relation.relatedReviewedValue} 不存在`);
}

for (const value of localRhirFields) {
  addError(
    errors,
    Object.hasOwn(dictionary.rhirFields, value) || documentedSourceRhirFields.has(value),
    `本地案例 RHIR ${value} 尚未加入字典或來源值關係`
  );
}

for (const value of localRiskTypes) {
  addError(
    errors,
    Object.hasOwn(dictionary.riskTypes, value) || documentedSourceRiskTypes.has(value),
    `本地案例 riskType ${value} 尚未加入字典或來源值關係`
  );
}

if (errors.length > 0) {
  console.error(`RHIR / riskType 字典驗證失敗，共 ${errors.length} 項：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("RHIR / riskType 字典驗證通過");
console.log(`- RHIR 欄位：${rhirEntries.length}`);
console.log(`- riskType：${riskEntries.length}`);
console.log(`- 本地案例覆蓋：${localCases.length} 筆`);
console.log(`- 未審核來源值關係：${sourceRelationships.length}`);
console.log("- 人工審核原值：只讀、不改寫");
