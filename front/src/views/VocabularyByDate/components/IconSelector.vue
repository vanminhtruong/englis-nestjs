<template>
  <div class="relative">
    <button
      type="button"
      @click.stop="togglePicker"
      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
      :class="{ 'bg-gray-100 dark:bg-white/10': showPicker }"
      title="Select Icon"
    >
      <component
        v-if="modelValue"
        :is="getIconComponent(modelValue)"
        class="w-4 h-4"
        :color="color"
      />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </button>

    <!-- Icon Picker Popover -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showPicker"
        class="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl w-64 z-50 transform -translate-x-1/4"
        @click.stop
      >
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search icons..."
          class="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2 text-gray-900 dark:text-white"
          autoFocus
        />

        <!-- Grid -->
        <div
          class="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto custom-scrollbar"
        >
          <button
            v-for="icon in filteredIcons"
            :key="icon"
            type="button"
            @click="selectIcon(icon)"
            class="aspect-square rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all p-1.5"
            :class="{
              'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400':
                modelValue === icon,
              'text-gray-500 dark:text-gray-400': modelValue !== icon,
            }"
            :title="icon"
          >
            <component :is="getIconComponent(icon)" class="w-full h-full" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// Icon selector component for picking icons from a grid
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getIconComponent } from "../../../utils/iconRenderer";

const props = defineProps<{
  modelValue: string;
  color?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const showPicker = ref(false);
const searchQuery = ref("");

const iconList = [
  "folder",
  "dollar-sign",
  "tablet",
  "graduation-cap",
  "pencil",
  "feather",
  "code",
  "smile",
  "music",
  "trash",
  "scissors",
  "palette",
  "sparkles",
  "flower",
  "lotus",
  "camera",
  "bar-chart",
  "disc",
  "dumbbell",
  "book",
  "scales",
  "mic",
  "plane",
  "globe",
  "wrench",
  "paw-print",
  "flask",
  "target",
  "heart",
  "coffee",
  "star",
  "sun",
  "moon",
  "cloud",
  "umbrella",
  "zap",
  "gift",
  "award",
  "crown",
  "key",
  "lock",
  "unlock",
  "bell",
  "calendar",
  "clock",
  "watch",
  "timer",
  "map",
  "flag",
  "tag",
  "bookmark",
];

const filteredIcons = computed(() => {
  if (!searchQuery.value.trim()) return iconList;
  return iconList.filter((icon) =>
    icon.includes(searchQuery.value.toLowerCase())
  );
});

function togglePicker() {
  showPicker.value = !showPicker.value;
  if (showPicker.value) {
    searchQuery.value = "";
  }
}

function selectIcon(icon: string) {
  emit("update:modelValue", icon);
  showPicker.value = false;
}

// Close on click outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".relative")) {
    showPicker.value = false;
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
