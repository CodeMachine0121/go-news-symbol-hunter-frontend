import { describe, expect, it } from 'vitest'
import { BackendHealthDomain } from '~/domain/models/domains/backend-health-domain'

describe('BackendHealthDomain', () => {
  it.each([
    { isReachable: true, status: { value: 'online', label: '服務連線正常', tone: 'positive' } },
    { isReachable: false, status: { value: 'offline', label: '無法連線', tone: 'negative' } },
  ])('reports a reachable service as $status.label', ({ isReachable, status }) => {
    expect(new BackendHealthDomain(isReachable).toDto().status).toMatchObject(status)
  })
})
