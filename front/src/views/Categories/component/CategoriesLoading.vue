<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
  >
    <div
      v-for="i in 8"
      :key="i"
      class="bg-white dark:bg-black border border-black/8 dark:border-white/10 rounded-2xl overflow-hidden"
    >
      <!-- Top bar skeleton -->
      <div class="h-1 w-full shimmer" />

      <div class="p-5 space-y-4">
        <!-- Icon + actions row -->
        <div class="flex items-start justify-between">
          <div class="w-11 h-11 rounded-xl shimmer" />
          <div class="flex gap-1">
            <div v-for="j in 3" :key="j" class="w-8 h-8 rounded-lg shimmer" />
          </div>
        </div>

        <!-- Name -->
        <div class="h-4 w-3/4 rounded-lg shimmer" />

        <!-- Description lines -->
        <div class="space-y-1.5">
          <div class="h-3 w-full rounded-md shimmer" />
          <div class="h-3 w-2/3 rounded-md shimmer" />
        </div>

        <!-- Footer -->
        <div class="h-9 w-full rounded-xl shimmer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 25%,
    rgba(0, 0, 0, 0.09) 50%,
    rgba(0, 0, 0, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

@media (prefers-color-scheme: dark) {
  .shimmer {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04) 25%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.04) 75%
    );
    background-size: 200% 100%;
  }
}

:global(.dark) .shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
