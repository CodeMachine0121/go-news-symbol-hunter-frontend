# CLAUDE.md

本檔只做一件事：**告訴你在什麼情境下該去讀哪一份文件。**

- 本專案是後端 [`go-symbol-news-hunter`](../go-symbol-news-hunter/) 的前端（Nuxt 3 + TypeScript）。
- 實作規範（架構、命名、風格、元件、測試）在 `.claude/rules/`，與產品無關。
- 產品知識（專案介紹、後端 API、環境變數）在 [README.md](README.md)；領域詞彙與需求在後端的 `.sdd/`。不要塞進這裡。
- 大小寫、檔名格式、lint 工具一律 follow TypeScript / Vue 自身的慣例。

## 規則優先序

**本專案的 `CLAUDE.md` 與 `.claude/rules/` 優先於任何上層目錄的 `CLAUDE.md`。**

上層目錄（如 `~/workspace/CLAUDE.md`）描述的是**另一個專案 go-stock**（Go 後端、SQLite、投資裁決 / 管線輪次等詞彙），與本專案無關。衝突時一律以本專案為準，也不要把那些產品詞彙（`InvestmentVerdict`、`PipelineRun`、`FinalVerdict`…）帶進來。

## 動工前必讀

任何時候要寫或改程式碼，先讀這兩份：

- [.claude/rules/architecture.md](.claude/rules/architecture.md) — 東西該放哪一層、哪個資料夾
- [.claude/rules/naming.md](.claude/rules/naming.md) — 東西該叫什麼名字

寫 `.vue` 元件或任何樣式之前，再加讀：

- [.claude/rules/component-design.md](.claude/rules/component-design.md) — 元件怎麼切、樣式寫在哪

## 產品與需求文件

| 我想知道 | 去讀 |
| :--- | :--- |
| 前端要做什麼、對接哪些後端 API、怎麼啟動 | [README.md](README.md) |
| 某個實體 / 動作 / enum 該叫什麼 | `../go-symbol-news-hunter/.sdd/UL-MAP.md`（**命名以此為準，不得自創同義詞**）；操作台自己新增的詞彙在本 repo `.sdd/UL-MAP.md` |
| 後端某個功能的業務規則與驗收條件 | `../go-symbol-news-hunter/.sdd/{YYYY-MM-DD}-{feature-slug}/PRD.md` |
| 後端端點的實際 request / response | `../go-symbol-news-hunter/postman/`、`internal/controller/`、`internal/domain/models/dto/` |
| 前端功能切片的需求與設計 | 本 repo `.sdd/{YYYY-MM-DD}-{feature-slug}/`（目前有 `2026-10-17-web-console`、`2026-10-28-analysis-result-pdf-export`；新功能開新資料夾） |
| 後端位址、環境變數 | [README.md](README.md) 的「設定後端位址」；範本是 `.env.example`，`.env` 不進版控 |

- 文件或設定尚未建立時，**不要假設它們存在**；動工前先看實際的 `package.json`、`nuxt.config.ts`、`eslint.config.mjs`、`.stylelintrc.json`、`vitest.config.ts`。
- 後端欄位或 enum 有疑問時，以後端程式碼與 UL-MAP 為準，不要在前端自行推測。

## 開發流程

- 節奏是 **SDD + TDD**：BRIEF → PRD / UI-SPEC → ARCH → 依驗收條件逐案 red-green-refactor，一個 commit 對應一個小步驟。
- commit 前自行執行並確認全過（目前沒有 pre-commit hook 擋）：`bun run verify`（lint + stylelint）、`bun run test`、`bun run typecheck`、`bun run build`。

## 情境對照表

