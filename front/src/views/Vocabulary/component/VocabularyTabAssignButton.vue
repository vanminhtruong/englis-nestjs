<template>
  <div
    ref="rootRef"
    class="relative inline-flex min-w-0 max-w-full items-center gap-1.5"
    @keydown.esc.stop="expanded = false"
  >
    <button
      type="button"
      class="inline-flex min-h-9 min-w-0 max-w-full items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:px-3"
      :class="
        hasBackground
          ? 'border-white/30 bg-black/35 text-white hover:bg-black/55'
          : 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
      "
      :title="t('vocabulary.assignTabs')"
      :aria-label="t('vocabulary.assignTabs')"
      @click.stop="openManager"
    >
      <svg
        class="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2" />
        <path d="M3 7v11a2 2 0 0 0 2 2h9" />
        <path d="M19 15v6m-3-3h6" />
      </svg>
      <span v-if="previewTabs.length" class="inline-flex shrink-0 items-center gap-0.5">
        <TabIcon
          v-for="tab in previewTabs"
          :key="tab.id"
          :icon="tab.icon"
          size="xs"
          :neutral="!hasBackground"
        />
      </span>
      <span class="min-w-0 max-w-[6.5rem] truncate whitespace-nowrap">
        {{ t("vocabulary.assignTabs") }}
      </span>
      <span
        v-if="assignedCount && !hiddenCount"
        class="min-w-5 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] leading-4"
        :class="
          hasBackground
            ? 'bg-white/20 text-white'
            : 'bg-black/5 text-black/70 dark:bg-white/10 dark:text-white'
        "
        >{{ assignedCount }}</span
      >
    </button>

    <!-- The main button always manages assignments; only the overflow control expands. -->
    <button
      v-if="hiddenCount > 0"
      type="button"
      class="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      :class="
        hasBackground
          ? 'border-white/30 bg-black/35 text-white hover:bg-black/55'
          : 'border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
      "
      :aria-label="
        t(expanded ? 'vocabulary.collapseAssignedTabs' : 'vocabulary.expandAssignedTabs', {
          count: hiddenCount,
        })
      "
      :title="
        t(expanded ? 'vocabulary.collapseAssignedTabs' : 'vocabulary.expandAssignedTabs', {
          count: hiddenCount,
        })
      "
      :aria-expanded="expanded"
      :aria-controls="popoverId"
      @click.stop="expanded = !expanded"
    >
      <span aria-hidden="true">{{ expanded ? "−" : `+${hiddenCount}` }}</span>
      <svg
        class="h-3.5 w-3.5 transition-transform"
        :class="{ 'rotate-180': expanded }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="expanded && hiddenCount > 0"
        :id="popoverId"
        class="vocabulary-assigned-overflow-panel absolute top-full z-[60] mt-2 flex w-64 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-xl dark:border-white/15 dark:bg-black dark:text-white"
        :class="align === 'right' ? 'right-0' : 'left-0'"
        role="region"
        :aria-label="t('vocabulary.assignedTabsList')"
        @click.stop
      >
        <div
          class="flex items-center justify-between gap-2 border-b border-black/10 bg-black/[0.02] px-3 py-2.5 dark:border-white/10 dark:bg-white/5"
        >
          <span class="min-w-0 truncate text-xs font-bold">{{
            t("vocabulary.assignedTabsCount", { count: assignedCount })
          }}</span>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-black/60 transition-colors hover:bg-black/10 dark:text-white/70 dark:hover:bg-white/10"
            :aria-label="t('vocabulary.collapseAssignedTabs')"
            @click.stop="expanded = false"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul class="max-h-56 space-y-0.5 overflow-y-auto p-2">
          <li
            v-for="tab in assignedTabs"
            :key="tab.id"
            class="flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs"
          >
            <TabIcon :icon="tab.icon" size="sm" neutral />
            <span class="min-w-0 flex-1 break-words font-medium">{{
              tab.name || t("vocabulary.assignTabs")
            }}</span>
          </li>
        </ul>
        <button
          type="button"
          class="border-t border-black/10 px-3 py-2.5 text-left text-xs font-semibold text-black/70 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          @click.stop="openManager"
        >
          {{ t("vocabulary.manageTabs") }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import TabIcon from "../../../components/common/TabIcon.vue";

interface TabSummary {
  id: string;
  name?: string;
  icon?: string | null;
  vocabularies?: { id: string }[];
}

const props = withDefaults(
  defineProps<{
    vocabularyId: string;
    tabs: TabSummary[];
    hasBackground?: boolean;
    align?: "left" | "right";
  }>(),
  { align: "left" },
);

const emit = defineEmits<{ "manage-tabs": [] }>();
const { t } = useI18n();
const popoverId = useId();
const rootRef = ref<HTMLElement | null>(null);
const expanded = ref(false);
const assignedTabs = computed(() =>
  props.tabs.filter((tab) => tab.vocabularies?.some((word) => word.id === props.vocabularyId)),
);
const assignedCount = computed(() => assignedTabs.value.length);
const previewTabs = computed(() => assignedTabs.value.slice(0, assignedCount.value > 2 ? 1 : 2));
const hiddenCount = computed(() => assignedCount.value - previewTabs.value.length);

function onOutsidePointerDown(event: PointerEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) expanded.value = false;
}
function openManager() {
  expanded.value = false;
  emit("manage-tabs");
}
watch(expanded, (open) => {
  if (open) document.addEventListener("pointerdown", onOutsidePointerDown, true);
  else document.removeEventListener("pointerdown", onOutsidePointerDown, true);
});
watch(
  () => [props.vocabularyId, assignedCount.value],
  () => {
    expanded.value = false;
  },
);
onBeforeUnmount(() => document.removeEventListener("pointerdown", onOutsidePointerDown, true));
</script>
<style>
/* Raise only the vocabulary card whose assignment overflow is open.
   Other cards remain at their original stacking level. */
.group.relative:has(.vocabulary-assigned-overflow-panel) {
  z-index: 30;
}
</style>
