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
assert.match(strategySource, /getLatestStrategySession/);
assert.match(strategySource, /saveStrategySession/);
assert.match(strategySource, /updateStrategySessionMessages/);
assert.match(strategySource, /generateStrategy/);
assert.match(strategySource, /chatWithRri/);
assert.match(strategySource, /localStorage/);
assert.match(detailSource, /生成個人策略/);
assert.match(strategySource, /先生成並保存個人策略，才會開放後續追問/);
assert.match(strategySource, /目前完成策略分析 Step 1–5/);
assert.match(detailSource, /StrategyTraceDetails/);
assert.match(detailSource, /優先行動/);
assert.match(detailSource, /談判點/);

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
  ".strategy-result-card",
  ".strategy-action-card",
  ".strategy-trace",
  ".strategy-chat-card",
  "@media (max-width: 600px)"
]) {
  assert.ok(stylesSource.includes(selector), `缺少策略分析樣式：${selector}`);
}

console.log("策略分析 UI 契約驗證通過");
console.log("- 獨立頁籤：已建立");
console.log("- 情境表單：8 組資料已包含");
console.log("- AI 顧問：已自分析報告移出");
console.log("- 個人策略：生成、Strategy Trace 與自動保存已接入");
console.log("- AI 顧問：策略保存後才解鎖，對話同步同一 session");
console.log("- 本機草稿與窄螢幕樣式：已包含");
