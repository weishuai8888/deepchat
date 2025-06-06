<template>
  <div class="flex flex-col gap-4">
    <!-- API URL 配置 -->
    <div class="flex flex-col items-start gap-2">
      <div class="flex justify-between items-center w-full">
        <Label :for="`${provider.id}-url`" class="flex-1 cursor-pointer">API URL</Label>
        <Button
          v-if="provider.custom"
          variant="destructive"
          size="sm"
          class="text-xs rounded-lg"
          @click="$emit('delete-provider')"
        >
          <Icon icon="lucide:trash-2" class="w-4 h-4 mr-1" />{{ t('settings.provider.delete') }}
        </Button>
      </div>
      <Input
        :id="`${provider.id}-url`"
        :model-value="apiHost"
        :placeholder="t('settings.provider.urlPlaceholder')"
        @blur="handleApiHostChange(String($event.target.value))"
        @keyup.enter="handleApiHostChange(apiHost)"
        @update:model-value="apiHost = String($event)"
      />
      <div class="text-xs text-muted-foreground">
        {{
          t('settings.provider.urlFormat', {
            defaultUrl: providerWebsites?.defaultBaseUrl || ''
          })
        }}
      </div>
    </div>

    <!-- API Key 配置 -->
    <div class="flex flex-col items-start gap-2">
      <Label :for="`${provider.id}-apikey`" class="flex-1 cursor-pointer">API Key</Label>
      <Input
        :id="`${provider.id}-apikey`"
        :model-value="apiKey"
        type="password"
        :placeholder="t('settings.provider.keyPlaceholder')"
        @blur="handleApiKeyChange($event.target.value)"
        @keyup.enter="$emit('validate-key', apiKey)"
        @update:model-value="apiKey = String($event)"
      />
      <div class="flex flex-row gap-2">
        <Button
          variant="outline"
          size="xs"
          class="text-xs text-normal rounded-lg"
          @click="$emit('validate-key', apiKey)"
        >
          <Icon icon="lucide:check-check" class="w-4 h-4 text-muted-foreground" />{{
            t('settings.provider.verifyKey')
          }}
        </Button>
        <Button
          variant="outline"
          size="xs"
          class="text-xs text-normal rounded-lg"
          v-if="!provider.custom && provider.id !== 'doubao'"
          @click="openProviderWebsite"
        >
          <Icon icon="lucide:hand-helping" class="w-4 h-4 text-muted-foreground" />{{
            t('settings.provider.howToGet')
          }}
        </Button>
      </div>
      <div class="text-xs text-muted-foreground" v-if="!provider.custom">
        {{ t('settings.provider.getKeyTip') }}
        <a :href="providerWebsites?.apiKey" target="_blank" class="text-primary">{{
          provider.name
        }}</a>
        {{ t('settings.provider.getKeyTipEnd') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import type { LLM_PROVIDER } from '@shared/presenter'

interface ProviderWebsites {
  official: string
  apiKey: string
  docs: string
  models: string
  defaultBaseUrl: string
}

const { t } = useI18n()

const props = defineProps<{
  provider: LLM_PROVIDER
  providerWebsites?: ProviderWebsites
}>()

const emit = defineEmits<{
  'api-host-change': [value: string]
  'api-key-change': [value: string]
  'validate-key': [value: string]
  'delete-provider': []
}>()

const apiKey = ref(props.provider.apiKey || '')
const apiHost = ref(props.provider.baseUrl || '')

watch(
  () => props.provider,
  () => {
    apiKey.value = props.provider.apiKey || ''
    apiHost.value = props.provider.baseUrl || ''
  },
  { immediate: true }
)

const handleApiKeyChange = (value: string) => {
  emit('api-key-change', value)
}

const handleApiHostChange = (value: string) => {
  emit('api-host-change', value)
}

const openProviderWebsite = () => {
  const url = props.providerWebsites?.apiKey
  if (url) {
    window.open(url, '_blank')
  }
}
</script>
