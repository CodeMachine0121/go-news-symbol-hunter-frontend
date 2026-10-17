import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class OutcomeCountDto {
  constructor(
    readonly outcome: LabelledValueDto,
    readonly count: number,
  ) {}
}
