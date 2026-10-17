import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

type TimeHorizon = 'short' | 'mid'

const TIME_HORIZONS: TimeHorizon[] = ['short', 'mid']

const TIME_HORIZON_LABELS: Record<TimeHorizon, string> = {
  short: '短期（兩週內）',
  mid: '中期（三個月內）',
}

export class TimeHorizonDomain {
  private readonly timeHorizon: TimeHorizon

  constructor(rawTimeHorizon: string) {
    this.timeHorizon = TIME_HORIZONS.find(timeHorizon => timeHorizon === rawTimeHorizon) ?? 'short'
  }

  toDto(): LabelledValueDto {
    return new LabelledValueDto(this.timeHorizon, TIME_HORIZON_LABELS[this.timeHorizon])
  }
}
