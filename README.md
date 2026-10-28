# go-symbol-news-hunter-frontend

[`go-symbol-news-hunter`](../go-symbol-news-hunter/) 的前端。

後端依「標的 + 市場類別」爬取新聞，交給 AI 分析，產出**標準化、可追溯來源**的評等（強烈看多 ～ 強烈看空）。另外還會為追蹤標的產出台股盤前、盤中、盤後的時段評等，並用價格服務回測評等的命中率。這個前端把這些能力做成可操作的畫面：管理 API key、搜尋新聞、發起與追蹤分析、看追蹤標的的時段評等、看回測命中率。

> 純資訊 / 決策輔助：不代操、不下單。

**狀態：** 操作台已完成，涵蓋後端所有 API；需求、PRD、架構與驗收對照在 `.sdd/2026-10-17-web-console/`。

---

## 技術選型

| 層面 | 選型 | 備註 |
| :--- | :--- | :--- |
| 框架 | **Nuxt 3** + **Vue 3**（`<script setup lang="ts">`） | `app/` 目錄結構（Nuxt 4 相容模式） |
| 語言 | **TypeScript**（`strict`） | 禁 `any` / `as any` / `@ts-ignore` |
| 套件管理 / 執行 | **Bun** | |
| 樣式 | **SCSS**（scoped），token 中央控管 | 不用 Tailwind 或其他 utility class 框架 |
| 金額 | **`decimal.js`** | 價格一律精確小數，禁用 `number` |
| 測試 | **Vitest** + `@vue/test-utils` | 只 mock 介面 |
| Lint | ESLint（`@nuxt/eslint` + `typescript-eslint` + 自訂原子化設計規則）、stylelint | 見 [component-design.md §四](.claude/rules/component-design.md) |

## 架構

Clean / Onion Architecture，依賴一律指向 Domain：

```
.vue 元件  ───▶  Application  ───▶  Domain  ◀───  Infrastructure
(Controller)     (use cases)       (核心)         (Proxy 實作)
```

- 前端沒有資料庫，**沒有 Repository**。所有對外資料（後端 REST API、`localStorage`）都經過 **Proxy**。
- `.vue` 元件只認識 Application 與 DTO。業務規則（例如評等該用什麼顏色）由 Domain Model 算好，放進 DTO 帶出來。
- 元件依原子化設計分成 atoms / molecules / organisms / templates 四層。

目錄結構與各層規範見 [.claude/rules/architecture.md](.claude/rules/architecture.md)。

## 對接的後端

後端是 Go + Gin 的 REST API，預設跑在 `http://localhost:8081`（後端 `SERVER_PORT`）。

### 鑑權：API key

- 受保護的端點都要帶 header **`X-API-Key`**。
- API key 由使用者在 `POST /api-keys` 建立，**建立後預設停用**，要 administrator 直接改資料庫啟用後才能用。前端只能顯示目前狀態，不能自己啟用。
- 前端要在瀏覽器保存使用者的 API key。存取一律包成 Proxy，`localStorage` 不得出現在 Proxy 以外的地方。

### 端點

