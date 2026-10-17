<script setup lang="ts">
import AppBadge from '~/components/atoms/AppBadge.vue'
import type { BackendHealthDto } from '~/domain/models/dto/backend-health-dto'

defineProps<{
  backendHealth: BackendHealthDto | undefined
}>()
</script>

<template>
  <AppBadge
    v-if="backendHealth"
    :tone="backendHealth.status.tone"
  >
    {{ backendHealth.status.label }}
  </AppBadge>
  <AppBadge v-else>
    檢查中
  </AppBadge>
</template>
