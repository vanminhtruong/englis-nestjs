<template>
  <button
    v-if="isVisible"
    type="button"
    class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    @click="scrollToTop"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
