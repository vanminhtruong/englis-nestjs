<template>
  <div class="min-w-0 shrink-0">
    <RouterLink
      to="/"
      class="app-brand-link group flex min-w-0 items-center gap-2 transition-transform hover:scale-[1.02] sm:gap-3" :class="{ 'app-brand-footer': footer }"
    >
      <div
        class="seasonal-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white sm:h-10 sm:w-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          />
        </svg>
      </div>
      <span v-if="!footer" class="seasonal-brand-name bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-base font-bold text-transparent min-[340px]:hidden">VM</span>
      <div class="min-w-0" :class="footer ? 'flex flex-wrap' : 'hidden min-[340px]:flex'">
        <span
          v-for="(char, index) in appNameArray"
          :key="index"
          v-html="char === ' ' ? '&nbsp;' : char"
          class="seasonal-brand-name char-animate inline-block text-lg font-bold min-[420px]:text-2xl bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
        </span>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

defineProps<{ footer?: boolean }>();
const { t } = useI18n();
const appNameArray = computed(() => t("common.appName").split(""));
</script>

<style scoped>
.char-animate {
  animation: scale-char 3s infinite ease-in-out;
  transform-origin: center;
  display: inline-block;
  white-space: pre;
}

@keyframes scale-char {
  0%,
  20%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  10% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}
</style>
