<template>
  <div
    class="flex min-h-[100dvh] min-w-0 items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-3 py-6 dark:from-black dark:via-black dark:to-black sm:p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="min-w-0 rounded-2xl bg-white p-5 shadow-2xl backdrop-blur-lg dark:bg-white/5 min-[380px]:p-6 sm:rounded-3xl sm:p-8"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>
