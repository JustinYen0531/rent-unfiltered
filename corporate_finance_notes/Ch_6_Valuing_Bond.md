# Ch. 6: Valuing Bond 債券估值
## 🎯 章節核心問題
> **債券價格是如何決定的？當市場利率變動時，債券價格會如何反應？公司債的利率為什麼總是高於政府公債？**
>
> **核心解答：**
> 債券的價值等於其未來所有利息與本金的**折現現值加總**。債券價格與市場利率（到期殖利率 YTM）呈**反向關係**：利率上升時債券價格下跌，且期限越長的債券對利率越敏感。公司債因為存在違約風險，其定價必須在無風險利率之上額外加上**信用利差**。
---
## 📌 一、 債券基本概念與現金流 (Bond Basics)
債券是發行者承諾在未來特定時間支付特定利息與本金的債務憑證。
- **面額 (Face Value / Par Value / \$FV\$)：** 債券到期時發行者承諾償還的本金金額（通常為 $1,000 元）。
- **票面利率 (Coupon Rate)：** 用以計算每期利息的年化利率。
- **利息 (Coupon / \$CPN\$)：** 每期支付的金額：
	$`CPN = \frac{\text{Coupon Rate} \times \text{Face Value}}{\text{Annual Coupon Payments per Year}}`$
- **到期日 (Maturity Date / \$N\$)：** 債券合約終止、償還最後一筆本金與利息的時間點。
- **到期殖利率 (Yield to Maturity, YTM)：** 投資人以當前市價買入債券並持有至到期所能獲得的實質年化報酬率。YTM 也是對該債券現金流進行折現的**市場折現率**。
---
## 📌 二、 零息債券與付息債券定價 (Bond Pricing Models)
### 1. 零息債券 (Zero-Coupon Bonds)
- **特徵：** 存續期間不支付任何利息（$CPN = 0$），僅在到期日償還面額。發行時以低於面額的折扣價折價發行。
- **💡 實務例子：** 美國國庫券 (T-Bills)。
- **零息債券定價與 YTM 公式：**
	$`Price = \frac{FV}{(1 + YTM_n)^n}`$
	$`YTM_n = \left( \frac{FV}{Price} \right)^{1/n} - 1`$
### 2. 付息債券 (Coupon Bonds)
- **特徵：** 存續期間定期（通常是半年或一年）支付利息，到期日支付最後一期利息並歸還面額。
- **付息債券定價公式：**
	付息債券可以看作是一個「**普通年金 (利息部分)**」加上一個「**單筆資金 (面額部分)**」的組合：
	$`Price = CPN \times \frac{1}{YTM} \left[ 1 - \frac{1}{(1 + YTM)^N} \right] + \frac{FV}{(1 + YTM)^N}`$
	*(若為半年付息：YTM 除以 2，期數 $N$ 乘以 2，利息 $CPN$ 除以 2。)*
---
## 📌 三、 債券價格的動態變化 (Why Bond Prices Change)
### 1. 債券價格與市場利率的關係
在發行後，債券的票面利率是固定的，但市場利率 (YTM) 會隨經濟環境不斷波動：
- **反向關係 (Inverse Relationship)：** 債券價格與 YTM 呈反方向變動。
	- 當 $YTM > \text{Coupon Rate}$ 時，債券以低於面額的價格售出，稱為**折價債券 (Discount Bond)**。
	- 當 $YTM < \text{Coupon Rate}$ 時，債券以高於面額的價格售出，稱為**溢價債券 (Premium Bond)**。
	- 當 $YTM = \text{Coupon Rate}$ 時，債券價格等於面額，稱為**平價債券 (Par Bond)**。
```javascript
// 利率與債券價格反向關係
YTM 上升 (↑)  ===>  債券價格下跌 (↓)
YTM 下跌 (↓)  ===>  債券價格上漲 (↑)
```
### 2. 利率風險與時間效應
- **利率風險 (Interest Rate Risk)：**
	- **到期期限越長**，債券價格對利率變動的敏感度越高（因為未來有更多期現金流被折現，複利敏感度大）。
	- **票面利率越低**，債券價格對利率變動的敏感度越高（因為現金流更集中在到期日）。
- **時間拉回效應 (Pull-to-Par Effect)：**
	在市場利率保持不變的情況下，折價或溢價債券的價格隨著到期日的臨近，都會逐漸收斂到其面額 ($Par Value$)。
