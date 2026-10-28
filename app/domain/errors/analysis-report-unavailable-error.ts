export class AnalysisReportUnavailableError extends Error {
  constructor() {
    super('這筆分析尚無可匯出的結果')
  }
}
