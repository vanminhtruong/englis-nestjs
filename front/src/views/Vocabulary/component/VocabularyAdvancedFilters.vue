<template>
  <div
    class="advanced-filters"
    :class="{ 'advanced-filters--expanded': isExpanded }"
  >
    <!-- Toggle Button -->
    <button
      type="button" :aria-expanded="isExpanded" class="filters-toggle"
      :class="{ 'filters-toggle--active': hasActiveFilters }"
      @click="toggleExpanded"
    >
      <div class="filters-toggle__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 6h18M7 12h10M10 18h4" />
        </svg>
      </div>
      <span class="filters-toggle__label">{{ labels.advancedFilters }}</span>
      <span v-if="hasActiveFilters" class="filters-toggle__badge">
        {{ activeFilterCount }}
      </span>
      <svg
        class="filters-toggle__arrow"
        :class="{ 'filters-toggle__arrow--rotated': isExpanded }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- Expandable Content -->
    <Transition
      enter-active-class="filters-content--enter-active"
      enter-from-class="filters-content--enter-from"
      enter-to-class="filters-content--enter-to"
      leave-active-class="filters-content--leave-active"
      leave-from-class="filters-content--leave-from"
      leave-to-class="filters-content--leave-to"
    >
      <div v-if="isExpanded" class="filters-content">
        <!-- Difficulty Filter - Full Width -->
        <div class="filter-group filter-group--difficulty">
          <div class="filter-group__header">
            <div class="filter-group__icon filter-group__icon--difficulty">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </div>
            <span class="filter-group__title">{{ labels.difficulty }}</span>
          </div>
          <div class="difficulty-chips">
            <button
              v-for="option in difficultyOptions"
              :key="option.value"
              type="button"
              class="difficulty-chip"
              :class="[
                `difficulty-chip--${option.value}`,
                {
                  'difficulty-chip--active': currentDifficulty === option.value,
                },
              ]"
              @click="emit('set-difficulty', option.value)"
            >
              <span class="chip-icon">{{ getChipIcon(option.value) }}</span>
              <span class="chip-label">{{ option.label }}</span>
              <span class="chip-glow"></span>
            </button>
          </div>
        </div>

        <div class="filters-grid">
          <ModalSelect class="sm:col-span-2" data-vocabulary-pos-filter :model-value="currentPos" :label="t('vocabulary.partOfSpeech')" :options="posOptions" @update:model-value="emit('update:pos', $event as PartOfSpeech | 'all')" />
          <ModalSelect data-vocabulary-category-filter multiple searchable compact-selection
            :model-value="selectedCategories" :options="categoryOptions"
            :label="labels.categories" :placeholder="categories.length ? labels.chooseCategories : labels.noCategories"
            :search-placeholder="labels.searchCategories" :no-matches-label="labels.noMatchingOptions"
            :selected-only-label="labels.selectedOnly" :clear-label="labels.clear"
            :selection-summary="labels.categorySelectionSummary"
            @update:model-value="updateCategories" />
          <ModalSelect data-vocabulary-tag-filter multiple searchable compact-selection
            :model-value="selectedTags" :options="tagOptions"
            :label="labels.tags" :placeholder="availableTags.length ? labels.chooseTags : labels.noTags"
            :search-placeholder="labels.searchTags" :no-matches-label="labels.noMatchingOptions"
            :selected-only-label="labels.selectedOnly" :clear-label="labels.clear"
            :selection-summary="labels.tagSelectionSummary"
            @update:model-value="updateTags" />
        </div>

        <div v-if="hasActiveFilters" class="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10">
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-xs text-black/60 dark:text-white/60" aria-live="polite">
            <span class="font-semibold">{{ labels.activeFilters }}:</span>
            <span v-if="selectedCategories.length" class="rounded-md bg-primary-500/10 px-2 py-1 font-medium text-primary-700 dark:text-primary-300">{{ labels.categories }}: {{ selectedCategories.length }}</span>
            <span v-if="selectedTags.length" class="rounded-md bg-primary-500/10 px-2 py-1 font-medium text-primary-700 dark:text-primary-300">{{ labels.tags }}: {{ selectedTags.length }}</span>
            <span v-if="currentPos !== 'all'" class="rounded-md bg-primary-500/10 px-2 py-1 font-medium text-primary-700 dark:text-primary-300">{{ t('vocabulary.pos_' + currentPos) }}</span>
            <span v-if="currentDifficulty !== 'all'" class="rounded-md bg-black/5 px-2 py-1 font-medium dark:bg-white/10">{{ labels[currentDifficulty] }}</span>
          </div>
          <button type="button" data-vocabulary-clear-filters class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" @click="clearAllFilters">{{ labels.clearAll }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { partOfSpeechOptions, type PartOfSpeech } from '../utils/partOfSpeech';
const { t } = useI18n();
const posOptions = computed(() => [{ value: 'all', label: t('vocabulary.all') }, ...partOfSpeechOptions(t)]);
import ModalSelect from "../../../components/common/ModalSelect.vue";
import apiService from "../../../services/api.service";

interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

