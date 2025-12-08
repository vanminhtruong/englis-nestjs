<template>
  <div
    class="rounded-2xl border p-6 transition-all duration-500 overflow-hidden relative hover:shadow-xl group"
    :class="[
      hasBackground || hasAnimatedBg
        ? 'border-white/20'
        : 'bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border-gray-200 dark:border-white/10',
    ]"
    :style="hasBackground && !hasAnimatedBg ? backgroundStyle : {}"
  >
    <!-- Animated Background -->
    <FlowerGrowAnimation v-if="hasAnimatedBg" />

    <!-- Static Background Overlay -->
    <div
      v-if="hasBackground && !hasAnimatedBg"
      class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/50 pointer-events-none z-0"
    ></div>

    <!-- Animated Background Overlay -->
    <div
      v-if="hasAnimatedBg"
      class="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 pointer-events-none z-[1]"
    ></div>

    <!-- Background Picker Button -->
    <button
      @click.stop="togglePicker"
      class="absolute top-3 right-3 z-20 p-2 rounded-xl transition-all duration-300"
      :class="
        hasBackground || hasAnimatedBg
          ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
          : 'bg-black/5 dark:bg-white/10 hover:bg-primary-500/20 opacity-0 group-hover:opacity-100'
      "
      :title="hasBackground || hasAnimatedBg ? 'Đổi nền' : 'Chọn nền'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 transition-colors"
        :class="
          hasBackground || hasAnimatedBg
            ? 'text-white'
            : 'text-black/60 dark:text-white/60'
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
        v-if="hasBackground || hasAnimatedBg"
        class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
      ></span>
    </button>

    <!-- Content -->
    <div
      class="relative z-10"
      :class="{ 'text-white': hasBackground || hasAnimatedBg }"
    >
      <slot :has-background="hasBackground || hasAnimatedBg"></slot>
    </div>

    <!-- Background Picker Popup -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPicker"
        class="absolute top-12 right-3 w-80 max-h-[70vh] bg-white dark:bg-black backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
      >
        <!-- Header -->
        <div
          class="p-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
        >
          <div class="flex items-center justify-between">
            <h3
              class="text-sm font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
            >
              ✨ {{ $t("background.selectBackground") }}
            </h3>
            <div class="flex gap-1">
              <button
                v-if="hasBackground || hasAnimatedBg"
                @click="clearBackground"
                class="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium"
              >
                {{ $t("background.clear") }}
              </button>
              <button
                @click="closePicker"
                class="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/60"
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

        <!-- Tab Switcher: Static / Animated -->
        <div class="flex border-b border-gray-200 dark:border-white/10">
          <button
            @click="bgType = 'static'"
            class="flex-1 py-2.5 text-xs font-medium transition-all"
            :class="
              bgType === 'static'
                ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-500/5'
                : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
            "
          >
            🖼️ Nền tĩnh
          </button>
          <button
            @click="bgType = 'animated'"
            class="flex-1 py-2.5 text-xs font-medium transition-all"
            :class="
              bgType === 'animated'
                ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-500/5'
                : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
            "
          >
            🌸 Nền động
          </button>
        </div>

        <!-- Static Backgrounds -->
        <template v-if="bgType === 'static'">
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
              {{ cat.icon }}
            </button>
          </div>

          <!-- Loading -->
          <div
            v-if="loading"
            class="p-6 flex flex-col items-center justify-center"
          >
            <div
              class="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"
            ></div>
          </div>

          <!-- Backgrounds Grid -->
          <div v-else class="p-2 max-h-[40vh] overflow-y-auto scrollbar-thin">
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="bg in filteredBackgrounds"
                :key="bg.id"
                @click="selectBackground(bg)"
                class="group relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all"
                :class="
                  selectedUrl === bg.url
                    ? 'border-primary-500 scale-[1.02]'
                    : 'border-transparent hover:border-white/30'
                "
              >
                <img
                  :src="bg.url"
                  :alt="bg.name"
                  class="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  v-if="selectedUrl === bg.url"
                  class="absolute top-0.5 right-0.5 w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </template>

        <!-- Animated Backgrounds -->
        <template v-else>
          <div class="p-3 max-h-[45vh] overflow-y-auto scrollbar-thin">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="anim in animatedBackgrounds"
                :key="anim.id"
                @click="selectAnimatedBg(anim.id)"
                class="relative aspect-video rounded-xl overflow-hidden border-2 transition-all group"
                :class="
                  selectedAnimatedBg === anim.id
                    ? 'border-primary-500 scale-[1.02] shadow-lg shadow-primary-500/25'
                    : 'border-gray-200 dark:border-white/10 hover:border-primary-300'
                "
              >
                <!-- Preview -->
                <div class="absolute inset-0" :class="anim.previewClass"></div>

                <!-- Label -->
                <div
                  class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="text-lg">{{ anim.icon }}</span>
                    <span class="text-xs text-white font-medium">{{
                      anim.name
                    }}</span>
                  </div>
                </div>

                <!-- Selected indicator -->
                <div
                  v-if="selectedAnimatedBg === anim.id"
                  class="absolute top-1.5 right-1.5 w-5 h-5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </template>
      </div>
    </Transition>

    <!-- Click outside overlay -->
    <div
      v-if="showPicker"
      class="fixed inset-0 z-40"
      @click="closePicker"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import api from "../../services/api.service";
