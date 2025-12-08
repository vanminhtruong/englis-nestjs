<template>
  <div class="relative">
    <!-- Toggle Button -->
    <button
      @click="togglePicker"
      class="group relative p-2.5 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-secondary-500/20 border border-white/10 dark:border-white/10 hover:border-primary-500/40 transition-all duration-300 backdrop-blur-sm"
      :title="hasBackground ? 'Đổi nền' : 'Chọn nền'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 text-black/70 dark:text-white/70 group-hover:text-primary-500 transition-colors"
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
        class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-2 border-white dark:border-gray-900"
      ></span>
    </button>

    <!-- Picker Popup -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        v-click-outside="closePicker"
        class="absolute top-full right-0 mt-2 w-80 max-h-[70vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
      >
        <!-- Header -->
        <div
          class="p-4 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"
        >
          <div class="flex items-center justify-between">
            <h3
              class="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
            >
              ✨ Chọn Hình Nền
            </h3>
            <button
              v-if="hasBackground"
              @click="clearBackground"
              class="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium"
            >
              Xóa nền
            </button>
          </div>
        </div>

        <!-- Category Tabs -->
        <div
          class="flex gap-1 p-2 overflow-x-auto scrollbar-hide border-b border-black/5 dark:border-white/5"
        >
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="activeCategory = cat.value"
            class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            :class="
              activeCategory === cat.value
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'
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
        <div
          v-else
          class="p-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500/30 hover:scrollbar-thumb-primary-500/50"
        >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="bg in filteredBackgrounds"
              :key="bg.id"
              @click="selectBackground(bg)"
              class="group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300"
              :class="
                selectedId === bg.id
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
                v-if="selectedId === bg.id"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import api from "../../services/api.service";

interface Background {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
}

const props = defineProps<{
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const isOpen = ref(false);
const loading = ref(false);
const backgrounds = ref<Background[]>([]);
const activeCategory = ref("all");
const selectedId = ref<string | null>(null);

const categories = [
  { value: "all", label: "Tất cả", icon: "🌟" },
  { value: "nature", label: "Thiên nhiên", icon: "🌸" },
  { value: "city", label: "Thành phố", icon: "🌆" },
  { value: "abstract", label: "Nghệ thuật", icon: "🎨" },
  { value: "study", label: "Học tập", icon: "📚" },
  { value: "minimal", label: "Tối giản", icon: "🌙" },
  { value: "aesthetic", label: "Thẩm mỹ", icon: "✨" },
];

const hasBackground = computed(() => !!props.modelValue);

const filteredBackgrounds = computed(() => {
  if (activeCategory.value === "all") return backgrounds.value;
  return backgrounds.value.filter((bg) => bg.category === activeCategory.value);
});

const togglePicker = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && backgrounds.value.length === 0) {
    loadBackgrounds();
  }
};

const closePicker = () => {
  isOpen.value = false;
};

const loadBackgrounds = async () => {
  loading.value = true;
  try {
    const response = await api.background.getAll();
    backgrounds.value = response.data;
  } catch (error) {
    console.error("Failed to load backgrounds:", error);
  } finally {
    loading.value = false;
  }
};

const selectBackground = (bg: Background) => {
  selectedId.value = bg.id;
  emit("update:modelValue", bg.url);
  closePicker();
};

const clearBackground = () => {
  selectedId.value = null;
  emit("update:modelValue", null);
  closePicker();
};

// Update selectedId when modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const found = backgrounds.value.find((bg) => bg.url === newVal);
      if (found) selectedId.value = found.id;
    } else {
      selectedId.value = null;
    }
  },
  { immediate: true }
);

// Custom directive for click outside
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", el.clickOutsideEvent);
    }, 0);
  },
  unmounted(el: any) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

onMounted(() => {
  if (props.modelValue) {
    loadBackgrounds();
  }
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
}
</style>
