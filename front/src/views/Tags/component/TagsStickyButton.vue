<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-20 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-20 opacity-0"
  >
    <button
      v-if="showStickyAddButton"
      @click="$emit('open-create-modal')"
      class="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-full shadow-2xl hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-sm"
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
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span class="hidden md:inline">{{ t("tags.addNew") }}</span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  showStickyAddButton: boolean;
}>();

defineEmits<{
  (e: "open-create-modal"): void;
}>();

const { t } = useI18n();
</script>
