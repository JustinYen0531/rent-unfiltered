# Ch. 9: Valuing Stocks 股票估值
## 🎯 章節核心問題
> **如何評估一張沒有到期日、且未來收益高度不確定的股票合理價值？什麼是企業價值 (Enterprise Value)？當公司不發放股利時，我們該如何為其股票估值？**
>
> **核心解答：**
> 股票定價同樣遵循無套利原則與現值法則。我們可以使用三種主流模型進行評估：**股利折現模型 (DDM)** 適用於股利穩定的公司；**總支付模型** 適用於常進行股票回購的公司；**自由現金流折現模型 (FCF Model)** 則是從公司整體經營價值出發，最適合無股利或高成長公司。此外，**乘數估值法** 則提供了一種基於同業比較的快速相對估值視角。
---
## 📌 一、 股利折現模型 (The Dividend-Discount Model, DDM)
股利折現模型認為，股票的合理價格等於投資人持有股票期間預期能收到的所有股利的現值總和。
### 1. 單期持有模型
投資人今天以 $P_0$ 買入，預計在第 1 年末收到股利 $Div_1$，並以 $P_1$ 賣出。要求的股權資本成本為 $r_E$：
$`P_0 = \frac{Div_1 + P_1}{1 + r_E}`$
### 2. 多期/無限期持有模型
由於股票沒有到期日，若投資人無限期持有，其價值等於未來所有股利的折現加總：
$`P_0 = \sum_{t=1}^{\infty} \frac{Div_t}{(1 + r_E)^t}`$
### 3. 固定股利增長模型 (Constant Dividend Growth Model)
假設股利從第 1 年開始以固定成長率 $g$ 永久增長（前提：$r_E > g$），這就是著名的**高登模型 (Gordon Growth Model)**：
$`P_0 = \frac{Div_1}{r_E - g} = \frac{Div_0 \times (1 + g)}{r_E - g}`$
- **股利增長率 ($g$) 的內生決定：**
	公司未來的股利增長取決於公司留存了多少盈餘進行再投資，以及再投資的效率。
	$`g = \text{Retention Rate (盈餘留存率)} \times \text{ROE (股權報酬率)}`$
	其中：
	$`\text{Retention Rate} = 1 - \text{Dividend Payout Rate (股利支付率)}`$
---
## 📌 二、 非恆定/兩階段股利增長模型 (Nonconstant Growth DDM)
高成長公司通常在前期經歷一段超額高速增長率（$g_{\text{high}}$），隨後在成熟期回歸到穩定的長期增長率（$g_{\text{normal}}$）。
- **解題邏輯：**
	1. **第一階段：** 逐筆計算高速增長期間（如第 1 到 $N$ 年）的每一筆股利，並折現。
	2. **第二階段：** 計算在第 $N$ 年末，當公司進入穩定成長期後，未來所有股利在 $t=N$ 時間點的總價值（即**終端價值 Terminal Value / $P_N$**）：
	   $`P_N = \frac{Div_{N+1}}{r_E - g_{\text{normal}}}`$
	3. **加總：** 將 $P_N$ 折現回今天 ($t=0$)，並與第一階段的股利現值相加。
	   $`P_0 = \frac{Div_1}{1+r_E} + \dots + \frac{Div_N}{(1+r_E)^N} + \frac{P_N}{(1+r_E)^N}`$
---
## 📌 三、 股票回購與總支付模型 (The Total Payout Model)
許多現代科技公司（如蘋果、微軟）不發放或少發放現金股利，而是透過**股票回購 (Share Repurchases)** 來將現金返還給股東。此時，單純的 DDM 會低估股價。
- **公式：**
	$`P_0 = \frac{PV(\text{Future Total Dividends} + \text{Future Total Repurchases})}{\text{Shares Outstanding (發行在外總股數)}}`$
	此模型直接計算公司全部股權的總價值，再除以總股數得到每股價值。
---
## 📌 四、 自由現金流折現模型 (Discounted Free Cash Flow Model)
這是實務中最核心的絕對估值法。它不從「分配給股東的利潤」出發，而是直接評估「公司整個業務所創造的現金流」。
### 1. 企業價值 (Enterprise Value, EV)
- **定義：** 購買整個公司業務所需的淨代價（包括股權與淨債務）。
- **公式關係：**
	$`\text{Enterprise Value (EV)} = \text{Market Value of Equity (E)} + \text{Debt (D)} - \text{Cash (C)}`$
