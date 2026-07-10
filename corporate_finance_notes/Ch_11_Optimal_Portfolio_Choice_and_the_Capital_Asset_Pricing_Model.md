# Ch. 11: Optimal Portfolio Choice and the Capital Asset Pricing Model 最佳投資組合選擇與資本資產定價模型
## 🎯 章節核心問題
> **如何構建一個在給定風險下報酬最高、或在要求報酬下風險最低的最佳投資組合？市場均衡時，資產的期望報酬與風險之間有何精確的數學關係？**
>
> **核心解答：**
> 藉由結合風險資產與無風險借貸，投資人能找到**夏普比率最高**的**切點投資組合 (Tangency Portfolio)**。在市場均衡狀態下，這個切點組合就是市場投資組合。資產的風險溢酬僅與其相對於市場的系統性風險 **Beta ($\beta$)** 呈線性正比，這就是 **CAPM 模型**（證券市場線 SML）。
---
## 📌 一、 雙資產投資組合的風險與報酬 (Two-Asset Portfolios)
當我們把多個資產打包時，它們之間的**聯動性**決定了組合的總風險。
### 1. 共變異數 (Covariance) 與相關係數 (Correlation)
- **共變異數 ($Cov(R_1, R_2)$)：** 衡量兩個資產回報率同向或反向變動的趨勢。
- **相關係數 ($\rho_{1,2}$)：** 將共變異數標準化，數值介於 $-1$ 與 $+1$ 之間：
	$`\rho_{1,2} = \frac{Cov(R_1, R_2)}{\sigma_1 \times \sigma_2}`$
### 2. 雙資產投資組合變異數公式
$`Var(R_p) = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 Cov(R_1, R_2)`$
使用相關係數表達：
$`Var(R_p) = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \sigma_1 \sigma_2 \rho_{1,2}`$
- **分散風險的效果分析：**
	- 當 $\rho_{1,2} = +1$ 時：無任何分散風險效果，組合標準差是兩資產標準差的簡單加權平均。
	- 當 $\rho_{1,2} < 1$ 時：只要相關係數小於 1，組合標準差就**小於**兩資產標準差的加權平均。
	- 當 $\rho_{1,2} = -1$ 時：可以構建出一個完全無風險的投資組合（$\sigma_p = 0$）。
---
## 📌 二、 效率前緣與夏普比率 (Efficient Frontier & Sharpe Ratio)
### 1. 效率前緣 (Efficient Frontier)
- 當考慮市場上所有風險資產時，在相同波動度下能提供最高預期回報、或在相同期望回報下波動度最低的組合軌跡。
- 投資人只會選擇落在效率前緣「上半部」的投資組合。
### 2. 無風險資產的引入與切點投資組合
當引入可以自由借入或貸出的無風險資產（利率為 $r_f$）時，投資人的選擇空間將被大幅拓寬。
- **資本配置線 (Capital Allocation Line, CAL)：**
	連接無風險資產與風險投資組合的直線。這條線的斜率代表每增加一單位波動度所能獲得的超額回報：
	$`\text{CAL Slope (Sharpe Ratio)} = \frac{E[R_p] - r_f}{\sigma_p}`$
- **最佳組合（切點投資組合 Tangency Portfolio）：**
	- 投資人應該選擇能讓 CAL 斜率最大的風險資產組合。這條切點切於風險資產效率前緣，稱為**切點投資組合**。
	- 不管投資人的風險偏好如何，所有投資人都應持有**切點投資組合與無風險資產的組合**。這就是**兩基金分離定理 (Two-Fund Separation Theorem)**。
---
## 📌 三、 資本資產定價模型 (The Capital Asset Pricing Model, CAPM)
在市場均衡時，所有投資人的買賣力量會使市場達到均衡。
### 1. CAPM 的核心假設
1. 投資人是理性的，且只關注期望回報與變異數。
2. 所有人都可以以無風險利率 $r_f$ 進行無限制借貸。
3. 所有人對資產的期望值、變異數有相同的預期。
4. 市場是完全競爭且無交易摩擦的。
### 2. 市場投資組合 (Market Portfolio)
- 在上述假設下，**切點投資組合必然等於市場投資組合 (Market Portfolio, M)**（包含市場上所有風險資產，且權重等於其市值占比，如 S&P 500 指數）。
### 3. 系統性風險度量：Beta ($\beta$)
Beta 衡量單一資產的回報率相對於市場投資組合波動的敏感度：
$`\beta_i = \frac{Cov(R_i, R_M)}{Var(R_M)} = \frac{\rho_{i,M} \sigma_i}{\sigma_M}`$
- **波動度 ($\sigma$) vs. Beta ($\beta$) 的本質區別：**
	- $\sigma$ 衡量的是資產的**總風險**（包含非系統性與系統性風險）。
	- $\beta$ 僅衡量資產無法被分散的**系統性風險**。
