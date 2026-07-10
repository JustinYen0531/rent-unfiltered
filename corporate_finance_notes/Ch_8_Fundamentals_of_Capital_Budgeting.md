# Ch. 8: Fundamentals of Capital Budgeting 資本預算基礎
## 🎯 章節核心問題
> **如何將會計利潤 (Accounting Earnings) 轉換為財務決策所需的自由現金流 (Free Cash Flow)？非現金支出（如折舊）如何影響專案的實質價值？如何評估專案預測的不確定性風險？**
>
> **核心解答：**
> 評估專案的唯一正確指標是**自由現金流 (FCF)**，而非會計利潤。折現時必須將非現金折舊加回，並扣除實際的資本支出與淨營運資金 (NWC) 的變動。折舊雖然不是現金流，但它透過**折舊稅盾**減少了稅務支出，進而增加了現金流。
---
## 📌 一、 預估利潤表與會計盈餘 (Pro Forma Earnings)
資本預算的第一步是預測專案未來的會計盈餘。
### 1. 營業盈餘 (EBIT)
EBIT 代表未扣除利息與稅金前的利潤：
$`EBIT = \text{Revenues} - \text{Cost of Goods Sold (COGS)} - \text{Selling, General & Administrative (SG\&A)} - \text{Depreciation}`$
- **機會成本與沉沒成本 (Opportunity vs. Sunk Costs)：**
	- **沉沒成本 (Sunk Costs)：** 已經發生且無法收回的支出（如前期的市場調查費），**絕不能**計入專案評估。
	- **機會成本 (Opportunity Costs)：** 使用現有資源所放棄的其他價值（如佔用現有廠房的租金收入），**必須**計入費用。
	- **副效應/ cannibalization (Cannibalization / Side Effects)：** 新專案導致公司現有舊產品銷售下降的損耗，**必須**作為成本扣除。
### 2. 邊際稅率與會計盈餘
$`\text{Earnings} = EBIT \times (1 - \tau_c)`$
其中 $\tau_c$ 為公司的邊際所得稅率。
---
## 📌 二、 自由現金流的計算公式 (Free Cash Flow, FCF)
會計盈餘不等於實際手頭上的現金。我們必須將會計盈餘調整為自由現金流：
$`FCF = (\text{EBIT} \times (1 - \tau_c)) + \text{Depreciation} - \text{Capital Expenditures (CapEx)} - \Delta \text{Net Working Capital (NWC)}`$
- **調整邏輯：**
	1. **加回折舊 (Depreciation)：** 折舊是非現金支出，並未真正流出現金，但它在計算 EBIT 時被扣除了，所以必須加回。
	2. **扣除資本支出 (CapEx)：** 購買廠房設備是實際的現金流出，但在會計上是以折舊分年攤銷，因此必須在發生當年扣除整筆支出。
	3. **扣除淨營運資金變動 ($\Delta NWC$)：** 營業過程中積壓的短期資金。
---
## 📌 三、 淨營運資金 (Net Working Capital, NWC)
NWC 代表維持日常營運所必須積壓的流動資金：
$`NWC = \text{Accounts Receivable (應收帳款)} + \text{Inventory (存貨)} - \text{Accounts Payable (應付帳款)}`$
### 1. NWC 的變動 ($\Delta NWC$)
- 現金流出取決於 NWC 的**增量**：
	$`\Delta NWC_t = NWC_t - NWC_{t-1}`$
- 當 $\Delta NWC_t > 0$ 時，代表公司有更多資金被積壓（如客戶賒帳增加或囤積存貨），這是**現金流出**（公式中為負號）。
- 當 $\Delta NWC_t < 0$ 時，代表收回了積壓資金，這是**現金流入**。
### 2. 專案結束時的 NWC 收回
- 在專案終止年（最後一年），NWC 通常會降為 0。這意味著所有應收帳款已收回、存貨已全部清空，會帶來一筆相等於前期積壓總額的**正現金流入**。
---
## 📌 四、 折舊稅盾與折舊方法的選擇 (Depreciation & Tax Shield)
### 1. 折舊稅盾 (Depreciation Tax Shield)
折舊雖然不是現金流，但它是可以抵稅的費用。每一元的折舊能為公司省下 $\tau_c$ 元的稅金支出：
$`\text{Depreciation Tax Shield} = \text{Depreciation} \times \tau_c`$
### 2. 直線折舊 vs. 加速折舊 (MACRS)
- **直線折舊 (Straight-Line)：** 每年折舊金額固定。
- **加速折舊 (MACRS)：** 在專案前期計提極高比例的折舊，後期逐漸減少。
- **財務決策偏好：** 根據貨幣的時間價值，**公司永遠偏好加速折舊 (MACRS)**。因為前期折舊多，能帶來更早的折舊稅盾現金流，從而大幅提升專案的 NPV。
---
## 📌 五、 專案分析與不確定性評估 (Project Analysis)
因為預測未來是不準確的，財務經理必須使用以下工具來評估風險：
- **敏感性分析 (Sensitivity Analysis)：**
	- 每次只改變**一個變數**（如銷售量），觀察 NPV 的變動幅度。這能幫公司找出對專案最關鍵的變數。
