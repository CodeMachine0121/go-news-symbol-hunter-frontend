# Rules

**前端（Nuxt 3 + TypeScript）的實作規範**（架構、命名、風格、資料存取、元件、測試），不含產品／業務知識。

這份規則由後端 [`go-symbol-news-hunter`](../../../go-symbol-news-hunter/) 的 `.claude/rules/` 改寫而來，核心分層與依賴方向完全一致，只換掉最外兩層的載體：

| 後端 | 前端 |
| :--- | :--- |
| Gin handler = Controller | **`.vue` 元件 = Controller** |
| Application（Go） | Application（TypeScript class） |
| Domain Service（Go） | Domain Service（TypeScript class） |
| Repository（GORM / PostgreSQL） | **Proxy（打後端 REST API）——前端沒有資料庫** |
| Proxy（新聞來源、AI、價格服務） | Proxy（後端 REST API、瀏覽器儲存） |

產品知識（專案介紹、後端 API、環境變數、領域詞彙）寫在專案根目錄的 [README.md](../../README.md) 與後端的 `.sdd/`，不要放進本目錄，也不要放進 `CLAUDE.md`——`CLAUDE.md` 只負責指路。

| 檔案 | 內容 |
| :--- | :--- |
| [architecture.md](architecture.md) | Clean / Onion 分層、依賴方向、呼叫鏈、`app/` 目錄結構、**`.vue` 元件即 Controller**、**Entity 乾淨 + 行為放 Domain Model**、**Domain Model 不是介面抽象**、**model 內禁 static（含 `fromXxx` 轉換）**、禁 private static |
| [naming.md](naming.md) | 角色後綴、entity / `Domain` / `Dto` / `Vo` / `Request` 四種 model 後綴、**介面只抽象行為不抽象資料**、介面以**能力**命名（`I` 前綴）、外部資源一律 `Proxy`、檔名對齊主型別、禁 barrel `index.ts`、業務詞彙沿用後端 UL-MAP |
| [component-design.md](component-design.md) | **原子化設計**（atoms / molecules / organisms / templates）、**一個 UI 概念只留一個元件**、依賴只能由上往下、atoms 不認識領域概念、**SCSS 中央控管**（token 單一來源、BEM、禁字面值與 `!important`）、lint 目標配置 |
| [code-style.md](code-style.md) | **禁 `any` / `as any` / `@ts-ignore`**、資料用 `class`、`const` 宣告即賦值、行為掛物件、**禁 helper class 與 `utils.ts`**、金額用 `decimal.js`、`<script setup lang="ts">`、錯誤處理 |
| [data-access.md](data-access.md) | `$fetch` / `useFetch` / `localStorage` 只准出現在 Proxy、一資源一 Proxy、wire 格式在 Proxy 收乾淨、前端狀態不是持久化、禁假資料層 |
| [testing.md](testing.md) | **只測業務行為**、**只用 Vitest mock 介面（禁手寫 Fake）**、測試力度放大、`tests/` 鏡射 `app/` |

> 後端另有 `persistence.md`（ORM / Code First）與 `background-jobs.md`（排程 job），**前端不適用，不收錄**。
