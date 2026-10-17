import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class HitRateDto {
  constructor(
    readonly group: LabelledValueDto,
    readonly hitCount: number,
    readonly missCount: number,
    readonly hitRateText: string,
  ) {}
}
