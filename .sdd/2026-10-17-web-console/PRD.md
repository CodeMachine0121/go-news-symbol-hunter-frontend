# Product Requirements Document (PRD) — 網頁操作台

**Status:** Finalized
**Version:** v1.0
**Owner:** James Hsueh
**Stakeholders:** Engineering, Design

---

## 1. Background & Goal (Why & Goal)

- **Problem Statement:** 標的資訊面分析服務目前只能以程式呼叫。申請 API key、搜尋新聞、發起分析並等候結果、查看追蹤標的評等與評等回測，都需要自行組請求、讀原始回覆，難以日常使用。
- **Expected Outcome:** 使用者不寫任何程式，就能在瀏覽器完成服務提供的每一件事；畫面呈現的資訊與服務回覆一致（評等、命中率、價格精確到服務給的每一位數）。
- **Out of Scope:**
  - 啟用 / 停用 API key（administrator 仍直接修改資料）。
  - 新增或暫停追蹤標的、查看時段執行紀錄。
  - 列出所有人發起過的分析（只記住本瀏覽器發起的）。
  - 帳號登入、多使用者、權限。
  - 價格走勢圖、K 線等任何技術面呈現。
  - 手機 App（手機瀏覽器需可正常閱讀與操作）。

---

## 2. User Personas

- **Primary Role(s):** 持有 API key 的使用者（專案擁有者本人為主要使用者）。
- **Usage Context:** 桌機瀏覽器為主，偶爾用手機瀏覽器查看結果；盤前、盤中、盤後查看追蹤標的評等，盤後或週末查看回測。

---

## 3. User Stories & Acceptance Criteria

### US-01 — 共通：受保護功能依 API key 狀況開放 [priority: P0]
**As a** 使用者, **I want** 操作台依目前使用的 API key 狀況決定我能不能使用功能, **so that** 我知道為什麼不能用、下一步該做什麼。

```gherkin
Scenario: 已啟用的 API key 可以使用受保護功能
  Given 目前使用的 API key 狀態為「已啟用」
  When 使用者打開新聞搜尋
  Then 可以輸入標的並搜尋

Scenario: 沒有 API key 時引導到設定
  Given 這個瀏覽器沒有目前使用的 API key
  When 使用者打開新聞搜尋
  Then 不顯示搜尋表單
  And 顯示「尚未設定 API key」並提供前往 API key 設定的連結

Scenario: 停用中的 API key 不能發起分析
  Given 目前使用的 API key 狀態為「停用中」
  When 使用者打開標的分析
  Then 不顯示發起分析表單
  And 顯示「API key 尚未啟用，請等候 administrator 啟用」並提供「重新檢查」

Scenario: 無效的 API key 引導重新設定
  Given 目前使用的 API key 已被撤銷或不存在
  When 使用者打開任何受保護功能
  Then 顯示「API key 無效」並提供前往 API key 設定的連結

Scenario: 重新檢查後立即可用
  Given 目前使用的 API key 狀態為「停用中」
  And administrator 剛把它改為已啟用
  When 使用者按「重新檢查」
  Then 狀態顯示「已啟用」
  And 受保護功能立即可以使用
```

### US-02 — 申請 API key [priority: P0]
**As a** 新使用者, **I want** 在操作台申請 API key, **so that** 我不必寫程式就能開始使用服務。

```gherkin
Scenario: 申請成功只顯示一次完整 API key
  Given 使用者填寫名稱「我的研究」
  When 使用者申請 API key
  Then 顯示完整 API key、「請立即保存，離開後將無法再次查看」提醒與複製功能
  And 狀態顯示「停用中」
  And 這把 API key 成為目前使用的 API key

Scenario: 名稱空白不送出
  Given 名稱為空白
  When 使用者申請 API key
  Then 不向服務送出申請
  And 顯示「API key 名稱為必填」

Scenario: 名稱過長顯示服務給的原因
  Given 名稱有 101 個字
  When 使用者申請 API key
  Then 顯示服務回覆的名稱過長原因

Scenario: 離開後不再顯示完整 API key
  Given 使用者已看過完整 API key 並離開畫面
  When 使用者回到 API key 設定
  Then 只顯示名稱、狀態與遮蔽的 API key
```

### US-03 — 使用、忘記與撤銷 API key [priority: P0]
**As a** 持有 API key 的使用者, **I want** 貼上、忘記或撤銷 API key, **so that** 我能在不同瀏覽器使用，或在外洩時讓它失效。

