# Contract Traceability Matrix — 評等回測依來源比較

Contract: PRD.md
Design map: ARCH.md
Implementation: `go-symbol-news-hunter-frontend`，分支 `feature/grade-source`
Oracle: Acceptance Criteria（10 clauses）

> 靜態一致性稽核：以 PRD 預期結果為準，分別判斷測試是否斷言該結果、程式是否產生該結果；不執行自創情境。另以 Stryker 對變更的 TypeScript 檔做變異測試（76/77 被抓到；唯一存活的是來源字串多餘的 `trim()`，已刪除），變更檔案覆蓋率 100%。

## Clauses

`Test audit` / `Code audit` 為 Claude 的 shadow verdict；`Jev test` / `Jev code`、`Status`、`Route` 照 `jev_audit.py` 回傳原樣記錄。

| ID | Clause | Spec-expected (oracle) | Impl | Test | Test audit | Code audit | Jev test | Jev code | Status | Route |
|----|--------|------------------------|------|------|------------|------------|----------|----------|--------|-------|
| AC-1 | US-01 只看背景評等紀錄 | 服務收到只回測背景的查詢 | `grade-backtest-service.ts:26`、`grade-backtest-proxy.ts:58` | `BacktestQueryForm.spec.ts:26`、`grade-backtest-application.spec.ts:66` | asserts-oracle | produces-oracle | asserts-oracle 0.91 | produces-oracle 0.57 | ✅ conforms | escalate (low confidence) |
| AC-2 | US-01 只看手動評等紀錄 | 服務收到只回測手動的查詢 | 同上 | `grade-backtest-application.spec.ts:66`、`grade-backtest-proxy.spec.ts:15` | asserts-oracle | produces-oracle | asserts-oracle 0.79 | produces-oracle 0.69 | ✅ conforms | recheck (mid confidence) |
| AC-3 | US-01 預設不限來源 | 服務收到的查詢不帶評等來源 | `grade-backtest-service.ts:26`（空字串 → 不送） | `BacktestQueryForm.spec.ts:13`、`grade-backtest-application.spec.ts:66`、`grade-backtest-proxy.spec.ts:75` | asserts-oracle | produces-oracle | asserts-oracle 0.79 | produces-oracle 0.63 | ✅ conforms | recheck (mid confidence) |
| AC-4 | US-02 依來源顯示命中率 | 依來源表：手動 60%、背景 45%，順序手動、背景 | `grade-backtest-domain.ts`、`GradeBacktestSummary.vue` | `grade-backtest-domain.spec.ts:96`、`GradeBacktestSummary.spec.ts:19` | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.79 | ✅ conforms | recheck (mid confidence) |
| AC-5 | US-02 背景沒有可評估的紀錄 | 背景顯示「沒有資料」 | `grade-backtest-domain.ts` | `grade-backtest-domain.spec.ts:102` | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.87 | ✅ conforms | accept |
| AC-6 | US-02 服務沒有提供依來源的命中率 | 手動與背景都顯示「沒有資料」，頁面照常 | `grade-backtest-proxy.ts`（缺欄位 → 空 Map）、`grade-backtest-domain.ts` | `grade-backtest-domain.spec.ts:102`、`grade-backtest-proxy.spec.ts:75` | asserts-oracle | produces-oracle | asserts-oracle 0.85 | produces-oracle 0.71 | ✅ conforms | recheck (mid confidence) |
| AC-7 | US-03 手動評等紀錄可點開分析事件 | 來源「手動」；「台股 2330」連到分析事件 #12 | `GradeBacktestTable.vue`、`grade-backtest-domain.ts` | `GradeBacktestTable.spec.ts:17`、`grade-backtest-domain.spec.ts:111` | asserts-oracle | produces-oracle | asserts-oracle 0.88 | produces-oracle 0.91 | ✅ conforms | accept |
| AC-8 | US-03 背景評等紀錄顯示交易日、不能點 | 來源「背景」；「台股 4958」不是連結；交易日 2026-10-28 | `GradeBacktestTable.vue`、`grade-backtest-domain.ts`、`grade-backtest-proxy.ts` | `GradeBacktestTable.spec.ts:27`、`grade-backtest-domain.spec.ts:117`、`grade-backtest-proxy.spec.ts:15` | asserts-oracle | produces-oracle | asserts-oracle 0.88 | produces-oracle 0.29 | ✅ conforms | escalate (low confidence) |
| AC-9 | US-03 手動評等紀錄沒有交易日 | 交易日顯示「—」 | `grade-backtest-domain.ts` | `grade-backtest-domain.spec.ts:111`、`GradeBacktestTable.spec.ts:17` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.95 | ✅ conforms | accept |
| AC-10 | US-03 服務回傳不認得的來源 | 來源顯示「other」，頁面照常 | `grade-source-domain.ts` | `grade-backtest-domain.spec.ts:123` | asserts-oracle | produces-oracle | asserts-oracle 0.61 | produces-oracle 0.95 | ✅ conforms | recheck (mid confidence) |

## Orphans (code with no clause)

| Code | Description | Verdict |
|------|-------------|---------|
| `pages/grade-backtest.vue` 頁面說明文字 | 說明改為「比較評等紀錄建立時的價格…手動分析與追蹤標的評等」 | 用語更新，對應 BRIEF「用語改稱評等紀錄」 |

## Summary

- Conforms: 10/10 clauses ✅ (100%)
- Violations: 無
- Mis-asserted: 無
- Partial: 無
- Gaps: 無
- Unclear: 無
- Orphans: 1（用語，非 Out of Scope）
- Jev: ran on 10 clauses
- Needs James: AC-1、AC-8（皆為 Jev 對程式碼判斷的 low confidence，雙方結論一致 conforms；AC-8 的交易日來自 proxy 讀 `tradingDay` → domain `tradingDayText` → 表格欄，三段皆有測試）
