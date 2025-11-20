<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="emit('cancel')"
    >
      <div
        class="bg-gradient-to-br from-white to-white/50 dark:from-white/5 dark:to-black border border-black/10 dark:border-white/10 rounded-3xl p-8 text-center max-w-md w-full shadow-2xl"
      >
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-black dark:text-white mb-3">
          {{ t("practice.exitConfirmation.title") }}
        </h2>
        <p class="text-black/70 dark:text-white/70 mb-6">
          {{ t("practice.exitConfirmation.message") }}
        </p>

        <div
          class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6"
        >
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            {{ t("practice.exitConfirmation.warning") }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="emit('cancel')"
            class="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-medium"
          >
            {{ t("practice.exitConfirmation.continue") }}
          </button>
          <button
            @click="emit('confirm')"
            class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
          >
            {{ t("practice.exitConfirmation.exit") }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>