| 我正在做的事 | 去讀 |
| :--- | :--- |
| 決定一段程式碼要放哪一層 / 哪個資料夾 | [architecture.md](.claude/rules/architecture.md) |
| 新增 entity、domain model、DTO、VO | [architecture.md](.claude/rules/architecture.md)、[naming.md](.claude/rules/naming.md) |
| 想把業務邏輯寫進 `.vue` 元件 | [architecture.md](.claude/rules/architecture.md)（元件只認識 Application 與 DTO） |
| 想把業務邏輯寫進 entity | [architecture.md](.claude/rules/architecture.md)（Entity 保持乾淨，行為放 Domain Model） |
| 想在元件裡 `useFetch` / `$fetch` 打後端 | [data-access.md](.claude/rules/data-access.md)（禁止；一律推成 Proxy） |
| 要串接後端 API / 第三方服務 | [naming.md](.claude/rules/naming.md)、[data-access.md](.claude/rules/data-access.md)（一律 `Proxy`；介面以能力命名） |
| 後端回傳的 JSON 要轉成什麼 | [data-access.md](.claude/rules/data-access.md)（Proxy 正規化成 entity / VO，wire 格式不進 domain） |
| 要存 API key 或任何瀏覽器儲存 | [data-access.md](.claude/rules/data-access.md)（`localStorage` 也只准在 Proxy 內） |
| 出現 `private static` 或只被一處使用的 `private` method | [architecture.md](.claude/rules/architecture.md)（三步搬家 / inline 門檻） |
| 想在 model 上開 `static`（工廠、`fromXxx` 轉換） | [architecture.md](.claude/rules/architecture.md)（轉換寫在來源的 `toXxx()`） |
| 幫 Domain Model 或 VO 命名 | [naming.md](.claude/rules/naming.md)（`Domain` / `Vo` 後綴） |
| 想為 Domain Model 定介面或做繼承 | [architecture.md](.claude/rules/architecture.md)（Domain Model 是普通 class，不是介面抽象） |
| 想用 `interface` / `type` 描述一份資料 | [naming.md](.claude/rules/naming.md)（介面只抽象行為；資料一律 class） |
| Application / Service 要收一組參數 | [naming.md](.claude/rules/naming.md)（封裝成 DTO） |
| 想寫 `any`、`as any`、`@ts-ignore` | [code-style.md](.claude/rules/code-style.md)（禁止） |
| 想開 `XxxHelper` / `utils.ts` 雜物模組 | [code-style.md](.claude/rules/code-style.md)（原則禁止；不得已才放 `app/utilities/`） |
| 新增 `.vue` 元件 / 決定它是 atom 還是 molecule | [component-design.md](.claude/rules/component-design.md) |
| 想新增 `PrimaryButton` / `DangerButton` 之類的變體元件 | [component-design.md](.claude/rules/component-design.md)（禁止；用 variant） |
| 要寫 CSS / 調整顏色、間距；需要新 token | [component-design.md](.claude/rules/component-design.md)（`<style scoped lang="scss">` + token 函式；新值先補 `_tokens.scss`） |
| 幫任何類別 / 介面 / 檔案命名 | [naming.md](.claude/rules/naming.md) |
| 處理價格（分析時價格、起點價格） | [code-style.md](.claude/rules/code-style.md)（`decimal.js`，禁用 `number`） |
| 寫測試、需要 mock、決定測試檔放哪 | [testing.md](.claude/rules/testing.md) |
| 選型別、宣告變數、包錯誤、寫 Vue 元件 | [code-style.md](.claude/rules/code-style.md) |

完整索引見 [.claude/rules/README.md](.claude/rules/README.md)。

## 不可妥協的幾條

即使沒讀完全部規則，這幾條一律成立：

1. **依賴方向永遠指向 Domain**，Domain 不認識 HTTP / Vue / Nuxt / 任何 SDK。
2. **`.vue` 元件是 Controller**：只綁事件與資料，不寫業務規則，只認識 Application 與 DTO。
3. **`$fetch` / `useFetch` / `localStorage` 只准出現在 Proxy 實作檔內。**
4. **Entity 是乾淨的 Data Model**，業務行為放 Domain Model。
5. **行為住在它操作的資料旁邊**——沒有 `private static`、沒有 static helper class、沒有 `utils.ts`。
6. **model 內沒有任何 `static`**。轉換一律寫在來源身上：`a.toB()`，不是 `B.fromA(a)`。
7. **`interface` 只抽象行為，不抽象資料**。所有 data model 一律 `class`；Application / Service 收的參數用 DTO。
8. **介面以「能力」命名，不以「供應商」命名。**
9. **業務詞彙沿用後端 UL-MAP**，不在前端自創同義詞。
10. **禁止 `any`、`as any`、`@ts-ignore`；金額一律 `decimal.js`。**
11. **測試只驗業務行為**，mock 只用 Vitest 對介面產生，禁手寫 Fake。
12. **一個 UI 概念只有一個元件**；樣式一律 `<style scoped lang="scss">`，值一律走 token 函式。
