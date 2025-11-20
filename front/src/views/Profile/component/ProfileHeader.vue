<template>
  <div
    class="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
      >
        {{ t("profile.title") }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t("profile.subtitle") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  t: (key: string) => string;
}>();
</script>
