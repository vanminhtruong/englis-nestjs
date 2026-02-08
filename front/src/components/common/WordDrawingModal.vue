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
          class="w-full h-[90vh] max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 flex-shrink-0"
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
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t("vocabulary.wordDrawer") }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("vocabulary.drawYourWord") }}
                </p>
              </div>
            </div>
            <button
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
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

          <!-- Main Content -->
          <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <!-- Drawing Canvas Area -->
            <div class="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
              <!-- Canvas Container -->
              <div
                class="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 border-2 border-dashed border-gray-300 dark:border-white/20"
              >
                <canvas
                  ref="canvasRef"
                  class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  @mousedown="startDrawing"
                  @mousemove="draw"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart.prevent="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
                  @touchend.prevent="stopDrawing"
                ></canvas>

                <!-- Empty State Hint -->
                <div
                  v-if="!hasDrawn"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div class="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                    >
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                    <p class="text-gray-400 dark:text-gray-500 text-sm">
                      {{ t("vocabulary.startDrawing") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tools & Preview Panel -->
            <div
              class="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/10 p-4 lg:p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50/50 dark:bg-white/5"
            >
              <!-- Word Input Section -->
              <div
                class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-700/50 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {{ t("vocabulary.word") }}
                  <span
                    class="text-xs text-emerald-600 dark:text-emerald-400 font-normal ml-auto"
                    >{{ t("vocabulary.requiredField") }}</span
                  >
                </h3>

                <!-- OCR Language Selector -->
                <div class="mb-3">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-1 block"
                    >{{ t("vocabulary.ocrLanguage") }}</label
                  >
                  <select
                    v-model="ocrLanguage"
                    class="w-full px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                    style="
                      background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2310b981%27 stroke-width=%272%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E');
                      background-position: right 0.5rem center;
                      background-size: 1.25rem;
                    "
                  >
                    <option
                      value="chi_sim"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      中文 (简体)
                    </option>
                    <option
                      value="chi_tra"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      中文 (繁體)
                    </option>
                    <option
                      value="eng"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      English
                    </option>
                    <option
                      value="jpn"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      日本語
                    </option>
                    <option
                      value="kor"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      한국어
                    </option>
                    <option
                      value="vie"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      Tiếng Việt
                    </option>
                  </select>
                </div>

                <!-- Recognize Button -->
                <button
                  type="button"
                  @click="recognizeText"
                  :disabled="!hasDrawn || isRecognizing"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    v-if="isRecognizing"
                    class="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {{
                    isRecognizing
                      ? t("vocabulary.recognizing")
                      : t("vocabulary.recognizeDrawing")
                  }}
                </button>

                <!-- Word Input -->
                <input
                  v-model="wordText"
                  type="text"
                  :placeholder="t('vocabulary.enterWordHere')"
                  class="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-medium"
                />
                <p class="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  {{ t("vocabulary.wordInputHint") }}
                </p>
              </div>

              <!-- Preview Section -->
              <div
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t("vocabulary.preview") }}
                </h3>
                <div
                  class="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 border border-gray-200 dark:border-white/10"
                >
                  <img
                    v-if="previewDataUrl"
                    :src="previewDataUrl"
                    alt="Preview"
                    class="w-full h-full object-contain"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <span class="text-gray-400 dark:text-gray-500 text-xs">{{
                      t("vocabulary.noPreview")
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Brush Tools -->
              <div
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-secondary-500"></span>
                  {{ t("vocabulary.brushSettings") }}
                </h3>

                <!-- Brush Size -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("vocabulary.brushSize") }}: {{ brushSize }}px</label
                  >
                  <input
                    type="range"
                    v-model.number="brushSize"
                    min="1"
                    max="50"
                    class="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                <!-- Brush Color -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("vocabulary.brushColor") }}</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in colorPalette"
                      :key="color"
                      @click="brushColor = color"
                      :class="[
                        'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                        brushColor === color
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                          : 'border-gray-300 dark:border-white/20',
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                    <div class="relative">
                      <input
                        type="color"
                        v-model="brushColor"
                        class="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer"
                      />
                      <div
                        class="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-white/20 flex items-center justify-center bg-gradient-to-br from-red-500 via-green-500 to-blue-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-4 h-4 text-white drop-shadow"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tool Selection -->
                <div>
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("vocabulary.tool") }}</label
                  >
                  <div class="flex gap-2">
                    <button
                      @click="currentTool = 'brush'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        currentTool === 'brush'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20',
                      ]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"
                        />
                        <path
                          d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"
                        />
                      </svg>
                      {{ t("vocabulary.brush") }}
                    </button>
                    <button
                      @click="currentTool = 'eraser'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        currentTool === 'eraser'
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20',
                      ]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.8 2.4c.8-.8 2-.8 2.8 0L21 6.8c.8.8.8 2 0 2.8L12 18.6"
                        />
                        <path d="M5 18H2" />
                      </svg>
                      {{ t("vocabulary.eraser") }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  {{ t("vocabulary.actions") }}
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="undoLast"
                    :disabled="historyIndex < 0"
                    class="py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    {{ t("vocabulary.undo") }}
                  </button>
                  <button
                    @click="redoLast"
                    :disabled="historyIndex >= history.length - 1"
                    class="py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    {{ t("vocabulary.redo") }}
                  </button>
                  <button
                    @click="clearCanvas"
                    class="col-span-2 py-2 px-3 rounded-lg text-sm font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                    {{ t("vocabulary.clearCanvas") }}
                  </button>
                </div>
              </div>

              <!-- Background Settings -->
              <div
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {{ t("vocabulary.background") }}
                </h3>
                <div class="flex gap-2">
                  <button
                    @click="canvasBackground = 'white'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      canvasBackground === 'white'
                        ? 'border-primary-500 bg-white text-gray-900'
                        : 'border-gray-200 dark:border-white/10 bg-white text-gray-600',
                    ]"
                  >
                    {{ t("vocabulary.white") }}
                  </button>
                  <button
                    @click="canvasBackground = 'transparent'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      canvasBackground === 'transparent'
                        ? 'border-primary-500 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-white/10 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-600 dark:text-gray-300',
                    ]"
                  >
                    {{ t("vocabulary.transparent") }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="p-4 lg:p-6 border-t border-black/5 dark:border-white/10 flex gap-3 flex-shrink-0 bg-gray-50 dark:bg-white/5"
          >
            <button
              type="button"
              @click="close"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t("vocabulary.cancel") }}
            </button>
            <div class="flex-1"></div>
            <button
              type="button"
              @click="confirm"
              :disabled="!hasDrawn || !wordText.trim()"
              class="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t("vocabulary.useDrawing") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import { createWorker } from "tesseract.js";