```gherkin
Scenario: 貼上既有 API key
  Given 使用者有一把已啟用的 API key
  When 使用者貼上它並確認使用
  Then 它成為目前使用的 API key
  And 顯示它的名稱與「已啟用」

Scenario: 貼上無效的 API key
  Given 使用者貼上一把不存在的 API key
  When 使用者確認使用
  Then 顯示「API key 無效」
  And 不成為目前使用的 API key

Scenario: 在這個瀏覽器忘記 API key
  Given 有目前使用的 API key
  When 使用者選「在這個瀏覽器忘記」
  Then 這個瀏覽器不再有目前使用的 API key
  And 不向服務撤銷它

Scenario: 撤銷 API key 並確認
  Given 有目前使用的 API key
  When 使用者選「撤銷」並在確認時同意
  Then 服務撤銷這把 API key
  And 這個瀏覽器不再有目前使用的 API key

Scenario: 撤銷時取消
  Given 有目前使用的 API key
  When 使用者選「撤銷」但在確認時取消
  Then 不向服務撤銷
  And 目前使用的 API key 不變
```

### US-04 — 新聞搜尋 [priority: P1]
**As a** 使用者, **I want** 搜尋某標的近 7 天新聞, **so that** 我能自己快速瀏覽資訊面。

```gherkin
Scenario: 搜尋成功
  Given 市場類別台股、標的 2330
  When 使用者搜尋
  Then 顯示新聞清單，發布時間新到舊
  And 每則顯示標題（可開啟原文）、新聞來源、發布時間，以及摘要（有才顯示）

Scenario: 部分新聞來源失敗
  Given 有新聞，但「鉅亨網」這次沒取到
  When 使用者搜尋
  Then 顯示取到的新聞
  And 另外提示「以下新聞來源這次沒有取到：鉅亨網」

Scenario: 近 7 天沒有新聞
  Given 該標的近 7 天沒有任何新聞
  When 使用者搜尋
  Then 顯示「近 7 天沒有新聞」

Scenario: 標的不存在
  Given 市場類別台股、標的 9999
  When 使用者搜尋
  Then 顯示「找不到此標的」

Scenario: 所有新聞來源失敗
  Given 所有新聞來源都無法取得
  When 使用者搜尋
  Then 顯示「新聞來源暫時無法使用」

Scenario: 標的空白不送出
  Given 標的為空白
  When 使用者搜尋
  Then 不向服務送出搜尋
  And 提示「請輸入標的」
```

### US-05 — 發起分析並等候結果 [priority: P0]
**As a** 使用者, **I want** 發起分析並在同一頁看到結果出來, **so that** 我不必反覆手動查詢。

```gherkin
Scenario: 新分析自動更新到完成
  Given 加密貨幣 BTC 在 6 小時內沒有分析
  When 使用者發起分析
  Then 進入該分析事件的頁面並顯示「分析中」
  And 自動更新，完成後顯示分析結果

Scenario: 重用已完成的分析
  Given 加密貨幣 BTC 在 2 小時前已完成一筆分析
  When 使用者發起分析
  Then 進入那筆分析事件的頁面並直接顯示其分析結果
  And 不進入等候

Scenario: 重用正在進行的分析
  Given 加密貨幣 BTC 已有一筆分析中的分析事件
  When 使用者發起分析
  Then 進入那筆分析事件的頁面並顯示「分析中」，繼續自動更新

Scenario: 分析失敗
  Given 等候中的分析事件以「AI 服務暫時無法使用」失敗
  When 自動更新取得最新狀態
  Then 顯示「分析失敗：AI 服務暫時無法使用」
  And 提供「重新發起」

Scenario: 分析數量已達上限
  Given 服務目前分析數量已達上限
  When 使用者發起分析
  Then 顯示「目前分析數量已達上限，請稍後再試」
  And 停留在發起表單

Scenario: 分析事件不存在
  Given 使用者打開一個不存在的分析事件網址
  When 頁面載入
  Then 顯示「找不到此分析事件」

Scenario: 離開頁面停止自動更新
  Given 分析事件仍在分析中
  When 使用者離開該分析事件的頁面
  Then 停止自動更新
  And 回到頁面時重新查詢最新狀態

Scenario: 等候超過上限
  Given 分析事件已持續分析中超過 15 分鐘
  When 自動更新到達上限
  Then 停止自動更新
  And 顯示「等候時間過長，請稍後手動重新整理」與「重新整理」
```

