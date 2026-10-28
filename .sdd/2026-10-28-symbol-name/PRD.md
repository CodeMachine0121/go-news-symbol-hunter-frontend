# Product Requirements Document (PRD) — 操作台顯示標的名稱

**Status:** Finalized
**Version:** v1.0
**Owner:** James Hsueh
**Stakeholders:** Engineering

---

## 1. Background & Goal (Why & Goal)

- **Problem Statement:** 操作台只顯示標的代號（2330、AAPL），使用者要自己記代號是哪一家公司。服務已經為分析事件與追蹤標的評等提供「標的名稱」，操作台還沒顯示。
- **Expected Outcome:**
  - 分析事件頁、分析報告、我發起過的分析、追蹤標的評等，都以同一種「代號 名稱」的寫法顯示標的。
  - 沒有標的名稱時只顯示代號，不出現多餘的空白或符號。
  - 匯出 PDF 的預設檔名在有名稱時帶上名稱。
- **Out of Scope:**
  - 新聞搜尋結果、評等回測顯示標的名稱（服務未提供）。
  - 使用者輸入或修改標的名稱。
  - 補上舊紀錄的標的名稱。

---

## 2. User Personas

- **Primary Role(s):** 持有已啟用 API key、在瀏覽器使用網頁操作台的使用者。
- **Usage Context:** 桌機或手機瀏覽器，查看分析事件、匯出分析報告、瀏覽追蹤標的評等時。

---

## 3. User Stories & Acceptance Criteria

### US-01 — 一致的標的顯示文字 [priority: P0]
**As a** 操作台使用者, **I want** 標的以「代號 名稱」顯示, **so that** 我不用自己對照代號。

```gherkin
Scenario: 台股有標的名稱
  Given 標的 2330 的標的名稱為「台積電」
  When 操作台顯示這個標的
  Then 顯示「2330 台積電」

Scenario: 美股有標的名稱
  Given 標的 AAPL 的標的名稱為「Apple Inc.」
  When 操作台顯示這個標的
  Then 顯示「AAPL Apple Inc.」

Scenario: 標的名稱是空的
  Given 標的 2317 的標的名稱是空的
  When 操作台顯示這個標的
  Then 顯示「2317」，後面沒有空白

Scenario: 標的名稱只有空白
  Given 標的 2330 的標的名稱只有空白
  When 操作台顯示這個標的
  Then 顯示「2330」

Scenario: 服務沒有提供標的名稱
  Given 服務回應的標的 2330 沒有標的名稱
  When 操作台顯示這個標的
  Then 顯示「2330」，畫面照常
```

### US-02 — 各畫面都顯示標的名稱 [priority: P0]
**As a** 操作台使用者, **I want** 每個顯示標的的地方都看到名稱, **so that** 不管在哪一頁都認得出是哪個標的。

```gherkin
Scenario: 分析事件頁的分析狀態
  Given 台股 2330、標的名稱「台積電」的分析事件
  When 使用者打開分析事件頁
  Then 分析狀態的標的顯示「台股 2330 台積電」

Scenario: 分析報告頁首
  Given 已完成的台股 2330、標的名稱「台積電」的分析
  When 使用者打開分析報告
  Then 頁首的標的顯示「台股 2330 台積電」

Scenario: 追蹤標的評等卡片
  Given 台股 2330、標的名稱「台積電」的追蹤標的評等
  When 使用者打開追蹤標的評等
  Then 卡片的標的顯示「2330 台積電」

Scenario: 沒有標的名稱的追蹤標的評等卡片
  Given 台股 2317、標的名稱是空的追蹤標的評等
  When 使用者打開追蹤標的評等
  Then 卡片的標的顯示「2317」
```

### US-03 — 報告檔名帶標的名稱 [priority: P1]
**As a** 操作台使用者, **I want** 匯出的 PDF 檔名帶上標的名稱, **so that** 存檔後一眼認得。

```gherkin
Scenario: 有標的名稱的報告檔名
  Given 台股 2330、標的名稱「台積電」、分析完成於 2026-10-28 的分析
  When 使用者匯出 PDF
  Then 預設檔名為「台股-2330-台積電-分析-2026-10-28」

Scenario: 沒有標的名稱的報告檔名
  Given 台股 2317、標的名稱是空的、分析完成於 2026-10-28 的分析
  When 使用者匯出 PDF
  Then 預設檔名為「台股-2317-分析-2026-10-28」
```

### US-04 — 我發起過的分析記下標的名稱 [priority: P1]
**As a** 操作台使用者, **I want** 我發起過的分析也顯示名稱, **so that** 清單裡一眼找到要看的那筆。

```gherkin
Scenario: 新發起的分析記下標的名稱
  Given 使用者發起台股 2330 的分析，服務回應標的名稱「台積電」
  When 使用者查看我發起過的分析
  Then 該筆顯示「台股 2330 台積電」

Scenario: 本功能上線前記下的分析
  Given 我發起過的分析中有一筆本功能上線前記下的台股 2330 分析
  When 使用者查看我發起過的分析
  Then 該筆顯示「台股 2330」
  And 清單照常顯示
```

---

## 4. Business Flow & Logic

- **Core Business Rules:**
  - 標的顯示文字：標的名稱去除前後空白後不為空 → 「代號 名稱」；否則 → 「代號」。
  - 全操作台只用這一條規則產生標的顯示文字。
  - 市場類別照舊放在標的顯示文字前面（分析狀態、分析報告頁首、我發起過的分析）。
  - 報告檔名：有名稱時「市場類別-代號-名稱-分析-分析完成日期」；沒有時維持「市場類別-代號-分析-分析完成日期」。
  - 我發起過的分析：名稱在發起分析當下記下；之後不更新。
- **Edge Cases:**
  - 服務沒有提供標的名稱 → 視為空的。
  - 這個瀏覽器先前記下的分析沒有名稱 → 視為空的，清單照常。

---

## 5. UI/UX Design & Interaction

- 沿用既有版面，只換標的文字；不新增元件或樣式。

---

## 6. Non-Functional Requirements

- **Compatibility:** 服務還沒提供標的名稱時，操作台所有畫面照常運作。
- **Performance / Security / Analytics:** N/A。

---

## 7. Dependencies & Risks

- **External Dependencies:** 服務端「標的名稱」功能。
- **Known Risks:** 無。

---

## 8. Appendix

- 服務端需求：`../go-symbol-news-hunter/.sdd/2026-10-28-symbol-name/PRD.md`。
- 相關切片：`2026-10-17-web-console`、`2026-10-28-analysis-result-pdf-export`（報告檔名）。
