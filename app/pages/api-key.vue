<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import IssuedApiKeyReveal from '~/components/molecules/IssuedApiKeyReveal.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import ApiKeyIssueForm from '~/components/organisms/ApiKeyIssueForm.vue'
import ApiKeyPanel from '~/components/organisms/ApiKeyPanel.vue'
import ApiKeyUseForm from '~/components/organisms/ApiKeyUseForm.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { API_KEY_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'

const apiKeyApplication = useApplication(API_KEY_APPLICATION)
const { apiKeyAccess, isChecking, refresh, replace } = useApiKeyAccess()

const apiKeyIssue = useRequest(async (issueApiKeyDto: IssueApiKeyDto) => {
  const issuedApiKey = await apiKeyApplication.issueApiKey(issueApiKeyDto)
  replace(issuedApiKey.access)
  return issuedApiKey
})
const apiKeyUse = useRequest(async (apiKey: string) => replace(await apiKeyApplication.useApiKey(apiKey)))
const apiKeyRevoke = useRequest(async () => replace(await apiKeyApplication.revokeApiKey()))

const actionError = computed(() => apiKeyIssue.error.value ?? apiKeyUse.error.value ?? apiKeyRevoke.error.value)

const resetActions = (): void => {
  for (const action of [apiKeyIssue, apiKeyUse, apiKeyRevoke]) {
    action.reset()
  }
}

const issueApiKey = (issueApiKeyDto: IssueApiKeyDto): Promise<void> => {
  resetActions()
  return apiKeyIssue.run(issueApiKeyDto)
}

const useApiKey = (apiKey: string): Promise<void> => {
  resetActions()
  return apiKeyUse.run(apiKey)
}

const revokeApiKey = (): Promise<void> => {
  resetActions()
  return apiKeyRevoke.run()
}

const forgetApiKey = (): void => {
  resetActions()
  replace(apiKeyApplication.forgetApiKey())
}

onMounted(() => refresh())
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      title="API key"
      description="操作台以 API key 呼叫服務。新申請的 API key 需等 administrator 啟用。"
    />
    <RequestErrorAlert
      v-if="actionError"
      :error="actionError"
      @retry="refresh"
    />
    <IssuedApiKeyReveal
      v-if="apiKeyIssue.data.value"
      :issued-api-key="apiKeyIssue.data.value"
    />
    <AppSpinner v-if="apiKeyAccess === undefined" />
    <ApiKeyPanel
      v-else-if="apiKeyAccess.hasApiKey"
      :api-key-access="apiKeyAccess"
      :is-checking="isChecking"
      :is-revoking="apiKeyRevoke.isRunning.value"
      @refresh="refresh"
      @forget="forgetApiKey"
      @revoke="revokeApiKey"
    />
    <ApiKeyIssueForm
      :loading="apiKeyIssue.isRunning.value"
      @issue="issueApiKey"
    />
    <ApiKeyUseForm
      :loading="apiKeyUse.isRunning.value"
      @use="useApiKey"
    />
  </ConsolePageLayout>
</template>
