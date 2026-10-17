const TAIPEI_TIME_ZONE = 'Asia/Taipei'

export class TimestampDomain {
  private readonly parts: Map<string, string>

  constructor(timestamp: Date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TAIPEI_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    this.parts = new Map(formatter.formatToParts(timestamp).map(part => [part.type, part.value]))
  }

  toDateText(): string {
    return `${this.parts.get('year')}-${this.parts.get('month')}-${this.parts.get('day')}`
  }

  toDateTimeText(): string {
    return `${this.toDateText()} ${this.parts.get('hour')}:${this.parts.get('minute')}`
  }
}
