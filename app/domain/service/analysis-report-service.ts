import type { IAnalysisEventProxy } from '~/domain/interface/i-analysis-event-proxy'
import type { IDocumentPrintProxy } from '~/domain/interface/i-document-print-proxy'
import type { AnalysisReportDto } from '~/domain/models/dto/analysis-report-dto'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class AnalysisReportService {
  constructor(
    private readonly analysisEventProxy: IAnalysisEventProxy,
    private readonly documentPrintProxy: IDocumentPrintProxy,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async getAnalysisReport(analysisEventId: number): Promise<AnalysisReportDto> {
    const analysisEvent = await this.analysisEventProxy.getAnalysisEvent(analysisEventId, this.apiKeyService.requireApiKey())
    return analysisEvent.toDomain().toReportDto(new Date())
  }

  printAnalysisReport(analysisReportDto: AnalysisReportDto): void {
    this.documentPrintProxy.printDocument(analysisReportDto.fileName)
  }
}
