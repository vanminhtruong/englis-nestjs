<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const DefaultLayout = defineAsyncComponent(() => import('./layouts/DefaultLayout.vue'))
</script>

<template>
  <DefaultLayout />
</template>

<style lang="postcss">
/* Global scroll lock for modals */
.scroll-lock {
  overflow: hidden;
}

/* Global scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-900;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-700 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-600;
}
</style>
