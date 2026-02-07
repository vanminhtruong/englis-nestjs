<template>
  <div class="relative">
    <button
      ref="triggerRef"
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
    <Teleport to="body">
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
          ref="pickerRef"
          class="fixed p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl w-64 z-[9999]"
          :style="pickerStyle"
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Icon selector component for picking icons from a grid
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
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
const triggerRef = ref<HTMLElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);
const pickerPosition = ref({ top: 0, left: 0 });

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

const pickerStyle = computed(() => ({
  top: `${pickerPosition.value.top}px`,
  left: `${pickerPosition.value.left}px`,
}));

function updatePosition() {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const pickerWidth = 256; // w-64 = 16rem = 256px
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = rect.left - pickerWidth / 4; // Center relative to button by moving left 1/4 width as per original logic? No, original had -translate-x-1/4

  // Check right boundary
  if (left + pickerWidth > windowWidth - 20) {
    left = windowWidth - pickerWidth - 20;
  }
  // Check left boundary
  if (left < 20) {
    left = 20;
  }

  // Check bottom boundary for top position
  let top = rect.bottom + 16;
  const pickerHeight = 250; // Approximate max height

  if (top + pickerHeight > windowHeight - 20) {
    // If not enough space below, show above
    top = rect.top - pickerHeight - 16;
  }

  pickerPosition.value = { top, left };
}

function togglePicker() {
  showPicker.value = !showPicker.value;
  if (showPicker.value) {
    searchQuery.value = "";
    nextTick(() => {
      updatePosition();
    });
  }
}

function selectIcon(icon: string) {
  emit("update:modelValue", icon);
  showPicker.value = false;
}

// Close on click outside or resize/scroll
function handleClickOutside(e: MouseEvent) {
  if (!showPicker.value) return;
  const target = e.target as HTMLElement;
  if (
    pickerRef.value &&
    !pickerRef.value.contains(target) &&
    triggerRef.value &&
    !triggerRef.value.contains(target)
  ) {
    showPicker.value = false;
  }
}

function handleScroll() {
  if (showPicker.value) {
    requestAnimationFrame(updatePosition);
  }
}

function handleResize() {
  if (showPicker.value) {
    requestAnimationFrame(updatePosition);
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
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
