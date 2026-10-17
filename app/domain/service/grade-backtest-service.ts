import type { IGradeBacktestProxy } from '~/domain/interface/i-grade-backtest-proxy'
import { BacktestPeriodDomain } from '~/domain/models/domains/backtest-period-domain'
import { SymbolQueryDomain } from '~/domain/models/domains/symbol-query-domain'
import type { GradeBacktestDto } from '~/domain/models/dto/grade-backtest-dto'
import type { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { GradeBacktestQueryVo } from '~/domain/models/vo/grade-backtest-query-vo'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class GradeBacktestService {
  constructor(
    private readonly gradeBacktestProxy: IGradeBacktestProxy,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async getGradeBacktest(gradeBacktestQueryDto: GradeBacktestQueryDto): Promise<GradeBacktestDto> {
    const backtestPeriod = new BacktestPeriodDomain(gradeBacktestQueryDto.completedFrom, gradeBacktestQueryDto.completedTo)
    const symbolQuery = new SymbolQueryDomain(new SymbolQueryDto(gradeBacktestQueryDto.symbol, gradeBacktestQueryDto.category)).toOptionalQuery()
    const gradeBacktest = await this.gradeBacktestProxy.getGradeBacktest(
      new GradeBacktestQueryVo(backtestPeriod.completedFrom, backtestPeriod.completedTo, symbolQuery),
      this.apiKeyService.requireApiKey(),
    )
    return gradeBacktest.toDomain().toDto()
  }
}
