import { describe, expect, it } from 'vitest'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { ApiKeyAccessDomain } from '~/domain/models/domains/api-key-access-domain'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'

const API_KEY = 'gsnh_1234567890abcdef'

describe('ApiKeyAccessDomain', () => {
  it.each([
    { case: 'no current API key', apiKey: undefined, outcome: undefined, state: 'missing', label: '未設定', guidance: '尚未設定 API key', isUsable: false, canRecheck: false, needsSettings: true },
    { case: 'active API key', apiKey: API_KEY, outcome: new ApiKeyStatus('我的研究', 'active'), state: 'active', label: '已啟用', guidance: undefined, isUsable: true, canRecheck: false, needsSettings: false },
    { case: 'inactive API key', apiKey: API_KEY, outcome: new ApiKeyStatus('我的研究', 'inactive'), state: 'inactive', label: '停用中', guidance: 'API key 尚未啟用，請等候 administrator 啟用', isUsable: false, canRecheck: true, needsSettings: false },
    { case: 'revoked or unknown API key', apiKey: API_KEY, outcome: new BackendRejectionError('api_key_invalid', 'API key 無效'), state: 'invalid', label: '無效', guidance: 'API key 無效', isUsable: false, canRecheck: false, needsSettings: true },
    { case: 'inactive rejection', apiKey: API_KEY, outcome: new BackendRejectionError('api_key_inactive', 'API key 尚未啟用'), state: 'inactive', label: '停用中', guidance: 'API key 尚未啟用，請等候 administrator 啟用', isUsable: false, canRecheck: true, needsSettings: false },
    { case: 'service unreachable', apiKey: API_KEY, outcome: new BackendUnavailableError(), state: 'unavailable', label: '無法確認', guidance: '服務暫時無法使用', isUsable: false, canRecheck: true, needsSettings: false },
    { case: 'non API key rejection', apiKey: API_KEY, outcome: new BackendRejectionError('symbol_not_found', '找不到此標的'), state: 'unavailable', label: '無法確認', guidance: '服務暫時無法使用', isUsable: false, canRecheck: true, needsSettings: false },
  ])('$case → $state', ({ apiKey, outcome, state, label, guidance, isUsable, canRecheck, needsSettings }) => {
    const apiKeyAccess = new ApiKeyAccessDomain(apiKey, outcome).toDto()

    expect(apiKeyAccess).toMatchObject({ state, guidance, isUsable, canRecheck, needsSettings, hasApiKey: apiKey !== undefined })
    expect(apiKeyAccess.status).toMatchObject({ value: state, label })
  })

  it.each([
    { apiKey: undefined, outcome: undefined, tone: 'neutral' },
    { apiKey: API_KEY, outcome: new ApiKeyStatus('名稱', 'inactive'), tone: 'warning' },
    { apiKey: API_KEY, outcome: new BackendRejectionError('api_key_invalid', 'API key 無效'), tone: 'negative' },
    { apiKey: API_KEY, outcome: new ApiKeyStatus('名稱', 'active'), tone: 'positive' },
    { apiKey: API_KEY, outcome: new BackendUnavailableError(), tone: 'warning' },
  ])('shows the status in a $tone tone', ({ apiKey, outcome, tone }) => {
    expect(new ApiKeyAccessDomain(apiKey, outcome).toDto().status.tone).toBe(tone)
  })

  it('shows the name of an active API key', () => {
    expect(new ApiKeyAccessDomain(API_KEY, new ApiKeyStatus('我的研究', 'active')).toDto().name).toBe('我的研究')
  })

  it.each([
    { apiKey: 'gsnh_1234567890abcdef', masked: 'gsnh••••cdef' },
    { apiKey: '12345678', masked: '••••' },
  ])('masks $apiKey without showing the full key', ({ apiKey, masked }) => {
    const maskedApiKey = new ApiKeyAccessDomain(apiKey, new ApiKeyStatus('名稱', 'active')).toDto().maskedApiKey

    expect(maskedApiKey).toBe(masked)
    expect(maskedApiKey).not.toBe(apiKey)
  })
})
