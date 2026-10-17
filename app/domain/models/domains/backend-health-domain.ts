import { BackendHealthDto } from '~/domain/models/dto/backend-health-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class BackendHealthDomain {
  constructor(private readonly isReachable: boolean) {}

  toDto(): BackendHealthDto {
    return new BackendHealthDto(this.isReachable
      ? new LabelledValueDto('online', '服務連線正常', 'positive')
      : new LabelledValueDto('offline', '無法連線', 'negative'))
  }
}
