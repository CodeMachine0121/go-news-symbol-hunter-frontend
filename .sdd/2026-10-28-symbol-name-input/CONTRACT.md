# Contract Traceability Matrix — symbol-name-input（操作台）

Contract: PRD.md
Design map: ARCH.md
Implementation: `app/`（branch `feature/symbol-name-input`）
Oracle: Acceptance Criteria + Business Rules（12 clauses）

> Static conformance audit：依規格推導的預期結果，分別檢查測試斷言與程式路徑；不執行自行發明的情境。

`Test audit` / `Code audit` 為 Claude 的 shadow verdict；`Jev test` / `Jev code` 為 Jev 的判斷與信心；`Status` / `Route` 取自 `jev_audit.py`（以參照範圍修正後的最後一次執行為準）。縮寫：`PG` = `app/pages/analysis-events/index.vue`、`PT` = `tests/pages/analysis-events/index.spec.ts`、`AT` = `tests/application/symbol-analysis-application.spec.ts`。

## Clauses

| ID | Clause | Spec-expected (oracle) | Impl | Test | Test audit | Code audit | Jev test | Jev code | Status | Route |
|----|--------|------------------------|------|------|------------|------------|----------|----------|--------|-------|
| AC-01 | 標的分析頁提示代號與名稱 | 提示「例如 2330、台積電、AAPL、Bitcoin」 | PG（`symbol-placeholder`）、SymbolQueryForm.vue:14-40 | PT:104 | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.95 | ✅ conforms | accept |
| AC-02 | 新聞搜尋頁維持只提示代號 | 提示「例如 2330、AAPL、BTC」 | SymbolQueryForm.vue:15 | SymbolQueryForm.spec.ts:30 | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.93 | ✅ conforms | accept |
| AC-03 | 列出候選 | 顯示說明，依序列出「2882 國泰金」「00878 國泰永續高股息」 | backend-http-proxy.ts、symbol-ambiguous-error.ts、SymbolCandidateList.vue | PT:119、backend-http-proxy.spec.ts:38 | asserts-oracle | produces-oracle | asserts-oracle 0.96 | produces-oracle 0.57 | ✅ conforms | escalate (low confidence) |
| AC-04 | 點選候選發起分析 | 以台股、2882 發起並進入該分析事件頁 | PG:37、SymbolCandidateList.vue | PT:134 | asserts-oracle | produces-oracle | asserts-oracle 0.95 | produces-oracle 0.75 | ✅ conforms | recheck |
| AC-05 | 候選沒有名稱時只顯示代號 | 顯示「BTC」 | symbol-label-domain.ts | PT:119、backend-http-proxy.spec.ts:38 | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.77 | ✅ conforms | recheck |
| AC-06 | 服務沒有附上候選 | 只顯示說明、不列候選 | backend-http-proxy.ts（空清單）、PG（`v-if`） | PT:119、backend-http-proxy.spec.ts:38 | asserts-oracle | produces-oracle | asserts-oracle 0.91 | produces-oracle 0.64 | ✅ conforms | recheck |
| AC-07 | 找不到標的照舊顯示 | 顯示「找不到此標的」、不列候選 | PG | PT:162 | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.71 | ✅ conforms | recheck |
| AC-08 | 以台股名稱發起 | 記為「台股 2330 台積電」 | symbol-analysis-service.ts、recent-analysis-list-domain.ts | AT:78 | asserts-oracle | produces-oracle | asserts-oracle 0.69 | produces-oracle 0.53 | ✅ conforms | escalate (low confidence) |
| AC-09 | 以美股名稱發起 | 記為「美股 TSLA Tesla, Inc.」 | 同上 | AT:78 | asserts-oracle | produces-oracle | asserts-oracle 0.87 | produces-oracle 0.64 | ✅ conforms | recheck |
| AC-10 | 美股資料來源無法使用時記下填的字 | 記為「美股 TESLA」 | 同上 | AT:78 | asserts-oracle | produces-oracle | asserts-oracle 0.88 | produces-oracle 0.77 | ✅ conforms | recheck |
| BR-1 | 點選候選後按鈕顯示處理中 | 處理中候選按鈕停用 | PG:29-36、SymbolCandidateList.vue | PT:149 | asserts-oracle | produces-oracle | asserts-oracle 0.51 | produces-oracle 0.21 | ✅ conforms | escalate (low confidence) |
| BR-2 | 點選候選時沿用發起那次的市場類別 | 以原市場類別發起 | PG:23-25、37 | PT:134 | asserts-oracle | produces-oracle | asserts-oracle 0.44 | produces-oracle 0.77 | ✅ conforms | escalate (low confidence) |

### Notes

- AC-08～AC-10 第一輪 Jev 判 unclear，原因是程式碼參照漏了 `RecentAnalysisListDomain` 與 `SymbolLabelDomain`；補齊後重跑，表中為重跑結果。
- 突變測試：11 個關鍵突變全部被測試抓到（候選對映、缺候選、缺名稱、顯示文字、提示、市場類別、清單顯示、處理中保留、按鈕停用、選擇事件）。
- BR-1：處理中，表單的「發起分析」按鈕與候選按鈕都停用；按鈕上的 spinner 只出現在表單按鈕上。

## Orphans (code with no clause)

| Code | Description | Verdict |
|------|-------------|---------|
| — | — | — |

## Summary

- Conforms: 12/12 clauses ✅（100%）
- Violations / Mis-asserted / Partial / Gaps / Unclear: —
- Orphans: 0
- Jev: ran on 12 clauses
- Needs James: AC-03、AC-08、BR-1、BR-2 為低信心 escalate（Jev 與 Claude 判斷一致，且都有突變測試佐證）
