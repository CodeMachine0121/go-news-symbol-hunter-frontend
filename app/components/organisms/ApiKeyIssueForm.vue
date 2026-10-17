<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppInput from '~/components/atoms/AppInput.vue'
import { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{ issue: [IssueApiKeyDto] }>()

const name = ref('')
</script>

<template>
  <AppCard
    title="申請新的 API key"
    description="新的 API key 預設為停用，需等 administrator 啟用後才能使用。"
  >
    <form
      class="api-key-issue-form"
      novalidate
      @submit.prevent="emit('issue', new IssueApiKeyDto(name))"
    >
      <AppInput
        v-model="name"
        label="名稱"
        placeholder="例如：我的研究"
        maxlength="200"
      />
      <AppButton
        type="submit"
        :loading="loading"
      >
        申請
      </AppButton>
    </form>
  </AppCard>
</template>

<style scoped lang="scss">
.api-key-issue-form {
  display: grid;
  gap: spacing('sm');
  align-items: end;

  @include respond-to('sm') {
    grid-template-columns: 1fr auto;
  }
}
</style>
