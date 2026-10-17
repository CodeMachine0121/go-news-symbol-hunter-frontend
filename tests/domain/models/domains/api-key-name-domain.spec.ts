import { describe, expect, it } from 'vitest'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { ApiKeyNameDomain } from '~/domain/models/domains/api-key-name-domain'

describe('ApiKeyNameDomain', () => {
  it('trims the name', () => {
    expect(new ApiKeyNameDomain('  我的研究  ').name).toBe('我的研究')
  })

  it.each(['', '   '])('rejects blank name "%s"', (name) => {
    expect(() => new ApiKeyNameDomain(name)).toThrow(new InvalidInputError('API key 名稱為必填'))
  })
})
