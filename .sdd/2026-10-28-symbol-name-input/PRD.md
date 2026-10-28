# Product Requirements Document (PRD) — 操作台以名稱發起分析

**Status:** Finalized
**Version:** v1.0
**Owner:** James Hsueh
**Stakeholders:** Engineering、操作台使用者

---

## 1. Background & Goal (Why & Goal)

- **Problem Statement:** 服務已接受以代號或名稱發起分析，名稱對到多個標的時會回覆「符合多個標的」並附候選；操作台只提示填代號，也不會呈現候選。
- **Expected Outcome:** 使用者在標的分析頁知道可以填名稱；遇到符合多個標的時，看到候選並一鍵以候選發起分析。
- **Out of Scope:** 輸入時自動完成；新聞搜尋與評等回測以名稱查詢；點選候選後填回輸入框。

---

## 2. User Personas

- **Primary Role(s):** 持有已啟用 API key 的操作台使用者。
- **Usage Context:** 桌機或手機瀏覽器，在標的分析頁發起分析。

---

## 3. User Stories & Acceptance Criteria

### US-01 — 知道可以填名稱 [priority: P1]
**As a** 使用者，**I want** 標的分析頁提示我可以填名稱，**so that** 不必先查代號。

```gherkin
Scenario: 標的分析頁提示代號與名稱
  Given 使用者在標的分析頁
  When 看標的欄的提示
  Then 提示為「例如 2330、台積電、AAPL、Bitcoin」

Scenario: 新聞搜尋頁維持只提示代號
  Given 使用者在新聞搜尋頁
  When 看標的欄的提示
  Then 提示為「例如 2330、AAPL、BTC」
```

### US-02 — 符合多個標的時選擇候選 [priority: P0]
**As a** 使用者，**I want** 名稱對到多個標的時看到候選並直接選一個，**so that** 不必猜正確的代號。

```gherkin
Scenario: 列出候選
  Given 服務對「國泰」回覆符合多個標的，候選依序為 2882 國泰金、00878 國泰永續高股息
  When 使用者以台股、填「國泰」發起分析
  Then 顯示「符合多個標的，請改填代號或更完整的名稱」
  And 下方依序列出「2882 國泰金」「00878 國泰永續高股息」

Scenario: 點選候選發起分析
  Given 畫面正列出台股「國泰」的候選
  When 使用者點選「2882 國泰金」
  Then 以台股、2882 發起分析，並進入該分析事件頁

Scenario: 候選沒有名稱時只顯示代號
  Given 服務回覆的候選 BTC 沒有名稱
  When 列出候選
  Then 該候選顯示「BTC」

Scenario: 服務沒有附上候選
  Given 服務回覆符合多個標的但沒有附上候選
  When 使用者發起分析
  Then 只顯示「符合多個標的，請改填代號或更完整的名稱」，不列候選

Scenario: 找不到標的照舊顯示
  Given 服務對「台基電」回覆找不到此標的
  When 使用者以台股、填「台基電」發起分析
  Then 照舊顯示「找不到此標的」，不列候選
```

### US-03 — 記住辨識出的標的 [priority: P1]
**As a** 使用者，**I want** 我發起過的分析記下服務辨識出的代號與名稱，**so that** 清單不會出現我當初隨手填的字。

```gherkin
Scenario: 以台股名稱發起
  Given 服務把「台積電」辨識為 2330 台積電
  When 使用者以台股、填「台積電」發起分析
  Then 進入該分析事件頁，我發起過的分析記為「台股 2330 台積電」

Scenario: 以美股名稱發起
  Given 服務把「Tesla」辨識為 TSLA、名稱「Tesla, Inc.」
  When 使用者以美股、填「Tesla」發起分析
  Then 我發起過的分析記為「美股 TSLA Tesla, Inc.」

Scenario: 美股資料來源無法使用時記下填的字
  Given 美股資料來源暫時無法使用，服務以 TESLA 分析且沒有名稱
  When 使用者以美股、填「Tesla」發起分析
  Then 我發起過的分析記為「美股 TESLA」
```

---

## 4. Business Flow & Logic

- **Flow:** 填標的 → 發起分析 → 成功：進入分析事件頁並記入我發起過的分析；符合多個標的：顯示說明與候選 → 點選候選 → 以候選代號與原市場類別再發起一次。
- **Core Business Rules:**
  - 候選顯示沿用「標的顯示文字」規則（名稱去除前後空白後不為空時為「代號 名稱」，否則只有代號）。
  - 候選順序與服務回覆相同。
  - 點選候選時使用的市場類別，是發起那次分析時選的市場類別。
- **Edge Cases:** 點選候選後若服務又回覆錯誤，照一般錯誤顯示。

---

## 5. UI/UX Design & Interaction

- 候選清單出現在錯誤說明下方，每個候選是一個可點的按鈕；點選後按鈕顯示處理中，直到進入分析事件頁或顯示新的錯誤。
- 其他錯誤的顯示（重試、前往 API key 設定）不變。

---

## 6. Non-Functional Requirements

- **Compatibility:** 服務沒有附上候選時仍能正常顯示說明。
- **Performance / Security / Analytics:** N/A

---

## 7. Dependencies & Risks

- **External Dependencies:** 後端切片 `../go-symbol-news-hunter/.sdd/2026-10-28-symbol-name-input/`。
- **Known Risks:** 無。

---

## 8. Appendix

- `.sdd/2026-10-28-symbol-name-input/BRIEF.md`
