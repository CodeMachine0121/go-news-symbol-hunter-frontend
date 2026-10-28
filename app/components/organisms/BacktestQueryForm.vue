<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInput from '~/components/atoms/AppInput.vue'
import AppSelect from '~/components/atoms/AppSelect.vue'
import { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

defineProps<{
  categories: LabelledValueDto[]
  sources: LabelledValueDto[]
  loading: boolean
}>()

const emit = defineEmits<{ submit: [GradeBacktestQueryDto] }>()

const completedFrom = ref('')
const completedTo = ref('')
const category = ref('')
const symbol = ref('')
const source = ref('')
</script>

<template>
  <form
    class="backtest-query-form"
    novalidate
    @submit.prevent="emit('submit', new GradeBacktestQueryDto(completedFrom, completedTo, symbol, category, source))"
  >
    <AppInput
      v-model="completedFrom"
      label="建立日（起）"
      type="date"
    />
    <AppInput
      v-model="completedTo"
      label="建立日（迄）"
      type="date"
    />
    <AppSelect
      v-model="category"
      label="市場類別"
      :options="categories"
      placeholder="全部"
    />
    <AppInput
      v-model="symbol"
      label="標的"
      placeholder="全部標的"
      autocomplete="off"
    />
    <AppSelect
      v-model="source"
      label="評等來源"
      :options="sources"
      placeholder="全部"
    />
    <AppButton
      type="submit"
      :loading="loading"
    >
      查詢回測
    </AppButton>
  </form>
</template>

<style scoped lang="scss">
.backtest-query-form {
  display: grid;
  gap: spacing('sm');
  align-items: end;

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('lg') {
    grid-template-columns: repeat(5, 1fr) auto;
  }
}
</style>