### 4. 證券市場線 (Security Market Line, SML)
CAPM 的核心公式。它指出任何資產的預期回報與其 Beta 呈完全線性關係：
$`E[R_i] = r_f + \beta_i \times \left( E[R_M] - r_f \right)`$
其中：
- $E[R_M] - r_f$ 稱為**市場風險溢酬 (Market Risk Premium)**。
- $\beta_i \times (E[R_M] - r_f)$ 稱為該資產的**風險溢酬 (Risk Premium)**。
---
## 📌 四、 經典例題與解題地圖 (Practice Questions)
### 例題 1：雙資產組合標準差計算 (⚠️ 核心公式應用)
> **題目：** 你投資了 40% 的資金在股票 A（標準差 20%），60% 在股票 B（標準差 30%）。兩者之間的相關係數 $\rho_{A,B} = 0.30$。
> 請問該投資組合的標準差是多少？
- **解答流程：**
	1. 確定權重與標準差：$w_A = 0.40, \sigma_A = 0.20$；$w_B = 0.60, \sigma_B = 0.30$；$\rho_{A,B} = 0.30$。
	2. 套用變異數公式：
	   $`Var(R_p) = w_A^2 \sigma_A^2 + w_B^2 \sigma_B^2 + 2 w_A w_B \sigma_A \sigma_B \rho_{A,B}`$
	   $`Var(R_p) = (0.4)^2(0.2)^2 + (0.6)^2(0.3)^2 + 2(0.4)(0.6)(0.2)(0.3)(0.3)`$
	   $`Var(R_p) = 0.16(0.04) + 0.36(0.09) + 2(0.24)(0.06)(0.3) = 0.0064 + 0.0324 + 0.00864 = 0.04744`$
	3. 計算標準差：
	   $`\sigma_p = \sqrt{0.04744} \approx 21.78\%`$
- **答案：** 該投資組合的標準差約為 **21.78%**。
---
### 例題 2：夏普比率 (Sharpe Ratio) 計算
> **題目：** 某共同基金的預期報酬率為 14%，標準差為 25%。若無風險利率為 4%。
> 請問該基金的夏普比率是多少？
- **解答流程：**
	- 套用公式：
	  $`Sharpe = \frac{E[R_p] - r_f}{\sigma_p} = \frac{14\% - 4\%}{25\%} = \frac{10\%}{25\%} = 0.40`$
- **答案：** 夏普比率為 **0.40**（代表每承擔 1% 的總風險，能換來 0.4% 的超額報酬）。
---
### 例題 3：資產 Beta 計算
> **題目：** 股票 A 與市場投資組合的相關係數為 0.60。股票 A 的標準差為 30%，市場的標準差為 15%。
> 請問股票 A 的 Beta 是多少？
- **解答流程：**
	- 套用公式：
	  $`\beta_A = \frac{\rho_{A,M} \sigma_A}{\sigma_M} = \frac{0.60 \times 30\%}{15\%} = \frac{18\%}{15\%} = 1.20`$
- **答案：** 股票 A 的 Beta 為 **1.20**（說明其系統性風險敏感度為市場整體的 1.2 倍）。
---
### 例題 4：CAPM 預期回報率計算
> **題目：** 承上題，若無風險利率為 3%，市場預期回報率為 10%。
> 請問根據 CAPM 模型，股票 A 的合理期望回報率是多少？
- **解答流程：**
	1. 市場風險溢酬 = $10\% - 3\% = 7\%$。
	2. 股票 A 的 Beta = 1.20。
	3. 套用 SML 公式：
	   $`E[R_A] = r_f + \beta_A (E[R_M] - r_f) = 3\% + 1.20 \times (10\% - 3\%) = 3\% + 8.4\% = 11.4\%`$
