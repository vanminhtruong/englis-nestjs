<template>
  <button
    @click="$emit('toggle')"
    class="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2 text-left">
      <component :is="iconComponent" :color="category.color" class="w-5 h-5 shrink-0" />
      <span class="min-w-0 truncate font-semibold">{{ category.name }}</span>
      <span class="shrink-0 text-sm text-black/50 dark:text-white/60"
        >({{ vocabularyCount }})</span
      >
    </div>
    <div class="flex shrink-0 items-center gap-1 sm:gap-2">
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
        class="h-7 w-7 p-1 shrink-0 rounded-full bg-black/5 text-black/60 transition-transform dark:bg-white/10 dark:text-white/70"
        :class="{ 'rotate-180': isExpanded }" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
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
