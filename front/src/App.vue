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

</style>
