import { NewsDto } from '~/domain/models/dto/news-dto'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export class News {
  constructor(
    readonly title: string,
    readonly link: string,
    readonly publishedAt: Date,
    readonly providerName: string,
    readonly summary: string,
  ) {}

  toDto(): NewsDto {
    const summary = this.summary.trim()
    return new NewsDto(
      this.title,
      this.link,
      this.providerName,
      new TimestampDomain(this.publishedAt).toDateTimeText(),
      summary === '' ? undefined : summary,
    )
  }
}
