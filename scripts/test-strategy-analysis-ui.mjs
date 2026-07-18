import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const detailSource = fs.readFileSync(path.join(rootDir, "detail.jsx"), "utf8");
const stylesSource = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

assert.match(detailSource, /tab === "strategy"/);
assert.match(detailSource, /<StrategyView/);

const reportStart = detailSource.indexOf("function ReportView(");
const strategyStart = detailSource.indexOf("function StrategyView(");
const addVersionStart = detailSource.indexOf("function AddVersionModal(");
assert.ok(reportStart >= 0 && strategyStart > reportStart && addVersionStart > strategyStart);

const reportSource = detailSource.slice(reportStart, strategyStart);
const strategySource = detailSource.slice(strategyStart, addVersionStart);

assert.doesNotMatch(reportSource, /詢問 AI 顧問/);
assert.doesNotMatch(reportSource, /chatWithRri/);
assert.match(strategySource, /AI 策略顧問/);
assert.match(strategySource, /getLatestAiInsight/);
assert.match(strategySource, /chatWithRri/);
assert.match(strategySource, /localStorage/);
assert.match(strategySource, /目前完成策略分析 Step 1–3/);

for (const field of [
  "rentalGoal",
  "moveUrgency",
  "budgetFlexibility",
  "mustHaveConditions",
  "negotiableConditions",
  "redLines",
  "specialNeeds",
  "personalNote"
]) {
  assert.match(strategySource, new RegExp(field), `缺少策略情境欄位：${field}`);
}

for (const selector of [
  ".strategy-workspace",
  ".strategy-profile-form",
  ".strategy-chat-card",
  "@media (max-width: 600px)"
]) {
  assert.ok(stylesSource.includes(selector), `缺少策略分析樣式：${selector}`);
}

console.log("策略分析 UI 契約驗證通過");
console.log("- 獨立頁籤：已建立");
console.log("- 情境表單：8 組資料已包含");
console.log("- AI 顧問：已自分析報告移出");
console.log("- 保存 Insight / verified cases / 個人情境 context：已接入");
console.log("- 本機草稿與窄螢幕樣式：已包含");
