<template>
  <div
    class="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none"
    style="width: 340px; max-width: calc(100vw - 2rem)"
    aria-live="assertive"
  >
    <TransitionGroup name="toast-slide" tag="div" class="flex flex-col gap-2.5">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto relative overflow-hidden rounded-2xl shadow-xl border"
        :class="[
          'bg-white dark:bg-black',
          'border-black/8 dark:border-white/10',
        ]"
      >
        <!-- Left color bar -->
        <div
          class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          :class="barClass(toast.type)"
        />

        <!-- Main content row -->
        <div class="flex items-start gap-3 pl-4 pr-4 pt-3.5 pb-3.5">
          <!-- Icon badge -->
          <div
            class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            :class="iconBgClass(toast.type)"
          >
            <!-- Success -->
            <svg
              v-if="toast.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="iconColorClass(toast.type)"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <!-- Error -->
            <svg
              v-else-if="toast.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="iconColorClass(toast.type)"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <!-- Warning -->
            <svg
              v-else-if="toast.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="iconColorClass(toast.type)"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <!-- Info -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="iconColorClass(toast.type)"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0 pt-0.5">
            <p
              class="text-sm text-gray-800 dark:text-white/90 leading-snug font-medium"
              :class="{ 'pr-6': !toast.actionLabel }"
            >
              {{ toast.message }}
            </p>

            <!-- Confirm buttons -->
            <div v-if="toast.actionLabel" class="flex items-center gap-2 mt-3">
              <button
                type="button"
                class="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95"
                :class="confirmBtnClass(toast.type)"
                @click="triggerAction(toast.id)"
              >
                {{ toast.actionLabel }}
              </button>
              <button
                type="button"
                class="py-1.5 px-3 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/10 text-gray-500 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/15 transition-all duration-150 active:scale-95 whitespace-nowrap"
                @click="removeToast(toast.id)"
              >
                {{ t("common.cancel") }}
              </button>
            </div>
          </div>

          <!-- Close button (only on non-confirm) -->
          <button
            v-if="!toast.actionLabel"
            type="button"
            class="absolute top-3 right-3 p-1 rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-150"
            @click="removeToast(toast.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Progress bar (chỉ với toast thường, không confirm) -->
        <div
          v-if="!toast.actionLabel"
          class="absolute bottom-0 left-0 right-0 h-[2px]"
        >
          <div
            class="h-full toast-progress"
            :class="progressClass(toast.type)"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "../../composables/useToast";
import type { ToastType } from "../../composables/useToast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { toasts, removeToast, triggerAction } = useToast();

function barClass(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-400",
    info: "bg-gradient-to-b from-primary-500 to-secondary-500",
  };
  return map[type];
}

function iconBgClass(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: "bg-green-50 dark:bg-green-500/20",
    error: "bg-red-50 dark:bg-red-500/20",
    warning: "bg-yellow-50 dark:bg-yellow-400/20",
    info: "bg-primary-50 dark:bg-primary-500/20",
  };
  return map[type];
}

function iconColorClass(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-300",
    info: "text-primary-600 dark:text-primary-400",
  };
  return map[type];
}

function confirmBtnClass(type: ToastType) {
  const map: Record<ToastType, string> = {
    success:
      "bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-500/30",
    error: "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/30",
    warning:
      "bg-yellow-400 hover:bg-yellow-500 text-black shadow-sm shadow-yellow-400/30",
    info: "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-sm shadow-primary-500/30",
  };
  return map[type];
}

function progressClass(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-400",
    info: "bg-gradient-to-r from-primary-500 to-secondary-500",
  };
  return map[type];
}
</script>

<style scoped>
/* Slide-in từ phải */
.toast-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 1, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.92);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.92);
}
.toast-slide-move {
  transition: transform 0.28s ease;
}

/* Progress bar shrink */
.toast-progress {
  animation: shrink 3s linear forwards;
  transform-origin: left;
}
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
