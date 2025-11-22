<template>
  <div class="text-center py-12">
    <div class="text-6xl mb-4">📚</div>
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {{ t("categories.noCategories") }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ t("categories.addFirstCategory") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
