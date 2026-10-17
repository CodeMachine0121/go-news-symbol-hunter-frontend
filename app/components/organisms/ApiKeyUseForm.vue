<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppInput from '~/components/atoms/AppInput.vue'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{ use: [string] }>()

const apiKey = ref('')
</script>

<template>
  <AppCard
    title="使用既有的 API key"
    description="貼上已經申請過的 API key，操作台會立即確認它的狀態。"
  >
    <form
      class="api-key-use-form"
      novalidate
      @submit.prevent="emit('use', apiKey)"
    >
      <AppInput
        v-model="apiKey"
        label="API key"
        type="password"
        autocomplete="off"
      />
      <AppButton
        type="submit"
        variant="secondary"
        :loading="loading"
      >
        使用
      </AppButton>
    </form>
  </AppCard>
</template>

<style scoped lang="scss">
.api-key-use-form {
  display: grid;
  gap: spacing('sm');
  align-items: end;

  @include respond-to('sm') {
    grid-template-columns: 1fr auto;
  }
}
</style>
