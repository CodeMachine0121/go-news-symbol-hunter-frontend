import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackendHealthProxy } from '~/infrastructure/proxy/backend-health-proxy'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

describe('BackendHealthProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([
    { case: 'healthy', response: jsonResponse(200, { status: 'ok' }), isReachable: true },
    { case: 'unreachable', response: new TypeError('fetch failed'), isReachable: false },
  ])('reports a $case service', async ({ response, isReachable }) => {
    const fetchStub = stubFetch(response)

    expect(await new BackendHealthProxy(new BackendHttpProxy('http://backend.test')).checkHealth()).toBe(isReachable)
    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/health', method: 'GET' })
  })
})