### 2. FCF 估值公式
企業的總價值 (EV) 等於未來所有自由現金流 (FCF) 的現值總和。因為 FCF 同時屬於債權人與股東，所以其折現率必須使用**加權平均資本成本 (WACC)**：
$`EV_0 = \sum_{t=1}^{\infty} \frac{FCF_t}{(1 + WACC)^t}`$
### 3. 由企業價值推導股價
一旦算出企業價值 $EV_0$，就可以推算出股權的市場價值 $E_0$，進而求得股價：
$`\text{Equity Value } E_0 = EV_0 + \text{Cash} - \text{Debt}`$
$`\text{Stock Price } P_0 = \frac{E_0}{\text{Shares Outstanding}}`$
---
## 📌 五、 乘數估值法 (Valuation Based on Comparables)
乘數估值法是一種相對估值法，利用同業相似公司的估值比例來快速推算目標公司的價值。
- **本益比乘數 (Price-Earnings Ratio, P/E)：**
	$`P_0 = \text{EPS}_{\text{Target}} \times \left( \frac{\text{Price}}{\text{EPS}} \right)_{\text{Comps}}`$
- **企業價值乘數 (EV/EBITDA)：**
	由於 EBITDA 未扣除折舊與利息，能排除不同資本結構與折舊政策的干擾，因此在跨國與重資產行業中比 P/E 更常用：
	$`EV_0 = \text{EBITDA}_{\text{Target}} \times \left( \frac{\text{EV}}{\text{EBITDA}} \right)_{\text{Comps}}`$
---
## 📌 六、 經典例題與解題地圖 (Practice Questions)
### 例題 1：高登模型 (Gordon Growth) 計算股價
> **題目：** 某公司剛剛發放了每股 2.0 元的股利（即 $Div_0 = 2$）。預計該股利將以年增長率 5% 永久增長。投資人要求的報酬率為 11%。請問該股票的合理價值是多少？
- **解答流程：**
	1. 確定第一年預期股利 $Div_1 = Div_0 \times (1 + g) = 2.0 \times 1.05 = 2.10$ 元。
	2. 套用公式：
	   $`P_0 = \frac{Div_1}{r_E - g} = \frac{2.10}{0.11 - 0.05} = \frac{2.10}{0.06} = 35`$
- **答案：** 該股票的合理價格為 **35** 元。
---
### 例題 2：內生增長率 $g$ 與股價變動
> **題目：** 某公司 EPS 為 5 元，原本將 100% 的盈餘作為股利發放。現公司決定將盈餘留存率 (Retention Rate) 調整為 40% 用於新專案投資，新專案的 ROE 為 15%。若要求的股權成本為 10%。請問：
> 1. 調整前的股價是多少？
> 2. 調整後的股利增長率 $g$ 及調整後的股價是多少？
- **解答流程：**
	1. **調整前：** $Retention = 0 \implies g = 0$。$Div_1 = EPS_1 = 5$ 元。
	   $`P_0 = \frac{5}{0.10} = 50`$ 元。
	2. **調整後：**
	   - $g = 0.40 \times 15\% = 6\%$。
	   - 第一年股利 $Div_1 = EPS_1 \times (1 - Retention) = 5 \times 0.60 = 3$ 元。
	   - 調整後股價：
	     $`P_0 = \frac{Div_1}{r_E - g} = \frac{3}{0.10 - 0.06} = \frac{3}{0.04} = 75`$ 元。
- **答案：** 調整前股價為 **50** 元；調整後 $g = 6\%$，股價升至 **75** 元。
---
### 例題 3：兩階段股利折現模型 (⚠️ 高頻考試考點)
> **題目：** 某高科技公司預計未來 2 年的股利增長率為 20%，隨後在第 3 年起回歸到穩定的 6% 長期增長。公司去年剛剛發放了股利 1.0 元 ($Div_0 = 1$)。要求的報酬率為 10%。請問該股票的合理現值是多少？
- **解答流程：**
	1. **計算前兩年的高速增長股利：**
	   - $Div_1 = 1.0 \times 1.20 = 1.20$ 元。
	   - $Div_2 = 1.20 \times 1.20 = 1.44$ 元。
	2. **計算第 2 年末的終端價值 $P_2$：**
	   - 第 3 年股利 $Div_3 = Div_2 \times (1 + g_{\text{normal}}) = 1.44 \times 1.06 = 1.5264$ 元。
	   - $P_2 = \frac{Div_3}{r_E - g_{\text{normal}}} = \frac{1.5264}{0.10 - 0.06} = \frac{1.5264}{0.04} = 38.16$ 元。
	3. **將所有流折現加總：**
	   $`P_0 = \frac{1.20}{1.10} + \frac{1.44}{1.10^2} + \frac{38.16}{1.10^2} = 1.0909 + 1.1901 + 31.5372 = 33.818`$
