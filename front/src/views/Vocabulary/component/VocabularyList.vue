<template>
  <div class="space-y-4">
    <VocabularyCardWrapper
      v-for="vocab in vocabularies"
      :key="vocab.id"
      :item-id="`vocab-${vocab.id}`"
      class="group"
    >
      <template #default="{ hasBackground }">
        <div class="flex flex-col md:flex-row gap-4 items-start">
          <!-- Media Display -->
          <div
            v-if="vocab.image || vocab.video"
            class="w-full md:w-44 lg:w-52 h-40 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex-shrink-0"
          >
            <!-- Image Display (only if no video) -->
            <button
              v-if="vocab.image && !vocab.video"
              type="button"
              class="w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-400"
              @click="
                emit('open-image', {
                  src: resolveImageSrc(vocab.image),
                  alt: vocab.word,
                })
              "
            >
              <img
                :src="resolveImageSrc(vocab.image)"
                :alt="vocab.word"
                class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            <!-- Video Display (prioritized over image) -->
            <button
              v-else-if="vocab.video"
              type="button"
              class="w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-400 relative overflow-hidden"
              @click="
                emit('open-video', { src: vocab.video, title: vocab.word })
              "
            >
              <img
                v-if="getVideoThumbnail(vocab.video)"
                :src="getVideoThumbnail(vocab.video)"
                :alt="vocab.word"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"
              ></div>
              <div
                class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5 3l14 9-14 9V3z"></path>
                </svg>
              </div>
            </button>
          </div>

          <div class="flex-1 w-full min-w-0">
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3
                    class="text-2xl font-bold truncate"
                    :class="
                      hasBackground
                        ? 'text-white'
                        : 'text-gray-900 dark:text-white'
                    "
                  >
                    {{ vocab.word }}
                  </h3>
                  <button
                    @click="emit('speak', vocab.word)"
                    class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all flex-shrink-0"
                    :title="t('vocabulary.speak')"
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
                      <polygon
                        points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                      ></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </button>
                </div>
                <p
                  class="text-sm truncate"
                  :class="
                    hasBackground
                      ? 'text-white/60'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  {{ vocab.pronunciation }}
                </p>
              </div>
              <span
                :class="{
                  'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400':
                    vocab.difficulty === 'easy',
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400':
                    vocab.difficulty === 'medium',
                  'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400':
                    vocab.difficulty === 'hard',
                }"
                class="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              >
                {{ t("vocabulary." + vocab.difficulty) }}
              </span>
            </div>

            <p
              class="mb-3"
              :class="
                hasBackground
                  ? 'text-white/80'
                  : 'text-gray-700 dark:text-gray-300'
              "
            >
              {{ vocab.meaning }}
            </p>

            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="category in vocab.categories"
                :key="category.id"
                class="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                :style="{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }"
              >
                <component
                  :is="getIconComponent(category.icon)"
                  :color="category.color"
                  class="w-3 h-3"
                />
                <span>{{ category.name }}</span>
              </span>
              <span
                v-for="tag in vocab.tags"
                :key="tag"
                class="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <div
            class="flex flex-row md:flex-col gap-3 w-full md:w-auto justify-between"
          >
            <div class="flex items-center gap-2">
              <VocabularyNote
                :id="vocab.id"
                :word="vocab.word"
                :note="vocab.note"
                @update="(n) => (vocab.note = n)"
              />
              <button
                @click="emit('toggle-pin', vocab.id)"
                :class="[
                  'p-2 rounded-lg transition-all text-xl',
                  vocab.isPinned
                    ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                ]"
                :title="
                  vocab.isPinned ? t('vocabulary.unpin') : t('vocabulary.pin')
                "
              >
                <span
                  aria-hidden="true"
                  :style="!vocab.isPinned ? 'filter: grayscale(1);' : ''"
                >
                  📌
                </span>
              </button>
              <button
                @click="emit('toggle-favorite', vocab.id)"
                class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
                :title="
                  vocab.isFavorite
                    ? t('vocabulary.unfavorite')
                    : t('vocabulary.favorite')
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  :fill="vocab.isFavorite ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="
                    vocab.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                  "
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  ></polygon>
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="emit('open-detail', vocab)"
                class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="View Details"
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button
                @click="emit('open-edit', vocab)"
                class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
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
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  ></path>
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  ></path>
                </svg>
              </button>
              <button
                @click="emit('delete', vocab.id)"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </VocabularyCardWrapper>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { Vocabulary } from "../../../stores/vocabulary.store";
import { getIconComponent } from "../../../utils/iconRenderer";

const VocabularyNote = defineAsyncComponent(
  () => import("./VocabularyNote.vue")
);
const VocabularyCardWrapper = defineAsyncComponent(
  () => import("../../../components/common/VocabularyCardWrapper.vue") as any
);

defineProps<{
  vocabularies: Vocabulary[];
  t: (key: string) => string;
  formatDate: (dateString: string) => string;
}>();

const emit = defineEmits<{
  (e: "speak", word: string): void;
  (e: "toggle-pin", id: string): void;
  (e: "toggle-favorite", id: string): void;
  (e: "open-detail", vocab: Vocabulary): void;
  (e: "open-edit", vocab: Vocabulary): void;
  (e: "delete", id: string): void;
  (e: "open-image", payload: { src: string; alt: string }): void;
  (e: "open-video", payload: { src: string; title: string }): void;
}>();

const resolveImageSrc = (image: string) => {
  if (!image) return "";
  return image.startsWith("data:") ? image : `http://localhost:3000${image}`;
};

const getVideoThumbnail = (videoUrl: string) => {
  if (!videoUrl) return "";

  // YouTube URL
  if (videoUrl.includes("youtube.com/embed/")) {
    const videoId = videoUrl.split("youtube.com/embed/")[1]?.split("?")[0];
    if (videoId)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // Vimeo URL
  if (videoUrl.includes("vimeo.com")) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) return `https://vimeo.com/api/v2/video/${videoId}.json`;
  }

  return "";
};
</script>
