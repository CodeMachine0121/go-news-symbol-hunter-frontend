<script setup lang="ts">
import AppBadge from '~/components/atoms/AppBadge.vue'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

defineProps<{
  value: LabelledValueDto
}>()
</script>

<template>
  <AppBadge :tone="value.tone">
    {{ value.label }}
  </AppBadge>
</template>
