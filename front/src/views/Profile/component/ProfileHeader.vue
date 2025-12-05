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
    <div class="flex gap-2">
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept=".xlsx, .xls"
        @change="onFileChange"
      />
      <button
        @click="triggerFileInput"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {{ t("profile.importData") }}
      </button>
      <button
        @click="$emit('export')"
        class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {{ t("profile.exportData") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "export"): void;
  (e: "import", file: File): void;
}>();

defineProps<{
  t: (key: string) => string;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit("import", target.files[0]);
    target.value = ""; // Reset input
  }
};
</script>
