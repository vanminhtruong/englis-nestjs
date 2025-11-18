<template>
  <div class="text-center py-12">
    <div class="text-6xl mb-4">📊</div>
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('history.empty.title') }}</h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('history.empty.message') }}</p>
    <RouterLink
      to="/practice"
      class="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
    >
      {{ t('history.empty.action') }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18n()
</script>

<script lang="ts">
export default {
  name: 'EmptyState'
}
</script>
