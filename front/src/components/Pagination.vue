<template>
  <div v-if="pageCount > 1" class="w-full flex items-center justify-center mt-8">
    <nav class="inline-flex items-center gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl">
      <button
        class="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(1)"
        :disabled="page === 1"
        aria-label="First page"
      >
        «
      </button>
      <button
        class="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(page - 1)"
        :disabled="page === 1"
        aria-label="Previous page"
      >
        ‹
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          class="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
          :class="p === page
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
            : 'text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'"
        >
          {{ p }}
        </button>
      </div>

      <button
        class="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(page + 1)"
        :disabled="page === pageCount"
        aria-label="Next page"
      >
        ›
      </button>
      <button
        class="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(pageCount)"
        :disabled="page === pageCount"
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageCount: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'page-change': [page: number]
}>()

function goToPage(p: number) {
  const target = Math.min(Math.max(1, p), props.pageCount)
  if (target !== props.page) {
    emit('update:page', target)
    emit('page-change', target)
  }
}

const visiblePages = computed(() => {
  const total = props.pageCount
  const current = props.page
  const span = 2
  const start = Math.max(1, current - span)
  const end = Math.min(total, current + span)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  if (pages[0] !== 1) pages.unshift(1)
  if (pages[pages.length - 1] !== total) pages.push(total)
  return Array.from(new Set(pages))
})
</script>
