<script setup lang="ts">
import AppButton from '~/components/atoms/AppButton.vue'
import type { SymbolCandidateDto } from '~/domain/models/dto/symbol-candidate-dto'

withDefaults(defineProps<{
  candidates: SymbolCandidateDto[]
  loading?: boolean
}>(), { loading: false })

defineEmits<{ choose: [string] }>()
</script>

<template>
  <ul
    class="symbol-candidate-list"
    aria-label="候選標的"
  >
    <li
      v-for="candidate in candidates"
      :key="candidate.symbol"
    >
      <AppButton
        variant="secondary"
        size="small"
        :disabled="loading"
        @click="$emit('choose', candidate.symbol)"
      >
        {{ candidate.symbolLabel }}
      </AppButton>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.symbol-candidate-list {
  display: flex;
  flex-wrap: wrap;
  gap: spacing('xs');
}
</style>
