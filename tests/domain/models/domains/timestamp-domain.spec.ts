import { describe, expect, it } from 'vitest'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

describe('TimestampDomain', () => {
  it('formats timestamps in Taipei time', () => {
    const timestamp = new TimestampDomain(new Date('2026-10-15T16:30:00Z'))

    expect(timestamp.toDateTimeText()).toBe('2026-10-16 00:30')
    expect(timestamp.toDateText()).toBe('2026-10-16')
  })
})
