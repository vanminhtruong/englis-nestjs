<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
  >
    <div
      class="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-lg dark:bg-black sm:max-h-[90dvh] sm:rounded-3xl"
    >
      <!-- Header - Fixed -->
      <div
        class="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-white/10 sm:p-6"
      >
        <h2 class="min-w-0 break-words text-lg font-bold text-black dark:text-white sm:text-2xl">
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
        :id="formId"
        @submit.prevent="onSubmit"
        class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6 scrollbar-custom"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
            >
              {{ t("vocabulary.word") }} *
            </label>
            <div class="relative">
              <input
                v-model="form.word"
                type="text"
                required
                class="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                @click="openWordDrawingModal"
                class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-all"
                title="Open Word Drawing"
              >
                +
              </button>
            </div>
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

          <WordDrawingModal
            :visible="isWordDrawingModalVisible"
            :word="form.word"
            @close="closeWordDrawingModal"
            @confirm="confirmWordDrawing"
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

        <ModalSelect data-vocabulary-pos
          :model-value="form.partOfSpeech || 'unspecified'"
          :label="t('vocabulary.partOfSpeech')" :options="posOptions"
          @update:model-value="form.partOfSpeech = $event" />
        <VocabularyDuplicateNotice :result="duplicate.result.value" :checking="duplicate.checking.value" :unavailable="duplicate.unavailable.value" />

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
          <h3 class="min-w-0 text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
            {{ t("vocabulary.formAdditional") }}
          </h3>
          <span class="h-px min-w-0 flex-1 bg-black/10 dark:bg-white/10"></span>
          <span class="min-w-0 text-xs text-black/40 dark:text-white/40">{{ t("vocabulary.formOptional") }}</span>
        </div>

        <div class="space-y-2.5">
          <CollapsibleFormSection
            v-model="expandedSections.examples"
            :title="t('vocabulary.formExamples')"
            :summary="exampleSummary"
            icon="book"
          >
            <div class="space-y-4">
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
            </div>
          </CollapsibleFormSection>

          <CollapsibleFormSection
            v-model="expandedSections.classification"
            :title="t('vocabulary.formClassification')"
            :summary="classificationSummary"
            icon="folder"
          >
            <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <ModalSelect
                v-model="form.difficulty"
                :label="t('vocabulary.difficulty')"
                :options="difficultyOptions"
              />

              <ModalSelect
                :model-value="selectedCategory"
                :label="t('vocabulary.categories')"
                :placeholder="t('vocabulary.selectCategory')"
                :options="categoryOptions"
                @update:model-value="selectedCategory = String($event)"
              />

              <ModalSelect
                class="sm:col-span-2"
                v-model="selectedTags"
                :label="t('vocabulary.tags')"
                :placeholder="t('vocabulary.selectTags')"
                :clear-label="t('vocabulary.clear')"
                :options="tagOptions"
                :max-selections="3"
                multiple
              />
            </div>
          </CollapsibleFormSection>

          <CollapsibleFormSection
            v-model="expandedSections.media"
            :title="t('vocabulary.formMedia')"
            :summary="mediaSummary"
            icon="camera"
          >
            <!-- Media Tabs -->
            <div>
              <div
                class="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5"
              >
                <button
                  type="button"
                  @click="activeMediaTab = 'image'"
                  :class="[
                    'min-w-0 break-words rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                    activeMediaTab === 'image'
                      ? 'bg-white text-primary-600 shadow-sm dark:bg-black dark:text-primary-400'
                      : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white',
                  ]"
                >
                  {{ t("vocabulary.image") }}
                </button>
                <button
                  type="button"
                  @click="activeMediaTab = 'video'"
                  :class="[
                    'min-w-0 break-words rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                    activeMediaTab === 'video'
                      ? 'bg-white text-primary-600 shadow-sm dark:bg-black dark:text-primary-400'
                      : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white',
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
                    @click="fileInput?.click()"
                    class="flex min-w-0 flex-col items-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
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
                    class="flex min-w-0 flex-col items-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
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
                    class="flex min-w-0 flex-col items-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
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
                    @keydown.enter.prevent="handleImageUrlSubmit"
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
                    @click="videoFileInput?.click()"
                    class="flex min-w-0 flex-col items-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
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
                    class="flex min-w-0 flex-col items-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all"
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
                    @keydown.enter.prevent="handleVideoUrlSubmit"
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
          </CollapsibleFormSection>
        </div>
      </form>

      <!-- Footer - Fixed -->
      <div
        class="flex shrink-0 gap-2.5 border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black sm:gap-3 sm:p-5"
      >
        <button
          type="submit"
          :form="formId" :disabled="busy || duplicate.result.value?.duplicate" data-vocabulary-save
          class="disabled:cursor-not-allowed disabled:opacity-50 min-w-0 flex-1 break-words py-3 px-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("vocabulary.save") }}
        </button>
        <button
          type="button"
          @click="onClose"
          class="min-w-0 flex-1 break-words py-3 px-3 bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold rounded-xl hover:bg-black/20 dark:hover:bg-white/20 transition-all"
        >
          {{ t("vocabulary.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveAssetUrl } from "@/utils/assetUrl";
import {
  computed,
  useId,
  ref,
  watch,
  onMounted,
  onUnmounted,
  defineAsyncComponent,
} from "vue";
import apiService from "../../../services/api.service";
import ModalSelect from "../../../components/common/ModalSelect.vue";
import CollapsibleFormSection from "../../../components/common/CollapsibleFormSection.vue";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import { websocketService } from "../../../services/websocket.service";

import { partOfSpeechOptions } from '../utils/partOfSpeech';
import { useVocabularyDuplicate } from '../composable/manager-state/useVocabularyDuplicate';
import VocabularyDuplicateNotice from './VocabularyDuplicateNotice.vue';

const IPAPronunciationModal = defineAsyncComponent(
  () => import("../../../components/common/IPAPronunciationModal.vue") as any
);

const WordDrawingModal = defineAsyncComponent(
  () => import("../../../components/common/WordDrawingModal.vue") as any
);

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  editingId?: string | null;
  busy?: boolean;
  form: any;
  t: any;
}>();

const { lockScroll, unlockScroll } = useModalScrollLock();

const emit = defineEmits<{
  submit: [];
  close: [];
}>();

const formId = 'vocabulary-form-' + useId();
const posOptions = computed(() => partOfSpeechOptions(props.t));
const duplicate = useVocabularyDuplicate(() => props.form, () => props.show, () => props.editingId);
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

const expandedSections = ref({ examples: false, classification: false, media: false });
const isIPAModalVisible = ref(false);
const isWordDrawingModalVisible = ref(false);

const selectedCategory = computed({
  get: () =>
    props.form.categoryIds && props.form.categoryIds.length > 0
      ? props.form.categoryIds[0]
      : "",
  set: (value: string) => {
    props.form.categoryIds = value ? [value] : [];
  },
});

const difficultyOptions = computed(() => ["easy", "medium", "hard"].map(value => ({
  value,
  label: props.t("vocabulary." + value),
})));

const categoryOptions = computed(() => [
  { value: "", label: props.t("vocabulary.selectCategory") },
  ...categories.value.map(category => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
    color: category.color,
  })),
]);

