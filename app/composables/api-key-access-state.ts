import { ref } from 'vue'
import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'

export class ApiKeyAccessState {
  readonly apiKeyAccess = ref<ApiKeyAccessDto>()
  readonly isChecking = ref(false)
}
