<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
}>()

const model = defineModel<string>({ required: true })
const inputId = useId()
</script>

<template>
  <div class="app-input">
    <label
      class="app-input__label"
      :for="inputId"
    >{{ label }}</label>
    <input
      :id="inputId"
      v-model="model"
      class="app-input__control"
      v-bind="$attrs"
    >
  </div>
</template>

<style scoped lang="scss">
.app-input {
  display: flex;
  flex-direction: column;
  gap: spacing('2xs');
  min-width: 0;

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
