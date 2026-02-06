<template>
  <div class="mb-8 relative z-10">
    <div
      class="flex items-start md:items-center justify-between flex-col md:flex-row gap-4"
    >
      <div class="flex items-center gap-6">
        <button
          @click="$router.push('/tags')"
          class="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="relative group">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-105"
            :style="{
              backgroundColor: (tag.color || '#A855F7') + '20',
              color: tag.color || '#A855F7',
              border: `2px solid ${tag.color || '#A855F7'}`,
            }"
          >
            #
          </div>
          <div
            class="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ tag.name }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl">
            {{ tag.description || "No description" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tag: any;
}>();
</script>
