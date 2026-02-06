<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-black dark:via-black dark:to-black flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>
