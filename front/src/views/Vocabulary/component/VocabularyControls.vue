<template>
  <div class="filter-container">
    <div class="filter-panel">
      <!-- Animated background gradient -->
      <div class="filter-panel__bg"></div>

      <div class="filter-panel__content">
        <!-- Search Section -->
        <div class="filter-section filter-section--search">
          <div class="search-wrapper">
            <div class="search-icon">
              <!-- Search Icon -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <input
              :value="search"
              type="text"
              :placeholder="labels.searchPlaceholder"
              class="search-input"
              @input="onSearch"
            />
            <button
              v-if="search"
              class="search-clear"
              @click="emit('update:search', '')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter Toggle & Chips -->
        <div class="filter-group">
          <button
            class="filter-toggle"
            :class="{ 'filter-toggle--active': isFiltersExpanded }"
            @click="toggleFilters"
            :title="isFiltersExpanded ? 'Hide filters' : 'Show filters'"
          >
            <div class="filter-toggle__icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon
                  points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
                ></polygon>
              </svg>
            </div>
            <!-- Indicator dot if not 'all' and filters hidden -->
            <span
              v-if="!isFiltersExpanded && currentDifficulty !== 'all'"
              class="filter-toggle__dot"
            ></span>
          </button>

          <!-- Difficulty Chips Section -->
          <div
            class="filter-section filter-section--difficulty"
            :class="{ 'filter-section--hidden': !isFiltersExpanded }"
          >
            <div class="difficulty-chips-wrapper">
              <div class="difficulty-chips">
                <button
                  v-for="option in difficultyOptions"
                  :key="option.value"
                  type="button"
                  class="difficulty-chip"
                  :class="[
                    `difficulty-chip--${option.value}`,
                    {
                      'difficulty-chip--active':
                        currentDifficulty === option.value,
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
          </div>
        </div>

        <!-- Add Button Section -->
        <div class="filter-section filter-section--action">
          <button class="add-button" @click="emit('create')">
            <span class="add-button__bg"></span>
            <span class="add-button__content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{{ labels.addNew }}</span>
            </span>
            <span class="add-button__shine"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref } from "vue";

const props = defineProps<{
  search: string;
  difficultyLabel: string;
  showDifficultyDropdown: boolean;
  isFiltersExpanded: boolean;
  currentDifficulty: "all" | "easy" | "medium" | "hard";
  labels: {
    searchPlaceholder: string;
    addNew: string;
    all: string;
    easy: string;
    medium: string;
    hard: string;
  };
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "toggle-difficulty"): void;
  (e: "update:isFiltersExpanded", value: boolean): void;
  (e: "set-difficulty", value: "all" | "easy" | "medium" | "hard"): void;
  (e: "create"): void;
}>();

const { search, labels } = toRefs(props);

function toggleFilters() {
  emit("update:isFiltersExpanded", !props.isFiltersExpanded);
}

const difficultyOptions = computed(() => [
  { value: "all" as const, label: labels.value.all },
  { value: "easy" as const, label: labels.value.easy },
  { value: "medium" as const, label: labels.value.medium },
  { value: "hard" as const, label: labels.value.hard },
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

function onSearch(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:search", target.value);
}
</script>

<style scoped>
/* Container */
.filter-container {
  position: relative;
}

/* Filter Panel Container */
.filter-panel {
  position: relative;
  border-radius: 20px;
  padding: 3px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.3),
    rgba(168, 85, 247, 0.3),
    rgba(236, 72, 153, 0.3)
  );
  overflow: hidden;
  margin-top: 8px;
}

