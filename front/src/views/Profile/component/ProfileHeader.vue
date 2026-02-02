<template>
  <div class="mb-10 relative">
    <!-- Decorative background element -->
    <div
      class="absolute -top-10 -left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10"
    ></div>

    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10"
    >
      <div>
        <h1
          class="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3"
        >
          {{ t("profile.title") }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">
          {{ t("profile.subtitle") }}
        </p>
      </div>

      <div class="flex gap-3">
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept=".xlsx, .xls"
          @change="onFileChange"
        />
        <button
          @click="triggerFileInput"
          class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 dark:hover:border-primary-400 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-primary-500"
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
          class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
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
