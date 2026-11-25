<template>
  <div ref="root" class="relative z-30 min-w-0 space-y-2.5">
    <label :id="labelId" class="block truncate text-sm font-semibold text-gray-700 dark:text-gray-200" :title="t('srs.chooseLimit')">
      {{ t("srs.chooseLimit") }}
    </label>
    <button
      :id="triggerId"
      ref="trigger"
      type="button"
      :aria-labelledby="labelId"
      :title="`${modelValue} ${t('srs.sizeUnit')} · ${t('srs.sizeHint')}`"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-controls="listId"
      class="group flex min-h-[72px] w-full min-w-0 items-center gap-2.5 py-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-left outline-none transition-all hover:border-primary-300 hover:bg-primary-50/50 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white/10 sm:gap-3 sm:px-4"
      @click="toggle"
      @keydown.down.prevent="openAndFocus(1)"
      @keydown.up.prevent="openAndFocus(-1)"
      @keydown.esc.prevent="close"
    >
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm dark:bg-white/10 dark:text-gray-200"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="12" height="15" rx="2" />
          <path d="M9 9h11v11a2 2 0 0 1-2 2H9M8 9h4M8 13h4" />
        </svg>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-extrabold text-gray-900 dark:text-white sm:text-base"
          >{{ modelValue }} {{ t("srs.sizeUnit") }}</span
        >
        <span class="mt-0.5 line-clamp-2 text-xs leading-4 text-gray-500 dark:text-gray-400" :title="t('srs.sizeHint')">{{
          t("srs.sizeHint")
        }}</span>
      </span>
      <svg
        class="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 scale-[.98] opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      leave-to-class="translate-y-1 scale-[.98] opacity-0"
    >
      <div
        v-if="open"
        :id="listId"
        role="listbox"
        :aria-labelledby="labelId"
        class="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-gray-900/10 dark:border-white/15 dark:bg-black dark:shadow-black/50 scrollbar-custom"
        @keydown="onListKeydown"
      >
        <button
          v-for="(option, index) in options"
          :key="option"
          :ref="(el) => setOptionRef(el, index)"
          type="button"
          role="option"
          :aria-selected="option === modelValue"
          :tabindex="index === activeIndex ? 0 : -1"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          :class="
            option === modelValue
              ? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-white'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'
          "
          @click="select(option)"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-bold shadow-sm dark:bg-white/10"
            >{{ option }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold">{{ option }} {{ t("srs.sizeUnit") }}</span>
            <span v-if="option === 20" class="block text-xs text-primary-600 dark:text-gray-300">{{
              t("srs.sizeRecommended")
            }}</span>
          </span>
          <svg
            v-if="option === modelValue"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path d="m5 12 4 4 10-10" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from "vue";
import { useI18n } from "vue-i18n";
type DomRef = Element | { $el?: Element } | null;
const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const { t } = useI18n();
const options = [10, 20, 30, 50] as const;
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const optionRefs = ref<(HTMLButtonElement | null)[]>([]);
const open = ref(false);
const activeIndex = ref(1);
const uid = useId();
const labelId = "srs-size-label-" + uid;
const triggerId = "srs-size-trigger-" + uid;
const listId = "srs-size-options-" + uid;

function setOptionRef(el: DomRef, index: number) {
  optionRefs.value[index] = el instanceof HTMLButtonElement ? el : null;
}
function focusActive() {
  void nextTick(() => optionRefs.value[activeIndex.value]?.focus());
}
function close() {
  open.value = false;
  void nextTick(() => trigger.value?.focus());
}
function toggle() {
  if (open.value) {
    close();
    return;
  }
  activeIndex.value = Math.max(0, options.indexOf(props.modelValue as (typeof options)[number]));
  open.value = true;
  focusActive();
}
function openAndFocus(step: 1 | -1) {
  if (!open.value) {
    activeIndex.value = Math.max(0, options.indexOf(props.modelValue as (typeof options)[number]));
    open.value = true;
  }
  activeIndex.value = (activeIndex.value + step + options.length) % options.length;
  focusActive();
}
function select(value: number) {
  emit("update:modelValue", value);
  close();
}
function onListKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    openAndFocus(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    activeIndex.value = event.key === "Home" ? 0 : options.length - 1;
    focusActive();
  } else if (event.key === "Escape") {
    event.preventDefault();
    close();
  }
}
function onOutside(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
function onEscape(event: KeyboardEvent) {
  if (open.value && event.key === "Escape") {
    event.preventDefault();
    close();
  }
}
onMounted(() => {
  document.addEventListener("pointerdown", onOutside);
  document.addEventListener("keydown", onEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onOutside);
  document.removeEventListener("keydown", onEscape);
});
</script>
