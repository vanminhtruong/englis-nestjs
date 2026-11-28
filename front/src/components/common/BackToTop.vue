<template>
  <Teleport to="#app-floating-actions">
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="isVisible"
      type="button"
      :aria-label="t('common.backToTop')"
      class="app-floating-action app-floating-action--right fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[45] inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none group"
      @click="scrollToTop"
      @mouseenter="showProgress"
      @mouseleave="hideProgress"
    >
      <!-- Pulse Effect Ring -->
      <span
        class="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 group-hover:opacity-40"
      ></span>

      <!-- Tooltip -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-100"
        enter-to-class="opacity-100 scale-105"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 scale-105"
        leave-to-class="opacity-0 scale-100"
      >
        <div
          v-show="isProgressHovered"
          class="absolute -top-16 right-0 z-50 scale-105 pointer-events-none"
        >
          <div class="relative bg-white/95 dark:bg-black/95 backdrop-blur-md border border-gray-200 dark:border-white/20 px-4 py-2 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50">
            <!-- Progress Bar -->
            <div class="w-full h-1 bg-gray-200 dark:bg-white/20 rounded-full mb-1.5 overflow-hidden">
              <div
                class="h-full origin-left bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-transform duration-300"
                :style="{ transform: `scaleX(${scrollPercentage / 100})` }"
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
      </Transition>

      <SeasonalActionIcon
        kind="backToTop"
        :size="30"
        class="transition-transform group-hover:-translate-y-0.5"
      >
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
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </SeasonalActionIcon>
    </button>
  </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import SeasonalActionIcon from "./SeasonalActionIcon.vue";

const { t } = useI18n();

const isVisible = ref(false);
const scrollPercentage = ref(0);
const isProgressHovered = ref(false);
let scrollRange = 0;
let progressObserver: ResizeObserver | undefined;

function updateProgress(scrollTop: number) {
  scrollPercentage.value = scrollRange > 0
    ? Math.min(100, Math.max(0, Math.round((scrollTop / scrollRange) * 100)))
    : 0;
}

function refreshScrollRange() {
  scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  updateProgress(window.scrollY);
}

function showProgress() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  isProgressHovered.value = true;
  refreshScrollRange();
  if (typeof ResizeObserver !== "undefined") {
    progressObserver ??= new ResizeObserver(refreshScrollRange);
    progressObserver.observe(document.body);
  }
}

function hideProgress() {
  isProgressHovered.value = false;
  progressObserver?.disconnect();
}

function handleScroll() {
  const scrollTop = window.scrollY;
  // Short mobile pages may have less than 300px of available scroll.
  const threshold = window.innerWidth < 768 ? 32 : 300;
  isVisible.value = scrollTop > threshold;
  if (!isVisible.value && isProgressHovered.value) hideProgress();
  if (isProgressHovered.value) updateProgress(scrollTop);
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function handleResize() {
  if (isProgressHovered.value) refreshScrollRange();
  handleScroll();
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, {
    passive: true,
  } as AddEventListenerOptions);
  window.addEventListener("resize", handleResize, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  progressObserver?.disconnect();
});
</script>
