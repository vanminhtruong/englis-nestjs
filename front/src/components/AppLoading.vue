<template>
  <div class="flex items-center justify-center py-24">
    <div class="relative">
      <div
        class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
      ></div>
      <div
        class="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-600"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: "...",
});
</script>

<style scoped>
/* Không cần CSS tùy chỉnh thêm vì đã dùng Tailwind chuẩn */
</style>
