<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <VocabularyCardWrapper
      v-for="vocab in vocabularies"
      :key="vocab.id"
      :item-id="`vocab-${vocab.id}`"
      class="group"
    >
      <template #default="{ hasBackground }">
        <!-- Media Preview -->
        <div v-if="vocab.image || vocab.video" class="mb-4">
          <!-- Image Display -->
          <button
            v-if="vocab.image && !vocab.video"
            type="button"
            class="w-full h-32 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400"
            @click="
              $emit('open-image-preview', {
                src: vocab.image.startsWith('data:')
                  ? vocab.image
                  : `http://localhost:3000${vocab.image}`,
                alt: vocab.word,
              })
            "
          >
            <img
              :src="
                vocab.image.startsWith('data:')
                  ? vocab.image
                  : `http://localhost:3000${vocab.image}`
              "
              :alt="vocab.word"
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
          <!-- Video Display -->
          <button
            v-if="vocab.video"
            type="button"
            class="w-full h-32 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
            @click="
              $emit('open-video-preview', {
                src: vocab.video,
                title: vocab.word,
              })
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
                class="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 3l14 9-14 9V3z"></path>
              </svg>
            </div>
          </button>
        </div>

        <!-- Header: word, pronunciation, favorite, difficulty -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3
                class="text-2xl font-bold"
                :class="
                  hasBackground ? 'text-white' : 'text-black dark:text-white'
                "
              >
                {{ vocab.word }}
              </h3>
              <button
                @click="$emit('speak', vocab.word)"
                class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            </div>
            <p
              class="text-sm"
              :class="
                hasBackground
                  ? 'text-white/60'
                  : 'text-black/50 dark:text-white/50'
              "
            >
              {{ vocab.pronunciation }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button
              v-if="vocab.isFavorite"
              class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="2"
                class="text-yellow-500"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                ></polygon>
              </svg>
            </button>
            <span
              :class="{
                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400':
                  vocab.difficulty === 'easy',
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400':
                  vocab.difficulty === 'medium',
                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400':
                  vocab.difficulty === 'hard',
              }"
              class="px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ vocab.difficulty }}
            </span>
          </div>
        </div>

        <!-- Meaning -->
        <p
          class="mb-4"
          :class="
            hasBackground ? 'text-white/80' : 'text-black/70 dark:text-white/70'
          "
        >
          {{ vocab.meaning }}
        </p>

        <!-- Stats + detail button -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-2">
            <span
              class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs"
            >
              ✓ {{ vocab.correctCount }}
            </span>
            <span
              class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs"
            >
              ✗ {{ vocab.incorrectCount }}
            </span>
          </div>
          <button
            @click="$emit('open-detail-modal', vocab)"
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
        </div>

        <!-- Categories -->
        <div
          v-if="vocab.categories && vocab.categories.length > 0"
          class="flex flex-wrap gap-2 mt-4"
        >
          <span
            v-for="cat in vocab.categories"
            :key="cat.id"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
            :style="{
              backgroundColor: cat.color + '20',
              color: cat.color,
            }"
          >
            <component
              :is="getIconComponent(cat.icon)"
              :color="cat.color"
              class="w-3 h-3"
            />
            {{ cat.name }}
          </span>
        </div>

        <!-- Tags -->
        <div
          v-if="vocab.tags && vocab.tags.length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <span
            v-for="tag in vocab.tags"
            :key="tag"
            class="px-2 py-1 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-lg text-xs"
          >
            #{{ tag }}
          </span>
        </div>
      </template>
    </VocabularyCardWrapper>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { getIconComponent } from "../../../utils/iconRenderer";

const VocabularyCardWrapper = defineAsyncComponent(
  () => import("../../../components/common/VocabularyCardWrapper.vue") as any
);

defineProps<{
  vocabularies: any[];
  getVideoThumbnail: (url: string) => string;
}>();

defineEmits<{
  (e: "open-image-preview", payload: { src: string; alt: string }): void;
  (e: "open-video-preview", payload: { src: string; title: string }): void;
  (e: "speak", word: string): void;
  (e: "open-detail-modal", vocab: any): void;
}>();
</script>
