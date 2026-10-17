<script setup lang="ts">
import AppAlert from '~/components/atoms/AppAlert.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'

defineProps<{
  error: Error
}>()

defineEmits<{ retry: [] }>()
</script>

<template>
  <AppAlert tone="negative">
    {{ error.message }}
    <template
      v-if="error instanceof BackendUnavailableError || (error instanceof BackendRejectionError && error.isApiKeyProblem)"
      #actions
    >
      <AppButton
        v-if="error instanceof BackendUnavailableError"
        variant="secondary"
        size="small"
        @click="$emit('retry')"
      >
        重試
      </AppButton>
      <NuxtLink
        v-else
        class="request-error-alert__link"
        to="/api-key"
      >
        前往 API key 設定
      </NuxtLink>
    </template>
  </AppAlert>
</template>

<style scoped lang="scss">
.request-error-alert__link {
  font-weight: font-weight('semibold');
}
</style>
