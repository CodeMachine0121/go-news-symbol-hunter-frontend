import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { ApiKeyAccessDto, type ApiKeyAccessState } from '~/domain/models/dto/api-key-access-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'

const VISIBLE_CHARACTERS = 4
const MASK = '••••'

const STATUSES: Record<ApiKeyAccessState, LabelledValueDto> = {
  missing: new LabelledValueDto('missing', '未設定', 'neutral'),
  inactive: new LabelledValueDto('inactive', '停用中', 'warning'),
  invalid: new LabelledValueDto('invalid', '無效', 'negative'),
  active: new LabelledValueDto('active', '已啟用', 'positive'),
  unavailable: new LabelledValueDto('unavailable', '無法確認', 'warning'),
}

const GUIDANCES: Record<ApiKeyAccessState, string | undefined> = {
  missing: '尚未設定 API key',
  inactive: 'API key 尚未啟用，請等候 administrator 啟用',
  invalid: 'API key 無效',
  active: undefined,
  unavailable: '服務暫時無法使用',
}

export class ApiKeyAccessDomain {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly statusOrFailure: ApiKeyStatus | Error | undefined,
  ) {}

  get state(): ApiKeyAccessState {
    if (this.apiKey === undefined) {
      return 'missing'
    }
    if (this.statusOrFailure instanceof ApiKeyStatus) {
      return this.statusOrFailure.status === 'active' ? 'active' : 'inactive'
    }
    if (this.statusOrFailure instanceof BackendRejectionError && this.statusOrFailure.isApiKeyProblem) {
      return this.statusOrFailure.code === 'api_key_inactive' ? 'inactive' : 'invalid'
    }
    return 'unavailable'
  }

  toDto(): ApiKeyAccessDto {
    const state = this.state
    const name = this.statusOrFailure instanceof ApiKeyStatus ? this.statusOrFailure.name : undefined
    const apiKey = this.apiKey
    const maskedApiKey = apiKey === undefined
      ? undefined
      : apiKey.length <= VISIBLE_CHARACTERS * 2
        ? MASK
        : `${apiKey.slice(0, VISIBLE_CHARACTERS)}${MASK}${apiKey.slice(-VISIBLE_CHARACTERS)}`
    return new ApiKeyAccessDto(
      state,
      STATUSES[state],
      name,
      maskedApiKey,
      GUIDANCES[state],
      state === 'active',
      state === 'inactive' || state === 'unavailable',
      state === 'missing' || state === 'invalid',
      apiKey !== undefined,
    )
  }
}
