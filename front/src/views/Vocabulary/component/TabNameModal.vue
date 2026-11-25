<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="headingId"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5"
    >
      <div
        class="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
      >
        <header
          class="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 bg-white px-5 py-5 dark:border-white/10 dark:bg-transparent sm:px-7 sm:py-6"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-black shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <svg
                width="23"
                height="23"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2
                :id="headingId"
                class="text-lg font-bold tracking-tight text-black dark:text-white sm:text-xl"
              >
                {{ t(isEditing ? "vocabulary.tabEditTitle" : "vocabulary.tabCreateTitle") }}
              </h2>
              <p class="mt-1 text-xs leading-5 text-black/60 dark:text-white/60">
                {{ t("vocabulary.tabModalSubtitle") }}
              </p>
            </div>
          </div>
          <button
            type="button"
            :disabled="saving"
            :aria-label="t('vocabulary.close')"
            class="rounded-xl p-2 text-black/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5 disabled:opacity-40"
            @click="emit('close')"
          >
            <svg
              width="20"
              height="20"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form
          id="vocabulary-tab-editor"
          class="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7 scrollbar-custom"
          @submit.prevent="submitTab"
        >
          <div>
            <label
              for="vocabulary-tab-name"
              class="mb-2 block text-sm font-medium text-black/70 dark:text-white/70"
              >{{ t("vocabulary.tabNameLabel") }}</label
            >
            <input
              id="vocabulary-tab-name"
              ref="inputRef"
              v-model="tabName"
              type="text"
              maxlength="80"
              autocomplete="off"
              required
              :placeholder="t('vocabulary.tabNamePlaceholder')"
              class="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition-all placeholder:text-black/40 focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30 dark:focus:ring-white/10"
            />
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-black/70 dark:text-white/70">
                {{ t("vocabulary.tabIconLabel") }}
              </h3>
              <p class="mt-1 text-xs leading-5 text-black/60 dark:text-white/60">
                {{ t("vocabulary.tabIconHint") }}
              </p>
            </div>

            <div
              class="flex items-center gap-4 rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt=""
                  class="h-full w-full object-cover"
                />
                <TabIcon v-else :icon="icon" size="lg" bare />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-black dark:text-white">
                  {{ tabName.trim() || t("vocabulary.tabPreviewName") }}
                </p>
                <p class="mt-1 text-xs leading-5 text-black/60 dark:text-white/60">
                  {{ t("vocabulary.tabPreviewHint") }}
                </p>
              </div>
              <button
                v-if="icon || file"
                type="button"
                :disabled="saving"
                :title="t('vocabulary.tabRemoveIcon')"
                class="rounded-lg p-2 text-black/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                @click="removeIcon"
              >
                <svg
                  width="17"
                  height="17"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <p class="mb-2 text-xs font-medium text-black/70 dark:text-white/70">
                {{ t("vocabulary.tabIconPresets") }}
              </p>
              <div
                class="grid grid-cols-5 gap-2 sm:grid-cols-10"
                role="group"
                :aria-label="t('vocabulary.tabIconPresets')"
              >
                <button
                  v-for="preset in TAB_ICON_PRESETS"
                  :key="preset"
                  type="button"
                  :disabled="saving"
                  :aria-pressed="icon === preset && !file"
                  :title="preset"
                  class="flex h-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50 dark:focus-visible:outline-white/50 disabled:opacity-40"
                  :class="
                    icon === preset && !file
                      ? 'border-black/30 bg-black/10 ring-1 ring-black/10 dark:border-white/40 dark:bg-white/20 dark:ring-white/10'
                      : 'border-black/10 bg-white hover:border-black/30 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white/10'
                  "
                  @click="selectPreset(preset)"
                >
                  <TabIcon :icon="preset" size="sm" bare />
                </button>
              </div>
            </div>

            <div>
              <input
                ref="fileInputRef"
                type="file"
                class="sr-only"
                accept="image/png,image/jpeg,image/webp"
                :disabled="saving"
                @change="chooseFile"
              />
              <button
                type="button"
                :disabled="saving"
                class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-white px-4 py-3 text-sm font-medium text-black/70 transition hover:border-black/40 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50 disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:outline-white/50"
                @click="fileInputRef?.click()"
              >
                <svg
                  width="19"
                  height="19"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                >
                  <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" />
                </svg>
                {{ t("vocabulary.tabUploadIcon") }}
              </button>
              <p class="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
                {{ t("vocabulary.tabUploadHint") }}
              </p>
              <p
                v-if="fileError"
                class="mt-2 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300"
                role="alert"
              >
                {{ fileError }}
              </p>
            </div>
          </div>
        </form>

        <footer
          class="grid shrink-0 grid-cols-2 gap-3 border-t border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-transparent sm:px-7"
        >
          <button
            type="button"
            :disabled="saving"
            class="inline-flex h-12 items-center justify-center rounded-xl bg-black/10 px-3 text-sm font-semibold text-black transition hover:bg-black/20 disabled:opacity-50 dark:border dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            @click="emit('close')"
          >
            {{ t("vocabulary.cancel") }}
          </button>
          <button
            form="vocabulary-tab-editor"
            type="submit"
            :disabled="saving || !tabName.trim() || !!fileError"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            <span
              v-if="saving"
              class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            ></span>
            {{
              saving
                ? t("vocabulary.tabSaving")
                : t(isEditing ? "vocabulary.tabSave" : "vocabulary.tabCreate")
            }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import TabIcon from "../../../components/common/TabIcon.vue";
import { TAB_ICON_PRESETS } from "../constants/tabIcons";

const props = withDefaults(
  defineProps<{
    show: boolean;
    isEditing: boolean;
    initialName?: string;
    initialIcon?: string | null;
    saving?: boolean;
  }>(),
  { saving: false },
);
const emit = defineEmits<{
  close: [];
  submit: [payload: { name: string; icon: string | null; file?: File | null }];
}>();
const { t } = useI18n();
const { lockScroll, unlockScroll } = useModalScrollLock();
const headingId = useId();
const tabName = ref("");
const icon = ref<string | null>("book");
const file = ref<File | null>(null);
const previewUrl = ref("");
const fileError = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

function clearFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  file.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
}
function selectPreset(preset: string) {
  clearFile();
  fileError.value = "";
  icon.value = preset;
}
function removeIcon() {
  clearFile();
  fileError.value = "";
  icon.value = null;
}
function chooseFile(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0];
  if (!selected) return;
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(selected.type) ||
    selected.size > 2 * 1024 * 1024 ||
    selected.size === 0
  ) {
    fileError.value = t("vocabulary.tabInvalidIcon");
    clearFile();
    return;
  }
  clearFile();
  fileError.value = "";
  icon.value = null;
  file.value = selected;
  previewUrl.value = URL.createObjectURL(selected);
}
function submitTab() {
  if (props.saving || !tabName.value.trim() || fileError.value) return;
  emit("submit", { name: tabName.value.trim(), icon: icon.value, file: file.value });
}
watch(
  () => props.show,
  (visible) => {
    if (visible) {
      lockScroll();
      clearFile();
      fileError.value = "";
      tabName.value = props.initialName ?? "";
      icon.value = props.initialIcon === undefined ? "book" : props.initialIcon;
      void nextTick(() => inputRef.value?.focus());
    } else {
      unlockScroll();
      clearFile();
    }
  },
  { immediate: true },
);
onBeforeUnmount(clearFile);
</script>