const props = defineProps<{
  visible: boolean;
  word: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", payload: { imageDataUrl: string; word: string }): void;
}>();

const { t } = useI18n();

// Canvas refs
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// Drawing state
const isDrawing = ref(false);
const hasDrawn = ref(false);
const brushSize = ref(5);
const brushColor = ref("#000000");
const currentTool = ref<"brush" | "eraser">("brush");
const canvasBackground = ref<"white" | "transparent">("white");
const previewDataUrl = ref("");
const wordText = ref("");

// OCR state
const isRecognizing = ref(false);
const ocrLanguage = ref("chi_sim");

// History for undo/redo
const history = ref<ImageData[]>([]);
const historyIndex = ref(-1);

// Color palette
const colorPalette = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

// Initialize canvas
const initCanvas = () => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const container = canvas.parentElement;

  if (!container) return;

  // Set canvas size to match container
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set initial background
  fillBackground();

  // Save initial state
  saveToHistory();
};

const fillBackground = () => {
  if (!ctx || !canvasRef.value) return;

  if (canvasBackground.value === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  } else {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

// Drawing functions
const getPointerPos = (e: MouseEvent | Touch) => {
  if (!canvasRef.value) return { x: 0, y: 0 };

  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true;
  const pos = getPointerPos(e);

  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (currentTool.value === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor.value;
  }
};

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx) return;

  const pos = getPointerPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  hasDrawn.value = true;
  updatePreview();
};

