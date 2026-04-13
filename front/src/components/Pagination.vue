<template>
  <div
    v-if="pageCount > 1"
    class="w-full flex items-center justify-center mt-8"
  >
    <nav
      class="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-lg"
    >
      <!-- First Page -->
      <button
        class="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
        @click="goToPage(1)"
        :disabled="page === 1"
        aria-label="First page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>

      <!-- Previous Page -->
      <button
        class="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
        @click="goToPage(page - 1)"
        :disabled="page === 1"
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Pages -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="p in visiblePages"
          :key="'page-' + p"
          @click="goToPage(p)"
          class="relative flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group active:scale-95"
          :class="
            p === page
              ? 'text-white shadow-[0_0_15px_rgba(102,126,234,0.5)]'
              : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-primary-500'
          "
        >
          <!-- Background for active state -->
          <div
            v-if="p === page"
            class="absolute inset-0 bg-gradient-to-tr from-primary-500 to-secondary-500 opacity-100"
          ></div>

          <!-- Hover effect background for non-active -->
          <div
            v-else
            class="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors"
          ></div>

          <span class="relative z-10">{{ p }}</span>
        </button>
      </div>

      <!-- Next Page -->
      <button
        class="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
        @click="goToPage(page + 1)"
        :disabled="page === pageCount"
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Last Page -->
      <button
        class="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
        @click="goToPage(pageCount)"
        :disabled="page === pageCount"
        aria-label="Last page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  page: number;
  pageCount: number;
}>();

const emit = defineEmits<{
  "update:page": [page: number];
  "page-change": [page: number];
}>();

function goToPage(p: number) {
  const target = Math.min(Math.max(1, p), props.pageCount);
  if (target !== props.page) {
    emit("update:page", target);
    emit("page-change", target);
  }
}

const visiblePages = computed(() => {
  const total = props.pageCount;
  const current = props.page;

  // Sliding window with max 3 pages
  const range: number[] = [];
  const maxVisible = 3;

  if (total <= maxVisible) {
    // Show all pages if total is 3 or less
    for (let i = 1; i <= total; i++) {
      range.push(i);
    }
  } else {
    // Calculate sliding window
    let start = current - 1;
    let end = current + 1;

    // Adjust start to ensure we show 3 pages
    if (start < 1) {
      start = 1;
      end = Math.min(3, total);
    } else if (end > total) {
      end = total;
      start = Math.max(1, total - 2);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
  }

  return range;
});
</script>
