export class NewsDto {
  constructor(
    readonly title: string,
    readonly link: string,
    readonly providerName: string,
    readonly publishedAtText: string,
    readonly summary: string | undefined,
  ) {}
}
