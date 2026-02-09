<template>
  <div
    class="advanced-filters"
    :class="{ 'advanced-filters--expanded': isExpanded }"
  >
    <!-- Toggle Button -->
    <button
      class="filters-toggle"
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
          <!-- Categories Filter -->
          <div class="filter-group">
            <div class="filter-group__header">
              <div class="filter-group__icon filter-group__icon--categories">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                  />
                </svg>
              </div>
              <span class="filter-group__title">{{ labels.categories }}</span>
              <button
                v-if="selectedCategories.length > 0"
                class="filter-group__clear"
                @click="clearCategories"
              >
                {{ labels.clear }}
              </button>
            </div>
            <div class="filter-chips" v-if="categories.length > 0">
              <button
                v-for="category in categories"
                :key="category.id"
                class="filter-chip"
                :class="{
                  'filter-chip--selected': selectedCategories.includes(
                    category.id
                  ),
                }"
                :style="
                  getChipStyle(
                    category,
                    selectedCategories.includes(category.id)
                  )
                "
                @click="toggleCategory(category.id)"
              >
                <span class="filter-chip__icon" v-if="category.icon">{{
                  category.icon
                }}</span>
                <span class="filter-chip__name">{{ category.name }}</span>
                <span
                  class="filter-chip__check"
                  v-if="selectedCategories.includes(category.id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </button>
            </div>
            <div v-else class="filter-empty">
              <span>{{ labels.noCategories }}</span>
            </div>
          </div>

          <!-- Tags Filter -->
          <div class="filter-group">
            <div class="filter-group__header">
              <div class="filter-group__icon filter-group__icon--tags">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                  />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <span class="filter-group__title">{{ labels.tags }}</span>
              <button
                v-if="selectedTags.length > 0"
                class="filter-group__clear"
                @click="clearTags"
              >
                {{ labels.clear }}
              </button>
            </div>
            <div class="filter-chips" v-if="availableTags.length > 0">
              <button
                v-for="tag in availableTags"
                :key="tag.id || tag.name"
                class="filter-chip filter-chip--tag"
                :class="{
                  'filter-chip--selected': selectedTags.includes(tag.name),
                }"
                :style="getTagStyle(tag, selectedTags.includes(tag.name))"
                @click="toggleTag(tag.name)"
              >
                <span class="filter-chip__hash">#</span>
                <span class="filter-chip__name">{{ tag.name }}</span>
                <span
                  class="filter-chip__check"
                  v-if="selectedTags.includes(tag.name)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </button>
            </div>
            <div v-else class="filter-empty">
              <span>{{ labels.noTags }}</span>
            </div>
          </div>
        </div>

        <!-- Active Filters Summary -->
        <div v-if="hasActiveFilters" class="filters-summary">
          <div class="filters-summary__content">
            <span class="filters-summary__label"
              >{{ labels.activeFilters }}:</span
            >
            <div class="filters-summary__tags">
              <span
                v-for="cat in selectedCategoryNames"
                :key="cat.id"
                class="summary-tag summary-tag--category"
              >
                <span v-if="cat.icon" class="summary-tag__icon">{{
                  cat.icon
                }}</span>
                {{ cat.name }}
                <button
                  class="summary-tag__remove"
                  @click="toggleCategory(cat.id)"
                >
                  ×
                </button>
              </span>
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="summary-tag summary-tag--tag"
              >
                #{{ tag }}
                <button class="summary-tag__remove" @click="toggleTag(tag)">
                  ×
                </button>
              </span>
            </div>
          </div>
          <button class="filters-clear-all" @click="clearAllFilters">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            {{ labels.clearAll }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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
  };
}>();

const emit = defineEmits<{
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
    props.currentDifficulty !== "all"
);

const activeFilterCount = computed(() => {
  let count = props.selectedCategories.length + props.selectedTags.length;
  if (props.currentDifficulty !== "all") count++;
  return count;
});

const selectedCategoryNames = computed(() =>
  categories.value.filter((c) => props.selectedCategories.includes(c.id))
);

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

function toggleCategory(categoryId: string) {
  const newSelection = props.selectedCategories.includes(categoryId)
    ? props.selectedCategories.filter((id) => id !== categoryId)
    : [...props.selectedCategories, categoryId];
  emit("update:selectedCategories", newSelection);
}

function toggleTag(tagName: string) {
  const newSelection = props.selectedTags.includes(tagName)
    ? props.selectedTags.filter((t) => t !== tagName)
    : [...props.selectedTags, tagName];
  emit("update:selectedTags", newSelection);
}

function clearCategories() {
  emit("update:selectedCategories", []);
}

function clearTags() {
  emit("update:selectedTags", []);
}

function clearAllFilters() {
  emit("update:selectedCategories", []);
  emit("update:selectedTags", []);
  emit("set-difficulty", "all");
}

function getChipStyle(category: Category, isSelected: boolean) {
  if (isSelected && category.color) {
    return {
      backgroundColor: category.color,
      borderColor: category.color,
      color: getContrastColor(category.color),
    };
  }
  if (category.color) {
    return {
      borderColor: category.color + "40",
      color: category.color,
    };
  }
  return {};
}

function getTagStyle(tag: Tag, isSelected: boolean) {
  if (isSelected && tag.color) {
    return {
      backgroundColor: tag.color,
      borderColor: tag.color,
      color: getContrastColor(tag.color),
    };
  }
  if (tag.color) {
    return {
      borderColor: tag.color + "40",
      color: tag.color,
    };
  }
  return {};
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
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
    availableTags.value = response.data;
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
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.dark .filters-content {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

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
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
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

.filter-group__icon--categories {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(99, 102, 241, 0.15)
  );
  color: #3b82f6;
}

.filter-group__icon--tags {
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.15),
    rgba(236, 72, 153, 0.15)
  );
  color: #a855f7;
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

.filter-group__clear {
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-group__clear:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Filter Chips */
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .filter-chip {
  background: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
}

.filter-chip:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-chip--selected {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
}

.filter-chip--selected:hover {
  background: linear-gradient(135deg, #4f46e5, #9333ea);
  transform: translateY(-2px);
}

.filter-chip__icon {
  font-size: 16px;
}

.filter-chip__hash {
  opacity: 0.7;
  font-weight: 400;
}

.filter-chip__check {
  width: 14px;
  height: 14px;
  margin-left: 2px;
}

.filter-chip__check svg {
  width: 100%;
  height: 100%;
}

/* Filter Empty State */
.filter-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  background: rgba(156, 163, 175, 0.05);
  border-radius: 10px;
  border: 2px dashed rgba(156, 163, 175, 0.2);
}

/* Filters Summary */
.filters-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

@media (min-width: 640px) {
  .filters-summary {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.filters-summary__content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filters-summary__label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-summary__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.summary-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.summary-tag--category {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(99, 102, 241, 0.15)
  );
  color: #3b82f6;
}

.summary-tag--tag {
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.15),
    rgba(236, 72, 153, 0.15)
  );
  color: #a855f7;
}

.summary-tag__icon {
  font-size: 12px;
}

.summary-tag__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-tag__remove:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.filters-clear-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filters-clear-all svg {
  width: 14px;
  height: 14px;
}

.filters-clear-all:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
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
