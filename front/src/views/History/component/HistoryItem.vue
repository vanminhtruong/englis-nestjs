<template>
  <div
    class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-lg transition-all"
  >
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Checkbox -->
      <div class="flex-shrink-0 flex items-start pt-1">
        <CustomCheckbox
          :checked="isSelected"
          @change="$emit('toggle-selection', history.id)"
        />
      </div>

      <!-- History Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start gap-4">
          <!-- Media (nếu có vocabulary) -->
          <div
            v-if="history.vocabulary?.image || history.vocabulary?.video"
            class="flex-shrink-0"
          >
            <div
              class="w-20 h-20 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5"
            >
              <!-- Image Display -->
              <button
                v-if="history.vocabulary?.image && !history.vocabulary?.video"
                type="button"
                class="w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-400"
                @click="
                  $emit('open-image', {
                    src: history.vocabulary.image.startsWith('data:')
                      ? history.vocabulary.image
                      : `http://localhost:3000${history.vocabulary.image}`,
                    alt: history.vocabulary.word,
                  })
                "
              >
                <img
                  :src="
                    history.vocabulary.image.startsWith('data:')
                      ? history.vocabulary.image
                      : `http://localhost:3000${history.vocabulary.image}`
                  "
                  :alt="history.vocabulary.word"
                  class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </button>
              <!-- Video Display -->
              <button
                v-if="history.vocabulary?.video"
                type="button"
                class="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
                @click="
                  $emit('open-video', {
                    src: history.vocabulary.video,
                    title: history.vocabulary.word,
                  })
                "
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-8 h-8 text-white opacity-70 group-hover:opacity-100 transition-opacity relative z-10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5 3l14 9-14 9V3z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Action Type Badge -->
            <div class="flex items-center gap-2 mb-2">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold uppercase',
                  history.action.startsWith('vocabulary_')
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                ]"
              >
                {{ history.action.replace("_", " ") }}
              </span>
              <span
                v-if="history.metadata?.isCorrect !== undefined"
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  history.metadata.isCorrect
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                ]"
              >
                {{ history.metadata.isCorrect ? "✓" : "✗" }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-gray-900 dark:text-white font-medium mb-2">
              {{ getDescription(history) }}
            </p>

            <!-- Metadata Details -->
            <div class="flex flex-wrap gap-2 text-sm">
              <!-- Word Info -->
              <span
                v-if="history.metadata?.word"
                class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full"
              >
                📝 {{ history.metadata.word }}
              </span>

              <!-- Score (for practice) -->
              <span
                v-if="history.metadata?.score !== undefined"
                class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
              >
                🎯 {{ history.metadata.score }} pts
              </span>

              <!-- Time (for practice) -->
              <span
                v-if="history.metadata?.timeSpent"
                class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full"
              >
                ⏱️ {{ formatTime(history.metadata.timeSpent) }}
              </span>

              <!-- Date -->
              <span
                class="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full"
              >
                📅 {{ formatDate(history.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions (chỉ show nút Delete nếu chưa bị xóa) -->
      <div class="flex lg:flex-col gap-2 flex-shrink-0">
        <button
          @click="$emit('delete-history', history.id)"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="inline-block mr-1"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import CustomCheckbox from "../../../components/CustomCheckbox.vue";
import type { History } from "../interface";

const { t } = useI18n();

defineProps<{
  history: History;
  formatTime: (seconds: number) => string;
  formatDate: (date: string) => string;
  isSelected: boolean;
}>();

defineEmits<{
  "delete-history": [historyId: string];
  "toggle-selection": [historyId: string];
}>();

function getDescription(history: History): string {
  // If metadata has descriptionKey, use i18n
  if (history.metadata?.descriptionKey) {
    return t(
      history.metadata.descriptionKey,
      history.metadata.descriptionData || {}
    );
  }
  // Fallback to original description
  return history.description;
}
</script>

<script lang="ts">
export default {
  name: "HistoryItem",
};
</script>
