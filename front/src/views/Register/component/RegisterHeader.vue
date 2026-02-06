<template>
  <div class="text-center mb-8">
    <h1
      class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
    >
      {{ t("register.title") }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400">
      {{ t("register.subtitle") }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  t: (key: string) => string;
}>();
</script>
