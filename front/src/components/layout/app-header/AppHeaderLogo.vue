<template>
  <div class="flex-shrink-0">
    <RouterLink
      to="/"
      class="flex items-center gap-3 hover:scale-105 transition-transform group"
    >
      <div
        class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white"
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
      <div class="flex">
        <span
          v-for="(char, index) in appNameArray"
          :key="index"
          v-html="char === ' ' ? '&nbsp;' : char"
          class="char-animate inline-block text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
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
