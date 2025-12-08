<template>
  <button
    @click="$emit('toggle')"
    class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
  >
    <div class="flex items-center gap-2">
      <component :is="iconComponent" :color="category.color" class="w-5 h-5" />
      <span class="font-semibold">{{ category.name }}</span>
      <span class="text-sm text-black/50 dark:text-white/60"
        >({{ vocabularyCount }})</span
      >
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500 dark:text-primary-400 transition-colors"
        :title="moveToDateText"
        @click.stop="$emit('move')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-black/40 dark:text-white/50 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  vocabularyCount: number;
  iconComponent: Component;
  isExpanded: boolean;
  moveToDateText: string;
}>();

defineEmits<{
  toggle: [];
  move: [];
}>();
</script>
