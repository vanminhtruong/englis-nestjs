<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-10 scale-50"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-10 scale-50"
  >
    <button
      v-if="isVisible"
      type="button"
      class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none group"
      @click="scrollToTop"
      @mouseenter="showProgress"
      @mouseleave="hideProgress"
    >
      <!-- Pulse Effect Ring -->
      <span
        class="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 group-hover:opacity-40"
      ></span>

      <!-- Tooltip -->
      <div class="absolute -top-16 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 group-hover:scale-105">
        <div class="relative bg-white/95 dark:bg-black/95 backdrop-blur-md border border-gray-200 dark:border-white/20 px-4 py-2 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50">
          <!-- Progress Bar -->
          <div class="w-full h-1 bg-gray-200 dark:bg-white/20 rounded-full mb-1.5 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
              :style="{ width: scrollPercentage + '%' }"
            ></div>
          </div>
          <!-- Percentage Text -->
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium text-gray-800 dark:text-white tracking-wide">{{ scrollPercentage }}%</span>
            <span class="text-xs text-gray-500 dark:text-gray-300">scrolled</span>
          </div>
          <!-- Arrow -->
          <div class="absolute -bottom-2 right-4 w-4 h-4 bg-white/95 dark:bg-black/95 border-b border-r border-gray-200 dark:border-white/20 rotate-45"></div>
        </div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="relative transform group-hover:-translate-y-0.5 transition-transform"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);
const scrollPercentage = ref(0);
let isProgressHovered = false;

function updateProgress(scrollTop: number) {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercentage.value = scrollRange > 0 ? Math.round((scrollTop / scrollRange) * 100) : 0;
}

function showProgress() {
  isProgressHovered = true;
  updateProgress(window.scrollY);
}

function hideProgress() {
  isProgressHovered = false;
}

function handleScroll() {
  const scrollTop = window.scrollY;
  isVisible.value = scrollTop > 300;
  if (!isVisible.value) hideProgress();
  if (isProgressHovered) updateProgress(scrollTop);
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, {
    passive: true,
  } as AddEventListenerOptions);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