- **答案：** 該股票的合理價格約為 **33.82** 元。
---
### 例題 4：自由現金流 (FCF) 企業價值估值法 (⚠️ 必考)
> **題目：** 某公司明年預計產生自由現金流 (FCF) 1,000 萬元，此後 FCF 每年以 4% 固定成長。公司的 WACC 為 9%，手頭現金 2,000 萬元，總債務 5,000 萬元，發行在外股數為 1,000 萬股。
> 請問該公司的合理股價是多少？
- **解答流程：**
	1. **計算企業價值 EV：**
	   $`EV = \frac{FCF_1}{WACC - g} = \frac{10,000,000}{0.09 - 0.04} = \frac{10,000,000}{0.05} = 200,000,000`$ 元 (2 億元)。
	2. **計算股權價值 E：**
	   $`E = EV + \text{Cash} - \text{Debt} = 200,000,000 + 20,000,000 - 50,000,000 = 170,000,000`$ 元 (1.7 億元)。
	3. **計算每股價值 (股價)：**
	   $`P_0 = \frac{170,000,000}{10,000,000} = 17`$ 元。
- **答案：** 該公司合理股價為 **17** 元。
---
## 📌 七、 程式化財務思維：JavaScript 股票估值模型
我們可以用程式碼整合高登模型、多階段 DDM 以及 FCF 估值，建立一個靈活的股票估值計算器：
```javascript
/**
 * 高登股利折現模型 (Gordon Growth Model)
 */
function gordonGrowthModel(div0, g, rE) {
  if (rE <= g) throw new Error("股權要求回報率必須大於成長率");
  const div1 = div0 * (1 + g);
  return div1 / (rE - g);
}

/**
 * 兩階段股利折現模型
 * @param {number} div0 - 剛發放的股利
 * @param {number} gHigh - 第一階段高增長率
 * @param {number} nHigh - 高增長持續年數
 * @param {number} gNormal - 第二階段穩定增長率
 * @param {number} rE - 股權成本
 */
function twoStageDdm(div0, gHigh, nHigh, gNormal, rE) {
  let pvDividends = 0;
  let currentDiv = div0;
  
  // 第一階段折現
  for (let t = 1; t <= nHigh; t++) {
    currentDiv = currentDiv * (1 + gHigh);
    pvDividends += currentDiv / Math.pow(1 + rE, t);
  }
  
  // 終端價值計算與折現
  const divNext = currentDiv * (1 + gNormal);
  const pN = divNext / (rE - gNormal);
  const pvPn = pN / Math.pow(1 + rE, nHigh);
  
  return pvDividends + pvPn;
}

// === 估值測試 ===
console.log(`高登模型估值: ${gordonGrowthModel(2, 0.05, 0.11).toFixed(2)} 元`); // 35.00
console.log(`兩階段 DDM 估值: ${twoStageDdm(1, 0.20, 2, 0.06, 0.10).toFixed(2)} 元`); // 33.82
```
---
## 📌 八、 本章公式與核心觀念整理 (Summary & Formulas)
### 1. 核心公式總覽表
<table>
<tr>
<td>公式名稱 (Formula Name)</td>
<td>LaTeX 數學表達式</td>
<td>應用情境 (Usage)</td>
</tr>
<tr>
<td>**高登模型 (Gordon Growth)**</td>
<td>$`P_0 = \frac{Div_1}{r_E - g}`$</td>
<td>評估進入穩定成熟期公司的股票價值。</td>
</tr>
<tr>
<td>**內生增長率**</td>
<td>$`g = \text{Retention Rate} \times ROE`$</td>
<td>分析公司再投資對股利成長的推動力。</td>
</tr>
<tr>
<td>**企業價值 (Enterprise Value)**</td>
<td>$`EV = E + D - C`$</td>
<td>公司全部營運資產的市場價值衡量。</td>
</tr>
<tr>
<td>**FCF 估值法 EV**</td>
<td>$`EV_0 = \frac{FCF_1}{WACC - g}`$</td>
<td>不論發不發股利，均能評估公司的核心經營價值。</td>
</tr>
</table>
### 2. 本章三大考試/常考觀念
1. **股利成長的雙刃劍：** 增加盈餘留存率雖然會提高股利增長率 $g$，但也減少了當期發放的股利。如果再投資的 ROE 低於資本成本 $r_E$，提高留存率反而會導致**股價下跌**。
2. **折現率的匹配原則：**
	- 股利折現模型 (DDM) 的現金流只屬於股東，因此必須用**股權資本成本 ($r_E$)** 折現。
	- 自由現金流模型 (FCF) 的現金流屬於所有出資人，因此必須用**加權平均資本成本 (WACC)** 折現。
3. **相對估值法的局限性：** 乘數估值法（如本益比）簡單快速，但它假設了「可比公司」在風險、成長率和利潤率上與目標公司完全相同。在實務中，這極難完全滿足。