const stopDrawing = () => {
  if (isDrawing.value && ctx) {
    ctx.closePath();
    saveToHistory();
  }
  isDrawing.value = false;
};

// Touch handlers
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  startDrawing(mouseEvent);
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  draw(mouseEvent);
};

// History management
const saveToHistory = () => {
  if (!ctx || !canvasRef.value) return;

  // Remove any redo states
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }

  const imageData = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );
  history.value.push(imageData);
  historyIndex.value = history.value.length - 1;

  // Limit history size
  if (history.value.length > 50) {
    history.value.shift();
    historyIndex.value--;
  }
};

const undoLast = () => {
  if (historyIndex.value <= 0 || !ctx) return;

  historyIndex.value--;
  ctx.putImageData(history.value[historyIndex.value], 0, 0);
  updatePreview();

  // Check if canvas is empty
  hasDrawn.value = historyIndex.value > 0;
};

const redoLast = () => {
  if (historyIndex.value >= history.value.length - 1 || !ctx) return;

  historyIndex.value++;
  ctx.putImageData(history.value[historyIndex.value], 0, 0);
  updatePreview();
  hasDrawn.value = true;
};

const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return;

  fillBackground();
  hasDrawn.value = false;
  saveToHistory();
  updatePreview();
};

const updatePreview = () => {
  if (!canvasRef.value) return;
  previewDataUrl.value = canvasRef.value.toDataURL("image/png");
};

const confirm = () => {
  if (!canvasRef.value || !hasDrawn.value || !wordText.value.trim()) return;

  const dataUrl = canvasRef.value.toDataURL("image/png");
  emit("confirm", { imageDataUrl: dataUrl, word: wordText.value.trim() });
  close();
};

// OCR recognition function
const recognizeText = async () => {
  if (!canvasRef.value || !hasDrawn.value || isRecognizing.value) return;

  isRecognizing.value = true;

  try {
    const dataUrl = canvasRef.value.toDataURL("image/png");

    const worker = await createWorker(ocrLanguage.value);
    const { data } = await worker.recognize(dataUrl);
    await worker.terminate();

    if (data.text && data.text.trim()) {
      // Clean up the recognized text (remove extra whitespace, newlines)
      wordText.value = data.text.trim().replace(/\s+/g, " ");
    }
  } catch (error) {
    console.error("OCR recognition failed:", error);
  } finally {
    isRecognizing.value = false;
  }
};

const close = () => {
  emit("close");
};

// Reset state when modal opens
watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      hasDrawn.value = false;
      history.value = [];
      historyIndex.value = -1;
      previewDataUrl.value = "";
      wordText.value = props.word || "";

      await nextTick();
      initCanvas();
    }
  }
);

// Watch background changes
watch(canvasBackground, () => {
  if (!ctx || !canvasRef.value || !hasDrawn.value) {
    fillBackground();
    saveToHistory();
    return;
  }

  // Save current drawing
  const currentImage = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );

  // Fill background
  fillBackground();

  // Restore drawing
  ctx.putImageData(currentImage, 0, 0);
  updatePreview();
});

// Handle resize
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (props.visible && canvasRef.value) {
      // Save current state before resize
      const currentState = ctx?.getImageData(
        0,
        0,
        canvasRef.value.width,
        canvasRef.value.height
      );

      initCanvas();

      // Restore state after resize if possible
      if (currentState && ctx) {
        ctx.putImageData(currentState, 0, 0);
      }
    }
  });
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
/* Custom range slider */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--tw-gradient-from),
    var(--tw-gradient-to)
  );
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Select dropdown dark mode styling */
:is(.dark) select option {
  background-color: #262626;
  color: #ffffff;
}

select option {
  background-color: #ffffff;
  color: #111827;
  padding: 8px 12px;
}

select option:checked {
  background: linear-gradient(135deg, #10b981, #14b8a6);
  color: white;
}

select option:hover {
  background-color: #10b981;
  color: white;
}
</style>
