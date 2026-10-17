export class IssuedApiKey {
  constructor(
    readonly name: string,
    readonly apiKey: string,
    readonly status: string,
  ) {}
}
