<template>
  <div class="relative group/header" :class="{ 'z-50': isEditing }">
    <!-- Topic Badge/Input -->
    <div
      class="absolute left-1/2 -translate-x-1/2 z-20 -top-4 translate-y-0 md:top-1/2 md:-translate-y-1/2"
      @click.stop
    >
      <div
        class="flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm border transition-all duration-300"
        :class="[
          isEditing
            ? 'bg-white dark:bg-zinc-800 border-primary-500 ring-2 ring-primary-500/20'
            : hasBackground
            ? 'bg-black/40 backdrop-blur-md border-white/20 shadow-lg'
            : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md',
        ]"
        :style="
          !isEditing && !hasBackground && color && color !== '#000000'
            ? { borderColor: color, boxShadow: `inset 0 0 0 100px ${color}10` }
            : {}
        "
      >
        <!-- View Mode -->
        <template v-if="!isEditing">
          <div class="view-mode-content">
            <!-- Icon with background -->
            <div
              v-if="icon"
              class="icon-wrapper"
              :class="{ 'bg-white/20': hasBackground }"
              :style="
                hasBackground
                  ? { color: '#ffffff' }
                  : color && color !== '#000000'
                  ? {
                      backgroundColor: `${color}20`,
                      color: color,
                    }
                  : {}
              "
            >
              <component :is="getIconComponent(icon)" class="w-4 h-4" />
            </div>
            <!-- Default icon when no icon selected -->
            <div
              v-else-if="topic"
              class="icon-wrapper"
              :class="hasBackground ? 'bg-white/20 text-white' : 'default-icon'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>

            <!-- Topic Text -->
            <span
              class="topic-text"
              :class="[
                topic ? 'has-topic' : 'no-topic',
                hasBackground ? 'text-white' : '',
              ]"
              :style="
                !hasBackground &&
                topic &&
                color &&
                color !== '#000000' &&
                !isDarkColor(color)
                  ? { color: color }
                  : {}
              "
              :title="topic"
            >
              {{ truncatedTopic || "Add a topic..." }}
            </span>
          </div>

          <!-- Edit Button -->
          <button
            @click="startEditing"
            class="edit-btn"
            :class="{
              'text-white/80 hover:text-white hover:bg-white/20': hasBackground,
            }"
            title="Edit topic"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="edit-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
          </button>
        </template>

        <!-- Edit Mode -->
        <template v-else>
          <div class="edit-mode-container">
            <div class="edit-controls">
              <!-- Icon Selector -->
              <div class="control-item">
                <IconSelector v-model="editIcon" :color="editColor" />
              </div>

              <!-- Color Input -->
              <div class="color-picker-wrapper">
                <div
                  class="color-picker"
                  :style="{
                    backgroundColor: editColor,
                    boxShadow: `0 0 12px ${editColor}60`,
                  }"
                >
                  <input
                    type="color"
                    v-model="editColor"
                    class="color-input"
                    title="Choose color"
                  />
                </div>
              </div>

              <!-- Text Input -->
              <div class="input-wrapper">
                <input
                  ref="inputRef"
                  type="text"
                  v-model="editValue"
                  @keyup.enter="saveTopic"
                  @keyup.esc="cancelEditing"
                  placeholder="Enter topic..."
                  class="topic-input"
                  :style="
                    editColor !== '#000000'
                      ? { '--accent-color': editColor }
                      : {}
                  "
                />
                <div
                  class="input-underline"
                  :style="{ backgroundColor: editColor }"
                ></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button
                @click="saveTopic"
                class="action-btn save-btn"
                title="Save"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="btn-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                @click="cancelEditing"
                class="action-btn cancel-btn"
                title="Cancel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="btn-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <button
      @click="$emit('toggle')"
      class="w-full px-6 py-4 flex items-center justify-between transition-colors rounded-t-2xl"
    >
      <div class="flex items-center gap-4">
        <!-- Calendar Date Card -->
        <div class="calendar-card">
          <div class="calendar-header">
            <span class="calendar-month">{{ monthAbbr }}</span>
          </div>
          <div class="calendar-body">
            <span class="calendar-day">{{ dayNumber }}</span>
          </div>
          <div class="calendar-fold"></div>
        </div>
        <div class="text-left">
          <h3 class="text-lg font-semibold text-black dark:text-white">
            {{ formattedDate }}
          </h3>
          <p class="text-sm text-black/50 dark:text-white/60">
            {{ count }} {{ wordsCountText }}
          </p>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-black/40 dark:text-white/50 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed, defineAsyncComponent } from "vue";
import { getIconComponent } from "../../../utils/iconRenderer";

const IconSelector = defineAsyncComponent(() => import("./IconSelector.vue"));

const props = defineProps<{
  dayNumber: number;
  formattedDate: string;
  count: number;
  wordsCountText: string;
  isExpanded: boolean;
  topic?: string;
  icon?: string;
  color?: string;
  hasBackground?: boolean;
}>();

