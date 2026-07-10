# 內政部糾紛案例自動同步 SOP

## 目的

這個流程會直接呼叫內政部不動產資訊平台公開的 `GetG5` 介面，一次下載歷年房地產糾紛案例，再自動篩選含有租屋、租賃、承租、出租、房東、房客或包租等語意的候選資料。

組員不需要逐頁搜尋案例，也不需要手動複製每一列。

## 執行方式

在專案目錄執行：

```powershell
npm run evidence:sync:moi
```

程式會產生：

* `data/evidence/moi-g5/raw-latest.xml`：官方原始回應快照
* `data/evidence/moi-g5/rental-candidates.json`：租屋候選案例
* `data/evidence/moi-g5/rental-candidates.seed.sql`：Supabase 批次匯入 SQL
* `data/evidence/moi-g5/sync-report.json`：本次同步統計

## 自動化邊界

自動化負責：

1. 下載全部官方案例。
2. 初步篩選租屋相關案例。
3. 依關鍵詞提出 RHIR 欄位與 `riskType` 草稿。
4. 保留官方案例說明、處理情形、年度、縣市、糾紛來源與糾紛原因。
5. 產生可一次匯入 Supabase 的 SQL。

人工只負責最後審核：

1. 確認確實是住宅租屋，而不是商業租賃或買賣案件。
2. 確認 RHIR 欄位與 `riskType` 沒有誤配。
3. 確認摘要沒有超出官方資料所載內容。
4. 通過後才把 `review_status` 從 `draft` 改為 `verified`。

## 安全規則

所有自動同步案例都寫成 `draft`。批次 SQL 重新執行時，只會更新資料庫中仍為 `draft` 的同 ID 案例，不會覆蓋已經人工確認的 `verified` 案例。

這個流程只讀取公開官方介面，不繞過驗證碼、不登入後台，也不抓取個人資料。
