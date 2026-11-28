<template>
  <div
    class="flex max-h-[min(74dvh,520px)] min-h-0 flex-col overflow-hidden bg-white text-black dark:bg-black dark:text-white"
  >
    <div
      class="max-h-[min(50dvh,330px)] shrink-0 overflow-y-auto border-b border-black/10 px-3 pb-3 pt-3 dark:border-white/10 scrollbar-custom"
    >
      <div
        class="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/10"
        role="group"
        :aria-label="t('background.uploadMethod')"
      >
        <button
          v-for="method in uploadMethods"
          :key="method.id"
          type="button"
          :disabled="busy"
          class="min-w-0 rounded-lg border border-transparent px-1.5 py-2 text-center text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50 disabled:opacity-50 dark:focus-visible:outline-white/50"
          :class="
            mode === method.id
              ? 'bg-white text-black shadow-sm dark:border-white/15 dark:bg-black dark:text-white dark:shadow-none'
              : 'text-gray-500 hover:bg-white/70 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
          "
          data-seasonal-tab :aria-pressed="mode === method.id"
          @click="switchMode(method.id)"
        >
          <span class="mr-0.5" aria-hidden="true">{{ method.icon }}</span>
          {{ t(method.label) }}
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        class="sr-only"
        accept="image/png,image/jpeg,image/webp"
        :disabled="busy"
        :aria-label="t('background.chooseImage')"
        @change="onFileChange"
      />

      <div
        v-if="mode === 'file'"
        class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-black/[0.025] px-3 py-4 text-center dark:border-white/20 dark:bg-white/5"
      >
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/80"
        >
          <svg
            aria-hidden="true"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 16V4m-5 5 5-5 5 5M4 17v3h16v-3" />
          </svg>
        </div>
        <p class="text-xs font-semibold text-black/80 dark:text-white/85">
          {{ t("background.uploadOwn") }}
        </p>
        <p class="text-[11px] leading-5 text-black/50 dark:text-white/55">
          {{ t("background.uploadFormats") }}
        </p>
        <button
          type="button"
          :disabled="busy"
          class="inline-flex min-h-9 items-center justify-center rounded-xl border border-black/10 bg-black px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black/80 disabled:opacity-50 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
          @click="fileInput?.click()"
        >
          {{ t("background.chooseImage") }}
        </button>
      </div>

      <div
        v-else-if="mode === 'clipboard'"
        tabindex="0"
        role="region"
        :aria-label="t('background.pasteImageHint')"
        class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-black/[0.025] px-3 py-5 text-center outline-none transition-colors focus-visible:border-black/40 dark:border-white/20 dark:bg-white/5 dark:focus-visible:border-white/50"
      >
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/80"
        >
          <svg
            aria-hidden="true"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4v-2h6v2M9 12h6M9 16h4" />
          </svg>
        </div>
        <p class="text-xs font-semibold">{{ t("background.pasteImageHint") }}</p>
        <p class="text-[11px] leading-5 text-black/55 dark:text-white/60">
          {{ t("background.pasteImageDescription") }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <kbd
            class="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-bold shadow-sm dark:border-white/10 dark:bg-black dark:text-gray-200 dark:shadow-none"
            >Ctrl + V</kbd
          >
          <button
            type="button"
            :disabled="busy"
            class="inline-flex min-h-9 items-center justify-center rounded-lg border border-black/10 bg-black px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black/80 disabled:opacity-50 dark:border-white/20 dark:bg-white/15 dark:hover:bg-white/25"
            @click="readClipboardImage"
          >
            {{ t("background.pasteFromClipboard") }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="space-y-2 rounded-xl border border-black/10 bg-black/[0.025] p-3 dark:border-white/15 dark:bg-white/5"
      >
        <label
          for="personal-background-url"
          class="block text-xs font-semibold text-black/80 dark:text-white/85"
        >
          {{ t("background.urlImageLabel") }}
        </label>
        <div
          class="flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-black"
        >
          <svg
            aria-hidden="true"
            class="h-4 w-4 shrink-0 text-black/50 dark:text-white/55"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"
            />
          </svg>
          <input
            id="personal-background-url"
            v-model.trim="urlDraft"
            type="url"
            inputmode="url"
            autocomplete="url"
            spellcheck="false"
            :disabled="busy"
            :placeholder="t('background.urlPlaceholder')"
            class="min-w-0 flex-1 bg-transparent text-xs text-black outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
            @keydown.enter.prevent="importUrl"
          />
        </div>
        <p class="text-[11px] leading-5 text-black/55 dark:text-white/60">
          {{ t("background.urlHint") }}
        </p>
        <button
          type="button"
          :disabled="busy || !urlDraft.trim()"
          class="inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-black px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-45 dark:border dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
          data-seasonal-primary @click="importUrl"
        >
          {{ uploading ? t("background.uploading") : t("background.importUrlButton") }}
        </button>
      </div>

      <div
        v-if="previewUrl && selectedFile && mode !== 'url'"
        class="mt-3 flex items-center gap-3 rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-white/5"
      >
        <img :src="previewUrl" alt="" class="h-16 w-20 shrink-0 rounded-lg object-cover" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold">{{ selectedFile.name }}</p>
          <p class="mt-1 text-[11px] text-black/55 dark:text-white/60">
            {{ t("background.readyToUpload") }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              :disabled="busy"
              class="rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-black/85 disabled:opacity-50 dark:bg-white/20 dark:hover:bg-white/30"
              data-seasonal-primary @click="uploadSelected"
            >
              {{ uploading ? t("background.uploading") : t("background.uploadAndApply") }}
            </button>
            <button
              type="button"
              :disabled="busy"
              class="rounded-lg bg-black/5 px-2 py-1.5 text-xs font-semibold text-black/70 hover:bg-black/10 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20"
              @click="clearFile"
            >
              {{ t("common.cancel") }}
            </button>
          </div>
        </div>
      </div>

      <p
        v-if="error"
        role="alert"
        class="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300"
      >
        {{ error }}
      </p>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-3 scrollbar-custom">
      <div class="mb-2 flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-black/75 dark:text-white/80">{{
          t("background.myBackgrounds")
        }}</span>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-[11px] font-semibold text-black/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
          :disabled="loading"
          @click="loadMine"
        >
          {{ t("background.refreshBackgrounds") }}
        </button>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-3 gap-2"
        role="status"
        :aria-label="t('common.loading')"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="aspect-[4/3] animate-pulse rounded-xl bg-black/5 dark:bg-white/10"
        ></div>
      </div>
      <p
        v-else-if="backgrounds.length === 0"
        class="rounded-xl border border-black/10 bg-black/[0.02] px-3 py-5 text-center text-xs leading-5 text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
      >
        {{ t("background.emptyPersonal") }}
      </p>
      <div v-else class="grid grid-cols-3 gap-2">
        <button
          v-for="background in backgrounds"
          :key="background.id"
          type="button"
          class="group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60 dark:focus-visible:outline-white/70"
          :class="
            selectedUrl === absoluteUrl(background.url)
              ? 'border-black dark:border-white/40 dark:ring-1 dark:ring-white/20'
              : 'border-transparent hover:border-black/30 dark:hover:border-white/30'
          "
          :title="background.name"
          :aria-label="background.name"
          :aria-pressed="selectedUrl === absoluteUrl(background.url)"
          @click="emit('select', absoluteUrl(background.url))"
        >
          <img
            :src="absoluteUrl(background.url)"
            :alt="background.name"
            loading="lazy"
            class="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <span
            class="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-1 text-[10px] font-medium text-white"
            >{{ background.name }}</span
          >
          <span
            v-if="selectedUrl === absoluteUrl(background.url)"
            class="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white dark:border dark:border-white/20 dark:bg-black dark:text-white"
            >✓</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveAssetUrl } from "@/utils/assetUrl";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import api, { API_URL } from "../../services/api.service";
import type { UserBackground } from "../../types/user-background";

defineProps<{ selectedUrl?: string | null }>();
const emit = defineEmits<{ select: [url: string] }>();
const { t } = useI18n();

type UploadMode = "file" | "clipboard" | "url";
const uploadMethods: { id: UploadMode; icon: string; label: string }[] = [
  { id: "file", icon: "▣", label: "background.sourceFile" },
  { id: "clipboard", icon: "▤", label: "background.sourceClipboard" },
  { id: "url", icon: "🔗", label: "background.sourceUrl" },
];

const mode = ref<UploadMode>("file");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const urlDraft = ref("");
const backgrounds = ref<UserBackground[]>([]);
const loading = ref(false);
const uploading = ref(false);
const error = ref("");
const busy = computed(() => uploading.value);

function absoluteUrl(path: string): string {
  return resolveAssetUrl(path);
}
function clearFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
}
function switchMode(next: UploadMode) {
  if (busy.value) return;
  mode.value = next;
  error.value = "";
  clearFile();
}
function normalizeClipboardImage(file: File): File {
  if (["image/png", "image/jpeg", "image/webp"].includes(file.type)) return file;
  const extension = file.name.split(".").pop()?.toLowerCase();
  const mime =
    extension === "png"
      ? "image/png"
      : extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : extension === "webp"
          ? "image/webp"
          : null;
  // The backend checks the actual image magic bytes, not just this file name.
  if (mime && (!file.type || file.type === "application/octet-stream")) {
    return new File([file], file.name, { type: mime });
  }
  return file;
}
function looksLikeImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
}
function useImageFile(file: File, source: "file" | "clipboard") {
  if (busy.value) return;
  clearFile();
  error.value = "";
  if (source === "clipboard") file = normalizeClipboardImage(file);
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    !file.size ||
    file.size > 5 * 1024 * 1024
  ) {
    error.value = t("background.invalidUpload");
    return;
  }
  selectedFile.value = file;
  mode.value = source;
  previewUrl.value = URL.createObjectURL(file);
}
function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) useImageFile(file, "file");
}
function onPaste(event: ClipboardEvent) {
  if (busy.value) return;
  const clipboard = event.clipboardData;
  if (!clipboard) return;
  const image =
    Array.from(clipboard.files).find(looksLikeImageFile) ||
    Array.from(clipboard.items)
      .map((item) => (item.kind === "file" ? item.getAsFile() : null))
      .find((file): file is File => !!file && looksLikeImageFile(file));
  if (image) {
    event.preventDefault();
    useImageFile(image, "clipboard");
    return;
  }
  const target = event.target as HTMLElement | null;
  const editing = !!target?.closest("input,textarea,[contenteditable=true]");
  if (editing) return;
  const text = clipboard.getData("text/plain").trim();
  if (/^https?:\/\//i.test(text)) {
    event.preventDefault();
    urlDraft.value = text;
    mode.value = "url";
    error.value = "";
    clearFile();
  }
}
async function readClipboardImage() {
  if (busy.value) return;
  if (!navigator.clipboard?.read) {
    error.value = t("background.clipboardReadFailed");
    return;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((name) =>
        ["image/png", "image/jpeg", "image/webp"].includes(name),
      );
      if (!type) continue;
      const blob = await item.getType(type);
      const extension = type === "image/jpeg" ? "jpg" : type.split("/")[1];
      const file = new File([blob], `pasted-image.${extension}`, { type });
      useImageFile(file, "clipboard");
      return;
    }
    error.value = t("background.clipboardReadFailed");
  } catch {
    error.value = t("background.clipboardReadFailed");
  }
}
async function loadMine() {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.background.getMine();
    backgrounds.value = response.data;
  } catch {
    error.value = t("background.loadPersonalFailed");
  } finally {
    loading.value = false;
  }
}
function saveAndApply(item: UserBackground) {
  backgrounds.value = [item, ...backgrounds.value.filter((bg) => bg.id !== item.id)];
  clearFile();
  emit("select", absoluteUrl(item.url));
}
async function uploadSelected() {
  if (!selectedFile.value || busy.value) return;
  uploading.value = true;
  error.value = "";
  try {
    const response = await api.background.uploadMine(selectedFile.value);
    saveAndApply(response.data);
  } catch {
    error.value = t("background.uploadFailed");
  } finally {
    uploading.value = false;
  }
}
function isValidImageUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return (
      parsed.protocol === "https:" &&
      !!parsed.hostname &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port
    );
  } catch {
    return false;
  }
}
async function importUrl() {
  if (busy.value) return;
  if (!isValidImageUrl(urlDraft.value)) {
    error.value = t("background.invalidImageUrl");
    return;
  }
  uploading.value = true;
  error.value = "";
  try {
    const response = await api.background.importMineFromUrl(urlDraft.value.trim());
    urlDraft.value = "";
    saveAndApply(response.data);
  } catch {
    error.value = t("background.urlImportFailed");
  } finally {
    uploading.value = false;
  }
}
onMounted(() => {
  void loadMine();
  document.addEventListener("paste", onPaste);
});
onBeforeUnmount(() => {
  document.removeEventListener("paste", onPaste);
  clearFile();
});
</script>
