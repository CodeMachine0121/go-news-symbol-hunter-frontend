<script setup lang="ts">
import { ref } from 'vue'
import AppAlert from '~/components/atoms/AppAlert.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import type { IssuedApiKeyDto } from '~/domain/models/dto/issued-api-key-dto'

const props = defineProps<{
  issuedApiKey: IssuedApiKeyDto
}>()

const isCopied = ref(false)

const copyApiKey = async (): Promise<void> => {
  await navigator.clipboard.writeText(props.issuedApiKey.apiKey)
  isCopied.value = true
}
</script>

<template>
  <AppAlert tone="warning">
    <div class="issued-api-key-reveal">
      <strong>請立即保存，離開後將無法再次查看</strong>
      <code class="issued-api-key-reveal__key">{{ issuedApiKey.apiKey }}</code>
    </div>
    <template #actions>
      <AppButton
        variant="secondary"
        size="small"
        @click="copyApiKey"
      >
        {{ isCopied ? '已複製' : '複製' }}
      </AppButton>
    </template>
  </AppAlert>
</template>

<style scoped lang="scss">
.issued-api-key-reveal {
  display: flex;
  flex-direction: column;
  gap: spacing('2xs');
  min-width: 0;

  &__key {
    font-family: font-family('mono');
    font-size: font-size('sm');
    word-break: break-all;
  }
}
</style>
