<template>
  <div class="mt-6 text-center">
    <p class="text-gray-600 dark:text-gray-400">
      {{ t("register.haveAccount") }}
      <RouterLink
        to="/login"
        class="text-primary-500 hover:text-primary-600 font-semibold ml-1"
      >
        {{ t("register.login") }}
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  t: (key: string) => string;
}>();
</script>
