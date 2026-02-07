<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col backdrop-blur-lg"
    >
      <!-- Header - Fixed -->
      <div
        class="p-6 border-b border-white/20 dark:border-white/10 flex items-center justify-between flex-shrink-0"
      >
        <h2 class="text-2xl font-bold text-black dark:text-white">
          {{
            isEditing ? t("vocabulary.editTitle") : t("vocabulary.createTitle")
          }}
        </h2>
        <button
          type="button"
          @click="onClose"
          class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content - Scrollable -->
      <form
        @submit.prevent="onSubmit"
        class="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
            >
              {{ t("vocabulary.word") }} *
            </label>
            <input
              v-model="form.word"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
            >
              {{ t("vocabulary.pronunciation") }} *
            </label>
            <div class="relative">
              <input
                v-model="form.pronunciation"
                type="text"
                required
                class="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                @click="openIPAModal"
                class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-all"
                title="Open IPA Pronunciation Builder"
              >
                +
              </button>
            </div>
          </div>

          <IPAPronunciationModal
            :visible="isIPAModalVisible"
            :pronunciation="form.pronunciation"
            @close="closeIPAModal"
            @confirm="confirmIPAPronunciation"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.meaning") }} *
          </label>
          <input
            v-model="form.meaning"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.example") }}
          </label>
          <textarea
            v-model="form.example"
            rows="2"
            class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.exampleTranslation") }}
          </label>
          <textarea
            v-model="form.exampleTranslation"
            rows="2"
            class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.difficulty") }}
          </label>
          <select
            v-model="form.difficulty"
            class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent [&>option]:bg-white [&>option]:dark:bg-black [&>option]:text-black [&>option]:dark:text-white"
          >
            <option value="easy">{{ t("vocabulary.easy") }}</option>
            <option value="medium">{{ t("vocabulary.medium") }}</option>
            <option value="hard">{{ t("vocabulary.hard") }}</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.categories") }}
          </label>
          <div class="relative">
            <button
              type="button"
              @click="showCategoryDropdown = !showCategoryDropdown"
              class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <component
                  v-if="selectedCategoryData"
                  :is="getIconComponent(selectedCategoryData.icon)"
                  :color="selectedCategoryData.color"
                  class="w-4 h-4 flex-shrink-0"
                />
                <span>{{
                  selectedCategoryData?.name ||
                  `-- ${t("vocabulary.selectCategory") || "Select Category"} --`
                }}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="transition-transform"
                :class="{ 'rotate-180': showCategoryDropdown }"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div
              v-if="showCategoryDropdown"
              class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              <button
                type="button"
                @click="selectCategory('')"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white"
              >
                -- {{ t("vocabulary.selectCategory") || "Select Category" }} --
              </button>
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                @click="selectCategory(category.id)"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20':
                    selectedCategory === category.id,
                }"
              >
                <component
                  :is="getIconComponent(category.icon)"
                  :color="category.color"
                  class="w-4 h-4 flex-shrink-0"
                />
                <span class="text-black dark:text-white">{{
                  category.name
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
          >
            {{ t("vocabulary.tags") }}
          </label>
          <div class="relative">
            <button
              type="button"
              @click="showTagDropdown = !showTagDropdown"
              class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
            >
              <div class="flex flex-wrap gap-2 max-w-full">
                <span
                  v-if="!Array.isArray(form.tags) || form.tags.length === 0"
                  class="text-sm text-black/50 dark:text-white/50"
                >
                  -- Select tags --
                </span>
                <span
                  v-for="tagName in Array.isArray(form.tags) ? form.tags : []"
                  :key="tagName"
                  class="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs"
                >
                  #{{ tagName }}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="transition-transform"
                :class="{ 'rotate-180': showTagDropdown }"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div
              v-if="showTagDropdown"
              class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              <button
                type="button"
                @click="form.tags = []"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white text-sm"
              >
                -- Clear tags --
              </button>
              <button
                v-for="tag in tags"
                :key="tag.id"
                type="button"
                @click="toggleTag(tag.name)"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between text-sm"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20': isTagSelected(
                    tag.name
                  ),
                }"
              >
                <span class="text-black dark:text-white">#{{ tag.name }}</span>
                <span
                  v-if="isTagSelected(tag.name)"
                  class="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Media Tabs -->
        <div>
          <div
            class="flex gap-2 mb-4 border-b border-black/10 dark:border-white/10"
          >
            <button
              type="button"
              @click="activeMediaTab = 'image'"
              :class="[
                'px-4 py-2 font-medium text-sm transition-all border-b-2',
                activeMediaTab === 'image'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white',
              ]"
            >
              {{ t("vocabulary.image") }}
            </button>
            <button
              type="button"
              @click="activeMediaTab = 'video'"
              :class="[
                'px-4 py-2 font-medium text-sm transition-all border-b-2',
                activeMediaTab === 'video'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white',
              ]"
            >
              {{ t("vocabulary.video") }}
            </button>
          </div>

          <!-- Image Tab -->
          <div v-if="activeMediaTab === 'image'">
            <!-- Image Preview -->
            <div
              v-if="imagePreview"
              class="relative w-full h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 mb-3"
            >
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-full h-full object-contain"
              />
              <button
                type="button"
                @click="removeImage"
                class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Image Upload Options -->
            <div class="grid grid-cols-3 gap-2">
              <!-- Option 1: Upload File -->
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-primary-500"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span
                  class="text-xs text-black/70 dark:text-white/70 text-center"
                  >{{ t("vocabulary.uploadFile") }}</span
                >
              </button>

              <!-- Option 2: Paste URL -->
              <button
                type="button"
                @click="showImageUrlInput = !showImageUrlInput"
                class="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-primary-500"
                >
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  ></path>
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  ></path>
                </svg>
                <span
                  class="text-xs text-black/70 dark:text-white/70 text-center"
                  >{{ t("vocabulary.pasteUrl") }}</span
                >
              </button>

              <!-- Option 3: Paste Image -->
              <button
                type="button"
                @click="handlePasteImage"
                class="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-primary-500"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path
                    d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                  ></path>
                </svg>
                <span
                  class="text-xs text-black/70 dark:text-white/70 text-center"
                  >{{ t("vocabulary.pasteImage") }}</span
                >
              </button>
            </div>

            <!-- Image URL Input (hidden by default) -->
            <div v-if="showImageUrlInput" class="mt-3">
              <input
                v-model="imageUrl"
                type="text"
                :placeholder="t('vocabulary.imageUrlPlaceholder')"
                @keyup.enter="handleImageUrlSubmit"
                class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                @click="handleImageUrlSubmit"
                class="mt-2 w-full py-2 px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
              >
                {{ t("vocabulary.loadImage") }}
              </button>
            </div>

            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*"
              class="hidden"
            />
          </div>

          <!-- Video Tab -->
          <div v-if="activeMediaTab === 'video'">
            <!-- Video Preview -->
            <div
              v-if="videoPreview"
              class="relative w-full h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 mb-3"
            >
              <iframe
                :src="videoPreview"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <button
                type="button"
                @click="removeVideo"
                class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Video Upload Options -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Option 1: Upload Video File -->
              <button
                type="button"
                @click="$refs.videoFileInput.click()"
                class="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-primary-500"
                >
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span
                  class="text-xs text-black/70 dark:text-white/70 text-center"
                  >{{ t("vocabulary.uploadVideo") }}</span
                >
              </button>

              <!-- Option 2: Paste Video URL -->
              <button
                type="button"
                @click="showVideoUrlInput = !showVideoUrlInput"
                class="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-primary-500"
                >
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  ></path>
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  ></path>
                </svg>
                <span
                  class="text-xs text-black/70 dark:text-white/70 text-center"
                  >{{ t("vocabulary.pasteVideoUrl") }}</span
                >
              </button>
            </div>

            <!-- Video URL Input (hidden by default) -->
            <div v-if="showVideoUrlInput" class="mt-3">
              <input
                v-model="videoUrl"
                type="text"
                :placeholder="t('vocabulary.videoUrlPlaceholder')"
                @keyup.enter="handleVideoUrlSubmit"
                class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                @click="handleVideoUrlSubmit"
                class="mt-2 w-full py-2 px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
              >
                {{ t("vocabulary.loadVideo") }}
              </button>
            </div>

            <input
              type="file"
              ref="videoFileInput"
              @change="handleVideoFileChange"
              accept="video/*"
              class="hidden"
            />
          </div>
        </div>
      </form>

      <!-- Footer - Fixed -->
      <div
        class="p-6 border-t border-white/20 dark:border-white/10 flex gap-3 flex-shrink-0"
      >
        <button
          type="submit"
          @click="onSubmit"
          class="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("vocabulary.save") }}
        </button>
        <button
          type="button"
          @click="onClose"
          class="flex-1 py-3 px-4 bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold rounded-xl hover:bg-black/20 dark:hover:bg-white/20 transition-all"
        >
          {{ t("vocabulary.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  defineAsyncComponent,
} from "vue";
import apiService from "../../../services/api.service";
import { getIconComponent } from "../../../utils/iconRenderer";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import { websocketService } from "../../../services/websocket.service";

const IPAPronunciationModal = defineAsyncComponent(
  () => import("../../../components/common/IPAPronunciationModal.vue") as any
);

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  form: any;
  t: any;
}>();

const { lockScroll, unlockScroll } = useModalScrollLock();

const emit = defineEmits<{
  submit: [];
  close: [];
}>();

const categories = ref<any[]>([]);
const tags = ref<any[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string>("");
const videoPreview = ref<string>("");
const showImageUrlInput = ref(false);
const showVideoUrlInput = ref(false);
const imageUrl = ref("");
const videoUrl = ref("");
const activeMediaTab = ref<"image" | "video">("image");

const showCategoryDropdown = ref(false);
const showTagDropdown = ref(false);
const isIPAModalVisible = ref(false);

const selectedCategory = computed({
  get: () =>
    props.form.categoryIds && props.form.categoryIds.length > 0
      ? props.form.categoryIds[0]
      : "",
  set: (value: string) => {
    props.form.categoryIds = value ? [value] : [];
  },
});

const selectedCategoryData = computed(() => {
  if (!selectedCategory.value) return null;
  return categories.value.find((c) => c.id === selectedCategory.value);
});

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId;
  showCategoryDropdown.value = false;
}

function ensureTagsArray() {
  if (!Array.isArray(props.form.tags)) {
    if (
      typeof props.form.tags === "string" &&
      props.form.tags.trim().length > 0
    ) {
      props.form.tags = props.form.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    } else {
      props.form.tags = [];
    }
  }
}

function toggleTag(tagName: string) {
  ensureTagsArray();
  const current = props.form.tags as string[];
  if (current.includes(tagName)) {
    props.form.tags = current.filter((t: string) => t !== tagName);
  } else if (current.length < 3) {
    props.form.tags = [...current, tagName];
  }
}

function isTagSelected(tagName: string) {
  return (
    Array.isArray(props.form.tags) &&
    (props.form.tags as string[]).includes(tagName)
  );
}

const isTagLimitReached = computed(
  () => (props.form.tags as string[]).length >= 3
);

// Option 1: Upload File
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      imagePreview.value = result;
      props.form.image = result;
    };
    reader.readAsDataURL(file);
  }
}