- **情境分析 (Scenario Analysis)：**
	- 同時改變**多個相關變數**，模擬特定情境（如「經濟大蕭條」下，銷量下滑、原料上漲的綜合影響）。
- **保本分析 (Breakeven Analysis)：**
	- 計算使專案 NPV 剛好等於 0 或是會計利潤等於 0 時，某變數的臨界值（如保本銷售量）。
---
## 📌 六、 經典例題與解題地圖 (Practice Questions)
### 例題 1：完整自由現金流表 (FCF) 與 NPV 計算
> **題目：** 某公司計劃投資新產品，初始設備投資 100 萬元 (t=0)，採用 4 年直線折舊至零。該專案預計存續 4 年，每年可產生銷售收入 80 萬元，付現營運成本為 30 萬元。所得稅率為 30%，資金折現率為 10%。假定無 NWC 變動，且設備在第 4 年底無殘值。
> 請問該專案的 NPV 是多少？
- **解答流程：**
	1. **計算年折舊：** $`\text{Depreciation} = \frac{1,000,000}{4} = 250,000`$ 元。
	2. **計算每年 EBIT：**
	   $`EBIT = 800,000 - 300,000 - 250,000 = 250,000`$ 元。
	3. **計算每年稅後會計盈餘：**
	   $`\text{Earnings} = 250,000 \times (1 - 0.30) = 175,000`$ 元。
	4. **計算每年自由現金流 (FCF) (t = 1 至 4)：**
	   $`FCF = \text{Earnings} + \text{Depreciation} = 175,000 + 250,000 = 425,000`$ 元。
	5. **建立現金流時間軸：**
	   - t = 0: $-1,000,000$ 元 (CapEx)
	   - t = 1, 2, 3, 4: $+425,000$ 元
	6. **計算 NPV：**
	   $`NPV = -1,000,000 + 425,000 \times \frac{1}{0.10} \left[ 1 - \frac{1}{(1.10)^4} \right]`$
	   $`NPV = -1,000,000 + 425,000 \times 3.16986 = -1,000,000 + 1,347,192.88 = 347,192.88`$
- **答案：** 專案的 NPV 為 **347,193** 元，應接受此投資。
---
### 例題 2：考慮淨營運資金變動 ($\Delta NWC$)
> **題目：** 承上題，如果該專案需要在 t = 0 投入營運資金 10 萬元。在 t = 1, 2, 3 期間營運資金維持 10 萬元不變。在 t = 4 專案結束時，營運資金將全部收回。
> 請問考慮營運資金後，專案的 NPV 變為多少？
- **解答流程：**
	- **NWC 現金流變動分析：**
	  - t = 0: $NWC_0 = 100,000 \implies \Delta NWC_0 = 100,000$（現金流出 $-100,000$）
	  - t = 1, 2, 3: $NWC_t = 100,000 \implies \Delta NWC_t = 0$（無變動）
	  - t = 4: $NWC_4 = 0 \implies \Delta NWC_4 = -100,000$（收回資金，現金流入 $+100,000$）
	- **綜合現金流調整：**
	  - t = 0: $-1,000,000 \text{ (CapEx)} - 100,000 \text{ (NWC)} = -1,100,000$ 元
	  - t = 1, 2, 3: $+425,000$ 元
	  - t = 4: $+425,000 \text{ (FCF)} + 100,000 \text{ (NWC 回收)} = +525,000$ 元
	- **重新計算 NPV：**
	  $`NPV = -1,100,000 + \frac{425,000}{1.10} + \frac{425,000}{1.10^2} + \frac{425,000}{1.10^3} + \frac{525,000}{1.10^4}`$
	  $`NPV = -1,100,000 + 386,363.64 + 351,239.67 + 319,308.79 + 358,579.52 = 315,491.62`$
