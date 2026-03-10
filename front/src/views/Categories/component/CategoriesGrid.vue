<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
  >
    <div
      v-for="category in categories"
      :key="category.id"
      class="category-card group relative flex flex-col bg-white dark:bg-black border border-black/8 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <!-- Top color bar driven by category.color -->
      <div
        class="h-1 w-full flex-shrink-0"
        :style="{
          background: `linear-gradient(90deg, ${category.color}cc, ${category.color}66)`,
        }"
      />

      <!-- Card body -->
      <div class="flex flex-col flex-1 p-5">
        <!-- Icon + Actions row -->
        <div class="flex items-start justify-between mb-4">
          <!-- Icon badge -->
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: category.color + '20' }"
          >
            <component
              :is="getIconComponent(category.icon)"
              :color="category.color"
              class="w-6 h-6"
            />
          </div>

          <!-- Action buttons -->
          <div
            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <!-- Pin -->
            <button
              @click.prevent="$emit('toggle-pin', category.id)"
              class="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
              :class="
                category.isPinned
                  ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400'
                  : 'text-gray-400 dark:text-white/30 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-500/10'
              "
              :title="
                category.isPinned ? t('categories.unpin') : t('categories.pin')
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" x2="12" y1="17" y2="22" />
                <path
                  d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"
                />
              </svg>
            </button>

            <!-- Edit -->
            <button
              @click.prevent="$emit('open-edit-modal', category)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/10 transition-all duration-150"
              :title="t('categories.edit')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
            </button>

            <!-- Delete -->
            <button
              @click.prevent="$emit('delete', category.id)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all duration-150"
              :title="t('categories.delete')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Pinned badge -->
        <div v-if="category.isPinned" class="mb-2">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path
                d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"
              />
            </svg>
            {{ t("categories.pin") }}
          </span>
        </div>

        <!-- Name -->
        <h3
          class="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1 line-clamp-1"
        >
          {{ category.name }}
        </h3>

        <!-- Description -->
        <p
          v-if="category.description"
          class="text-xs text-gray-500 dark:text-white/50 line-clamp-2 leading-relaxed mb-4 flex-1"
        >
          {{ category.description }}
        </p>
        <div v-else class="flex-1 mb-4" />

        <!-- Footer: vocab count + link -->
        <RouterLink
          :to="`/categories/${category.id}`"
          class="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group/link"
          :style="{
            backgroundColor: category.color + '12',
          }"
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ color: category.color }"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              />
            </svg>
            <span
              class="text-xs font-semibold"
              :style="{ color: category.color }"
            >
              {{ category.vocabularies?.length || 0 }}
              {{ t("categories.vocabularyCount") }}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
            :style="{ color: category.color }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </RouterLink>
      </div>
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

<style scoped>
.category-card {
  will-change: transform;
}
</style>
