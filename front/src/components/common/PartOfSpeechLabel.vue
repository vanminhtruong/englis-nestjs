<template>
  <span v-if="value && value !== 'unspecified'" data-part-of-speech class="inline-flex max-w-full items-center rounded-md px-2 py-1 text-xs font-semibold leading-tight break-words"
    :class="onImage ? 'bg-black/50 text-white' : 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'">{{ t('vocabulary.pos_' + value) }}</span>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
defineProps<{ value?: string | null; onImage?: boolean }>()
const { t } = useI18n()
</script>