---
## 📌 四、 公司債與信用風險 (Corporate Bonds & Credit Risk)
### 1. 違約風險 (Default Risk / Credit Risk)
- 發行者無法按時支付利息或本金的風險。主權國家（如美國）發行的債券通常被視為無風險債券；公司債券則存在不同程度的違約風險。
### 2. 信用評等 (Credit Ratings)
- 由評等機構（如 S&P, Moody's, Fitch）評估發行者的還款能力。
	- **投資級債券 (Investment Grade)：** BBB- / Baa3 以上，違約率極低。
	- **投機級/垃圾/高收益債券 (High Yield / Junk Bonds)：** BB+ / Ba1 以下，違約風險高，但提供極高殖利率。
<h3>3. 信用利差 (Credit Spread / Yield Spread)</h3>
- 同等期限的公司債券殖利率與無風險政府債券殖利率之間的差額。
	$`\text{Credit Spread} = YTM_{\text{Corporate}} - YTM_{\text{Risk-free}}`$
- 信用評等越低，信用利差越大；在經濟衰退期，市場恐慌度上升，信用利差會顯著擴大。
---
## 📌 五、 經典例題與解題地圖 (Practice Questions)
### 例題 1：零息債券定價與 YTM
> **題目：** 一張面額 1,000 元、期限 5 年的無息國庫券，目前市價為 750 元。請問該國庫券的到期殖利率 (YTM) 是多少？
- **解答流程：**
	- 零息債券沒有利息付款。
	- 套用公式：
	  $`YTM = \left( \frac{1,000}{750} \right)^{1/5} - 1 = (1.3333)^{0.2} - 1 = 5.92\%`$
- **答案：** 該零息債券的到期殖利率 (YTM) 為 **5.92%**。
---
### 例題 2：付息債券定價 (年付息)
> **題目：** 某公司債券面額 1,000 元，期限 10 年，票面利率 6% (年付息)。若當前市場同等風險投資的殖利率 (YTM) 為 8%，請問該債券的合理價格是多少？
- **解答流程：**
	1. 每期利息 $CPN = 1,000 \times 6\% = 60$ 元。
	2. 總期數 $N = 10$，市場折現率 $r = 8\%$。
	3. 套用付息債券公式：
	   $`Price = 60 \times \frac{1}{0.08} \left[ 1 - \frac{1}{(1.08)^{10}} \right] + \frac{1,000}{(1.08)^{10}}`$
	   $`Price = 60 \times 6.71008 + 1,000 \times 0.46319 = 402.60 + 463.19 = 865.79`$
- **答案：** 該債券的合理市價約為 **865.79** 元（折價發行，因 YTM 8% > 票面利率 6%）。
---
### 例題 3：半年付息債券定價 (⚠️ 考試最常見)
> **題目：** 承上題，若該債券改為半年付息一次，其他條件不變。請問合理價格是多少？
- **解答流程：**
	1. 半年利息 $CPN = \frac{1,000 \times 6\%}{2} = 30$ 元。
	2. 總計息期數 $N = 10 \times 2 = 20$ 期。
	3. 每期折現率 $r = \frac{8\%}{2} = 4\%$。
	4. 套用公式：
	   $`Price = 30 \times \frac{1}{0.04} \left[ 1 - \frac{1}{(1.04)^{20}} \right] + \frac{1,000}{(1.04)^{20}}`$
	   $`Price = 30 \times 13.5903 + 1,000 \times 0.45639 = 407.71 + 456.39 = 864.10`$
- **答案：** 半年付息下的債券價格為 **864.10** 元。
---
### 例題 4：由價格反推 YTM (年付息)
> **題目：** 一張 3 年期、票面利率 5% 的債券，面額 1,000 元 (年付息)，當前售價為 1,027.23 元。請問其 YTM 是多少？
- **解答流程：**
	- 債券定價方程：
	  $`1,027.23 = 50 \times \frac{1}{YTM} \left[ 1 - \frac{1}{(1+YTM)^3} \right] + \frac{1,000}{(1+YTM)^3}`$
	- 由於此公式無法直接解出 YTM，必須透過插值法 (Interpolation) 或試錯法：
	  - 試 YTM = 4%：
	    $`Price = 50 \times \frac{1}{0.04} \left[ 1 - \frac{1}{1.04^3} \right] + \frac{1,000}{1.04^3} = 138.75 + 889.00 = 1,027.75`$ (非常接近)
	  - 試 YTM = 4.02%：價格會更接近 1,027.23。
