<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
  options: { value: string, label: string }[]
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })
const selectId = useId()
</script>

<template>
  <div class="app-select">
    <label
      class="app-select__label"
      :for="selectId"
    >{{ label }}</label>
    <select
      :id="selectId"
      v-model="model"
      class="app-select__control"
      v-bind="$attrs"
    >
      <option
        v-if="placeholder !== undefined"
        value=""
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">
.app-select {
  display: flex;
  flex-direction: column;
  gap: spacing('2xs');

  &__label {
    @include caption;
  }

  &__control {
    height: size('control');
    padding: 0 spacing('sm');
    background: color('surface');
    border: 1px solid color('border-strong');
    border-radius: radius('md');
    color: color('text');
    font-size: font-size('md');

    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
