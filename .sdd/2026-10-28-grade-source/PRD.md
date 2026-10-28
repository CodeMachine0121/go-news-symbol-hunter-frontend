# Product Requirements Document (PRD) — 評等回測依來源比較

**Status:** Draft
**Version:** v1.0
**Owner:** James Hsueh
**Stakeholders:** Engineering

---

## 1. Background & Goal (Why & Goal)

- **Problem Statement:** 服務已把使用者發起的分析結果與追蹤標的的綜合評等都存成評等紀錄，並以評等來源（手動 / 背景）區分，評等回測也同時檢驗兩種來源。操作台的評等回測頁還只認得手動分析：不能只看某一種來源、看不到依來源分開的命中率、逐筆明細分不出來源，背景紀錄的標的還會連到不存在的分析事件。
- **Expected Outcome:**
  - 使用者可以在評等回測頁依評等來源查詢。
  - 命中率總表多一張「依來源」的表，直接比較手動與背景誰比較準。
  - 逐筆明細每一筆標出評等來源；只有手動紀錄能點開分析事件，背景紀錄改顯示交易日。
- **Out of Scope:**
  - 追蹤標的評等頁、分析事件頁、分析報告的任何改動。
  - 從背景評等紀錄連到追蹤標的評等頁。

---

## 2. User Personas

- **Primary Role(s):** 持有已啟用 API key、在瀏覽器使用網頁操作台的使用者（專案擁有者本人）。
- **Usage Context:** 桌機或手機瀏覽器，不定期查看評等回測，比較手動分析與追蹤標的自動評等的命中率。

---

## 3. User Stories & Acceptance Criteria

### US-01 — 依評等來源查詢 [priority: P0]
**As a** 使用者, **I want** 在評等回測頁選擇評等來源, **so that** 我能只看手動分析或只看追蹤標的的自動評等。

```gherkin
Scenario: 只看背景評等紀錄
  Given 查詢表單的評等來源選「背景」
  When 使用者查詢評等回測
  Then 服務只回測背景評等紀錄

Scenario: 只看手動評等紀錄
  Given 查詢表單的評等來源選「手動」
  When 使用者查詢評等回測
  Then 服務只回測手動評等紀錄

Scenario: 預設不限來源
  Given 查詢表單的評等來源維持預設的「全部」
  When 使用者查詢評等回測
  Then 服務不限評等來源
```

### US-02 — 依來源的命中率表 [priority: P0]
**As a** 使用者, **I want** 看到依評等來源分開的命中率, **so that** 我能比較手動分析與自動評等誰比較準。

```gherkin
Scenario: 依來源顯示命中率
  Given 手動命中 6 筆、沒命中 4 筆
  And 背景命中 9 筆、沒命中 11 筆
  When 使用者查看命中率總表
  Then 「依來源」表中手動顯示 60%、背景顯示 45%，順序為手動、背景

Scenario: 背景沒有可評估的紀錄
  Given 沒有任何可評估的背景評等紀錄
  When 使用者查看命中率總表
  Then 「依來源」表中背景的命中率顯示「沒有資料」

Scenario: 服務沒有提供依來源的命中率
  Given 服務回傳的結果沒有依來源的命中率
  When 使用者查看命中率總表
  Then 「依來源」表中手動與背景都顯示「沒有資料」，頁面照常顯示
```

### US-03 — 逐筆明細標出來源 [priority: P0]
**As a** 使用者, **I want** 逐筆明細標出每筆的評等來源, **so that** 我能分辨每一筆是手動分析還是自動評等。

```gherkin
Scenario: 手動評等紀錄可點開分析事件
  Given 一筆手動評等紀錄，屬於分析事件 #12，標的為台股 2330
  When 使用者查看逐筆明細
  Then 該筆的來源顯示「手動」
  And 「台股 2330」可點開分析事件 #12

Scenario: 背景評等紀錄顯示交易日、不能點
  Given 一筆背景評等紀錄，交易日 2026-10-28，標的為台股 4958
  When 使用者查看逐筆明細
  Then 該筆的來源顯示「背景」
  And 「台股 4958」只是文字、不能點
  And 交易日顯示 2026-10-28

Scenario: 手動評等紀錄沒有交易日
  Given 一筆手動評等紀錄
  When 使用者查看逐筆明細
  Then 該筆的交易日顯示「—」

Scenario: 服務回傳不認得的來源
  Given 一筆評等紀錄的來源是「other」
  When 使用者查看逐筆明細
  Then 該筆的來源顯示「other」，頁面照常顯示
```

---

## 4. Business Flow & Logic

- **Flow:** 查詢表單（期間、市場類別、標的、評等來源）→ 服務回測 → 命中率總表（整體、依市場類別、依評等、依信心分組、依來源）＋逐筆明細。
- **Core Business Rules:**
  - 評等來源選項：全部（預設，不限）、手動、背景；用語以後端 UL-MAP 的「評等來源」為準。
  - 「依來源」表固定兩列：手動、背景；沒有資料時顯示「沒有資料」，不顯示 0%。
  - 逐筆明細：手動紀錄的標的連到它的分析事件；背景紀錄沒有分析事件，標的只顯示文字，並顯示交易日；手動紀錄的交易日顯示「—」。
  - 用語：逐筆明細與空狀態稱「評等紀錄」，時間欄稱「建立時間」。
- **Edge Cases:**
  - 服務回傳不認得的評等來源：照原值顯示。
  - 服務沒有提供依來源的命中率：兩組都顯示「沒有資料」。
  - 服務拒絕不正確的來源時，比照其他查詢錯誤顯示服務的說明。

---

## 5. UI/UX Design & Interaction

- **Prototype Link:** N/A（沿用既有評等回測頁的版面與元件）
- **Key Interactions:**
  - 查詢表單在「標的」之後多一個「評等來源」下拉選單。
  - 命中率總表在「依信心分組」之後多一張「依來源」表。
  - 逐筆明細在「標的」之後多「來源」欄；在「建立時間」之後多「交易日」欄。

---

## 6. Non-Functional Requirements

- **Performance:** N/A（沒有新的請求，只多一個查詢參數）。
- **Security:** 照舊需要已啟用的 API key。
- **Compatibility:** 桌機與手機瀏覽器；明細表照舊可以左右捲動。
- **Analytics / Tracking:** N/A

---

## 7. Dependencies & Risks

- **External Dependencies:** 後端切片 `unified-grade-record`（評等來源查詢參數、依來源分組、明細的評等來源與交易日）。
- **Known Risks:** 後端尚未部署新版時，依來源表會顯示「沒有資料」、明細來源為空；頁面不會壞。

---

## 8. Appendix

- `BRIEF.md`（本資料夾）
- 後端 `../go-symbol-news-hunter/.sdd/2026-10-28-unified-grade-record/PRD.md`
