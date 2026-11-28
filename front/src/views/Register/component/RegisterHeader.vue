<template>
  <div v-scroll-reveal class="text-center mb-8">
    <h1
      class="mb-2 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl"
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
