import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { NewsDto } from '~/domain/models/dto/news-dto'

export class SymbolNewsDto {
  constructor(
    readonly symbol: string,
    readonly category: LabelledValueDto,
    readonly news: NewsDto[],
    readonly failedNewsProvidersText: string | undefined,
  ) {}
}
