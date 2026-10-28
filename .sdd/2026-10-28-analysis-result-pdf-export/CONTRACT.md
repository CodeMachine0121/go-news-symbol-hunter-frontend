# Contract Traceability Matrix — 分析結果匯出 PDF

Contract: PRD.md
Design map: ARCH.md
Implementation: `app/`（domain / application / infrastructure / components / pages）
Oracle: Acceptance Criteria + Core Business Rules + Non-Functional Requirements (33 clauses)

> **Ceiling:** static conformance audit — test assertions and code paths are judged against the spec oracle, not by running the full suite. Mapped tests were run only as corroboration. CSS-only behaviour (page breaks, A4, toolbar hidden on paper) was additionally checked by rendering the report to PDF in headless Chrome against a mock backend during implementation; that render is evidence, not part of this audit's verdict.

## Clauses

`Test audit` / `Code audit` are Claude's shadow verdict. `Jev test` / `Jev code` are Jev's pick with its confidence. `Status` and `Route` come from `jev_audit.py` as returned.

| ID | Clause | Spec-expected (oracle) | Impl | Test | Test audit | Code audit | Jev test | Jev code | Status | Route |
|----|--------|------------------------|------|------|------------|------------|----------|----------|--------|-------|
| AC-01 | 已完成的分析顯示匯出動作 | 分析事件已完成且有分析結果時，頁首動作區出現「匯出 PDF」 | [analysisEventId]/index.vue:40 | index.spec: offers to export a completed analysis… | asserts-oracle | produces-oracle | asserts-oracle 0.87 | produces-oracle 0.93 | ✅ conforms | accept |
| AC-02 | 分析中不顯示匯出動作 | 狀態分析中時頁首沒有「匯出 PDF」 | analysis-event-domain.ts:62 | index.spec: offers no export while … running | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.49 | ✅ conforms | escalate (low confidence) |
| AC-03 | 分析失敗不顯示匯出動作 | 狀態失敗時頁首沒有「匯出 PDF」 | analysis-event-domain.ts:62 | index.spec: offers no export while … failed | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.93 | ✅ conforms | accept |
| AC-04 | 分析完成時匯出動作隨即出現 | 自動更新取得已完成與結果後，不重新整理即出現「匯出 PDF」 | [analysisEventId]/index.vue:41 | index.spec: offers the export as soon as … | asserts-oracle | produces-oracle | asserts-oracle 0.95 | produces-oracle 0.88 | ✅ conforms | accept |
| AC-05 | 匯出開啟分析報告並開啟存檔視窗 | 按「匯出 PDF」在新分頁打開分析事件 #42 的分析報告，報告顯示後自動開啟存檔視窗，原分析事件頁不變 | [analysisEventId]/index.vue:43; report.vue:49 | index.spec: offers to export … new tab; report.spec: shows the report … save dialog once | asserts-oracle | produces-oracle | asserts-oracle 0.25 | diverges 0.17 | 🔴 violation | escalate (violation) |
| AC-06 | 取消存檔視窗後可以再次匯出 | 停留在報告，報告上方提供「匯出 PDF」可再次開啟存檔視窗，以及「返回分析事件」回到分析事件 #42 | report.vue:32 | report.spec: opens the save dialog again from the toolbar… | asserts-oracle | produces-oracle | asserts-oracle 0.79 | produces-oracle 0.27 | ✅ conforms | escalate (low confidence) |
| AC-07 | 直接打開分析報告的網址 | 顯示分析事件 #42 的分析報告並自動開啟存檔視窗 | report.vue:23 | report.spec: shows the report … save dialog once | asserts-oracle | produces-oracle | asserts-oracle 0.53 | produces-oracle 0.61 | ✅ conforms | escalate (low confidence) |
| AC-08 | 直接打開尚無分析結果的分析報告 | 顯示「這筆分析尚無可匯出的結果」並提供「返回分析事件」，不開啟存檔視窗 | analysis-event-domain.ts:47 | report.spec: says a running/failed analysis has nothing to export… | asserts-oracle | produces-oracle | asserts-oracle 0.89 | produces-oracle 0.61 | ✅ conforms | recheck (mid confidence) |
| AC-09 | 沒有可用的 API key 時打開分析報告 | 依既有 API key 引導顯示（尚未設定、停用中或無效），不開啟存檔視窗 | report.vue:39 | report.spec: guides the user with no/inactive/invalid API key… | asserts-oracle | produces-oracle | asserts-oracle 0.93 | produces-oracle 0.91 | ✅ conforms | accept |
| AC-10 | 服務無法回覆時打開分析報告 | 顯示「服務暫時無法使用」並可重試，不開啟存檔視窗 | report.vue:40 | report.spec: offers a retry when the service is unavailable… | asserts-oracle | produces-oracle | asserts-oracle 0.97 | produces-oracle 0.80 | ✅ conforms | recheck (mid confidence) |
| AC-11 | 台股的預設檔名 | 台股、2330、台灣時間 2026-10-28 完成 → 預設檔名「台股-2330-分析-2026-10-28」 | analysis-event-domain.ts:55 | analysis-event-domain.spec: names the report file for Taiwan stock; report.spec: …save dialog once | asserts-oracle | produces-oracle | asserts-oracle 0.97 | produces-oracle 0.65 | ✅ conforms | recheck (mid confidence) |
| AC-12 | 美股的預設檔名 | 美股、AAPL、台灣時間 2026-10-27 → 「美股-AAPL-分析-2026-10-27」 | analysis-event-domain.ts:55 | analysis-event-domain.spec: …US stock; analysis-report-application.spec: prints the report under its default file name | asserts-oracle | produces-oracle | asserts-oracle 1.00 | produces-oracle 0.40 | ✅ conforms | escalate (low confidence) |
| AC-13 | 分析完成日期以台灣時間計 | 加密貨幣 BTC 完成於台灣時間 2026-10-28 23:59 → 「加密貨幣-BTC-分析-2026-10-28」 | timestamp-domain.ts:20 | analysis-event-domain.spec: …completion at 23:59 Taipei time | asserts-oracle | produces-oracle | asserts-oracle 0.99 | produces-oracle 0.57 | ✅ conforms | escalate (low confidence) |
| AC-14 | 報告頁首 | 顯示「標的分析報告」、「台股」、「2330」、「分析事件 #42」與分析完成時間「2026-10-28 09:15」 | AnalysisReportDocument.vue:12 | AnalysisReportDocument.spec: heads the report… | asserts-oracle | produces-oracle | asserts-oracle 0.97 | produces-oracle 0.39 | ✅ conforms | escalate (low confidence) |
| AC-15 | 分析結論 | 顯示評等「看多」、時間範圍、信心指數「72」與分析時價格「1050.5 TWD」並附價格來源與取得時間；分析理由依原本分段 | analysis-result.ts:24 | AnalysisReportDocument.spec: states the conclusion… | asserts-oracle | produces-oracle | asserts-oracle 0.88 | produces-oracle 0.45 | ✅ conforms | escalate (low confidence) |
| AC-16 | 分析時價格未取得 | 顯示「未取得」 | analysis-result.ts:28 | AnalysisReportDocument.spec: shows 未取得… | asserts-oracle | produces-oracle | asserts-oracle 0.93 | produces-oracle 0.79 | ✅ conforms | recheck (mid confidence) |
| AC-17 | 逐條列出關鍵事件與風險因子 | 3 個關鍵事件、2 個風險因子逐條列出 | AnalysisResultReport.vue:40 | AnalysisReportDocument.spec: lists every key event and risk factor | asserts-oracle | produces-oracle | asserts-oracle 0.93 | unclear 0.24 | ❔ unclear | escalate (disagree) |
| AC-18 | 沒有關鍵事件 | 關鍵事件區塊保留並顯示「沒有關鍵事件」 | AnalysisResultReport.vue:47 | AnalysisReportDocument.spec: keeps the key events section… | asserts-oracle | produces-oracle | asserts-oracle 0.60 | produces-oracle 0.93 | ✅ conforms | recheck (mid confidence) |
| AC-19 | 沒有風險因子 | 風險因子區塊保留並顯示「沒有風險因子」 | AnalysisResultReport.vue:56 | AnalysisReportDocument.spec: keeps the risk factors section… | asserts-oracle | produces-oracle | asserts-oracle 0.60 | produces-oracle 0.96 | ✅ conforms | recheck (mid confidence) |
| AC-20 | 分析佐證附完整網址 | 標示「本次分析參考的 12 則新聞」，12 則都列標題、新聞來源、發布時間並在標題下印出完整網址；標題可點擊 | EvidenceList.vue:22 | AnalysisReportDocument.spec: prints the full address under every evidence title | asserts-oracle | produces-oracle | asserts-oracle 0.73 | produces-oracle 0.55 | ✅ conforms | escalate (low confidence) |
| AC-21 | 報告頁尾 | 台灣時間 2026-10-28 10:30 打開 → 頁尾顯示「匯出時間 2026-10-28 10:30」與投資聲明 | AnalysisReportDocument.vue:27 | AnalysisReportDocument.spec: ends with the export time…; analysis-report-application.spec: builds the report … export time | asserts-oracle | produces-oracle | asserts-oracle 0.79 | produces-oracle 0.76 | ✅ conforms | recheck (mid confidence) |
| AC-22 | 黑白列印仍可辨識評等 | 評等強烈看空時以黑白列印仍讀到「強烈看空」 | GradeBadge.vue:10 | AnalysisReportDocument.spec: spells out the grade… | asserts-oracle | produces-oracle | asserts-oracle 0.80 | produces-oracle 0.49 | ✅ conforms | escalate (low confidence) |
| AC-23 | 內容超過一頁時延續到下一頁 | 每則佐證新聞與關鍵事件完整留在同一頁，區塊標題不單獨留在頁底 | EvidenceList.vue:40; KeyEventList.vue:34; _print.scss:16 | — (verified by real-browser PDF render) | no-test | produces-oracle | no-test 1.00 | unclear 0.33 | ❔ unclear | escalate (disagree) |
| AC-24 | PDF 不含操作元件 | PDF 中沒有選單、「匯出 PDF」、「返回分析事件」或任何按鈕，且為 A4 直式 | ReportLayout.vue:35; _print.scss:5 | report.spec: keeps every control out of the printed paper; AnalysisReportDocument.spec: has no buttons | shallow | produces-oracle | asserts-oracle 0.63 | produces-oracle 0.92 | ✅ conforms | escalate (disagree) |
| BR-1 | 可匯出條件 | 分析事件狀態為「已完成」且有分析結果才可匯出，其餘狀態一律不可 | analysis-event-domain.ts:62 | analysis-event-domain.spec: … can be exported; refuses to build a report… | asserts-oracle | produces-oracle | asserts-oracle 0.93 | produces-oracle 0.49 | ✅ conforms | escalate (low confidence) |
| BR-2 | 預設檔名 | 「{市場類別中文名稱}-{標的}-分析-{分析完成日期}」，日期為台灣時間年-月-日 | analysis-event-domain.ts:55 | analysis-event-domain.spec: names the report file for … | asserts-oracle | produces-oracle | asserts-oracle 0.87 | unclear 0.25 | ❔ unclear | escalate (disagree) |
| BR-3 | 報告內容 | 與分析事件頁的分析結果同一份資料、同樣中文名稱與數值，不另做計算 | analysis-event-domain.ts:58 | analysis-event-domain.spec: carries the report header, footer and the analysis result; AnalysisReportDocument.spec: states the conclusion… | shallow | produces-oracle | asserts-oracle 0.37 | produces-oracle 0.89 | ✅ conforms | escalate (disagree) |
| BR-4 | 匯出時間 | 打開分析報告當下的台灣時間，精確到分鐘 | analysis-report-service.ts:15 | analysis-report-application.spec: builds the report … stamped with the export time | asserts-oracle | produces-oracle | mis-asserted 0.35 | unclear 0.39 | ❔ unclear | escalate (disagree) |
| BR-5 | 存檔視窗只開一次 | 報告顯示完成後自動開啟一次；之後只在按「匯出 PDF」時再開啟 | report.vue:34,49 | report.spec: …save dialog once; opens the save dialog again… | asserts-oracle | produces-oracle | asserts-oracle 0.85 | produces-oracle 0.72 | ✅ conforms | recheck (mid confidence) |
| NFR-1 | Performance：存檔視窗在報告呈現完成後才開啟 | 存檔視窗在報告呈現完成後才開啟，不出現空白或不完整的 PDF | report.vue:49 | report.spec: waits for the API key check before opening the save dialog… | asserts-oracle | produces-oracle | shallow 0.36 | produces-oracle 0.55 | 🟠 mis-asserted | escalate (disagree) |
| NFR-2 | Security：需要已啟用的 API key | 分析報告需要已啟用的 API key 才能取得內容 | analysis-report-service.ts:14 | analysis-report-application.spec: asks for an API key…; report.spec: guides the user… | asserts-oracle | produces-oracle | asserts-oracle 0.93 | produces-oracle 0.60 | ✅ conforms | recheck (mid confidence) |
| NFR-3 | Compatibility：Chrome / Edge / Safari / Firefox | 桌機版 Chrome、Edge、Safari、Firefox 最新版皆可透過存檔視窗存成 PDF | browser-document-print-proxy.ts:10 | — | no-test | unclear | no-test 1.00 | produces-oracle 0.87 | 🟡 partial | escalate (disagree) |
| NFR-4 | Fidelity：文字可選取、連結可點擊 | PDF 內文字可選取、可複製，新聞連結可點擊 | EvidenceList.vue:17 | AnalysisReportDocument.spec: prints the full address … (href) | shallow | produces-oracle | shallow 0.25 | produces-oracle 0.59 | 🟠 mis-asserted | escalate (low confidence) |

