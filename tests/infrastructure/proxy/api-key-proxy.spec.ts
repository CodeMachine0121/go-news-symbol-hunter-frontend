import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiKeyProxy } from '~/infrastructure/proxy/api-key-proxy'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

const createProxy = () => new ApiKeyProxy(new BackendHttpProxy('http://backend.test'))

describe('ApiKeyProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('issues an API key by name', async () => {
    const fetchStub = stubFetch(jsonResponse(201, { name: '我的研究', apiKey: 'full-key', status: 'inactive' }))

    const issuedApiKey = await createProxy().issueApiKey('我的研究')

    expect(issuedApiKey).toMatchObject({ name: '我的研究', apiKey: 'full-key', status: 'inactive' })
    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/api-keys', method: 'POST', body: '{"name":"我的研究"}' })
  })

  it('reads the status of an API key', async () => {
    const fetchStub = stubFetch(jsonResponse(200, { name: '我的研究', status: 'active' }))

    expect(await createProxy().getApiKeyStatus('full-key')).toMatchObject({ name: '我的研究', status: 'active' })
    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/api-keys/me', method: 'GET', apiKey: 'full-key' })
  })

  it('revokes an API key', async () => {
    const fetchStub = stubFetch(new Response(null, { status: 204 }))

    await createProxy().revokeApiKey('full-key')

    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/api-keys/me', method: 'DELETE', apiKey: 'full-key' })
  })
})
