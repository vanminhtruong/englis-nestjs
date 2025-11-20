<template>
  <div class="relative inline-flex items-center">
    <input
      :id="id"
      type="checkbox"
      :checked="checked"
      @change="$emit('change', $event)"
      class="peer sr-only"
    />
    <label
      :for="id"
      class="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition-all duration-300 ease-out border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:scale-110 hover:shadow-lg hover:shadow-primary-500/30 peer-checked:border-primary-500 peer-checked:bg-gradient-to-br peer-checked:from-primary-500 peer-checked:to-secondary-500 peer-checked:shadow-lg peer-checked:shadow-primary-500/40 peer-focus:ring-2 peer-focus:ring-primary-500/50 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-900 group"
    >
      <!-- Checkmark Icon -->
      <svg
        class="absolute h-4 w-4 text-white opacity-0 scale-0 transition-all duration-300 ease-out peer-checked:opacity-100 peer-checked:scale-100"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>

      <!-- Hover Glow Effect -->
      <div
        class="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-30"
      ></div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  checked: boolean;
  id?: string;
}>();

defineEmits<{
  change: [event: Event];
}>();

const id = computed(
  () => props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
);
</script>

<script lang="ts">
export default {
  name: "CustomCheckbox",
};
</script>
