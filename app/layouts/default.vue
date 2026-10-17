<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBadge from '~/components/atoms/AppBadge.vue'
import BackendStatusIndicator from '~/components/molecules/BackendStatusIndicator.vue'
import ConsoleNavigation from '~/components/organisms/ConsoleNavigation.vue'
import ConsoleLayout from '~/components/templates/ConsoleLayout.vue'
import { BACKEND_HEALTH_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import type { BackendHealthDto } from '~/domain/models/dto/backend-health-dto'

const backendHealthApplication = useApplication(BACKEND_HEALTH_APPLICATION)
const { apiKeyAccess, refresh } = useApiKeyAccess()
const backendHealth = ref<BackendHealthDto>()

onMounted(async () => {
  void refresh()
  backendHealth.value = await backendHealthApplication.checkHealth()
})
</script>

<template>
  <ConsoleLayout>
    <template #brand>
      標的資訊面分析
    </template>
    <template #navigation>
      <ConsoleNavigation />
    </template>
    <template #status>
      <BackendStatusIndicator :backend-health="backendHealth" />
      <NuxtLink
        v-if="apiKeyAccess"
        to="/api-key"
        class="default-layout__api-key"
      >
        <AppBadge :tone="apiKeyAccess.status.tone">
          API key {{ apiKeyAccess.status.label }}
        </AppBadge>
      </NuxtLink>
    </template>
    <slot />
  </ConsoleLayout>
</template>

<style scoped lang="scss">
.default-layout__api-key {
  text-decoration: none;
}
</style>