const props = defineProps<{
  selectedCategories: string[];
  selectedTags: string[];
  currentPos: PartOfSpeech | 'all';
  currentDifficulty: "all" | "easy" | "medium" | "hard";
  labels: {
    advancedFilters: string;
    categories: string;
    tags: string;
    difficulty: string;
    clear: string;
    clearAll: string;
    activeFilters: string;
    noCategories: string;
    noTags: string;
    all: string;
    easy: string;
    medium: string;
    hard: string;
    chooseCategories: string;
    chooseTags: string;
    searchCategories: string;
    searchTags: string;
    noMatchingOptions: string;
    selectedOnly: string;
    categorySelectionSummary: string;
    tagSelectionSummary: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update:pos', value: PartOfSpeech | 'all'): void;
  (e: "update:selectedCategories", value: string[]): void;
  (e: "update:selectedTags", value: string[]): void;
  (e: "set-difficulty", value: "all" | "easy" | "medium" | "hard"): void;
}>();

const isExpanded = ref(false);
const categories = ref<Category[]>([]);
const availableTags = ref<Tag[]>([]);

const hasActiveFilters = computed(
  () =>
    props.selectedCategories.length > 0 ||
    props.selectedTags.length > 0 ||
    props.currentDifficulty !== "all" || props.currentPos !== 'all'
);

const activeFilterCount = computed(() => {
  let count = props.selectedCategories.length + props.selectedTags.length;
  if (props.currentDifficulty !== "all") count++;
  if (props.currentPos !== 'all') count++;
  return count;
});

const categoryOptions = computed(() => categories.value.map(c => ({ value: c.id, label: c.name, icon: c.icon || 'folder', color: c.color })));
const tagOptions = computed(() => availableTags.value.map(tag => ({ value: tag.name, label: '#' + tag.name, color: tag.color })));
function updateCategories(value: string | string[]) { if (Array.isArray(value)) emit("update:selectedCategories", value); }
function updateTags(value: string | string[]) { if (Array.isArray(value)) emit("update:selectedTags", value); }

const difficultyOptions = computed(() => [
  { value: "all" as const, label: props.labels.all },
  { value: "easy" as const, label: props.labels.easy },
  { value: "medium" as const, label: props.labels.medium },
  { value: "hard" as const, label: props.labels.hard },
]);

function getChipIcon(value: string): string {
  const icons: Record<string, string> = {
    all: "🎯",
    easy: "🌱",
    medium: "⚡",
    hard: "🔥",
  };
  return icons[value] || "📚";
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function clearAllFilters() {
  emit("update:selectedCategories", []);
  emit("update:selectedTags", []);
  emit("set-difficulty", "all");
  emit('update:pos', 'all');
}

async function loadCategories() {
  try {
    const response = await apiService.category.getAll();
    categories.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

async function loadTags() {
  try {
    const response = await apiService.tag.getAll();
    availableTags.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to load tags:", error);
  }
}

onMounted(() => {
  loadCategories();
  loadTags();
});

// Auto-expand when filters are active
watch(hasActiveFilters, (hasFilters) => {
  if (hasFilters && !isExpanded.value) {
    isExpanded.value = true;
  }
});
</script>

<style scoped>
.advanced-filters {
  margin-top: 16px;
}

/* Toggle Button */
.filters-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  width: 100%;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05),
    rgba(168, 85, 247, 0.05)
  );
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.dark .filters-toggle {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}

.filters-toggle:hover {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(168, 85, 247, 0.1)
  );
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.dark .filters-toggle:hover {
  background: rgba(255, 255, 255, 0.08); /* slightly lighter than base */
}

.filters-toggle--active {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.dark .filters-toggle--active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.filters-toggle__icon {
  width: 20px;
  height: 20px;
  color: #6366f1;
}

.filters-toggle__label {
  flex: 1;
  text-align: left;
}

.filters-toggle__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.filters-toggle__arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  color: #9ca3af;
}

.filters-toggle__arrow--rotated {
  transform: rotate(180deg);
}

/* Filters Content */
.filters-content {
  margin-top: 12px;
  padding: 12px;
  min-width: 0;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.dark .filters-content {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

@media (min-width: 640px) { .filters-content { padding: 16px; } }
/* Animation Classes */
.filters-content--enter-active,
.filters-content--leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.filters-content--enter-from,
.filters-content--leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.filters-content--enter-to,
.filters-content--leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Filter Group */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.filter-group__icon svg {
  width: 18px;
  height: 18px;
}

.filter-group__title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.dark .filter-group__title {
  color: #e5e7eb;
}

/* Difficulty Filter Styles */
.filter-group--difficulty {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.filter-group__icon--difficulty {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.15),
    rgba(239, 68, 68, 0.15)
  );
  color: #f59e0b;
}

.difficulty-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.difficulty-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: #f3f4f6;
  color: #4b5563;
}

.dark .difficulty-chip {
  background: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
}

.chip-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.chip-label {
  position: relative;
  z-index: 1;
}

.chip-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Difficulty Chip Variants */
.difficulty-chip--all {
  border-color: rgba(99, 102, 241, 0.2);
}
.difficulty-chip--all:hover,
.difficulty-chip--all.difficulty-chip--active {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.difficulty-chip--easy {
  border-color: rgba(34, 197, 94, 0.2);
}
.difficulty-chip--easy:hover,
.difficulty-chip--easy.difficulty-chip--active {
  background: linear-gradient(135deg, #22c55e, #4ade80);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.difficulty-chip--medium {
  border-color: rgba(245, 158, 11, 0.2);
}
.difficulty-chip--medium:hover,
.difficulty-chip--medium.difficulty-chip--active {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.difficulty-chip--hard {
  border-color: rgba(239, 68, 68, 0.2);
}
.difficulty-chip--hard:hover,
.difficulty-chip--hard.difficulty-chip--active {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.difficulty-chip:hover .chip-icon,
.difficulty-chip--active .chip-icon {
  transform: scale(1.2) rotate(-5deg);
}

.difficulty-chip--active {
  transform: translateY(-2px);
}
</style>
