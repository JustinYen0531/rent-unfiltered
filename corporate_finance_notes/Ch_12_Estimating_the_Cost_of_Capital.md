# Ch. 12: Estimating the Cost of Capital 估計資本成本
## 🎯 章節核心問題
> **如何具體估計一家公司的股權與債務資本成本？如何計算公司整體的加權平均資本成本 (WACC)？當新投資專案的風險與公司原有業務截然不同時，如何調整折現率？**
>
> **核心解答：**
> 股權成本使用 **CAPM 公式** 估計，債務成本則使用債券的 **到期殖利率 (YTM)** 並考慮利息抵稅。將兩者以 **股權與債務的市場價值權重** 進行加權平均，即得到 **WACC**。若評估不同風險的專案，必須尋找同業可比公司，並藉由 **無槓桿 Beta (Asset Beta)** 與 **有槓桿 Beta** 之間的公式轉換，為新專案量身訂做專屬的要求報酬率。
---
## 📌 一、 股權資本成本的估計 (The Cost of Equity Capital)
股權資本成本是股東投資該公司所要求的預期回報率。實務上主要透過 CAPM 模型來估計：
$`r_E = r_f + \beta_E \times \left( E[R_M] - r_f \right)`$
### 1. 無風險利率 ($r_f$) 的選擇
- 通常採用面臨極低違約與通膨風險的長期政府公債殖利率（如美國 10 年期國債 Yield）。
### 2. 市場風險溢酬 ($E[R_M] - r_f$) 的估計
- 根據歷史長期數據（如 S&P 500 指數過去幾十年的平均超額報酬），一般在 4% 到 7% 之間。
### 3. 股權 Beta ($\beta_E$) 的估計
- **方法：** 將公司歷史回報率對市場大盤指數（如 S&P 500）進行線性迴歸。
- 迴歸線的**斜率**即為 Beta，代表公司股權相對於市場波動的敏感度。
---
## 📌 二、 債務資本成本的估計 (The Cost of Debt Capital)
債務資本成本是公司發行新債券或向銀行借款所必須支付的市場利率。
### 1. 債務成本 ($r_D$)
- **錯誤做法：** 使用歷史上已發行債券的票面利率 (Coupon Rate)。
- **正確做法：** 採用當前債券市場上的**到期殖利率 (YTM)**，因為這代表公司現在去市場上借新債所必須付出的當前機會成本。
### 2. 稅後債務資本成本 (After-Tax Cost of Debt)
由於利息支出在會計上可以在稅前扣除，能為公司省下稅金，因此實際承擔的債務成本必須扣除稅盾：
$`r_{D,\text{after-tax}} = r_D \times (1 - \tau_c)`$
where $\tau_c$ 為公司所得稅率。
---
## 📌 三、 加權平均資本成本 (Weighted Average Cost of Capital, WACC)
WACC 是公司所有出資人（股東與債權人）共同要求的平均年化回報率，也是評估公司整體專案的折現率。
### 1. WACC 核心公式
$`r_{\text{wacc}} = \frac{E}{V} r_E + \frac{D}{V} r_D (1 - \tau_c)`$
其中：
- $E$ 為股權的**市場價值 (Market Value)** = $`\text{Stock Price} \times \text{Shares Outstanding}`$。
- $D$ 為債務的**市場價值 (Market Value)**。
- $V = E + D$ 為公司總資產的市場價值。
- **⚠️ 考前盲點警告：**
	> **「公式中的 E、D 和 V 必須全部使用市場價值 (Market Value)，絕不能使用財務報表上的會計帳面價值 (Book Value)。」**
