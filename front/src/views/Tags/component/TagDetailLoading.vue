<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="i in 3" :key="i" class="animate-pulse">
      <div class="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64 w-full"></div>
      <div class="mt-4 h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
      <div class="mt-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
</template>