// Option 2: Paste Image URL
function handleImageUrlSubmit() {
  if (imageUrl.value.trim()) {
    imagePreview.value = imageUrl.value;
    props.form.image = imageUrl.value;
    showImageUrlInput.value = false;
    imageUrl.value = "";
  }
}

// Option 3: Paste Image from Clipboard
async function handlePasteImage() {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            imagePreview.value = result;
            props.form.image = result;
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
    alert("No image found in clipboard");
  } catch (error) {
    console.error("Failed to read clipboard:", error);
    alert("Failed to paste image. Please make sure you have copied an image.");
  }
}

function removeImage() {
  imagePreview.value = "";
  props.form.image = "";
  showImageUrlInput.value = false;
  imageUrl.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

// Video handlers
function handleVideoFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      videoPreview.value = result;
      props.form.video = result;
    };
    reader.readAsDataURL(file);
  }
}

function handleVideoUrlSubmit() {
  if (videoUrl.value.trim()) {
    // Convert YouTube/Vimeo URLs to embed format
    let embedUrl = videoUrl.value;

    // YouTube URL conversion
    if (
      videoUrl.value.includes("youtube.com") ||
      videoUrl.value.includes("youtu.be")
    ) {
      const videoId = videoUrl.value.includes("youtu.be")
        ? videoUrl.value.split("youtu.be/")[1]?.split("?")[0]
        : new URLSearchParams(new URL(videoUrl.value).search).get("v");
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // Vimeo URL conversion
    else if (videoUrl.value.includes("vimeo.com")) {
      const videoId = videoUrl.value.split("vimeo.com/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    videoPreview.value = embedUrl;
    props.form.video = embedUrl;
    showVideoUrlInput.value = false;
    videoUrl.value = "";
  }
}

function removeVideo() {
  videoPreview.value = "";
  props.form.video = "";
  showVideoUrlInput.value = false;
  videoUrl.value = "";
  if (videoFileInput.value) {
    videoFileInput.value.value = "";
  }
}

async function loadCategories() {
  try {
    const response = await apiService.category.getAll();
    categories.value = response.data;
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

async function loadTags() {
  try {
    const response = await apiService.tag.getAll();
    tags.value = response.data;
  } catch (error) {
    console.error("Failed to load tags:", error);
  }
}

let tagCreatedHandler: ((data: any) => void) | null = null;
let tagUpdatedHandler: ((data: any) => void) | null = null;
let tagDeletedHandler: ((data: any) => void) | null = null;

function setupTagWebsocketListeners() {
  tagCreatedHandler = (data: any) => {
    tags.value = [data, ...tags.value.filter((t: any) => t.id !== data.id)];
  };
  tagUpdatedHandler = (data: any) => {
    tags.value = tags.value.map((t: any) => (t.id === data.id ? data : t));
  };
  tagDeletedHandler = (data: { id: string }) => {
    tags.value = tags.value.filter((t: any) => t.id !== data.id);
    if (Array.isArray(props.form.tags)) {
      props.form.tags = (props.form.tags as string[]).filter((name: string) =>
        tags.value.some((t: any) => t.name === name)
      );
    }
  };

  websocketService.on("tag:created", tagCreatedHandler);
  websocketService.on("tag:updated", tagUpdatedHandler);
  websocketService.on("tag:deleted", tagDeletedHandler);
}

function cleanupTagWebsocketListeners() {
  if (tagCreatedHandler) {
    websocketService.off("tag:created", tagCreatedHandler);
  }
  if (tagUpdatedHandler) {
    websocketService.off("tag:updated", tagUpdatedHandler);
  }
  if (tagDeletedHandler) {
    websocketService.off("tag:deleted", tagDeletedHandler);
  }
}

onMounted(() => {
  loadCategories();
  setupTagWebsocketListeners();
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      lockScroll();
      loadCategories();
      loadTags();
      if (props.form.image) {
        imagePreview.value = props.form.image;
      }
    } else {
      unlockScroll();
      imagePreview.value = "";
      showCategoryDropdown.value = false;
      showTagDropdown.value = false;
    }
  }
);

onUnmounted(() => {
  cleanupTagWebsocketListeners();
});

function onSubmit() {
  emit("submit");
}

function onClose() {
  emit("close");
}

function openIPAModal() {
  isIPAModalVisible.value = true;
}

function closeIPAModal() {
  isIPAModalVisible.value = false;
}

function confirmIPAPronunciation(pronunciation: string) {
  props.form.pronunciation = pronunciation;
  closeIPAModal();
}
</script>
