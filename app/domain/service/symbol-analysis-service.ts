import type { IAnalysisEventProxy } from '~/domain/interface/i-analysis-event-proxy'
import type { IRecentAnalysisStorageProxy } from '~/domain/interface/i-recent-analysis-storage-proxy'
import { RecentAnalysisListDomain } from '~/domain/models/domains/recent-analysis-list-domain'
import { SymbolQueryDomain } from '~/domain/models/domains/symbol-query-domain'
import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import type { RecentAnalysisDto } from '~/domain/models/dto/recent-analysis-dto'
import { StartedSymbolAnalysisDto } from '~/domain/models/dto/started-symbol-analysis-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class SymbolAnalysisService {
  constructor(
    private readonly analysisEventProxy: IAnalysisEventProxy,
    private readonly recentAnalysisStorageProxy: IRecentAnalysisStorageProxy,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async startSymbolAnalysis(symbolQueryDto: SymbolQueryDto): Promise<StartedSymbolAnalysisDto> {
    const symbolQuery = new SymbolQueryDomain(symbolQueryDto).toRequiredQuery()
    const startedSymbolAnalysis = await this.analysisEventProxy.startSymbolAnalysis(symbolQuery, this.apiKeyService.requireApiKey())
    const analysisEvent = startedSymbolAnalysis.analysisEvent
    const recentAnalyses = new RecentAnalysisListDomain(this.recentAnalysisStorageProxy.read())
      .remember(new RecentAnalysis(analysisEvent.analysisEventId, analysisEvent.symbol, analysisEvent.category, analysisEvent.startedAt))
    this.recentAnalysisStorageProxy.save(recentAnalyses.toEntities())
    return new StartedSymbolAnalysisDto(startedSymbolAnalysis.isNew, analysisEvent.toDomain().toDto(new Date()))
  }

  async getAnalysisEvent(analysisEventId: number): Promise<AnalysisEventDto> {
    const analysisEvent = await this.analysisEventProxy.getAnalysisEvent(analysisEventId, this.apiKeyService.requireApiKey())
    return analysisEvent.toDomain().toDto(new Date())
  }

  getRecentAnalyses(): RecentAnalysisDto[] {
    return new RecentAnalysisListDomain(this.recentAnalysisStorageProxy.read()).toDtos()
  }
}
