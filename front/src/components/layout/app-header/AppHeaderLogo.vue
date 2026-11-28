<template>
  <div class="min-w-0 shrink-0">
    <RouterLink
      to="/"
      :aria-label="brandName"
      class="app-brand-link group flex min-w-0 items-center gap-2 transition-transform hover:scale-[1.02] sm:gap-3" :class="{ 'app-brand-footer': footer }"
    >
      <div
        class="seasonal-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white sm:h-10 sm:w-10"
        :class="{ 'seasonal-brand-mark--footer-art': footer && brandArtwork }"
        :data-seasonal-brand-loaded="artworkReady || undefined"
        aria-hidden="true"
      >
        <svg
          v-if="!artworkReady"
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
        <img
          v-if="brandArtwork"
          :key="brandArtwork"
          :src="brandArtwork"
          :class="{ 'is-ready': artworkReady }"
          class="seasonal-brand-art"
          alt=""
          width="192"
          height="192"
          decoding="async"
          @load="markArtworkReady"
        />
      </div>
      <span v-if="!footer" class="seasonal-brand-name bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-base font-bold text-transparent min-[340px]:hidden">VM</span>
      <div class="min-w-0" :class="footer ? 'flex flex-wrap' : 'hidden min-[340px]:flex'">
        <span
          v-for="(part, index) in wordmarkParts"
          :key="index"
          class="seasonal-brand-name inline-block text-lg font-bold min-[420px]:text-2xl bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          :class="{ 'char-animate': !brandArtwork }"
          :style="brandArtwork ? undefined : { animationDelay: `${index * 0.1}s` }"
        >{{ part === " " ? "\u00a0" : part }}</span>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { seasonalUiArtworkKey } from "../../../utils/seasonalDecor";

defineProps<{ footer?: boolean }>();
const { t } = useI18n();
const artwork = inject(seasonalUiArtworkKey);
const brandArtwork = computed(() => artwork?.value?.brand);
const loadedSource = ref<string>();
const artworkReady = computed(() => !!brandArtwork.value && brandArtwork.value === loadedSource.value);
const brandName = computed(() => t("common.appName"));
const wordmarkParts = computed(() => brandArtwork.value ? [brandName.value] : brandName.value.split(""));

function markArtworkReady(event: Event) {
  loadedSource.value = (event.currentTarget as HTMLImageElement).getAttribute("src") ?? undefined;
}
</script>

<style scoped>
.seasonal-brand-mark {
  position: relative;
}

.seasonal-brand-mark[data-seasonal-brand-loaded] {
  background-image: none;
}

.app-brand-footer .seasonal-brand-mark--footer-art {
  width: 3rem;
  height: 3rem;
}

@media (min-width: 640px) {
  .app-brand-footer .seasonal-brand-mark--footer-art {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.seasonal-brand-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  visibility: hidden;
  pointer-events: none;
}

.seasonal-brand-art.is-ready {
  visibility: visible;
}

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
