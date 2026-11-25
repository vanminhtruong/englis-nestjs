<template>
  <div class="flex min-w-0 flex-col items-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-12 text-center dark:border-white/15 dark:bg-white/[0.02] sm:py-16">
    <TagBadge class="mb-4" />
    <h3 class="text-lg font-bold text-black dark:text-white sm:text-xl">{{ t('tags.noTags') }}</h3>
    <p class="mt-2 max-w-sm text-sm leading-relaxed text-black/60 dark:text-white/60">{{ t('tags.addFirstTag') }}</p>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TagBadge from './TagBadge.vue'
const { t } = useI18n()
</script>