| 方法 | 路徑 | 鑑權 | 用途 | 後端切片 |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/health` | — | 健康檢查 | — |
| POST | `/api-keys` | — | 建立 API key（body `{ name }`，回 201） | api-key-management |
| GET | `/api-keys/me` | `X-API-Key` | 查詢 API key 名稱與狀態（`inactive` / `active`） | api-key-management |
| DELETE | `/api-keys/me` | `X-API-Key` | 撤銷 API key（不可逆） | api-key-management |
| GET | `/news?symbol=&category=` | 已啟用 | 搜尋標的新聞（7 天內，最多 30 則，附失敗的新聞來源） | symbol-news-search |
| POST | `/analysis-events` | 已啟用 | 發起分析（body `{ symbol, category }`）。**非同步**：新建時回 202；6 小時內有可重用的分析就直接回那一筆 | symbol-news-analysis |
| GET | `/analysis-events/:analysisEventId` | 已啟用 | 查詢分析事件狀態（`running` / `succeeded` / `failed`）、失敗原因、分析結果 | symbol-news-analysis、analysis-price-snapshot |
| GET | `/tracked-symbol-grades?symbol=&category=` | 已啟用 | 追蹤標的最新一天的綜合評等與各時段評等（標的與市場類別要一起給，或都不給） | tracked-symbol-session-grade |
| GET | `/grade-backtest?completedFrom=&completedTo=&symbol=&category=` | 已啟用 | 評等回測：命中率總表（整體、依市場類別、評等、信心分組）與逐筆明細。超過 500 筆會被拒絕 | analysis-grade-backtest |

錯誤回應一律是 `{ "error": { "code", "message" } }`。Proxy 要把它包成領域可辨識的具名錯誤，讓元件依錯誤種類顯示對應畫面。

各端點完整的 request / response 以後端為準：`../go-symbol-news-hunter/postman/`、`internal/controller/`、`.sdd/{切片}/PRD.md`。

### 主要領域詞彙

前端命名一律沿用後端 [`.sdd/UL-MAP.md`](../go-symbol-news-hunter/.sdd/UL-MAP.md)，下表只列常用的：

| 詞彙 | 程式名稱 | 值域 / 說明 |
| :--- | :--- | :--- |
| 標的 | `symbol` | `2330`、`AAPL`、`BTC`…，一定要搭配市場類別 |
| 市場類別 | `category` | `crypto` / `twStock` / `usStock` |
| 評等 | `grade` | `strongBullish` / `bullish` / `neutral` / `bearish` / `strongBearish` |
| 信心指數 | `confidence` | 0–100；信心分組 `low`（0–49）/ `medium`（50–74）/ `high`（75–100） |
| 時間範圍 | `timeHorizon` | `short`（兩週內）/ `mid`（三個月內） |
| 分析事件 / 分析結果 | `AnalysisEvent` / `AnalysisResult` | 一次分析的執行紀錄與它的標準化產出 |
| 分析時價格 | `priceAtAnalysis` | 精確小數，可能是 `null`（未取得） |
| 交易時段 | `session` | `preMarket` / `intraday` / `afterMarket` |
| 時段評等 / 綜合評等 | `SessionGrade` / `CombinedGrade` | 只保留當天 |
| 回測結果 | `outcome` | `hit` / `miss` / `neutral` / `pending` / `unevaluable` |
| 命中率 | `hitRate` | 分母為 0 時是「沒有資料」，不是 0% |

## 畫面

| 畫面 | 對應端點 | 重點 |
| :--- | :--- | :--- |
| API key 設定 | `/api-keys`、`/api-keys/me` | 建立、保存在瀏覽器、顯示狀態（停用中要提示等 administrator 啟用）、撤銷 |
| 新聞搜尋 | `/news` | 標的 + 市場類別；顯示失敗的新聞來源 |
| 標的分析 | `/analysis-events` | 發起後輪詢到 `succeeded` / `failed`；顯示評等、信心、理由、關鍵事件（附來源連結）、風險因子、分析時價格 |
| 分析報告（匯出 PDF） | `/analysis-events/:analysisEventId` | 只有已完成的分析可匯出；新分頁打開 A4 紙本版面並開啟瀏覽器存檔視窗，預設檔名「市場類別-標的-標的名稱-分析-完成日期」（沒有標的名稱時省略該段；標的名稱去掉 `.` 與不能出現在檔名的字元） |
| 追蹤標的評等 | `/tracked-symbol-grades` | 綜合評等 + 盤前 / 盤中 / 盤後時段評等 |
| 評等回測 | `/grade-backtest` | 命中率總表（並列隨機 50% 作比較）+ 逐筆明細 |

前端的功能切片在本 repo 的 `.sdd/{YYYY-MM-DD}-{feature-slug}/` 規劃。

## 開發

```bash
cp .env.example .env   # 第一次使用時建立；.env 不進版控
bun install
bun run dev            # 開發伺服器（http://localhost:3000）
bun run test           # Vitest
bun run test:coverage  # Vitest + 覆蓋率
bun run lint           # ESLint
bun run lint:style     # stylelint
bun run verify         # lint + lint:style
bun run build
```

先在 `../go-symbol-news-hunter` 啟動後端（`make start`，需要 PostgreSQL 與 `.env`）。

### 設定後端位址

Nuxt 會自動讀取專案根目錄的 `.env`。`.env.example` 是範本並進版控；`.env` 只存在你的機器上（已在 `.gitignore` 排除）。

| 變數 | 預設值 | 用途 |
| :--- | :--- | :--- |
| `NUXT_BACKEND_ORIGIN` | `http://localhost:8081` | 後端位址。Nuxt 把 `/api/**` 轉送到這裡 |
| `NUXT_PUBLIC_BACKEND_BASE_URL` | `/api` | 瀏覽器呼叫 API 的前綴；通常不需要改 |

接遠端後端時，只要改 `.env` 的 `NUXT_BACKEND_ORIGIN`，例如 `NUXT_BACKEND_ORIGIN=https://your-backend.example.com`，也可以直接帶在指令前：`NUXT_BACKEND_ORIGIN=https://your-backend.example.com bun run dev`。

- **一律經由 `/api` 代理**：後端沒有設定 CORS，瀏覽器無法直接呼叫後端，所以不要把 `NUXT_PUBLIC_BACKEND_BASE_URL` 設成遠端網址。
- **正式部署時後端位址在 build 時固定**：`NUXT_BACKEND_ORIGIN` 在 `bun run build` 時寫進產出，部署後改環境變數不會生效；換後端要重新 build。
- **部署方式**：需要 Nuxt 的 node server（`node .output/server/index.mjs`）提供 `/api` 代理；只部署靜態檔案時沒有代理，操作台會顯示「服務暫時無法使用」。

## 開發規範

動工前先讀 [CLAUDE.md](CLAUDE.md)，它會指向 `.claude/rules/` 裡對應的規範：

| 檔案 | 內容 |
| :--- | :--- |
| [architecture.md](.claude/rules/architecture.md) | 分層、目錄結構、Entity / Domain Model 分工 |
| [naming.md](.claude/rules/naming.md) | 命名、後綴、介面以能力命名 |
| [component-design.md](.claude/rules/component-design.md) | 原子化設計、SCSS token |
| [code-style.md](.claude/rules/code-style.md) | 型別、宣告、金額、錯誤處理 |
| [data-access.md](.claude/rules/data-access.md) | Proxy、wire 格式正規化 |
| [testing.md](.claude/rules/testing.md) | Vitest、只 mock 介面 |

開發節奏是 **SDD + TDD**：先寫切片文件，再依驗收條件逐案 red-green-refactor，一個 commit 對應一個小步驟。
