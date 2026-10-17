import { InvalidInputError } from '~/domain/errors/invalid-input-error'

export class ApiKeyNameDomain {
  readonly name: string

  constructor(rawName: string) {
    this.name = rawName.trim()
    if (this.name === '') {
      throw new InvalidInputError('API key 名稱為必填')
    }
  }
}
