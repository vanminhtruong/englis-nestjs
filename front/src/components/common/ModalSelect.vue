<template>
  <div class="min-w-0">
    <label :id="labelId" :for="triggerId" class="text-sm font-medium text-black/70 dark:text-white/70" :class="compactTrigger ? 'sr-only' : 'mb-2 block'">
      {{ label }}
    </label>
    <button
      :id="triggerId" ref="trigger" type="button"
      :aria-labelledby="labelId + ' ' + valueId"
      aria-haspopup="listbox" :disabled="disabled" :aria-expanded="open" :aria-controls="open ? listId : undefined"
      class="flex w-full min-w-0 items-center rounded-xl border text-left text-black outline-none transition-colors focus-visible:ring-2 dark:text-white"
      :class="[pillTrigger ? 'min-h-[30px] gap-1.5 px-2.5 py-1 text-xs font-semibold !rounded-full' : compactTrigger ? 'min-h-[32px] gap-1.5 px-2 py-1 text-xs' : 'min-h-12 gap-3 px-3.5 py-2.5 text-sm', accent === 'emerald' ? [ 'bg-white dark:bg-neutral-800 hover:border-emerald-500 focus-visible:ring-emerald-500/30', open ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-300 dark:border-emerald-600/50' ] : [ 'bg-white dark:bg-white/5 hover:border-primary-300 dark:hover:border-primary-400/50 focus-visible:ring-primary-500/30', open ? 'border-primary-500 ring-2 ring-primary-500/15 dark:border-primary-400' : 'border-black/10 dark:border-white/10' ], pillTrigger ? (onImage ? '!bg-black/40 !text-white !border-white/20' : '!bg-primary-50 !text-primary-700 !border-primary-200 dark:!bg-primary-500/10 dark:!text-primary-300 dark:!border-primary-500/25') : '', disabled ? 'cursor-not-allowed opacity-50' : '']"
      @click="open ? close() : show()" @keydown.down.prevent="show()" @keydown.up.prevent="show(true)"
    >
      <span :id="valueId" class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <template v-if="compactTrigger"><slot name="trigger-content"><span class="truncate font-medium">{{ label }}</span></slot></template>
        <template v-else-if="multiple && selectedValues.length && compactSelection">
          <span class="min-w-0 flex-1 truncate font-medium" :title="selectionText">{{ selectionText }}</span>
        </template>
        <template v-else-if="multiple && selectedValues.length">
          <span v-for="value in selectedValues" :key="value" class="max-w-full truncate rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            {{ options.find(option => option.value === value)?.label ?? value }}
          </span>
        </template>
        <template v-else-if="selectedOption && selectedOption.value">
          <component v-if="selectedOption.icon" :is="getIconComponent(selectedOption.icon)" :color="selectedOption.color" class="h-5 w-5 shrink-0" />
          <span class="min-w-0 flex-1 truncate font-medium">{{ selectedOption.label }}</span>
        </template>
        <span v-else class="min-w-0 flex-1 truncate text-black/50 dark:text-white/50">{{ placeholder || label }}</span>
      </span>
      <span v-if="multiple && maxSelections" class="shrink-0 text-xs tabular-nums text-black/50 dark:text-white/50">{{ selectedValues.length }}/{{ maxSelections }}</span>
      <svg class="h-4 w-4 shrink-0 text-black/50 transition-transform duration-150 dark:text-white/50" :class="{ 'rotate-180': open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="open" ref="panel" data-seasonal-dropdown :style="position" class="fixed z-[100000] flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 shadow-2xl shadow-black/10 dark:border-white/15 dark:shadow-black/50" :class="accent === 'emerald' ? 'dark:bg-neutral-800' : 'dark:bg-black'">
          <div v-if="searchable" class="shrink-0 space-y-1.5 px-1 pb-1.5 pt-1">
            <div class="flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-black/10 px-2.5 focus-within:border-primary-500 dark:border-white/10">
              <svg class="h-4 w-4 shrink-0 text-black/40 dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
              <input ref="searchInput" v-model="search" type="search" :aria-label="searchPlaceholder || label" :placeholder="searchPlaceholder || label" class="min-w-0 flex-1 bg-transparent py-2 text-sm text-black outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40" @keydown.down.prevent="focusFirst" />
            </div>
            <div v-if="multiple" class="flex min-w-0 items-center justify-between gap-2">
              <button v-if="selectedOnlyLabel" type="button" data-select-chosen-only :aria-pressed="selectedOnly" class="min-w-0 rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors" :class="selectedOnly ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'" @click="selectedOnly = !selectedOnly">{{ selectedOnlyLabel }} ({{ selectedValues.length }})</button>
              <span class="shrink-0 text-[11px] tabular-nums text-black/40 dark:text-white/40">{{ visibleOptions.length }}/{{ options.length }}</span>
            </div>
          </div>
          <button v-if="multiple && clearLabel && selectedValues.length" type="button" class="mb-1 flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-black/60 hover:bg-black/5 focus-visible:outline-primary-500 dark:text-white/60 dark:hover:bg-white/10" @click="clear">
            {{ clearLabel }}
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <div :id="listId" ref="listElement" :style="maxVisibleOptions ? { maxHeight: optionHeight, scrollbarGutter: visibleOptions.length > maxVisibleOptions ? 'stable' : undefined } : undefined" role="listbox" :aria-labelledby="labelId" :aria-multiselectable="multiple || undefined" class="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain scrollbar-custom" @keydown="onListKeydown">
            <button
              v-for="(option, index) in visibleOptions" :key="option.value" :ref="el => setOptionRef(el, index)"
              type="button" role="option" :aria-selected="isSelected(option.value)" :aria-disabled="isDisabled(option.value)"
              :tabindex="index === activeIndex ? 0 : -1"
              class="flex min-h-11 w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
              :class="[accent === 'emerald' ? 'focus-visible:outline-emerald-500' : 'focus-visible:outline-primary-500', isSelected(option.value) ? (accent === 'emerald' ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300') : isDisabled(option.value) ? 'cursor-not-allowed text-black/30 dark:text-white/30' : 'text-black/80 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10']"
              @click="choose(option.value)"
              @focus="activeIndex = index"
            >
              <component v-if="option.icon" :is="getIconComponent(option.icon)" :color="option.color" class="h-5 w-5 shrink-0" />
              <slot name="option-content" :option="option"><span class="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{{ option.label }}</span></slot>
              <span v-if="multiple" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border" :class="isSelected(option.value) ? 'border-primary-500 bg-primary-500 text-white' : 'border-black/15 dark:border-white/20'">
                <svg v-if="isSelected(option.value)" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg>
              </span>
              <svg v-else-if="isSelected(option.value)" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg>
            </button>
            <p v-if="!visibleOptions.length" class="px-3 py-4 text-center text-sm text-black/50 dark:text-white/50">{{ (searchable && (search || selectedOnly) ? noMatchesLabel : placeholder) || label }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useVisibleRows } from '../../composables/useVisibleRows';
