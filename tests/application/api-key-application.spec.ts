import { describe, expect, it } from 'vitest'
import { ApiKeyApplication } from '~/application/api-key-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { IssuedApiKey } from '~/domain/models/entities/issued-api-key'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { mockApiKeyProxy, mockApiKeyStorageProxy } from '../fixtures/proxy-mocks'

const FULL_API_KEY = 'gsnh_1234567890abcdef'

const createApplication = (storedApiKey?: string) => {
  const apiKeyProxy = mockApiKeyProxy()
  const apiKeyStorageProxy = mockApiKeyStorageProxy(storedApiKey)
  return { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication: new ApiKeyApplication(new ApiKeyService(apiKeyProxy, apiKeyStorageProxy)) }
}

describe('ApiKeyApplication', () => {
  describe('getApiKeyAccess', () => {
    it('reports missing without asking the service when no API key is stored', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication()

      const apiKeyAccess = await apiKeyApplication.getApiKeyAccess()

      expect(apiKeyAccess.state).toBe('missing')
      expect(apiKeyProxy.getApiKeyStatus).not.toHaveBeenCalled()
    })

    it.each([
      { case: 'active', outcome: new ApiKeyStatus('我的研究', 'active'), state: 'active' },
      { case: 'inactive', outcome: new ApiKeyStatus('我的研究', 'inactive'), state: 'inactive' },
    ])('reports a stored $case API key', async ({ outcome, state }) => {
      const { apiKeyProxy, apiKeyApplication } = createApplication(FULL_API_KEY)
      apiKeyProxy.getApiKeyStatus.mockResolvedValue(outcome)

      expect((await apiKeyApplication.getApiKeyAccess()).state).toBe(state)
      expect(apiKeyProxy.getApiKeyStatus).toHaveBeenCalledWith(FULL_API_KEY)
    })

    it.each([
      { case: 'revoked', error: new BackendRejectionError('api_key_invalid', 'API key 無效'), state: 'invalid' },
      { case: 'unreachable', error: new BackendUnavailableError(), state: 'unavailable' },
      { case: 'non-error failure', error: 'boom', state: 'unavailable' },
    ])('reports a stored API key whose check is $case', async ({ error, state }) => {
      const { apiKeyProxy, apiKeyApplication } = createApplication(FULL_API_KEY)
      apiKeyProxy.getApiKeyStatus.mockRejectedValue(error)

      expect((await apiKeyApplication.getApiKeyAccess()).state).toBe(state)
    })

    it('becomes usable after the administrator activates the API key', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication(FULL_API_KEY)
      apiKeyProxy.getApiKeyStatus.mockResolvedValueOnce(new ApiKeyStatus('我的研究', 'inactive'))
      apiKeyProxy.getApiKeyStatus.mockResolvedValueOnce(new ApiKeyStatus('我的研究', 'active'))

      expect((await apiKeyApplication.getApiKeyAccess()).isUsable).toBe(false)
      const rechecked = await apiKeyApplication.getApiKeyAccess()

      expect(rechecked.isUsable).toBe(true)
      expect(rechecked.status.label).toBe('已啟用')
    })
  })

  describe('issueApiKey', () => {
    it('returns the full API key once, inactive, and makes it the current API key', async () => {
      const { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication } = createApplication()
      apiKeyProxy.issueApiKey.mockResolvedValue(new IssuedApiKey('我的研究', FULL_API_KEY, 'inactive'))

      const issuedApiKey = await apiKeyApplication.issueApiKey(new IssueApiKeyDto(' 我的研究 '))

      expect(apiKeyProxy.issueApiKey).toHaveBeenCalledWith('我的研究')
      expect(issuedApiKey.apiKey).toBe(FULL_API_KEY)
      expect(issuedApiKey.access.status.label).toBe('停用中')
      expect(apiKeyStorageProxy.save).toHaveBeenCalledWith(FULL_API_KEY)
    })

    it('rejects a blank name without asking the service', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication()

      await expect(apiKeyApplication.issueApiKey(new IssueApiKeyDto('   '))).rejects.toThrow(new InvalidInputError('API key 名稱為必填'))
      expect(apiKeyProxy.issueApiKey).not.toHaveBeenCalled()
    })

    it('passes on the reason the service gives for a name that is too long', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication()
      apiKeyProxy.issueApiKey.mockRejectedValue(new BackendRejectionError('api_key_name_too_long', 'API key 名稱不可超過 100 個字'))

      await expect(apiKeyApplication.issueApiKey(new IssueApiKeyDto('名'.repeat(101)))).rejects.toThrow('API key 名稱不可超過 100 個字')
    })

    it('only shows a masked API key afterwards', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication()
      apiKeyProxy.issueApiKey.mockResolvedValue(new IssuedApiKey('我的研究', FULL_API_KEY, 'inactive'))
      apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'inactive'))
      await apiKeyApplication.issueApiKey(new IssueApiKeyDto('我的研究'))

      const apiKeyAccess = await apiKeyApplication.getApiKeyAccess()

      expect(apiKeyAccess).toMatchObject({ name: '我的研究', maskedApiKey: 'gsnh••••cdef' })
      expect(JSON.stringify(apiKeyAccess)).not.toContain(FULL_API_KEY)
    })
  })

  describe('useApiKey', () => {
    it('makes a pasted active API key the current API key', async () => {
      const { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication } = createApplication()
      apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('舊的金鑰', 'active'))

      const apiKeyAccess = await apiKeyApplication.useApiKey(` ${FULL_API_KEY} `)

      expect(apiKeyStorageProxy.save).toHaveBeenCalledWith(FULL_API_KEY)
      expect(apiKeyAccess).toMatchObject({ name: '舊的金鑰', status: { label: '已啟用' } })
    })

    it('does not keep a pasted API key the service does not know', async () => {
      const { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication } = createApplication()
      apiKeyProxy.getApiKeyStatus.mockRejectedValue(new BackendRejectionError('api_key_invalid', 'API key 無效'))

      await expect(apiKeyApplication.useApiKey('unknown')).rejects.toThrow('API key 無效')
      expect(apiKeyStorageProxy.save).not.toHaveBeenCalled()
    })
  })

  describe('forgetApiKey', () => {
    it('forgets the API key in this browser without revoking it', async () => {
      const { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication } = createApplication(FULL_API_KEY)

      expect(apiKeyApplication.forgetApiKey().state).toBe('missing')
      expect(apiKeyStorageProxy.clear).toHaveBeenCalled()
      expect(apiKeyProxy.revokeApiKey).not.toHaveBeenCalled()
      expect((await apiKeyApplication.getApiKeyAccess()).state).toBe('missing')
    })
  })

  describe('revokeApiKey', () => {
    it('revokes the current API key and forgets it', async () => {
      const { apiKeyProxy, apiKeyStorageProxy, apiKeyApplication } = createApplication(FULL_API_KEY)
      apiKeyProxy.revokeApiKey.mockResolvedValue()

      expect((await apiKeyApplication.revokeApiKey()).state).toBe('missing')
      expect(apiKeyProxy.revokeApiKey).toHaveBeenCalledWith(FULL_API_KEY)
      expect(apiKeyStorageProxy.clear).toHaveBeenCalled()
    })

    it('has nothing to revoke when no API key is stored', async () => {
      const { apiKeyProxy, apiKeyApplication } = createApplication()

      expect((await apiKeyApplication.revokeApiKey()).state).toBe('missing')
      expect(apiKeyProxy.revokeApiKey).not.toHaveBeenCalled()
    })
  })
})
