import { vi } from 'vitest'

export const jsonResponse = (status: number, body: object | null): Response =>
  new Response(body === null ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export const stubFetch = (...responses: (Response | Error)[]) => {
  const fetchStub = vi.fn<typeof fetch>()
  for (const response of responses) {
    if (response instanceof Error) {
      fetchStub.mockRejectedValueOnce(response)
    }
    else {
      fetchStub.mockResolvedValueOnce(response)
    }
  }
  vi.stubGlobal('fetch', fetchStub)
  return fetchStub
}

export const requestOf = (fetchStub: ReturnType<typeof stubFetch>, callIndex = 0): { url: string, method: string, apiKey: string | null, body: string | null } => {
  const [input, init] = fetchStub.mock.calls[callIndex] ?? []
  const headers = new Headers(init?.headers)
  return {
    url: String(input),
    method: init?.method ?? 'GET',
    apiKey: headers.get('X-API-Key'),
    body: typeof init?.body === 'string' ? init.body : null,
  }
}