### US-06 — 分析結果的呈現 [priority: P0]
**As a** 使用者, **I want** 完整看到分析結果, **so that** 我能判斷評等是否可信。

```gherkin
Scenario: 完整呈現分析結果
  Given 分析事件已完成，評等看多、信心 72、時間範圍短期
  When 使用者查看
  Then 顯示「看多」（正向語氣）、信心 72、「短期（兩週內）」
  And 顯示分析理由、關鍵事件（可開啟來源）、風險因子與分析佐證新聞清單

Scenario: 分析時價格
  Given 分析時價格 1085.5、新台幣、價格來源證交所、價格時間 2026-10-16
  When 使用者查看
  Then 顯示「1085.5 TWD」、來源「證交所」、價格時間 2026-10-16

Scenario: 極小價格不失真
  Given 分析時價格 0.00001234 USDT
  When 使用者查看
  Then 顯示「0.00001234 USDT」

Scenario: 價格未取得
  Given 分析時價格未取得
  When 使用者查看
  Then 價格處顯示「未取得」
  And 其餘分析結果照常顯示
```

### US-07 — 我發起過的分析 [priority: P1]
**As a** 使用者, **I want** 回到之前在這個瀏覽器發起的分析, **so that** 我不必記住分析事件編號。

```gherkin
Scenario: 列出發起過的分析
  Given 這個瀏覽器發起過 3 筆分析
  When 使用者打開標的分析
  Then 「我發起過的分析」列出 3 筆，最新在前，可點擊進入

Scenario: 最多 20 筆
  Given 已記住 20 筆分析
  When 使用者再發起 1 筆
  Then 清單仍為 20 筆，最舊的那筆不再列出

Scenario: 同一分析事件只列一次
  Given 同一筆分析事件被重用兩次
  When 使用者查看清單
  Then 該分析事件只列一次，位於最前
```

### US-08 — 追蹤標的評等 [priority: P1]
**As a** 使用者, **I want** 看追蹤標的當天的綜合評等與各時段評等, **so that** 我能在盤前、盤中、盤後掌握資訊面變化。

```gherkin
Scenario: 列出追蹤標的的綜合評等
  Given 有追蹤標的 2330 的當日綜合評等
  When 使用者打開追蹤標的評等
  Then 顯示標的、市場類別、交易日、綜合評等、綜合分數、信心指數與更新時間

Scenario: 展開查看各時段評等
  Given 2330 當天有盤前、盤中評等
  When 使用者展開 2330
  Then 盤前、盤中顯示評等、信心、理由、關鍵事件與風險因子
  And 盤後顯示「尚未產生」

Scenario: 指定單一標的
  Given 使用者選市場類別台股、標的 2330
  When 使用者查詢
  Then 只顯示 2330

Scenario: 只填標的不送出
  Given 使用者只填標的、沒選市場類別
  When 使用者查詢
  Then 不向服務送出查詢
  And 提示「標的與市場類別需一起提供」

Scenario: 沒有資料
  Given 沒有任何追蹤標的評等
  When 使用者打開追蹤標的評等
  Then 顯示「目前沒有追蹤標的評等」
```

### US-09 — 評等回測 [priority: P1]
**As a** 使用者, **I want** 查看評等回測的命中率, **so that** 我知道分析評等是否優於隨機。

```gherkin
Scenario: 整體命中率並列隨機基準
  Given 整體命中 26 筆、沒命中 14 筆
  When 使用者查詢回測
  Then 顯示整體命中率「65%」，並列「隨機 50%」

Scenario: 分組沒有資料
  Given 信心「高」組命中 0 筆、沒命中 0 筆
  When 使用者查詢回測
  Then 該組命中率顯示「沒有資料」

Scenario: 尚未到期的明細
  Given 某筆分析的回測結果為尚未到期
  When 使用者查看明細
  Then 該筆檢查點價格與漲跌幅顯示「—」，回測結果顯示「尚未到期」

Scenario: 期間顛倒不送出
  Given 起日 2026-10-10、迄日 2026-10-01
  When 使用者查詢回測
  Then 不向服務送出查詢
  And 提示「期間不正確」

Scenario: 超過 500 筆
  Given 查詢涵蓋超過 500 筆分析
  When 使用者查詢回測
  Then 顯示「涵蓋分析超過 500 筆，請縮小期間」

Scenario: 價格服務無法連線
  Given 價格服務無法連線
  When 使用者查詢回測
  Then 顯示「價格服務暫時無法使用」

Scenario: 從明細回到分析
  Given 明細中有一筆分析
  When 使用者點擊該筆
  Then 打開該分析事件的頁面
```

