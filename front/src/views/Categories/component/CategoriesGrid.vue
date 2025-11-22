<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    <div
      v-for="category in categories"
      :key="category.id"
      class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all group"
    >
      <div class="flex items-start justify-between mb-4">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: category.color + '20' }"
        >
          <component
            :is="getIconComponent(category.icon)"
            :color="category.color"
            class="w-6 h-6"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('toggle-pin', category.id)"
            :class="[
              'p-2 rounded-lg transition-all text-xl',
              category.isPinned
                ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                : 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
            ]"
            :title="
              category.isPinned ? t('categories.unpin') : t('categories.pin')
            "
          >
            <span
              aria-hidden="true"
              :style="!category.isPinned ? 'filter: grayscale(1);' : ''"
            >
              📌
            </span>
          </button>
          <button
            @click="$emit('open-edit-modal', category)"
            class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
          </button>
          <button
            @click="$emit('delete', category.id)"
            class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {{ category.name }}
      </h3>

      <p
        v-if="category.description"
        class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
      >
        {{ category.description }}
      </p>

      <RouterLink
        :to="`/categories/${category.id}`"
        class="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
      >
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {{ category.vocabularies?.length || 0 }}
          {{ t("categories.vocabularyCount") }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { getIconComponent } from "../../../utils/iconRenderer";

defineProps<{
  categories: any[];
}>();

defineEmits<{
  (e: "toggle-pin", id: string): void;
  (e: "open-edit-modal", category: any): void;
  (e: "delete", id: string): void;
}>();

const { t } = useI18n();
</script>
