import { InvalidInputError } from '~/domain/errors/invalid-input-error'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export class BacktestPeriodDomain {
  readonly completedFrom: string | undefined
  readonly completedTo: string | undefined

  constructor(rawCompletedFrom: string, rawCompletedTo: string) {
    const completedFrom = rawCompletedFrom.trim()
    const completedTo = rawCompletedTo.trim()
    const isInvalidDate = [completedFrom, completedTo].some(date => date !== '' && !DATE_PATTERN.test(date))
    const isReversed = completedTo !== '' && completedFrom > completedTo
    if (isInvalidDate || isReversed) {
      throw new InvalidInputError('期間不正確')
    }
    this.completedFrom = completedFrom === '' ? undefined : completedFrom
    this.completedTo = completedTo === '' ? undefined : completedTo
  }
}
