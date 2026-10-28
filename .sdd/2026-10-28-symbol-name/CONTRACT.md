# Contract Traceability Matrix — 操作台顯示標的名稱

Contract: PRD.md
Design map: ARCH.md
Implementation: `app/`（domain / infrastructure / components）
Oracle: Acceptance Criteria（13 clauses）

> 靜態一致性稽核：以 PRD 驗收條件為 oracle，逐條判斷測試斷言與程式路徑；只跑過對應單一測試作佐證，不以整套測試綠燈下結論，不執行自創情境。

## Clauses

`Test audit` / `Code audit` 為 Claude 的 shadow verdict。`Jev test` / `Jev code`、`Status`、`Route` 為 `jev_audit.py` 原樣輸出（AC-4、AC-7、AC-8 為補上完整程式範圍後的重跑結果，首輪結果見 Rechecks）。

| ID | Clause | Spec-expected (oracle) | Impl | Test | Test audit | Code audit | Jev test | Jev code | Status | Route |
|----|--------|------------------------|------|------|------------|------------|----------|----------|--------|-------|
| AC-1 | 台股有標的名稱 | 顯示「2330 台積電」 | `symbol-label-domain.ts:5-14` | `symbol-label-domain.spec.ts:6` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.95 | ✅ conforms | accept |
| AC-2 | 美股有標的名稱 | 顯示「AAPL Apple Inc.」 | `symbol-label-domain.ts:5-14` | `symbol-label-domain.spec.ts:7` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.96 | ✅ conforms | accept |
| AC-3 | 標的名稱是空的 | 顯示「2317」，後面沒有空白 | `symbol-label-domain.ts:13` | `symbol-label-domain.spec.ts:9` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.27 | ✅ conforms | escalate (low confidence) |
| AC-4 | 標的名稱只有空白 | 顯示「2330」 | `symbol-label-domain.ts:5` | `symbol-label-domain.spec.ts:10` | asserts-oracle | produces-oracle | asserts-oracle 0.96 | produces-oracle 0.56 | ✅ conforms | escalate (low confidence) |
| AC-5 | 服務沒有提供標的名稱 | 顯示「2330」，畫面照常 | `analysis-event-proxy.ts:15,58`；`tracked-symbol-grade-proxy.ts:11,40` | `analysis-event-proxy.spec.ts:46`；`tracked-symbol-grade-proxy.spec.ts:33`；`analysis-event-domain.spec.ts:90` | asserts-oracle | produces-oracle | asserts-oracle 0.95 | produces-oracle 0.49 | ✅ conforms | escalate (low confidence) |
| AC-6 | 分析事件頁的分析狀態 | 標的顯示「台股 2330 台積電」 | `AnalysisEventStatusPanel.vue:21`；`analysis-event-domain.ts:35,65` | `AnalysisEventStatusPanel.spec.ts:13` | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.60 | ✅ conforms | recheck |
| AC-7 | 分析報告頁首 | 頁首標的顯示「台股 2330 台積電」 | `AnalysisReportDocument.vue:17`；`analysis-event-domain.ts:56` | `AnalysisReportDocument.spec.ts:27` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.60 | ✅ conforms | recheck |
| AC-8 | 追蹤標的評等卡片 | 卡片標的顯示「2330 台積電」 | `TrackedSymbolGradeCard.vue:21`；`tracked-symbol-grade-domain.ts:34` | `TrackedSymbolGradeTable.spec.ts:7` | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.57 | ✅ conforms | escalate (low confidence) |
| AC-9 | 沒有標的名稱的追蹤標的評等卡片 | 卡片標的顯示「2317」 | 同 AC-8 + `symbol-label-domain.ts:13` | `TrackedSymbolGradeTable.spec.ts:9` | asserts-oracle | produces-oracle | asserts-oracle 0.72 | produces-oracle 0.87 | ✅ conforms | recheck |
| AC-10 | 有標的名稱的報告檔名 | 預設檔名「台股-2330-台積電-分析-2026-10-28」 | `analysis-event-domain.ts:58` | `analysis-event-domain.spec.ts:82` | asserts-oracle | produces-oracle | asserts-oracle 0.96 | produces-oracle 0.36 | ✅ conforms | escalate (low confidence) |
| AC-11 | 沒有標的名稱的報告檔名 | 預設檔名「台股-2317-分析-2026-10-28」 | `analysis-event-domain.ts:58` | `analysis-event-domain.spec.ts:83` | asserts-oracle | produces-oracle | asserts-oracle 0.88 | produces-oracle 0.23 | ✅ conforms | escalate (low confidence) |
| AC-12 | 新發起的分析記下標的名稱 | 我發起過的分析該筆顯示「台股 2330 台積電」 | `symbol-analysis-service.ts:24`；`recent-analysis.ts:19`；`RecentAnalysisList.vue:31` | `symbol-analysis-application.spec.ts:66`；`RecentAnalysisList.spec.ts:18` | asserts-oracle | produces-oracle | asserts-oracle 0.96 | produces-oracle 0.72 | ✅ conforms | recheck |
| AC-13 | 本功能上線前記下的分析 | 該筆顯示「台股 2330」，清單照常 | `local-storage-recent-analysis-storage-proxy.ts:10,22` | `local-storage-recent-analysis-storage-proxy.spec.ts:17`；`RecentAnalysisList.spec.ts:20` | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.49 | ✅ conforms | escalate (low confidence) |

### Rechecks

- **AC-4**：首輪 Jev 判 `diverges 0.31`（低信心）→ status violation / escalate。重讀：`SymbolLabelDomain` 建構子先 `trim()`，只有空白的名稱變成空字串，輸出只有代號；對應測試跑過為綠，且「拿掉 trim」的突變會讓它失敗。補上完整說明後重跑 Jev：conforms。
- **AC-7、AC-8**：首輪 Jev 判 `unclear`（disagree）。原因是程式範圍沒有涵蓋 `SymbolLabelDomain` 與 DTO；補上後重跑：conforms。對應測試跑過為綠。
- **其餘低信心（AC-3、5、10、11、13）**：程式路徑都只有一兩行（`?? ''`、`trim`、`join('-')`），Jev 測試判讀皆 ≥0.88；每條都有突變測試佐證（拿掉該行即紅）。

## Orphans (code with no clause)

| Code | Description | Verdict |
|------|-------------|---------|
| — | 無 | — |

## Summary

- Conforms: 13/13 clauses ✅ (100%)
- Violations / Mis-asserted / Partial / Gaps / Unclear: —
- Orphans: 0
- Jev: ran on 13 clauses（AC-4、AC-7、AC-8 補完整範圍後重跑）
- Needs James: AC-3、AC-4、AC-5、AC-8、AC-10、AC-11、AC-13（Jev 程式判讀信心低；Claude 重讀並以單一測試與突變測試佐證，判定 conforms）