import { useItemBackground } from "../../composables/useBackgroundState";

const FlowerGrowAnimation = defineAsyncComponent(
  () => import("../animations/FlowerGrowAnimation.vue") as any
);

interface Background {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
}

interface AnimatedBackground {
  id: string;
  name: string;
  icon: string;
  previewClass: string;
}

const props = defineProps<{
  itemId: string;
}>();

// Use background state for this specific item
const { backgroundUrl, backgroundStyle, hasBackground, setBackground } =
  useItemBackground(props.itemId);

const showPicker = ref(false);
const loading = ref(false);
const backgrounds = ref<Background[]>([]);
const categories = ref<{ value: string; label: string; icon: string }[]>([]);
const activeCategory = ref("all");
const bgType = ref<"static" | "animated">("static");
const selectedAnimatedBg = ref<string | null>(null);
const selectedUrl = computed(() => backgroundUrl.value);

// Check if has animated background
const hasAnimatedBg = computed(() => selectedAnimatedBg.value !== null);

// Animated backgrounds list (frontend only)
const animatedBackgrounds: AnimatedBackground[] = [
  {
    id: "flower-grow",
    name: "Hoa nở",
    icon: "🌸",
    previewClass:
      "bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900",
  },
];

// Load saved animated bg from localStorage
onMounted(() => {
  const savedAnimBg = localStorage.getItem(
    `vocabulary_anim_bg_${props.itemId}`
  );
  if (savedAnimBg) {
    selectedAnimatedBg.value = savedAnimBg;
  }
  if (backgroundUrl.value) {
    loadData();
  }
});

// Drag to scroll
const categoryTabsRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const hasDragged = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const startDrag = (e: MouseEvent) => {
  if (!categoryTabsRef.value) return;
  isDragging.value = true;
  hasDragged.value = false;
  startX.value = e.pageX - categoryTabsRef.value.offsetLeft;
  scrollLeft.value = categoryTabsRef.value.scrollLeft;
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !categoryTabsRef.value) return;
  e.preventDefault();
  const x = e.pageX - categoryTabsRef.value.offsetLeft;
  const walk = (x - startX.value) * 2;
  if (Math.abs(walk) > 5) {
    hasDragged.value = true;
  }
  categoryTabsRef.value.scrollLeft = scrollLeft.value - walk;
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
  if (showPicker.value && backgrounds.value.length === 0) {
    loadData();
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
  // Clear animated bg when selecting static
  selectedAnimatedBg.value = null;
  localStorage.removeItem(`vocabulary_anim_bg_${props.itemId}`);

  setBackground(bg.url);
  closePicker();
};

const selectAnimatedBg = (animId: string) => {
  // Clear static bg when selecting animated
  setBackground(null);

  selectedAnimatedBg.value = animId;
  localStorage.setItem(`vocabulary_anim_bg_${props.itemId}`, animId);
  closePicker();
};

const clearBackground = () => {
  setBackground(null);
  selectedAnimatedBg.value = null;
  localStorage.removeItem(`vocabulary_anim_bg_${props.itemId}`);
  closePicker();
};
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
  width: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(var(--primary-500), 0.3);
}
</style>
