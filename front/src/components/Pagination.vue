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
        <template v-for="(p, index) in visiblePages">
          <!-- Ellipsis -->
          <span
            v-if="p === '...'"
            :key="'ellipsis-' + index"
            class="flex items-center justify-center w-10 h-10 text-gray-400 font-medium"
          >
            •••
          </span>
          <!-- Page Number -->
          <button
            v-else
            :key="'page-' + p"
            @click="goToPage(Number(p))"
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
        </template>
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
  const delta = 1; // Number of pages to show before and after current page

  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift("..." as any);
  }
  if (current + delta < total - 1) {
    range.push("..." as any);
  }

  range.unshift(1);
  if (total !== 1) {
    range.push(total);
  }

  return range;
});
</script>
