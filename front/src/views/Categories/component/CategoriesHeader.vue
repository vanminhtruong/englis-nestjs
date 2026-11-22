<template>
  <div class="mb-8 flex min-w-0 flex-col items-stretch gap-4 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
    <div>
      <h1
        class="mb-2 break-words bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl"
      >
        {{ t("categories.title") }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ categoriesCount }} {{ t("categories.title").toLowerCase() }}
      </p>
    </div>
    <button
      @click="$emit('open-create-modal')"
      class="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/25 min-[390px]:w-auto sm:px-6 sm:text-base"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      {{ t("categories.addNew") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  categoriesCount: number;
}>();

defineEmits<{
  (e: "open-create-modal"): void;
}>();

const { t } = useI18n();
</script>
