<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
      >
        <div
          class="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-xl dark:bg-black sm:max-h-[90dvh]"
        >
          <!-- Header - Fixed -->
          <div
            class="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-white/10 sm:p-6"
          >
            <h2 class="min-w-0 break-words text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
              {{
                isEditing
                  ? t("categories.editTitle")
                  : t("categories.createTitle")
              }}
            </h2>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Form Content - Scrollable -->
          <form
            @submit.prevent="$emit('submit')"
            class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ t("categories.name") }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ t("categories.description") }}
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <IconPicker
              v-model="form.icon"
              :label="t('categories.icon')"
              :selected-color="form.color"
            />

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2"
              >
                {{ t("categories.color") }}
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model="form.color"
                  type="color"
                  class="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-white/10"
                />
                <div class="flex-1">
                  <p class="text-sm text-gray-600 dark:text-white/70">
                    Selected Color
                  </p>
                  <p class="text-sm font-mono text-gray-900 dark:text-white">
                    {{ form.color }}
                  </p>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer - Fixed -->
          <div
            class="flex shrink-0 gap-3 border-t border-gray-200 p-4 dark:border-white/10 sm:p-6"
          >
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            >
              {{ t("categories.cancel") }}
            </button>
            <button
              type="submit"
              @click="$emit('submit')"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {{ t("categories.save") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { defineAsyncComponent, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import type { CategoryForm } from "../interface/category.interface";

const IconPicker = defineAsyncComponent(
  () => import("./IconPicker.vue") as any
);

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  form: CategoryForm;
}>();

defineEmits<{
  submit: [];
  close: [];
}>();

const { t } = useI18n();
const { lockScroll, unlockScroll } = useModalScrollLock();

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }
);
</script>