---
## 📌 四、 專案資本成本與 Beta 的調整 (Project Cost of Capital)
如果公司要進入一個全新的業務領域（例如台積電去開發生物科技新藥），該新專案的風險與公司原本的半導體業務完全不同。此時**不能**使用公司的 WACC，否則會做出錯誤決策。
- **解決方案：** 尋找該新領域的「純粹可比公司 (Comparable/Pure Play Firms)」，利用其 Beta 來估計專案的折現率。
- **槓桿效應干擾：** 可比公司的 Beta 反映了兩部分：一是**業務本身的風險 (Asset Risk)**，二是**因為借債而產生的額外財務風險 (Financial Risk)**。我們必須將槓桿效應排除，才能得到純粹的業務風險。
### 1. 槓桿與無槓桿 Beta 的轉換公式
假設債務的 Beta 為 $\beta_D$（通常無違約風險時設為 0）：
- **無槓桿資產 Beta (Unlevered / Asset Beta / $\beta_U$)：**
	將可比公司的槓桿效應「拆除」，得到純粹業務風險：
	$`\beta_U = \frac{E}{E + D} \beta_E + \frac{D}{E + D} \beta_D`$
	*(若債務無風險 $\beta_D = 0$：$`\beta_U = \frac{E}{E+D} \beta_E`$)*
- **有槓桿股權 Beta (Levered / Equity Beta / $\beta_E$)：**
	根據目標公司自己的資本結構，重新「組裝」財務槓桿風險：
	$`\beta_E = \beta_U + \frac{D}{E} (\beta_U - \beta_D)`$
---
## 📌 五、 經典例題與解題地圖 (Practice Questions)
### 例題 1：公司 WACC 計算 (⚠️ 必考)
> **題目：** 某公司發行在外股票 1,000 萬股，當前股價為每股 40 元。公司要求的股權成本 (rE) 為 12%。公司同時有面值為 2 億元、市價為面值 90% 的公司債發行在外，債務的 YTM 為 6%。公司所得稅率為 30%。
> 請問該公司的 WACC 是多少？
- **解答流程：**
	1. **計算股權市值 E：**
	   $`E = 10,000,000 \times 40 = 400,000,000`$ 元 (4 億元)。
	2. **計算債務市值 D：**
	   $`D = 200,000,000 \times 90\% = 180,000,000`$ 元 (1.8 億元)。
	3. **計算總價值 V：**
	   $`V = E + D = 400,000,000 + 180,000,000 = 580,000,000`$ 元 (5.8 億元)。
	4. **計算權重：**
	   - 股權權重 $E/V = \frac{400}{580} \approx 68.97\%$
	   - 債務權重 $D/V = \frac{180}{580} \approx 31.03\%$
	5. **套用 WACC 公式：**
	   $`r_{\text{wacc}} = 0.6897 \times 12\% + 0.3103 \times 6\% \times (1 - 0.30)`$
	   $`r_{\text{wacc}} = 8.276\% + 0.3103 \times 4.2\% = 8.276\% + 1.303\% = 9.579\%`$
- **答案：** 該公司的 WACC 為 **9.58%**。
---
### 例題 2：專案 Beta 與資本成本估計 (⚠️ 難度大、高頻題)
> **題目：** 公司計劃投資一個新物流專案。市場上有一家「純物流公司」作為可比對象，其股權 Beta 為 1.50，債資比 (D/E) 為 0.80。假設所有債務均為無風險（Beta_D = 0）。
> 本公司計劃以此專案進行融資，使該專案的債資比 (D/E) 保持在 0.50。若無風險利率為 3%，市場風險溢酬為 6%。
> 請問本公司在評估該專案時，應該使用多少的股權要求報酬率 (r_E) 作為專案資本成本？
- **解答流程：**
	1. **拆除可比公司的財務槓桿，求無槓桿 Beta ($\beta_U$)：**
	   可比公司 D/E = 0.80，代表 $D = 0.8, E = 1$。總價值 $E+D = 1.8$。
	   $`\beta_U = \frac{E}{E+D} \beta_E = \frac{1}{1.8} \times 1.50 = 0.8333`$
	2. **根據本公司此專案的資本結構重新組裝，求有槓桿 Beta ($\beta_E$)：**
	   本專案 D/E = 0.50。
	   $`\beta_E = \beta_U + \frac{D}{E} (\beta_U - \beta_D) = 0.8333 + 0.50 \times (0.8333 - 0) = 0.8333 + 0.4167 = 1.25`$
	3. **套用 CAPM 計算專案的股權資本成本：**
	   $`r_E = 3\% + 1.25 \times 6\% = 3\% + 7.5\% = 10.5\%`$