const tagOptions = computed(() => tags.value.map(tag => ({
  value: tag.name,
  label: "#" + tag.name,
})));

const selectedTags = computed({
  get: (): string[] => {
    if (Array.isArray(props.form.tags)) return props.form.tags;
    if (typeof props.form.tags === "string") return props.form.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
    return [];
  },
  set: (value: string | string[]) => {
    if (Array.isArray(value)) props.form.tags = value;
  },
});

const exampleSummary = computed(() =>
  [props.form.example, props.form.exampleTranslation]
    .filter(value => typeof value === "string" && value.trim())
    .join(" · ") || props.t("vocabulary.formOptional")
);

const classificationSummary = computed(() => [
  difficultyOptions.value.find(option => option.value === props.form.difficulty)?.label,
  categoryOptions.value.find(option => selectedCategory.value && option.value === selectedCategory.value)?.label,
  selectedTags.value.length ? props.t("vocabulary.formTagCount", { count: selectedTags.value.length }) : "",
].filter(Boolean).join(" · "));

const mediaSummary = computed(() => [
  props.form.image ? props.t("vocabulary.image") : "",
  props.form.video ? props.t("vocabulary.video") : "",
].filter(Boolean).join(" · ") || props.t("vocabulary.formNoMedia"));

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
      expandedSections.value = { examples: false, classification: false, media: false };
      imagePreview.value = resolveAssetUrl(props.form.image);
      videoPreview.value = resolveAssetUrl(props.form.video);
      activeMediaTab.value = !props.form.image && props.form.video ? "video" : "image";
      showImageUrlInput.value = false;
      showVideoUrlInput.value = false;
      imageUrl.value = "";
      videoUrl.value = "";
    } else {
      unlockScroll();
      imagePreview.value = "";
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  cleanupTagWebsocketListeners();
});

function onSubmit() {
  if (!props.busy && !duplicate.result.value?.duplicate) emit("submit");
}

function onClose() {
  if (!props.busy) emit("close");
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

function openWordDrawingModal() {
  isWordDrawingModalVisible.value = true;
}

function closeWordDrawingModal() {
  isWordDrawingModalVisible.value = false;
}

function confirmWordDrawing(payload: { imageDataUrl: string; word: string }) {
  imagePreview.value = payload.imageDataUrl;
  props.form.image = payload.imageDataUrl;
  if (payload.word) {
    props.form.word = payload.word;
  }
  closeWordDrawingModal();
}
</script>