import { getIconComponent } from "../../utils/iconRenderer";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}
const props = defineProps<{
  modelValue: string | string[];
  options: SelectOption[];
  label: string;
  placeholder?: string;
  multiple?: boolean;
  maxSelections?: number;
  clearLabel?: string;
  accent?: "emerald";
  searchable?: boolean;
  compactSelection?: boolean;
  compactTrigger?: boolean;
  maxVisibleOptions?: number;
  pillTrigger?: boolean;
  onImage?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
  noMatchesLabel?: string;
  selectedOnlyLabel?: string;
  selectionSummary?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string | string[]] }>();
const uid = useId();
const triggerId = "modal-select-" + uid;
const labelId = triggerId + "-label";
const valueId = triggerId + "-value";
const listId = triggerId + "-list";
const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const listElement = ref<HTMLElement | null>(null);
const optionRefs = ref<(HTMLButtonElement | null)[]>([]);
const open = ref(false);
const activeIndex = ref(0);
const position = ref<Record<string, string>>({});
const selectedValues = computed(() => Array.isArray(props.modelValue) ? props.modelValue : []);
const search = ref("");
const selectedOnly = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\u0111/g, "d");
const selectedSet = computed(() => new Set(selectedValues.value));
const selectionText = computed(() => selectedValues.value.length === 1
  ? props.options.find(option => option.value === selectedValues.value[0])?.label ?? props.selectionSummary ?? props.label
  : props.selectionSummary ?? String(selectedValues.value.length));

const visibleOptions = computed(() => {
  if (!props.searchable) return props.options;
  const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  return props.options.filter(option =>
    (!selectedOnly.value || selectedSet.value.has(option.value)) &&
    terms.every(term => normalize(option.label).includes(term))
  );
});
const optionHeight = useVisibleRows(listElement, () => visibleOptions.value.length, () => props.maxVisibleOptions);
const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue));