### US-10 — 服務連線狀態 [priority: P2]
**As a** 使用者, **I want** 隨時知道服務是否連得上, **so that** 失敗時我能分辨是服務問題還是輸入問題。

```gherkin
Scenario: 服務連線正常
  Given 服務可以連線
  When 使用者打開操作台
  Then 顯示「服務連線正常」

Scenario: 服務無法連線
  Given 服務無法連線
  When 使用者在任何頁面送出操作
  Then 顯示「服務暫時無法使用」並提供重試
  And 服務狀態顯示「無法連線」
```

---

## 4. Business Flow & Logic

- **Flow:**
  1. 第一次使用 → API key 設定：申請（取得完整 API key 一次）或貼上既有 → 成為目前使用的 API key → 確認狀態。
  2. 停用中 → 等 administrator 啟用 → 重新檢查 → 已啟用。
  3. 已啟用 → 新聞搜尋 / 標的分析 / 追蹤標的評等 / 評等回測。
  4. 標的分析：發起 → 新分析或重用 → 分析事件頁 → 分析中時自動更新 → 已完成（顯示結果）或失敗（顯示原因、可重新發起）。
- **Core Business Rules:**
  - 所有業務判斷（評等、重用、命中與否、API key 狀態）以服務回覆為準，操作台不自行判斷。
  - 評等語氣：強烈看多、看多 → 正向；看空、強烈看空 → 負向；中性 → 中立。
  - 自動更新每 3 秒查詢一次；分析事件開始後超過 15 分鐘仍在分析中即停止自動更新（服務本身 15 分鐘後視為卡住）。
  - 我發起過的分析：最多 20 筆、最新在前、同一分析事件只列一次；只存在這個瀏覽器。
  - 目前使用的 API key 只存在這個瀏覽器；換瀏覽器需重新貼上。
  - 操作台送出前先擋明顯錯誤：標的空白、名稱空白、標的與市場類別只給一個、回測期間起日晚於迄日。其餘規則交給服務判斷並顯示服務給的原因。
  - 價格與漲跌幅照服務給的數字顯示，不四捨五入、不失真。
  - 回測期間預設不限（與服務一致）。
- **Edge Cases:**
  - 使用中途 API key 被撤銷或停用：下一次操作時顯示對應原因並引導到設定。
  - 服務無法連線：顯示「服務暫時無法使用」並可重試，不清掉使用者已填的內容。
  - 分析中離開頁面：停止自動更新；回來時重新查詢。

---

## 5. UI/UX Design & Interaction

- **Prototype Link:** 無；版面參考 Mobbin 上同類型網頁產品（儀表板、搜尋結果清單、設定頁、API key 管理頁、資料表）。
- **Key Interactions:**
  - 左側導覽（API key、新聞搜尋、標的分析、追蹤標的評等、評等回測），頂部顯示服務連線狀態與目前使用的 API key 狀態；手機寬度時導覽收合。
  - 載入中：按鈕顯示載入中並暫停重複送出；區塊顯示載入中提示。
  - 空狀態：每個清單都有明確的「沒有資料」文字。
  - 錯誤狀態：以醒目的提示區塊顯示原因與可做的下一步（重試、前往設定）。
  - 撤銷 API key 以確認對話框二次確認。
  - 完整 API key 只在申請成功的提示中出現，附複製按鈕。

---

## 6. Non-Functional Requirements

- **Performance:** 頁面切換即時；分析等候期間每 3 秒更新一次，不重複送出。
- **Security:** 完整 API key 除申請成功當下外不顯示；只存在使用者自己的瀏覽器。
- **Compatibility:** 最新版 Chrome、Safari、Firefox；桌機與手機寬度皆可操作。
- **Analytics / Tracking:** N/A。

---

## 7. Dependencies & Risks

- **External Dependencies:** 標的資訊面分析服務（後端）；回測依賴其價格服務。
- **Known Risks:**
  - 服務目前沒有開放跨來源瀏覽器存取，開發與部署時需讓操作台與服務看起來來自同一來源。
  - 我發起過的分析與目前使用的 API key 只存在瀏覽器，清除瀏覽器資料即遺失。

---

## 8. Appendix

- `BRIEF.md`（本資料夾）。
- 後端規格：API key 管理、新聞搜尋、標的分析、分析時價格、上櫃股票、追蹤標的時段評等、分析評等回測（`../go-symbol-news-hunter/.sdd/`）。
