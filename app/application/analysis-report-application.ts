import type { AnalysisReportDto } from '~/domain/models/dto/analysis-report-dto'
import type { AnalysisReportService } from '~/domain/service/analysis-report-service'

export class AnalysisReportApplication {
  constructor(private readonly analysisReportService: AnalysisReportService) {}

  getAnalysisReport(analysisEventId: number): Promise<AnalysisReportDto> {
    return this.analysisReportService.getAnalysisReport(analysisEventId)
  }

  printAnalysisReport(analysisReportDto: AnalysisReportDto): void {
    this.analysisReportService.printAnalysisReport(analysisReportDto)
  }
}
