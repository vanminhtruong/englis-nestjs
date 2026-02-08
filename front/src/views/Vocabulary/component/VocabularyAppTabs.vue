<template>
  <div
    ref="tabsContainer"
    class="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar select-none cursor-grab active:cursor-grabbing"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- All Vocabularies Tab with Toggle -->
    <div class="relative flex items-center group" v-if="!isAllTabHidden">
      <button
        @click="handleTabClick(null)"
        :class="[
          'pl-4 pr-10 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm',
          !activeTabId
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
        ]"
      >
        All Vocabularies
      </button>
      <!-- Toggle Hide Button -->
      <button
        @click.stop="$emit('update:isAllTabHidden', true)"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all"
        :class="[
          !activeTabId
            ? 'text-white/60 hover:text-white hover:bg-white/20'
            : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100',
        ]"
        title="Hide All Vocabularies tab"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          ></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </button>
    </div>

    <!-- Collapsed Toggle Button (when All Vocabularies tab is hidden) -->
    <button
      v-else
      @click.stop="$emit('update:isAllTabHidden', false)"
      class="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
      title="Show All Vocabularies tab"
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
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span class="text-xs font-medium">All</span>
    </button>

    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="group relative flex items-center"
    >
      <button
        @click="handleTabClick(tab.id)"
        :class="[
          'pl-4 pr-16 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm',
          activeTabId === tab.id
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
        ]"
      >
        {{ tab.name }}
      </button>

      <!-- Tab Actions (Edit/Delete) -->
      <div
        class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
        :class="{ 'opacity-0 group-hover:opacity-100': activeTabId !== tab.id }"
      >
        <button
          v-if="activeTabId === tab.id"
          @click.stop="$emit('edit', tab)"
          class="p-0.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          title="Edit Name"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            ></path>
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            ></path>
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', tab)"
          class="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
          :class="
            activeTabId === tab.id
              ? 'text-white/70 hover:text-white hover:bg-red-500'
              : 'text-gray-500 dark:text-white/40'
          "
          title="Delete Tab"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
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

    <button
      @click="$emit('create')"
      class="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all ml-1 shrink-0"
      title="Create New Tab"
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
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  tabs: any[];
  activeTabId: string | null;
  isAllTabHidden?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string | null];
  create: [];
  edit: [tab: any];
  delete: [tab: any];
  "update:isAllTabHidden": [value: boolean];
}>();

const tabsContainer = ref<HTMLElement | null>(null);
const isDown = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const isDragging = ref(false);

const handleMouseDown = (e: MouseEvent) => {
  if (!tabsContainer.value) return;
  isDown.value = true;
  isDragging.value = false;
  startX.value = e.pageX - tabsContainer.value.offsetLeft;
  scrollLeft.value = tabsContainer.value.scrollLeft;
};

const handleMouseLeave = () => {
  isDown.value = false;
};

const handleMouseUp = () => {
  isDown.value = false;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDown.value || !tabsContainer.value) return;
  e.preventDefault();
  const x = e.pageX - tabsContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2; // scroll-fast factor
  if (Math.abs(walk) > 5) {
    isDragging.value = true;
  }
  tabsContainer.value.scrollLeft = scrollLeft.value - walk;
};

// Prevent click event if we were dragging
const handleTabClick = (id: string | null) => {
  if (!isDragging.value) {
    emit("select", id);
  }
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
