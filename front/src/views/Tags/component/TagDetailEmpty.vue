<template>
  <div class="text-center py-20">
    <div
      class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-12 h-12 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        ></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    </div>
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
      No Vocabularies Found
    </h3>
    <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
      There are no vocabularies associated with this tag yet.
    </p>
    <button
      @click="$router.push('/vocabulary')"
      class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
    >
      View All Vocabulary
    </button>
  </div>
</template>
