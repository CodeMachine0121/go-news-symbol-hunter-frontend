<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInput from '~/components/atoms/AppInput.vue'
import AppSelect from '~/components/atoms/AppSelect.vue'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const props = withDefaults(defineProps<{
  categories: LabelledValueDto[]
  submitLabel: string
  loading?: boolean
  optional?: boolean
}>(), { loading: false, optional: false })

const emit = defineEmits<{ submit: [SymbolQueryDto] }>()

const category = ref(props.optional ? '' : props.categories[0]?.value ?? '')
const symbol = ref('')
</script>

<template>
  <form
    class="symbol-query-form"
    novalidate
    @submit.prevent="emit('submit', new SymbolQueryDto(symbol, category))"
  >
    <AppSelect
      v-model="category"
      class="symbol-query-form__category"
      label="市場類別"
      :options="categories"
      :placeholder="optional ? '全部' : undefined"
    />
    <AppInput
      v-model="symbol"
      class="symbol-query-form__symbol"
      label="標的"
      :placeholder="optional ? '全部標的' : '例如 2330、AAPL、BTC'"
      autocomplete="off"
    />
    <AppButton
      type="submit"
      class="symbol-query-form__submit"
      :loading="loading"
    >
      {{ submitLabel }}
    </AppButton>
  </form>
</template>

<style scoped lang="scss">
.symbol-query-form {
  display: grid;
  gap: spacing('sm');
  align-items: end;

  @include respond-to('sm') {
    grid-template-columns: size('category-field') 1fr auto;
  }
}
</style>
