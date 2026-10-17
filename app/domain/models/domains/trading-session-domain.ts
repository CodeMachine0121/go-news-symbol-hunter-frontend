import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export type TradingSession = 'preMarket' | 'intraday' | 'afterMarket'

export const TRADING_SESSIONS: TradingSession[] = ['preMarket', 'intraday', 'afterMarket']

const TRADING_SESSION_LABELS: Record<TradingSession, string> = {
  preMarket: '盤前',
  intraday: '盤中',
  afterMarket: '盤後',
}

export class TradingSessionDomain {
  constructor(private readonly session: TradingSession) {}

  toDto(): LabelledValueDto {
    return new LabelledValueDto(this.session, TRADING_SESSION_LABELS[this.session])
  }
}
