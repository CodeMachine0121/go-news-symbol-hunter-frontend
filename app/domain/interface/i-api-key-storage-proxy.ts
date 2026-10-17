export interface IApiKeyStorageProxy {
  read(): string | undefined
  save(apiKey: string): void
  clear(): void
}