.filter-panel__bg {
  position: absolute;
  inset: 1px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dark .filter-panel__bg {
  background: rgba(15, 15, 20, 0.9);
}

.filter-panel__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

@media (min-width: 768px) {
  .filter-panel__content {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
}

/* Filter Sections */
.filter-section {
  display: flex;
  align-items: center;
}

.filter-section--search {
  flex: 1;
  min-width: 0;
}

/* Filter Group (Toggle + Chips) */
.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  /* background: rgba(0,0,0,0.03); */ /* Optional subtle background */
  padding: 4px;
  border-radius: 14px;
  transition: all 0.3s ease;
}

/* Toggle Button */
.filter-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.dark .filter-toggle {
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
}

.filter-toggle:hover {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
}

.dark .filter-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-toggle--active {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.2);
}

.dark .filter-toggle--active {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

.filter-toggle__icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.filter-toggle:active .filter-toggle__icon {
  transform: scale(0.95);
}

.filter-toggle__dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background-color: #ef4444; /* Red dot for active filter warning */
  border-radius: 50%;
  border: 2px solid #fff; /* Border to separate from button bg */
}

.dark .filter-toggle__dot {
  border-color: #1f2937;
}

/* Difficulty Section */
.filter-section--difficulty {
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 500px; /* Adjust based on max expected width */
  opacity: 1;
  transform: translateX(0);
}

.filter-section--hidden {
  max-width: 0;
  opacity: 0;
  margin: 0;
  transform: translateX(-10px);
  pointer-events: none;
}

.difficulty-chips-wrapper {
  overflow: hidden; /* Important for clipping during transition */
  padding: 2px; /* Prevent shadow clipping */
}

.difficulty-chips {
  display: flex;
  gap: 8px;
  white-space: nowrap; /* Prevent chips from wrapping weirdly during transition */
}

.filter-section--action {
  flex-shrink: 0;
}

/* Search Wrapper */
.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
  z-index: 2;
  transition: all 0.3s ease;
}

.search-wrapper:focus-within .search-icon {
  color: #6366f1;
  transform: translateY(-50%) scale(1.1);
}

.search-input {
  width: 100%;
  height: 52px;
  padding: 0 48px 0 52px;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid transparent;
  border-radius: 16px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .search-input {
  color: #f9fafb;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-input:focus {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1),
    0 4px 12px rgba(99, 102, 241, 0.15);
}

.dark .search-input:focus {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2),
    0 4px 12px rgba(99, 102, 241, 0.25);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f5f9;
  color: #6b7280;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .search-clear {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.search-clear:hover {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-50%) scale(1.1);
}

.dark .search-clear:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.search-clear svg {
  width: 14px;
  height: 14px;
}

/* Difficulty Chips */

.difficulty-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
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

/* Add Button */
.add-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 700;
  color: white;
  background: transparent;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.add-button__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.add-button:hover .add-button__bg {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.add-button__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-button__content svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.add-button:hover .add-button__content svg {
  transform: rotate(90deg);
}

.add-button__shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  z-index: 3;
  transition: left 0.5s ease;
}

.add-button:hover .add-button__shine {
  left: 100%;
}

.add-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4),
    0 5px 15px rgba(168, 85, 247, 0.3);
}

.add-button:active {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .filter-panel__content {
    padding: 16px;
  }

  /* Wrap flex-direction to keep toggle nicely placed */
  .filter-panel__content {
    flex-wrap: wrap;
  }

  .filter-section--search {
    width: 100%;
    flex: 0 0 100%; /* Force search to take full width on mobile */
  }

  .filter-group {
    flex: 1; /* Allow filter group to take remaining space */
    justify-content: flex-start;
  }

  .difficulty-chips {
    width: 100%;
    justify-content: flex-start;
  }

  .difficulty-chip {
    flex: 0 0 auto; /* Don't stretch too much */
    padding: 8px 12px;
  }

  .filter-section--difficulty {
    max-width: 100%; /* reset max width for slide down vs slide right if needed, but horizontal slide works ok */
  }

  .chip-label {
    /* display: none; */ /* Maybe keep labels on mobile if scrolling? Or hide to save space */
  }

  .add-button {
    width: auto; /* Let it size naturally or keep full width */
    flex: 0 0 auto;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .difficulty-chip {
    padding: 10px 14px;
  }
}
</style>
