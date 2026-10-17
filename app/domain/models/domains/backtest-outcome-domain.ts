import { LabelledValueDto, type Tone } from '~/domain/models/dto/labelled-value-dto'

export type BacktestOutcome = 'hit' | 'miss' | 'neutral' | 'pending' | 'unevaluable'

export const BACKTEST_OUTCOMES: BacktestOutcome[] = ['hit', 'miss', 'neutral', 'pending', 'unevaluable']

const BACKTEST_OUTCOME_LABELS: Record<BacktestOutcome, string> = {
  hit: '命中',
  miss: '沒命中',
  neutral: '中性',
  pending: '尚未到期',
  unevaluable: '無法評估',
}

const BACKTEST_OUTCOME_TONES: Record<BacktestOutcome, Tone> = {
  hit: 'positive',
  miss: 'negative',
  neutral: 'neutral',
  pending: 'info',
  unevaluable: 'warning',
}

export class BacktestOutcomeDomain {
  private readonly outcome: BacktestOutcome

  constructor(rawOutcome: string) {
    this.outcome = BACKTEST_OUTCOMES.find(outcome => outcome === rawOutcome) ?? 'unevaluable'
  }

  toDto(): LabelledValueDto {
    return new LabelledValueDto(this.outcome, BACKTEST_OUTCOME_LABELS[this.outcome], BACKTEST_OUTCOME_TONES[this.outcome])
  }
}