- **答案：** 公司評估該新專案應使用的股權資本成本為 **10.5%**。
---
## 📌 六、 程式化財務思維：JavaScript WACC 與 Beta 轉換計算工具
在實務財務建模中，我們可以用程式碼快速進行 WACC 試算與 Beta 的拆裝調整：
```javascript
/**
 * 計算公司 WACC
 */
function calculateWacc(equityValue, costOfEquity, debtValue, costOfDebt, taxRate) {
  const totalValue = equityValue + debtValue;
  const wE = equityValue / totalValue;
  const wD = debtValue / totalValue;
  return wE * costOfEquity + wD * costOfDebt * (1 - taxRate);
}

/**
 * 拆解 Beta 槓桿 (求 Asset Beta)
 */
function unleverBeta(equityBeta, dOverE, betaD = 0) {
  // 由於 D/E = dOverE, 設 E=1, D=dOverE, 則 E/(E+D) = 1/(1+dOverE), D/(E+D) = dOverE/(1+dOverE)
  const weightE = 1 / (1 + dOverE);
  const weightD = dOverE / (1 + dOverE);
  return weightE * equityBeta + weightD * betaD;
}

/**
 * 組裝 Beta 槓桿 (求 Equity Beta)
 */
function releverBeta(assetBeta, dOverE, betaD = 0) {
  return assetBeta + dOverE * (assetBeta - betaD);
}

// === 測試轉換 ===
const assetBeta = unleverBeta(1.50, 0.80);
console.log(`物流可比公司的資產 Beta (業務風險): ${assetBeta.toFixed(4)}`); // 0.8333

const newEquityBeta = releverBeta(assetBeta, 0.50);
console.log(`我司專案(D/E=0.5)對應的有槓桿股權 Beta: ${newEquityBeta.toFixed(4)}`); // 1.2500
```
---
## 📌 七、 本章公式與核心觀念整理 (Summary & Formulas)
### 1. 核心公式總覽表
<table>
<tr>
<td>公式名稱 (Formula Name)</td>
<td>LaTeX 數學表達式</td>
<td>應用情境 (Usage)</td>
</tr>
<tr>
<td>**加權平均資本成本 (WACC)**</td>
<td>$`r_{\text{wacc}} = \frac{E}{V}r_E + \frac{D}{V}r_D(1 - \tau_c)`$</td>
<td>評估同等公司風險的常規專案折現率。</td>
</tr>
<tr>
<td>**無槓桿資產 Beta**</td>
<td>$`\beta_U = \frac{E}{E+D}\beta_E + \frac{D}{E+D}\beta_D`$</td>
<td>排除債務槓桿干擾，獲得純粹業務風險指標。</td>
</tr>
<tr>
<td>**有槓桿股權 Beta**</td>
<td>$`\beta_E = \beta_U + \frac{D}{E}(\beta_U - \beta_D)`$</td>
<td>根據自身財務槓桿重新計算股權的市場風險。</td>
</tr>
</table>
### 2. 本章三大考試/常考觀念
1. **必須使用市價 (Market Values)：** 許多題目會同時給出「股本面值 (Book Value of Equity)」和「股價/股數」。記住，計算 WACC 權重時，**面值是完全無用的干擾項**，必須用 $股價 \times 股數$。
2. **債務稅盾的適用性：** 只有**債務成本 ($r_D$)** 需要乘上 $(1 - \tau_c)$，因為股利發放不能抵稅，所以**股權成本 ($r_E$) 絕對不能扣稅**。
3. **可比公司的「純粹性」：** 尋找可比公司時，應尋找業務單一的「純粹播放者 (Pure Play)」，若可比公司自身也是多元化集團，其 Beta 會包含多種不同行業風險，無法精確代表目標專案的風險。
