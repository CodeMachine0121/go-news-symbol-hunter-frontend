import { EvidenceDto } from '~/domain/models/dto/evidence-dto'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export class AnalysisEvidence {
  constructor(
    readonly title: string,
    readonly link: string,
    readonly publishedAt: Date,
    readonly providerName: string,
  ) {}

  toDto(): EvidenceDto {
    return new EvidenceDto(this.title, this.link, this.providerName, new TimestampDomain(this.publishedAt).toDateTimeText())
  }
}
