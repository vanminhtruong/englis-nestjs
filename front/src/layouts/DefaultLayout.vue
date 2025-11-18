<template>
  <div class="min-h-screen bg-white dark:bg-black flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <RouterView />
      <BackToTop />
    </main>
    <AppToastContainer />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
 import { defineAsyncComponent } from 'vue'
 import { RouterView } from 'vue-router'

 const AppHeader = defineAsyncComponent(() => import('../components/layout/AppHeader.vue') as any)
 const AppFooter = defineAsyncComponent(() => import('../components/layout/AppFooter.vue') as any)
 const BackToTop = defineAsyncComponent(() => import('../components/common/BackToTop.vue') as any)
 const AppToastContainer = defineAsyncComponent(() => import('../components/common/AppToastContainer.vue') as any)
</script>