function isSelected(value: string) {
  return props.multiple ? selectedSet.value.has(value) : props.modelValue === value;
}
function isDisabled(value: string) {
  return !!(props.multiple && props.maxSelections && selectedValues.value.length >= props.maxSelections && !isSelected(value));
}
function setOptionRef(el: unknown, index: number) {
  optionRefs.value[index] = el instanceof HTMLButtonElement ? el : null;
}
function place() {
  const rect = trigger.value?.getBoundingClientRect();
  if (!rect) return;
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const bottom = top + (viewport?.height ?? window.innerHeight);
  const left = viewport?.offsetLeft ?? 0;
  const right = left + (viewport?.width ?? window.innerWidth);
  if (!props.searchable && (rect.bottom < top || rect.top > bottom)) { close(false); return; }
  const below = bottom - rect.bottom - 12;
  const above = rect.top - top - 12;
  // On short viewports or with the software keyboard, keep a usable search/list area.
  if (props.searchable && Math.max(below, above) < 220) {
    const width = Math.min(Math.max(rect.width, 240), right - left - 16);
    const height = Math.max(80, Math.min(340, bottom - top - 16));
    position.value = {
      left: Math.max(left + 8, Math.min(rect.left, right - width - 8)) + "px",
      top: Math.max(top + 8, top + (bottom - top - height) / 2) + "px",
      width: width + "px", maxHeight: height + "px",
    };
    return;
  }
  const upwards = below < Math.min(props.searchable ? 340 : 280, visibleOptions.value.length * 46 + (props.searchable ? 110 : 14)) && above > below;
  const height = Math.max(40, Math.min(props.searchable ? 340 : 288, upwards ? above : below));
  const width = Math.min(props.compactTrigger ? Math.max(rect.width, 240) : rect.width, right - left - 16);
  position.value = {
    left: Math.max(left + 8, Math.min(rect.left, right - width - 8)) + "px",
    width: width + "px",
    maxHeight: height + "px",
    ...(upwards ? { bottom: window.innerHeight - rect.top + 6 + "px" } : { top: rect.bottom + 6 + "px" }),
  };
}
function focusActive() {
  void nextTick(() => {
    const option = optionRefs.value[activeIndex.value];
    option?.focus({ preventScroll: true });
    if (option && panel.value) {
      const list = option.parentElement;
      if (list) {
        const itemRect = option.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
        else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
      }
    }
  });
}
function show(last = false) {
  if (open.value || props.disabled) return;
  search.value = ""; selectedOnly.value = false;
  const selected = visibleOptions.value.findIndex(option => isSelected(option.value));
  activeIndex.value = selected >= 0 ? selected : last ? Math.max(0, visibleOptions.value.length - 1) : 0;
  open.value = true;
  place();
  if (props.searchable && !window.matchMedia("(pointer: coarse)").matches) void nextTick(() => searchInput.value?.focus({ preventScroll: true }));
  else focusActive();
}
function close(restoreFocus = true) {
  if (!open.value) return;
  open.value = false;
  if (restoreFocus) trigger.value?.focus({ preventScroll: true });
}
function choose(value: string) {
  if (isDisabled(value)) return;
  if (props.multiple) {
    emit("update:modelValue", isSelected(value) ? selectedValues.value.filter(item => item !== value) : [...selectedValues.value, value]);
  } else {
    emit("update:modelValue", value);
    close();
  }
}
function clear() {
  emit("update:modelValue", []);
  activeIndex.value = 0;
  focusActive();
}
function focusFirst() { activeIndex.value = 0; focusActive(); }
watch([search, selectedOnly], () => { activeIndex.value = 0; if (panel.value) { const list = panel.value.querySelector("[role=listbox]"); if (list) list.scrollTop = 0; } });
watch(() => visibleOptions.value.length, length => { activeIndex.value = Math.min(activeIndex.value, Math.max(0, length - 1)); });
function onListKeydown(event: KeyboardEvent) {
  const length = visibleOptions.value.length;
  if (!length) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + (event.key === "ArrowDown" ? 1 : -1) + length) % length;
    focusActive();
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    activeIndex.value = event.key === "Home" ? 0 : length - 1;
    focusActive();
  }
}
function outside(event: PointerEvent) {
  const target = event.target as Node;
  if (open.value && !trigger.value?.contains(target) && !panel.value?.contains(target)) close(false);
}
function keyboard(event: KeyboardEvent) {
  if (!open.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
  } else if (event.key === "Tab") {
    if (props.searchable && panel.value?.contains(document.activeElement)) {
      const focusable = [...panel.value.querySelectorAll<HTMLElement>('input, button:not([tabindex="-1"])')].filter(el => !el.hasAttribute("disabled"));
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      const next = focusable[index + (event.shiftKey ? -1 : 1)];
      if (next) { event.preventDefault(); next.focus({ preventScroll: true }); return; }
    }
    close();
  }
}
function onScroll(event: Event) {
  if (open.value && (!(event.target instanceof Node) || !panel.value?.contains(event.target))) {
    if (props.searchable && document.activeElement === searchInput.value) place(); else close(false);
  }
}
function onResize() { if (open.value) place(); }
watch(() => props.options.length, onResize);
onMounted(() => {
  document.addEventListener("pointerdown", outside);
  document.addEventListener("keydown", keyboard, true);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", outside);
  document.removeEventListener("keydown", keyboard, true);
  window.removeEventListener("scroll", onScroll, true);
  window.removeEventListener("resize", onResize);
  window.visualViewport?.removeEventListener("resize", onResize);
});
</script>
