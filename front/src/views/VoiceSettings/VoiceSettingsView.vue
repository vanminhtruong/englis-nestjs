<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('voiceSettings.title') }}
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          {{ t('voiceSettings.subtitle') }}
        </p>
      </div>
    </div>

    <VoiceSettingsPanel />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import en from './language/en'
import vi from './language/vi'
import ko from './language/ko'

const { t, mergeLocaleMessage } = useI18n()

mergeLocaleMessage('en', { voiceSettings: en })
mergeLocaleMessage('vi', { voiceSettings: vi })
mergeLocaleMessage('ko', { voiceSettings: ko })

const VoiceSettingsPanel = defineAsyncComponent(() => import('./component/VoiceSettingsPanel.vue') as any)
</script>


