export class EvidenceDto {
  constructor(
    readonly title: string,
    readonly link: string,
    readonly providerName: string,
    readonly publishedAtText: string,
  ) {}
}
