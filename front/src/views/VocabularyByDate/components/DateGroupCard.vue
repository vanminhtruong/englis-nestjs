<template>
  <div
    ref="cardRef"
    class="rounded-2xl border shadow-lg transition-all duration-500 overflow-hidden relative"
    :class="[
      hasBackground
        ? 'border-white/20 dark:border-white/10'
        : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10',
    ]"
    :style="hasBackground ? backgroundStyle : {}"
  >
    <!-- Background Overlay -->
    <div
      v-if="hasBackground"
      class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/50 pointer-events-none z-0"
    ></div>

    <!-- Content Container -->
    <div class="relative z-10">
      <!-- Header with Background Picker -->
      <div class="flex items-center">
        <div class="flex-1">
          <slot name="header" :has-background="hasBackground"></slot>
        </div>
        <!-- Background Picker Button -->
        <div class="px-4 py-2">
          <button
            @click="togglePicker"
            class="group relative p-2.5 rounded-xl transition-all duration-300"
            :class="
              hasBackground
                ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                : 'bg-white/10 dark:bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/40'
            "
            :title="hasBackground ? 'Đổi nền' : 'Chọn nền'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 transition-colors"
              :class="
                hasBackground
                  ? 'text-white'
                  : 'text-black/70 dark:text-white/70 group-hover:text-primary-500'
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span
              v-if="hasBackground"
              class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-2 border-white"
            ></span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <slot></slot>
    </div>

    <!-- Background Picker Popup - Teleported to body -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="showPicker"
          class="fixed w-80 max-h-[50vh] bg-white dark:bg-black backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-[9999]"
          :style="pickerPosition"
        >
          <!-- Header -->
          <div
            class="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
              >
                ✨ {{ $t("background.selectBackground") }}
              </h3>
              <div class="flex gap-2">
                <button
                  v-if="hasBackground"
                  @click="clearBackground"
                  class="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium"
                >
                  {{ $t("background.clear") }}
                </button>
                <button
                  @click="closePicker"
                  class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/60"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Category Tabs -->
          <div
            ref="categoryTabsRef"
            class="flex gap-1.5 p-2.5 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 cursor-grab active:cursor-grabbing select-none"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          >
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectCategory(cat.value)"
              class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              :class="
                activeCategory === cat.value
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white dark:bg-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10'
              "
            >
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>

          <!-- Loading -->
          <div
            v-if="loading"
            class="p-8 flex flex-col items-center justify-center"
          >
            <div
              class="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"
            ></div>
            <p class="mt-3 text-sm text-black/50 dark:text-white/50">
              Đang tải...
            </p>
          </div>

          <!-- Backgrounds Grid -->
          <div v-else class="p-3 max-h-[35vh] overflow-y-auto scrollbar-thin">
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="bg in filteredBackgrounds"
                :key="bg.id"
                @click="selectBackground(bg)"
                class="group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300"
                :class="
                  selectedUrl === bg.url
                    ? 'border-primary-500 shadow-lg shadow-primary-500/25 scale-[1.02]'
                    : 'border-transparent hover:border-white/30 hover:scale-[1.02]'
                "
              >
                <img
                  :src="bg.url"
                  :alt="bg.name"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <!-- Overlay -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div
                    class="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-medium truncate"
                  >
                    {{ bg.icon }} {{ bg.name }}
                  </div>
                </div>
                <!-- Selected Indicator -->
                <div
                  v-if="selectedUrl === bg.url"
                  class="absolute top-1 right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-if="filteredBackgrounds.length === 0"
              class="text-center py-8 text-black/50 dark:text-white/50"
            >
              <div class="text-4xl mb-2">🖼️</div>
              <p class="text-sm">Không có hình nền nào</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Click outside overlay -->
      <div
        v-if="showPicker"
        class="fixed inset-0 z-[9998]"
        @click="closePicker"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import api from "../../../services/api.service";
import { useItemBackground } from "../../../composables/useBackgroundState";

interface Background {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
}

const props = defineProps<{
  itemId: string;
}>();

// Card reference for position calculation
const cardRef = ref<HTMLElement | null>(null);

// Use background state for this specific item
const { backgroundUrl, backgroundStyle, hasBackground, setBackground } =
  useItemBackground(props.itemId);

const showPicker = ref(false);
const loading = ref(false);
const backgrounds = ref<Background[]>([]);
const categories = ref<{ value: string; label: string; icon: string }[]>([]);
const activeCategory = ref("all");
const selectedUrl = computed(() => backgroundUrl.value);

// Reactive picker position
const pickerPosition = ref({ top: "100px", right: "20px" });

const updatePickerPosition = () => {
  if (!cardRef.value) return;
  const rect = cardRef.value.getBoundingClientRect();
  pickerPosition.value = {
    top: `${rect.top + 60}px`,
    right: `${window.innerWidth - rect.right + 10}px`,
  };
};

// Handle scroll - close picker when scrolling
const handleScroll = () => {
  if (showPicker.value) {
    requestAnimationFrame(updatePickerPosition);
  }
};

// Drag to scroll
const categoryTabsRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const hasDragged = ref(false);
const startX = ref(0);
const scrollLeftVal = ref(0);

const startDrag = (e: MouseEvent) => {
  if (!categoryTabsRef.value) return;
  isDragging.value = true;
  hasDragged.value = false;
  startX.value = e.pageX - categoryTabsRef.value.offsetLeft;
  scrollLeftVal.value = categoryTabsRef.value.scrollLeft;
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !categoryTabsRef.value) return;
  e.preventDefault();
  const x = e.pageX - categoryTabsRef.value.offsetLeft;
  const walk = (x - startX.value) * 2;
  if (Math.abs(walk) > 5) {
    hasDragged.value = true;
  }
  categoryTabsRef.value.scrollLeft = scrollLeftVal.value - walk;
};

const stopDrag = () => {
  isDragging.value = false;
};

const selectCategory = (value: string) => {
  if (!hasDragged.value) {
    activeCategory.value = value;
  }
  hasDragged.value = false;
};

const filteredBackgrounds = computed(() => {
  if (activeCategory.value === "all") return backgrounds.value;
  return backgrounds.value.filter((bg) => bg.category === activeCategory.value);
});

const togglePicker = () => {
  showPicker.value = !showPicker.value;
  if (showPicker.value) {
    updatePickerPosition();
    if (backgrounds.value.length === 0) {
      loadData();
    }
  }
};

const closePicker = () => {
  showPicker.value = false;
};

const loadData = async () => {
  loading.value = true;
  try {
    const [bgResponse, catResponse] = await Promise.all([
      api.background.getAll(),
      api.background.getCategories(),
    ]);
    backgrounds.value = bgResponse.data;
    categories.value = catResponse.data;
  } catch (error) {
    console.error("Failed to load backgrounds:", error);
  } finally {
    loading.value = false;
  }
};

const selectBackground = (bg: Background) => {
  setBackground(bg.url);
  closePicker();
};

const clearBackground = () => {
  setBackground(null);
  closePicker();
};

onMounted(() => {
  if (backgroundUrl.value) {
    loadData();
  }
  // Add scroll listener to parent scrollable elements
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", closePicker);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", closePicker);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(var(--primary-500), 0.3);
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary-500), 0.5);
}
</style>
