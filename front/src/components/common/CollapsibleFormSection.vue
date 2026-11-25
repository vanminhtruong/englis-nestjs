<template>
  <section
    class="min-w-0 rounded-2xl border border-black/10 bg-white transition-colors dark:border-white/10 dark:bg-white/5"
    :class="{ 'border-primary-300 dark:border-primary-500/40': modelValue }"
  >
    <button
      :id="headingId"
      type="button"
      :aria-expanded="modelValue"
      :aria-controls="panelId"
      class="group flex w-full min-w-0 items-center rounded-2xl text-left outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:hover:bg-white/5"
      :class="compact ? 'min-h-11 gap-2 px-2.5 py-1.5 sm:px-3' : 'min-h-[66px] gap-3 px-3 py-3 sm:px-4'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="flex shrink-0 items-center justify-center rounded-xl bg-black/5 text-black/60 transition-colors dark:bg-white/10 dark:text-white/70"
        :class="[compact ? 'h-7 w-7 rounded-lg' : 'h-10 w-10', { '!bg-primary-50 !text-primary-600 dark:!bg-primary-900/30 dark:!text-primary-400': modelValue }]">
        <component :is="getIconComponent(icon)"  :class="compact ? 'h-4 w-4' : 'h-5 w-5'" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1" :class="compact ? 'flex items-center gap-2' : ''">
        <span class="block min-w-0 text-sm font-semibold leading-snug text-black dark:text-white" :class="compact ? 'truncate' : 'break-words'">{{ title }}</span>
        <span v-if="summary" class="block min-w-0 truncate text-xs leading-4 text-black/50 dark:text-white/50" :class="compact ? 'shrink-0 max-w-[42%]' : 'mt-1'" :title="summary">{{ summary }}</span>
      </span>
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors group-hover:bg-black/5 dark:text-white/50 dark:group-hover:bg-white/10">
        <svg class="h-4 w-4 transition-transform duration-200 motion-reduce:transition-none" :class="{ 'rotate-180': modelValue }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>
    <div :id="panelId" role="region" :aria-labelledby="headingId" :hidden="!modelValue">
      <Transition
        enter-active-class="transition-opacity duration-150 motion-reduce:transition-none"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div v-if="modelValue" class="border-t border-black/10 px-3 pb-4 pt-4 dark:border-white/10 sm:px-4">
          <slot />
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { getIconComponent } from "../../utils/iconRenderer";

defineProps<{
  modelValue: boolean;
  title: string;
  summary?: string;
  icon: string;
  compact?: boolean;
}>();
defineEmits<{ "update:modelValue": [value: boolean] }>();

const uid = useId();
const headingId = "form-section-heading-" + uid;
const panelId = "form-section-panel-" + uid;
</script>
