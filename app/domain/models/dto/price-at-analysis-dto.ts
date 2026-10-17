export class PriceAtAnalysisDto {
  constructor(
    readonly priceText: string,
    readonly sourceText: string,
    readonly pricedAtText: string,
  ) {}
}
