import { KeyEventDto } from '~/domain/models/dto/key-event-dto'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export class KeyEvent {
  constructor(
    readonly title: string,
    readonly link: string,
    readonly publishedAt: Date,
  ) {}

  toDto(): KeyEventDto {
    return new KeyEventDto(this.title, this.link, new TimestampDomain(this.publishedAt).toDateTimeText())
  }
}
