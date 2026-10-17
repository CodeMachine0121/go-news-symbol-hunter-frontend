import type { ITrackedSymbolGradeProxy } from '~/domain/interface/i-tracked-symbol-grade-proxy'
import { SymbolQueryDomain } from '~/domain/models/domains/symbol-query-domain'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class TrackedSymbolGradeService {
  constructor(
    private readonly trackedSymbolGradeProxy: ITrackedSymbolGradeProxy,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async getTrackedSymbolGrades(symbolQueryDto: SymbolQueryDto): Promise<TrackedSymbolGradeDto[]> {
    const symbolQuery = new SymbolQueryDomain(symbolQueryDto).toOptionalQuery()
    const trackedSymbolGrades = await this.trackedSymbolGradeProxy.getTrackedSymbolGrades(symbolQuery, this.apiKeyService.requireApiKey())
    return trackedSymbolGrades.map(trackedSymbolGrade => trackedSymbolGrade.toDomain().toDto())
  }
}