- **答案：** 考慮 NWC 後，NPV 降為 **315,492** 元。
---
### 例題 3：資產殘值與稅務效應 (⚠️ 常考陷阱)
> **題目：** 公司在第 4 年底結束專案時，將原本直線折舊到 0 元的設備以 10 萬元的價格賣掉。所得稅率為 30%。請問這筆設備處分在第 4 年底帶來的實質現金流是多少？
- **解答流程：**
	- 設備的**帳面價值 (Book Value)** = 0 元。
	- 設備的**售出價格 (Salvage Value)** = 10 萬元。
	- 由於售價大於帳面價值，公司產生了 10 萬元的**處分利得**，這筆利得必須課稅。
	- 應繳稅金 = $(\text{Sale Price} - \text{Book Value}) \times \tau_c = (100,000 - 0) \times 30\% = 30,000$ 元。
	- 稅後殘值回收現金流 = $\text{Sale Price} - \text{Tax} = 100,000 - 30,000 = 70,000$ 元。
- **答案：** 第 4 年底的實質殘值回收現金流為 **70,000** 元。
---
## 📌 七、 程式化財務思維：JavaScript 資本預算與 FCF 模型
我們可以用程式碼建立一個 FCF 預估模型，以矩陣陣列運算自動處理折舊加回、CapEx、NWC 增量以及 NPV 折現：
```javascript
/**
 * 資本預算 FCF 及 NPV 計算器
 */
function calculateProjectNpv(params) {
  const { initialInvestment, taxRate, discountRate, revenues, cashCosts, n } = params;
  
  const depreciation = initialInvestment / n;
  let npv = -initialInvestment;
  const fcfList = [];
  
  for (let t = 1; t <= n; t++) {
    const ebit = revenues - cashCosts - depreciation;
    const taxes = ebit * taxRate;
    const earnings = ebit - taxes;
    const fcf = earnings + depreciation; // 無 NWC 變動
    
    fcfList.push(fcf);
    npv += fcf / Math.pow(1 + discountRate, t);
  }
  
  return { npv, fcfList };
}

// === 執行預算評估 ===
const projectData = {
  initialInvestment: 1000000,
  taxRate: 0.30,
  discountRate: 0.10,
  revenues: 800000,
  cashCosts: 300000,
  n: 4
};

const result = calculateProjectNpv(projectData);
console.log(`每年預估自由現金流為: `, result.fcfList);
console.log(`該專案之淨現值 NPV = ${result.npv.toFixed(2)} 元`);
// 輸出 NPV = 347192.88 元
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
<td>**會計盈餘**</td>
<td>$`\text{Earnings} = (\text{Revenues} - \text{Costs} - \text{Depr}) \times (1 - \tau_c)`$</td>
<td>專案淨利潤的初步計算。</td>
</tr>
<tr>
<td>**自由現金流 (FCF)**</td>
<td>$`FCF = \text{Earnings} + \text{Depr} - \text{CapEx} - \Delta NWC`$</td>
<td>評價任何公司實質專案價值的金標準。</td>
</tr>
<tr>
<td>**折舊稅盾**</td>
<td>$`\text{Tax Shield} = \text{Depr} \times \tau_c`$</td>
<td>計算折舊政策為公司省下的實質所得稅。</td>
</tr>
<tr>
<td>**稅後殘值回收**</td>
<td>$`\text{After-Tax Salvage} = \text{Sale Price} - (\text{Sale Price} - \text{Book Value}) \times \tau_c`$</td>
<td>計算專案終止時處分舊設備的淨回收資金。</td>
</tr>
</table>
### 2. 本章三大考試/常考觀念
1. **沉沒成本不是成本：** 歷史已經發生的費用（如研發費用、市調費用）是無法收回的，不管專案接不接受，這筆錢都已經沒了。因此，NPV 計算中**絕對不能**包含沉沒成本。
2. **NWC 必須在期末完美回收：** 除非題目特別說明，否則專案結束時，NWC 的餘額會變為 0，這代表在最後一年會有一筆同等額度的**正現金流流入**。
3. **利息費用不包含在 FCF 中：** FCF 衡量的是專案本身產生的現金流，不考慮融資方式。利息費用已經在折現率（WACC）中考慮了，如果在計算 FCF 時又扣除利息，會造成**重複計算**。
