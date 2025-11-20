<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div
          class="w-full h-[90vh] max-w-6xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t("common.avatarPreview") }}
                </p>
                <p
                  v-if="userName"
                  class="text-xs text-gray-500 dark:text-gray-400 truncate"
                >
                  {{ userName }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                :class="
                  isSharpened
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                "
                @click.stop="toggleSharpen"
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
                    d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
                  />
                </svg>
                Làm nét
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                @click.stop="reset"
              >
                {{ t("vocabulary.resetImage") }}
              </button>
              <button
                class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20"
                @click.stop="close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="relative bg-black/5 dark:bg-white/5 flex-1 min-h-[300px]">
            <div class="absolute top-3 right-3 flex items-center gap-2">
              <button
                class="w-9 h-9 rounded-full bg-white/80 dark:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center shadow-md"
                @click.stop="zoomOut"
              >
                <span class="text-xl leading-none">-</span>
              </button>
              <button
                class="w-9 h-9 rounded-full bg-white/80 dark:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center shadow-md"
                @click.stop="zoomIn"
              >
                <span class="text-xl leading-none">+</span>
              </button>
            </div>

            <div
              v-if="src"
              class="w-full h-full overflow-hidden"
              ref="viewportRef"
            >
              <div
                class="w-full h-full flex items-center justify-center"
                :style="viewportStyle"
              >
                <img
                  :src="src"
                  :alt="userName"
                  :style="imageStyle"
                  class="max-w-full max-h-[80vh] select-none rounded-xl"
                  @wheel.prevent="handleWheel"
                  @mousedown.prevent="startDrag"
                  draggable="false"
                />
              </div>
            </div>
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm"
            >
              {{ t("vocabulary.noImage") }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- SVG Filter Definition -->
    <svg
      style="width: 0; height: 0; position: absolute"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="sharpen-filter" color-interpolation-filters="sRGB">
          <!-- Super Sharp Unsharp Mask
               stdDeviation="0.5": Targets very fine details (individual pixels)
               k2="3.5", k3="-2.5": High amount of sharpening (2.5x boost to edges)
          -->
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
          <feComposite
            in="SourceGraphic"
            in2="blur"
            operator="arithmetic"
            k1="0"
            k2="3.5"
            k3="-2.5"
            k4="0"
          />
        </filter>
      </defs>
    </svg>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  src: string;
  userName?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { t } = useI18n();

const zoom = ref(1);
const originalOverflow = ref<string | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragOrigin = ref({ x: 0, y: 0 });
const translation = ref({ x: 0, y: 0 });
const isSharpened = ref(false);

const imageStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transition: isDragging.value ? "none" : "transform 0.2s ease-out",
  filter: isSharpened.value ? "url(#sharpen-filter)" : "none",
  imageRendering: isSharpened.value ? "pixelated" : "auto",
}));

const viewportStyle = computed(() => ({
  transform: `translate(${translation.value.x}px, ${translation.value.y}px)`,
  cursor: zoom.value > 1 ? (isDragging.value ? "grabbing" : "grab") : "default",
  transition: isDragging.value ? "none" : "transform 0.2s ease-out",
}));

const close = () => {
  emit("close");
};

const toggleSharpen = () => {
  isSharpened.value = !isSharpened.value;
};

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.2, 3);
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.2, 0.5);
  if (zoom.value <= 1) {
    translation.value = { x: 0, y: 0 };
  }
};

const reset = () => {
  zoom.value = 1;
  translation.value = { x: 0, y: 0 };
};

const handleWheel = (event: WheelEvent) => {
  if (event.deltaY < 0) {
    zoomIn();
  } else if (event.deltaY > 0) {
    zoomOut();
  }
};

const lockBodyScroll = () => {
  if (typeof document === "undefined") return;
  if (originalOverflow.value === null) {
    originalOverflow.value = document.documentElement.style.overflow || "";
  }
  document.documentElement.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
  if (typeof document === "undefined") return;
  if (originalOverflow.value !== null) {
    document.documentElement.style.overflow = originalOverflow.value;
    originalOverflow.value = null;
  }
};

const startDrag = (event: MouseEvent) => {
  if (zoom.value <= 1) return;
  isDragging.value = true;
  dragStart.value = { x: event.clientX, y: event.clientY };
  dragOrigin.value = { ...translation.value };
  window.addEventListener("mousemove", handleDrag);
  window.addEventListener("mouseup", stopDrag);
};

const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value) return;
  const dx = event.clientX - dragStart.value.x;
  const dy = event.clientY - dragStart.value.y;
  translation.value = {
    x: dragOrigin.value.x + dx,
    y: dragOrigin.value.y + dy,
  };
};

const stopDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  window.removeEventListener("mousemove", handleDrag);
  window.removeEventListener("mouseup", stopDrag);
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      reset();
      lockBodyScroll();
    } else {
      unlockBodyScroll();
      stopDrag();
    }
  }
);

onBeforeUnmount(() => {
  unlockBodyScroll();
  stopDrag();
});

const visible = computed(() => props.visible);
const src = computed(() => props.src);
const userName = computed(() => props.userName || "");
</script>

<style scoped>
img {
  cursor: grab;
}

img:active {
  cursor: grabbing;
}
</style>
