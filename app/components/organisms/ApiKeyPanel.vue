<script setup lang="ts">
import { ref } from 'vue'
import AppBadge from '~/components/atoms/AppBadge.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppDialog from '~/components/atoms/AppDialog.vue'
import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'

defineProps<{
  apiKeyAccess: ApiKeyAccessDto
  isChecking: boolean
  isRevoking: boolean
}>()

const emit = defineEmits<{ refresh: [], forget: [], revoke: [] }>()

const isConfirmingRevoke = ref(false)

const confirmRevoke = (): void => {
  isConfirmingRevoke.value = false
  emit('revoke')
}
</script>

<template>
  <AppCard
    title="目前使用的 API key"
    description="只存在這個瀏覽器；換瀏覽器需要重新貼上。"
  >
    <dl class="api-key-panel__details">
      <div class="api-key-panel__row">
        <dt>名稱</dt>
        <dd>{{ apiKeyAccess.name ?? '—' }}</dd>
      </div>
      <div class="api-key-panel__row">
        <dt>API key</dt>
        <dd><code class="api-key-panel__key">{{ apiKeyAccess.maskedApiKey }}</code></dd>
      </div>
      <div class="api-key-panel__row">
        <dt>狀態</dt>
        <dd>
          <AppBadge :tone="apiKeyAccess.status.tone">
            {{ apiKeyAccess.status.label }}
          </AppBadge>
        </dd>
      </div>
    </dl>
    <p
      v-if="apiKeyAccess.guidance"
      class="api-key-panel__guidance"
    >
      {{ apiKeyAccess.guidance }}
    </p>
    <div class="api-key-panel__actions">
      <AppButton
        variant="secondary"
        :loading="isChecking"
        @click="emit('refresh')"
      >
        重新檢查
      </AppButton>
      <AppButton
        variant="ghost"
        @click="emit('forget')"
      >
        在這個瀏覽器忘記
      </AppButton>
      <AppButton
        variant="danger"
        :loading="isRevoking"
        @click="isConfirmingRevoke = true"
      >
        撤銷
      </AppButton>
    </div>
    <AppDialog
      :open="isConfirmingRevoke"
      title="撤銷 API key"
      @close="isConfirmingRevoke = false"
    >
      撤銷後這把 API key 會永久失效，無法回復。使用它的程式都會被拒絕。
      <template #actions>
        <AppButton
          variant="secondary"
          @click="isConfirmingRevoke = false"
        >
          取消
        </AppButton>
        <AppButton
          variant="danger"
          @click="confirmRevoke"
        >
          確認撤銷
        </AppButton>
      </template>
    </AppDialog>
  </AppCard>
</template>

<style scoped lang="scss">
.api-key-panel {
  &__details {
    display: grid;
    gap: spacing('sm');
  }

  &__row {
    display: grid;
    grid-template-columns: size('category-field') 1fr;
    align-items: center;

    dt {
      @include caption;
    }
  }

  &__key {
    font-family: font-family('mono');
  }

  &__guidance {
    color: color('warning');
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: spacing('xs');
  }
}
</style>
