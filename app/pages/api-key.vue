<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
import type { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'
import type { IssuedApiKeyDto } from '~/domain/models/dto/issued-api-key-dto'

const apiKeyApplication = useApplication(API_KEY_APPLICATION)
const { apiKeyAccess, isChecking, refresh, replace } = useApiKeyAccess()

const issuedApiKey = ref<IssuedApiKeyDto>()
const runningAction = ref<'issue' | 'use' | 'revoke'>()
const actionError = ref<Error>()

const run = async (action: 'issue' | 'use' | 'revoke', operation: () => Promise<void>): Promise<void> => {
  runningAction.value = action
  actionError.value = undefined
  try {
    await operation()
  }
  catch (error: unknown) {
    actionError.value = error instanceof Error ? error : new Error(String(error))
  }
  finally {
    runningAction.value = undefined
  }
}

const issueApiKey = (issueApiKeyDto: IssueApiKeyDto) => run('issue', async () => {
  issuedApiKey.value = await apiKeyApplication.issueApiKey(issueApiKeyDto)
  replace(issuedApiKey.value.access)
})

const useApiKey = (apiKey: string) => run('use', async () => {
  issuedApiKey.value = undefined
  replace(await apiKeyApplication.useApiKey(apiKey))
})

const revokeApiKey = () => run('revoke', async () => {
  issuedApiKey.value = undefined
  replace(await apiKeyApplication.revokeApiKey())
})

const forgetApiKey = (): void => {
  issuedApiKey.value = undefined
  actionError.value = undefined
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
      v-if="issuedApiKey"
      :issued-api-key="issuedApiKey"
    />
    <AppSpinner v-if="apiKeyAccess === undefined" />
    <ApiKeyPanel
      v-else-if="apiKeyAccess.hasApiKey"
      :api-key-access="apiKeyAccess"
      :is-checking="isChecking"
      :is-revoking="runningAction === 'revoke'"
      @refresh="refresh"
      @forget="forgetApiKey"
      @revoke="revokeApiKey"
    />
    <ApiKeyIssueForm
      :loading="runningAction === 'issue'"
      @issue="issueApiKey"
    />
    <ApiKeyUseForm
      :loading="runningAction === 'use'"
      @use="useApiKey"
    />
  </ConsolePageLayout>
</template>
