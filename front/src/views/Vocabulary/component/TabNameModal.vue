<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all border border-gray-200 dark:border-white/10"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2
            class="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          >
            {{ isEditing ? "Edit Tab" : "Create New Tab" }}
          </h2>
          <button
            @click="$emit('close')"
            class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-gray-500 dark:text-white/60"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit">
          <div class="mb-6">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2"
            >
              Tab Name
            </label>
            <input
              v-model="tabName"
              type="text"
              ref="inputRef"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Enter tab name..."
              required
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!tabName.trim()"
              class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isEditing ? "Save Changes" : "Create Tab" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  initialName?: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [name: string];
}>();

const tabName = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      tabName.value = props.initialName || "";
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

function handleSubmit() {
  if (tabName.value.trim()) {
    emit("submit", tabName.value.trim());
  }
}
</script>
