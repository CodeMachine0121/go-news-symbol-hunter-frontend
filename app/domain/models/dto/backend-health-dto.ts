import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class BackendHealthDto {
  constructor(readonly status: LabelledValueDto) {}
}
