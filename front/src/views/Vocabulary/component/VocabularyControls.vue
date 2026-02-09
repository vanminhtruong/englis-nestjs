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
import { toRefs } from "vue";

const props = defineProps<{
  search: string;
  labels: {
    searchPlaceholder: string;
    addNew: string;
  };
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "create"): void;
}>();

const { search, labels } = toRefs(props);

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
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  overflow: hidden;
  margin-top: 8px;
}

.dark .filter-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
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
  background: rgba(0, 0, 0, 0.8);
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
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
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
    flex-wrap: wrap;
  }

  .filter-section--search {
    width: 100%;
    flex: 0 0 100%;
  }

  .add-button {
    width: auto;
    flex: 0 0 auto;
  }
}
</style>