### Re-audit after contract feedback

- **NFR-1** — first audit: shadow `shallow`; the test only checked that the save dialog opened once. A test now holds the API-key check open, asserts no save dialog meanwhile, and asserts the report is on screen at the moment the dialog opens. Falsified: a "print right after loading" implementation fails it (it would print the spinner). Re-audited: shadow `asserts-oracle`; Jev `shallow 0.36` → status stays as returned (🟠, escalate/disagree).
- **AC-24** — first audit: `shallow` (🟠 mis-asserted). A test now asserts every control sits in the toolbar region that printing hides and the paper region has none. Falsified by moving a link into the paper. Re-audited → ✅ conforms (Jev `asserts-oracle 0.63`). Hiding on paper and A4 remain CSS, confirmed by the PDF render.

### Recheck notes (routes `recheck` / `escalate`)

- **AC-05** (Jev `diverges 0.17`, very low confidence): re-read `[analysisEventId]/index.vue:40-47` (link to `/analysis-events/42/report`, `target="_blank"`) and `report.vue:46-50` (save dialog opened when the report document mounts). Ran the two mapped tests: green. Claude judges the code to produce the oracle; listed under Needs James because the script routed it.
- **AC-17 / BR-2 / BR-4** (Jev `unclear`, ≤0.39): code paths are single-branch template/string building; the mapped tests assert the exact values from the oracle (3 + 2 items; 「台股-2330-分析-2026-10-28」; 「2026-10-28 10:30」 under a fixed clock). Claude judges `produces-oracle`.
- **AC-23** (no automated test): `break-inside: avoid` on every evidence item, key event and risk factor; `break-after: avoid` on headings and card headers. The headless-Chrome PDF of a 24-evidence report kept every item whole across 3 pages. Print-cascade layout can't be asserted in happy-dom.
- **NFR-3**: only Chrome was rendered. Edge (Chromium) is equivalent; Safari and Firefox were not exercised → stays a known risk (PRD §7).
- **NFR-4**: links carry `href` (asserted); selectable text is a property of the browser's print engine, confirmed by text extraction from the rendered PDF.

