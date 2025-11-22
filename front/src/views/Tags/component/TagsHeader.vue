<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
      >
        {{ t("tags.title") }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">{{ tagsCount }} tags</p>
    </div>
    <button
      @click="$emit('open-create-modal')"
      class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
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
      {{ t("tags.addNew") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  tagsCount: number;
}>();

defineEmits<{
  (e: "open-create-modal"): void;
}>();

const { t } = useI18n();
</script>