- **答案：** 到期殖利率 (YTM) 約為 **4.02%**（因價格大於面額，YTM 必小於票面利率 5%）。
---
### 例題 5：信用利差計算
> **題目：** 某 5 年期 AAA 級公司債的 YTM 為 5.2%，同期限的美國國債 YTM 為 3.5%。而另一張 BBB 級的 5 年期公司債 YTM 為 6.8%。請問 BBB 級債券相對於 AAA 級債券的信用利差是多少？
- **解答流程：**
	- BBB 級債券相對於無風險利率的利差 = $6.8\% - 3.5\% = 3.3\%$。
	- BBB 級債券相對於 AAA 級債券 the 信用利差 = $6.8\% - 5.2\% = 1.6\%$。
- **答案：** BBB 級相對於 AAA 級的信用利差為 **1.6%** (即 160 個基點 Basis Points)。
---
## 📌 六、 程式化財務思維：JavaScript 債券計算器
在實務中，計算債券價格與到期殖利率 (YTM) 可以用程式碼極快解決。特別是 YTM 的求法，通常使用二分搜尋法 (Bisection Method) 來逼近：
```javascript
/**
 * 計算付息債券價格 (年付息)
 * @param {number} fv - 面額 (Face Value)
 * @param {number} couponRate - 票面利率 (小數)
 * @param {number} ytm - 到期殖利率 (小數)
 * @param {number} n - 期限 (年)
 * @returns {number} 債券合理價格
 */
function calculateBondPrice(fv, couponRate, ytm, n) {
  const cpn = fv * couponRate;
  let price = 0;
  for (let t = 1; t <= n; t++) {
    price += cpn / Math.pow(1 + ytm, t);
  }
  price += fv / Math.pow(1 + ytm, n);
  return price;
}

/**
 * 利用二分法估算債券的到期殖利率 YTM
 * @param {number} targetPrice - 當前債券市價
 * @param {number} fv - 面額
 * @param {number} couponRate - 票面利率
 * @param {number} n - 期限 (年)
 * @returns {number} 估算的 YTM
 */
function estimateBondYtm(targetPrice, fv, couponRate, n) {
  let lowYtm = 0.0;
  let highYtm = 2.0; // 假設最高到 200% YTM
  let midYtm = 0.0;
  const tolerance = 0.0001; // 精確度
  
  for (let i = 0; i < 100; i++) {
    midYtm = (lowYtm + highYtm) / 2;
    const price = calculateBondPrice(fv, couponRate, midYtm, n);
    
    if (Math.abs(price - targetPrice) < tolerance) {
      return midYtm;
    }
    
    if (price > targetPrice) {
      // 債券價格太高，說明假設的利率太低，要調高利率
      lowYtm = midYtm;
    } else {
      // 債券價格太低，說明假設的利率太高，要調低利率
      highYtm = midYtm;
    }
  }
  return midYtm;
}

// === 測試估值 ===
const bondPrice = calculateBondPrice(1000, 0.06, 0.08, 10);
console.log(`票面6%, 殖利率8%, 10年期年付息債券價格: ${bondPrice.toFixed(2)} 元`);
// 輸出: 865.80 元

const computedYtm = estimateBondYtm(1027.23, 1000, 0.05, 3);
console.log(`市價 1027.23 元、票面5%、3年期年付息債券的 YTM 為: ${(computedYtm * 100).toFixed(2)}%`);
// 輸出: 4.02%
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
<td>**零息債券價格**</td>
<td>$`Price = \frac{FV}{(1 + YTM_n)^n}`$</td>
<td>評估無息票據或短期國庫券價格。</td>
</tr>
<tr>
<td>**付息債券價格**</td>
<td>$`Price = CPN \times \frac{1}{YTM} \left[ 1 - \frac{1}{(1 + YTM)^N} \right] + \frac{FV}{(1 + YTM)^N}`$</td>
<td>評估一般付息債券價格。</td>
</tr>
<tr>
<td>**信用利差 (Credit Spread)**</td>
<td>$`\text{Spread} = YTM_{\text{Corp}} - YTM_{\text{Gov}}`$</td>
<td>反映發行公司違約風險大小。</td>
</tr>
</table>
### 2. 本章三大考試/常考觀念
1. **半年計息的轉換陷阱：** 如果債券是每半年付息一次，一定要記得利息除以 2、折現率除以 2、總期數乘以 2 進行公式代入，這是最容易失分的地方。
2. **債券價格的收斂性：** 無論債券當前是折價還是溢價，在到期日前，其市價都會逐漸向面值收斂。
3. **敏感度分析（利率風險）：** 長期、低息的債券具有極高的利率風險。市場利率的小幅上升，會導致長期低息債券價格出現大幅下跌。