- **答案：** 股票 A 的期望回報率為 **11.4%**。
---
### 例題 5：Alpha 異常報酬與低估估值 (⚠️ 常考題)
> **題目：** 某證券分析師認為，股票 B（Beta = 0.80）明年的預期報酬率將達到 10.0%。無風險利率為 4%，市場回報為 11%。
> 1. 根據 CAPM 計算股票 B 的要求回報率。
> 2. 計算股票 B 的 Alpha ($\alpha$)。分析師認為這檔股票被高估還是低估？
- **解答流程：**
	1. **要求的合理報酬率：**
	   $`E[R_B]_{\text{required}} = 4\% + 0.80 \times (11\% - 4\%) = 4\% + 5.6\% = 9.6\%`$
	2. **計算 Alpha ($\alpha$)：**
	   分析師的預期回報與要求的合理回報之差：
	   $`\alpha_B = E[R_B]_{\text{expected}} - E[R_B]_{\text{required}} = 10.0\% - 9.6\% = +0.40\%`$
	3. **決策判定：** 因為 $\alpha > 0$，代表該股票預期能提供高於其風險對應的超額回報。因此，這檔股票在市場上**被低估 (Undervalued)**，此時是**買入 (Buy)** 的好時機。
- **答案：** 要求回報為 **9.6%**；Alpha = **+0.4%**；股票**被低估**。
---
## 📌 五、 程式化財務思維：JavaScript 投資組合與 CAPM 計算器
我們可以用程式碼快速進行投資組合風險試算以及 CAPM 定價評估：
```javascript
/**
 * 計算雙資產投資組合的預期回報與標準差
 */
function calculatePortfolioStats(w1, r1, sigma1, w2, r2, sigma2, corr12) {
  const expectedReturn = w1 * r1 + w2 * r2;
  const variance = Math.pow(w1 * sigma1, 2) + Math.pow(w2 * sigma2, 2) + 2 * w1 * w2 * sigma1 * sigma2 * corr12;
  const volatility = Math.sqrt(variance);
  
  return { expectedReturn, volatility };
}

/**
 * 根據 CAPM 計算要求回報率
 */
function getCapmRequiredReturn(rf, beta, marketReturn) {
  const marketRiskPremium = marketReturn - rf;
  return rf + beta * marketRiskPremium;
}

// === 實務試算 ===
const pStats = calculatePortfolioStats(0.4, 0.12, 0.20, 0.6, 0.15, 0.30, 0.3);
console.log(`投資組合期望回報: ${(pStats.expectedReturn * 100).toFixed(2)}%`);
console.log(`投資組合波動度(標準差): ${(pStats.volatility * 100).toFixed(2)}%`);
// 輸出波動度: 21.78%

const reqReturn = getCapmRequiredReturn(0.03, 1.2, 0.10);
console.log(`Beta 1.20 在 rf=3%, Rm=10% 下的要求報酬率: ${(reqReturn * 100).toFixed(2)}%`);
// 輸出要求報酬率: 11.40%
```
---
## 📌 六、 本章公式與核心觀念整理 (Summary & Formulas)
### 1. 核心公式總覽表
<table>
<tr>
<td>公式名稱 (Formula Name)</td>
<td>LaTeX 數學表達式</td>
<td>應用情境 (Usage)</td>
</tr>
<tr>
<td>**投資組合變異數 (雙資產)**</td>
<td>$`\sigma_p^2 = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \sigma_1 \sigma_2 \rho_{1,2}`$</td>
<td>計算分散投資後組合的真實風險。</td>
</tr>
<tr>
<td>**夏普比率 (Sharpe Ratio)**</td>
<td>$`Sharpe = \frac{E[R_p] - r_f}{\sigma_p}`$</td>
<td>衡量每單位總風險帶來的超額回報。</td>
</tr>
<tr>
<td>**資產 Beta 定義**</td>
<td>$`\beta_i = \frac{Cov(R_i, R_M)}{\sigma_M^2}`$</td>
<td>度量資產的系統性風險敏感度。</td>
</tr>
<tr>
<td>**CAPM 定價公式**</td>
<td>$`E[R_i] = r_f + \beta_i(E[R_M] - r_f)`$</td>
<td>計算資產與專案的合理要求報酬率。</td>
</tr>
</table>
### 2. 本章三大考試/常考觀念
1. **SML 與 CML 的區別 (極易混淆)：**
	- **資本市場線 (CML)：** 橫軸是**總風險 ($\sigma$)**，只適用於**完全分散**的有效投資組合。個別股票不能畫在 CML 上。
	- **證券市場線 (SML)：** 橫軸是**系統性風險 ($\beta$)**，適用於**任何**單一股票、資產或投資組合。
2. **Alpha 的本質：** $\alpha$ 代表偏離 SML 的垂直距離。SML 線之上的資產其 $\alpha > 0$，代表被低估；線之下的資產其 $\alpha < 0$，代表被高估。在有效市場假說下，所有資產的 Alpha 都應為 0。
3. **無風險利率對切點組合的影響：** 無風險利率上升時，資本配置線 CAL 的起點上移，會導致切點組合向右上方平移，降低了切點組合的夏普比率。
