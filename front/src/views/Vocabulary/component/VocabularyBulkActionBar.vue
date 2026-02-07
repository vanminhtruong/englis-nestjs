<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        class="flex items-center gap-4 px-6 py-4 bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl"
      >
        <!-- Selection Info -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold"
          >
            {{ selectedCount }}
          </div>
          <div>
            <p class="text-sm font-medium text-black dark:text-white">
              {{ selectedCount }} item{{
                selectedCount > 1 ? "s" : ""
              }}
              selected
            </p>
            <p class="text-xs text-gray-500 dark:text-white/50">
              Choose an action below
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-10 bg-gray-200 dark:bg-white/10"></div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Add to Tab -->
          <button
            @click="$emit('add-to-tab')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              ></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            Add to Tab
          </button>

          <!-- Select All Toggle -->
          <button
            @click="$emit('toggle-select-all')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path
                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
              ></path>
            </svg>
            {{ isAllSelected ? "Deselect All" : "Select All" }}
          </button>

          <!-- Clear Selection -->
          <button
            @click="$emit('clear-selection')"
            class="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 transition-all"
            title="Clear Selection"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number;
  isAllSelected: boolean;
}>();

defineEmits<{
  "add-to-tab": [];
  "toggle-select-all": [];
  "clear-selection": [];
}>();
</script>
