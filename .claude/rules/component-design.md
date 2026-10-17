# Component Design — 原子化設計與 SCSS 中央控管

本檔規範 `.vue` 元件怎麼切、怎麼共用，以及樣式寫在哪裡。
分層歸屬（元件屬於 Controller 層、只認識 Application 與 DTO）見 [architecture.md](architecture.md)，
命名格式見 [naming.md](naming.md)，型別與語法見 [code-style.md](code-style.md)。

核心只有兩句：

1. **同一個 UI 概念，全專案只留一個元件**——長相由使用端決定，不是複製一份新元件。
2. **樣式值只有一個來源**——所有顏色 / 間距 / 字級都是 token，字面值只准出現在 `app/assets/styles/`。

---

## 一、原子化設計（Atomic Design）

元件依「組成粒度」分層，資料夾即層級：

| 層級 | 資料夾 | 是什麼 | 例 |
| :--- | :--- | :---

## 五、動手前的檢查清單

新增一個元件時：

- [ ] 這個 UI 概念**已經有元件**了嗎？有 → 加 variant，不是加元件。
- [ ] 它屬於 atom / molecule / organism / template 哪一層？放進對應資料夾。
- [ ] 是 atom 嗎？那它**不能認識任何領域概念**（含 DTO）。
- [ ] 外觀是不是由使用端決定（variant / slot / class），而不是寫死？
- [ ] 有沒有把業務判斷寫進 template 的三元運算？有 → 推回 Domain Model，由 DTO 帶出來。
- [ ] style 區塊是 `scoped lang="scss"` 嗎？裡面有沒有字面值？
- [ ] 需要的顏色 / 間距有 token 嗎？沒有 → 先補進 `abstracts/_tokens.scss`。
- [ ] 有互動邏輯的元件，測試放在 `tests/components/{層級}/{元件名}.spec.ts`（見 [testing.md](testing.md)）。