## Orphans (code with no clause)

| Code | Description | Verdict |
|------|-------------|---------|
| AppCard.vue:37-41, AppStat.vue (on-print) | Printing **any** console page now drops card frames and shadows, not just the analysis report | undocumented side effect — harmless and consistent with the report, not out of scope; no clause needed |
| report.spec: shows the report … after a successful retry | After a failed load, a successful retry shows the report and opens the save dialog once | covered in spirit by BR-5 + AC-10 (dialog opens once the report is shown); undocumented combination |

## Summary

- Conforms: 25/33 clauses ✅ (76%)
- Violations: AC-05  (Jev-only at confidence 0.17; Claude disagrees — see recheck)
- Mis-asserted: NFR-1, NFR-4
- Partial: NFR-3
- Gaps: —
- Unclear: AC-17, AC-23, BR-2, BR-4
- Orphans: 2
- Jev: ran on 33 clauses (+2 re-audits)
- Needs James: AC-02 (low confidence), AC-05 (violation), AC-06 (low confidence), AC-07 (low confidence), AC-12 (low confidence), AC-13 (low confidence), AC-14 (low confidence), AC-15 (low confidence), AC-17 (disagree), AC-20 (low confidence), AC-22 (low confidence), AC-23 (disagree), AC-24 (disagree), BR-1 (low confidence), BR-2 (disagree), BR-3 (disagree), BR-4 (disagree), NFR-1 (disagree), NFR-3 (disagree), NFR-4 (low confidence)
