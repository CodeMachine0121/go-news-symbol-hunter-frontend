# 📔 Ubiquitous Language Map

**Project:** go-symbol-news-hunter-frontend
**Bounded Context:** 標的資訊面分析（Symbol News Analysis）的網頁操作台
**Maintainer:** James Hsueh
**Last Updated:** 2026-10-17

> **業務詞彙的權威來源是後端 `../go-symbol-news-hunter/.sdd/UL-MAP.md`**（標的、市場類別、評等、分析事件、時段評等、評等回測…）。本檔只收錄操作台**新增**的詞彙；後端已定義的詞彙不在此重複，也不得在前端另取同義詞。

---

## 1. Nouns & Concepts

| Domain Term | Technical Name | User-Facing Label | Definition & Business Rules | Status |
| :--- | :--- | :--- | :--- | :--- |
| 網頁操作台 | — | — | 在瀏覽器中使用服務所有功能的網頁 | Confirmed |
| 目前使用的 API key | `StoredApiKey` | 目前使用的 API key | 這個瀏覽器記住、用來呼叫受保護功能的 API key；只存在這個瀏覽器 | Confirmed |
| 遮蔽的 API key | `MaskedApiKey` | — | 只露出開頭與結尾幾個字元、其餘以符號遮蔽的 API key 顯示方式 | Confirmed |
| 我發起過的分析 | `RecentAnalysis` | 我發起過的分析 | 這個瀏覽器發起過的分析事件清單，最多 20 筆、最新在前、同一分析事件只列一次 | Confirmed |
| 評等語氣 | `GradeTone` | — | 評等在畫面上的語氣：看多類為正向、看空類為負向、中性為中立 | Confirmed |
| 服務連線狀態 | `BackendHealth` | 服務狀態 | 操作台目前是否連得上服務 | Confirmed |
| 自動更新 | `AnalysisPolling` | — | 分析中時定期重新查詢分析事件，直到完成、失敗或達到等候上限 | Confirmed |

---

## 2. Actions & Processes

| Business Action | Technical Method | Trigger | Business Impact | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 使用 API key | `useApiKey` | 使用者貼上既有 API key | 成為目前使用的 API key，並立即確認狀態 | |
| 忘記 API key | `forgetApiKey` | 使用者選「在這個瀏覽器忘記」 | 瀏覽器不再記住；API key 本身不受影響 | 與「撤銷 API key」不同 |
| 重新檢查 API key 狀態 | `refreshApiKeyStatus` | 使用者按「重新檢查」 | 取得最新的停用中 / 已啟用狀態 | |
| 記住發起過的分析 | `rememberAnalysis` | 發起分析成功 | 加入我發起過的分析清單 | |

---

## 3. Ambiguities & Conflicts

| Ambiguous Term | Meaning in Context A | Meaning in Context B | Resolution |
| :--- | :--- | :--- | :--- |
| 忘記 vs 撤銷 | 忘記：只在這個瀏覽器不再記住 | 撤銷：API key 永久失效（後端定義） | 兩個動作分開呈現；撤銷需二次確認 |

---

## 4. External & Enum Mapping

| Category | Code Value / Key | Domain Label | Description |
| :--- | :--- | :--- | :--- |
| 評等語氣 | `positive` / `negative` / `neutral` | 正向 / 負向 / 中立 | 強烈看多、看多 → 正向；看空、強烈看空 → 負向；中性 → 中立 |
| 服務連線狀態 | `online` / `offline` / `checking` | 連線正常 / 無法連線 / 檢查中 | Confirmed |
