<script setup lang="ts">
import AppEmptyState from '~/components/atoms/AppEmptyState.vue'
import TrackedSymbolGradeCard from '~/components/organisms/TrackedSymbolGradeCard.vue'
import type { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'

defineProps<{
  trackedSymbolGrades: TrackedSymbolGradeDto[]
}>()
</script>

<template>
  <AppEmptyState v-if="trackedSymbolGrades.length === 0">
    目前沒有追蹤標的評等
  </AppEmptyState>
  <div
    v-else
    class="tracked-symbol-grade-table"
  >
    <TrackedSymbolGradeCard
      v-for="trackedSymbolGrade in trackedSymbolGrades"
      :key="`${trackedSymbolGrade.category.value}:${trackedSymbolGrade.symbol}`"
      :tracked-symbol-grade="trackedSymbolGrade"
    />
  </div>
</template>

<style scoped lang="scss">
.tracked-symbol-grade-table {
  display: flex;
  flex-direction: column;
  gap: spacing('md');
}
</style>
