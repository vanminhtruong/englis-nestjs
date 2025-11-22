<template>
  <div class="mb-8">
    <RouterLink
      to="/categories"
      class="inline-flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-primary-500 dark:hover:text-primary-400 mb-4"
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
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      {{ t("categories.title") }}
    </RouterLink>

    <div class="flex items-center gap-4">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center"
        :style="{ backgroundColor: category.color + '30' }"
      >
        <component
          :is="getIconComponent(category.icon)"
          :color="category.color"
          class="w-10 h-10"
        />
      </div>
      <div>
        <h1 class="text-4xl font-bold text-black dark:text-white">
          {{ category.name }}
        </h1>
        <p
          v-if="category.description"
          class="text-black/60 dark:text-white/60 mt-1"
        >
          {{ category.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { getIconComponent } from "../../../utils/iconRenderer";

defineProps<{
  category: any;
}>();

const { t } = useI18n();
</script>