// Extract month abbreviation from formattedDate
const monthAbbr = computed(() => {
  // Try to extract month from formattedDate like "Tuesday, November 18, 2025"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const fullMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (let i = 0; i < fullMonths.length; i++) {
    if (props.formattedDate.includes(fullMonths[i])) {
      return months[i];
    }
  }

  // Fallback: try to match abbreviated month
  for (const month of months) {
    if (props.formattedDate.includes(month)) {
      return month;
    }
  }

  return "N/A";
});

const emit = defineEmits<{
  toggle: [];
  "update-topic": [topic: string, icon?: string, color?: string];
  "editing-change": [isEditing: boolean];
}>();

const isEditing = ref(false);
const editValue = ref("");
const editIcon = ref("");
const editColor = ref("#000000");
const inputRef = ref<HTMLInputElement | null>(null);

function startEditing() {
  editValue.value = props.topic || "";
  editIcon.value = props.icon || "";
  editColor.value = props.color || "#000000";
  isEditing.value = true;
  emit("editing-change", true);
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function cancelEditing() {
  isEditing.value = false;
  emit("editing-change", false);
  editValue.value = "";
}

function saveTopic() {
  if (
    editValue.value.trim() !== props.topic ||
    editIcon.value !== props.icon ||
    editColor.value !== props.color
  ) {
    emit(
      "update-topic",
      editValue.value.trim(),
      editIcon.value,
      editColor.value
    );
  }
  isEditing.value = false;
  emit("editing-change", false);
}

// Watch for external topic updates
watch(
  () => [props.topic, props.icon, props.color],
  ([newTopic, newIcon, newColor]) => {
    if (!isEditing.value) {
      editValue.value = newTopic || "";
      editIcon.value = newIcon || "";
      editColor.value = newColor || "#000000";
    }
  }
);

const truncatedTopic = computed(() => {
  if (!props.topic) return "";
  const words = props.topic.split(" ");
  if (words.length > 6) {
    return words.slice(0, 6).join(" ") + "...";
  }
  return props.topic;
});

function isDarkColor(color: string) {
  if (!color) return false;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 100; // Consider colors with brightness < 100 as "dark"
}
</script>

<style scoped>
/* Calendar Card Styles */
.calendar-card {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.calendar-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.calendar-header {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  padding: 3px 0 2px 0;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

.calendar-header::after {
  content: "";
  position: absolute;
  left: 6px;
  right: 6px;
  top: 1px;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
}

.calendar-month {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.calendar-body {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  min-height: 0;
}

.calendar-body::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.05),
    transparent
  );
}

.calendar-day {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  font-family: "Segoe UI", system-ui, sans-serif;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.calendar-fold {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.08) 50%);
  pointer-events: none;
}

/* Dark mode calendar */
:root.dark .calendar-body,
html.dark .calendar-body {
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
}

:root.dark .calendar-day,
html.dark .calendar-day {
  color: #f3f4f6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

:root.dark .calendar-fold,
html.dark .calendar-fold {
  background: linear-gradient(
    135deg,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 50%
  );
}

/* View Mode Styles */
.view-mode-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.15) 0%,
    rgba(139, 92, 246, 0.15) 100%
  );
  color: #8b5cf6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-wrapper:hover {
  transform: scale(1.05);
}

.icon-wrapper.default-icon {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.topic-text {
  font-size: 13px;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.topic-text.has-topic {
  color: #e5e7eb;
  letter-spacing: 0.01em;
}

.topic-text.no-topic {
  color: #6b7280;
  font-style: italic;
  font-weight: 400;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.edit-btn:active {
  transform: translateY(0);
}

.edit-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.edit-btn:hover .edit-icon {
  transform: rotate(-8deg);
}

/* Light mode adjustments for View Mode */
:root:not(.dark) .topic-text.has-topic,
html:not(.dark) .topic-text.has-topic {
  color: #374151;
}

:root:not(.dark) .edit-btn,
html:not(.dark) .edit-btn {
  background: rgba(0, 0, 0, 0.05);
}

:root:not(.dark) .edit-btn:hover,
html:not(.dark) .edit-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

/* Edit Mode Container */
.edit-mode-container {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.edit-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-item {
  display: flex;
  align-items: center;
}

/* Color Picker */
.color-picker-wrapper {
  position: relative;
}

.color-picker {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.color-picker:hover {
  transform: scale(1.15);
}

.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
  min-width: 140px;
}

.topic-input {
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.topic-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.topic-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--accent-color, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.topic-input:focus + .input-underline {
  width: 90%;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  margin-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.save-btn:hover .btn-icon {
  transform: scale(1.1);
}

.save-btn:active {
  transform: translateY(0);
}

.cancel-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.cancel-btn:hover .btn-icon {
  transform: scale(1.1) rotate(90deg);
}

.cancel-btn:active {
  transform: translateY(0);
}

/* Light mode adjustments */
:root:not(.dark) .topic-input,
html:not(.dark) .topic-input {
  color: #1f2937;
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

:root:not(.dark) .topic-input::placeholder,
html:not(.dark) .topic-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

:root:not(.dark) .topic-input:focus,
html:not(.dark) .topic-input:focus {
  background: rgba(0, 0, 0, 0.06);
}

:root:not(.dark) .action-buttons,
html:not(.dark) .action-buttons {
  border-left-color: rgba(0, 0, 0, 0.1);
}
</style>
