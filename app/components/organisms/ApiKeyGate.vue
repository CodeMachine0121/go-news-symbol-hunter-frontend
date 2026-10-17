<script setup lang="ts">
import { onMounted } from 'vue'
import AppAlert from '~/components/atoms/AppAlert.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import { useApiKeyAccess } from '~/composables/use-api-key-access'

const { apiKeyAccess, isChecking, refresh } = useApiKeyAccess()

onMounted(() => {
  if (apiKeyAccess.value === undefined) {
    void refresh()
  }
})
</script>

<template>
  <AppSpinner v-if="apiKeyAccess === undefined">
    正在確認 API key
  </AppSpinner>
  <slot v-else-if="apiKeyAccess.isUsable" />
  <AppAlert
    v-else
    :tone="apiKeyAccess.status.tone"
  >
    {{ apiKeyAccess.guidance }}
    <template #actions>
      <AppButton
        v-if="apiKeyAccess.canRecheck"
        variant="secondary"
        size="small"
        :loading="isChecking"
        @click="refresh"
      >
        重新檢查
      </AppButton>
      <NuxtLink
        v-if="apiKeyAccess.needsSettings"
        class="api-key-gate__link"
        to="/api-key"
      >
        前往 API key 設定
      </NuxtLink>
    </template>
  </AppAlert>
</template>

<style scoped lang="scss">
.api-key-gate__link {
  font-weight: font-weight('semibold');
}
</style>
