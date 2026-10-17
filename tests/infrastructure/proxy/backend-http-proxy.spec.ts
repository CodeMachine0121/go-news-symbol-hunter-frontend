import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

describe('BackendHttpProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the API key and query to the backend under the base URL', async () => {
    const fetchStub = stubFetch(jsonResponse(202, { ok: true }))

    const response = await new BackendHttpProxy('http://backend.test/api').request<{ ok: boolean }>('GET', '/news', { apiKey: 'secret', query: { symbol: '2330', category: undefined } })

    expect(response.status).toBe(202)
    expect(response.body).toEqual({ ok: true })
    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/api/news?symbol=2330', apiKey: 'secret' })
  })

  it('omits the API key header when none is given', async () => {
    const fetchStub = stubFetch(jsonResponse(200, {}))

    await new BackendHttpProxy('http://backend.test').request('GET', '/health')

    expect(requestOf(fetchStub).apiKey).toBeNull()
  })

  it('turns a backend rejection into a named error carrying its reason', async () => {
    stubFetch(jsonResponse(404, { error: { code: 'symbol_not_found', message: '找不到此標的' } }))

    const failure = new BackendHttpProxy('http://backend.test').request('GET', '/news')

    await expect(failure).rejects.toBeInstanceOf(BackendRejectionError)
    await expect(failure).rejects.toMatchObject({ code: 'symbol_not_found', message: '找不到此標的' })
  })

  it.each([
    { case: 'network failure', response: new TypeError('fetch failed') },
    { case: 'generic service unavailable', response: jsonResponse(503, { error: { code: 'service_unavailable', message: '服務暫時無法使用' } }) },
    { case: 'error without a reason', response: jsonResponse(502, null) },
    { case: 'error with a code but no message', response: jsonResponse(400, { error: { code: 'symbol_required' } }) },
    { case: 'error with a message but no code', response: jsonResponse(400, { error: { message: '請求內容格式錯誤' } }) },
  ])('reports $case as 服務暫時無法使用', async ({ response }) => {
    stubFetch(response)

    const failure = new BackendHttpProxy('http://backend.test').request('GET', '/news')

    await expect(failure).rejects.toBeInstanceOf(BackendUnavailableError)
    await expect(failure).rejects.toThrow('服務暫時無法使用')
  })
})
