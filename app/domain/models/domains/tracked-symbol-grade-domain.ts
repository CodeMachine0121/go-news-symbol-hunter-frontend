import { SessionGradeDto } from '~/domain/models/dto/session-grade-dto'
import { SessionSlotDto } from '~/domain/models/dto/session-slot-dto'
import { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'
import type { TrackedSymbolGrade } from '~/domain/models/entities/tracked-symbol-grade'
import { GradeDomain } from '~/domain/models/domains/grade-domain'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'
import { TRADING_SESSIONS, TradingSessionDomain } from '~/domain/models/domains/trading-session-domain'

const SESSION_NOT_PRODUCED = '尚未產生'
const COMBINED_SCORE_DECIMALS = 2

export class TrackedSymbolGradeDomain {
  constructor(private readonly trackedSymbolGrade: TrackedSymbolGrade) {}

  toDto(): TrackedSymbolGradeDto {
    const sessionSlots = TRADING_SESSIONS.map((session) => {
      const sessionGrade = this.trackedSymbolGrade.sessionGrades.find(candidate => candidate.session === session)
      const sessionGradeDto = sessionGrade
        ? new SessionGradeDto(
            new GradeDomain(sessionGrade.grade).toDto(),
            sessionGrade.confidence,
            sessionGrade.reason,
            sessionGrade.keyEvents.map(keyEvent => keyEvent.toDto()),
            sessionGrade.riskFactors,
            new TimestampDomain(sessionGrade.createdAt).toDateTimeText(),
          )
        : undefined
      return new SessionSlotDto(new TradingSessionDomain(session).toDto(), sessionGradeDto, SESSION_NOT_PRODUCED)
    })
    return new TrackedSymbolGradeDto(
      this.trackedSymbolGrade.symbol,
      new MarketCategoryDomain(this.trackedSymbolGrade.category).toDto(),
      this.trackedSymbolGrade.tradingDay,
      new GradeDomain(this.trackedSymbolGrade.grade).toDto(),
      this.trackedSymbolGrade.combinedScore.toFixed(COMBINED_SCORE_DECIMALS),
      this.trackedSymbolGrade.confidence,
      new TimestampDomain(this.trackedSymbolGrade.updatedAt).toDateTimeText(),
      sessionSlots,
    )
  }
}
