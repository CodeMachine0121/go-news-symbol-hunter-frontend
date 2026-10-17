import { readonly } from 'vue'
import { API_KEY_ACCESS_STATE, API_KEY_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'

export function useApiKeyAccess() {
  const apiKeyApplication = useApplication(API_KEY_APPLICATION)
  const { apiKeyAccess, isChecking } = useApplication(API_KEY_ACCESS_STATE)

  const refresh = async (): Promise<void> => {
    isChecking.value = true
    try {
      apiKeyAccess.value = await apiKeyApplication.getApiKeyAccess()
    }
    finally {
      isChecking.value = false
    }
  }

  const replace = (nextApiKeyAccess: ApiKeyAccessDto): void => {
    apiKeyAccess.value = nextApiKeyAccess
  }

  return { apiKeyAccess: readonly(apiKeyAccess), isChecking: readonly(isChecking), refresh, replace }
}
