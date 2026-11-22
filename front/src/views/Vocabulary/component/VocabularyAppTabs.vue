<template>
  <div class="vocab-tabs-wrapper">
    <div
      ref="tabsContainer"
      class="flex items-center gap-2 pb-2 mb-6 no-scrollbar select-none flex-wrap"
    >
      <!-- All Vocabularies Tab with Toggle (selectionOnly disables management actions) -->
      <div class="relative flex items-center group" v-if="selectionOnly || !isAllTabHidden">
        <button
          @click="handleTabClick(null)"
          :class="[
            selectionOnly
              ? 'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm'
              : 'pl-4 pr-10 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm',
            !activeTabId
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
          ]"
        >
          {{ t("vocabularyTabs.allVocabularies") }}
        </button>
        <!-- Toggle Hide Button -->
        <button
          v-if="!selectionOnly"
          @click.stop="$emit('update:isAllTabHidden', true)"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all"
          :class="[
            !activeTabId
              ? 'text-white/60 hover:text-white hover:bg-white/20'
              : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100',
          ]"
          :title="t('vocabularyTabs.hideAllTab')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            ></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>

      <!-- Collapsed Toggle Button (when All Vocabularies tab is hidden) -->
      <button
        v-else
        @click.stop="$emit('update:isAllTabHidden', false)"
        class="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
        :title="t('vocabularyTabs.showAllTab')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span class="text-xs font-medium">{{ t("vocabularyTabs.all") }}</span>
      </button>

      <!-- Visible Tabs (first 4) -->
      <div v-for="tab in visibleTabs" :key="tab.id" class="group relative flex items-center">
        <button
          @click="handleTabClick(tab.id)"
          :class="[
            selectionOnly
              ? 'max-w-[min(75vw,22rem)] px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-2'
              : 'pl-3 pr-3 sm:pl-4 sm:pr-16 py-1.5 sm:py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm flex items-center gap-2',
            !selectionOnly && activeTabId === tab.id ? '!pr-16' : '',
            activeTabId === tab.id
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
          ]"
        >
          <TabIcon :icon="tab.icon" :active="activeTabId === tab.id" size="xs" />
          <span class="min-w-0 max-w-[7.5rem] truncate sm:max-w-none">{{ tab.name }}</span>
        </button>

        <!-- Tab Actions (Edit/Delete) -->
        <div
          v-if="!selectionOnly"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
          :class="{
            'opacity-0 group-hover:opacity-100': activeTabId !== tab.id,
          }"
        >
          <button
            v-if="activeTabId === tab.id"
            @click.stop="$emit('edit', tab)"
            class="p-0.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            :title="t('vocabularyTabs.editName')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            @click.stop="$emit('delete', tab)"
            class="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
            :class="
              activeTabId === tab.id
                ? 'text-white/70 hover:text-white hover:bg-red-500'
                : 'text-gray-500 dark:text-white/40'
            "
            :title="t('vocabularyTabs.deleteTab')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- "More Tabs" button — only shown if there are hidden tabs -->
      <div
        v-if="hiddenTabs.length > 0"
        class="relative max-w-full"
        ref="moreMenuRef"
        @keydown.esc.stop="isMoreMenuOpen = false"
      >
        <button
          type="button"
          :aria-expanded="isMoreMenuOpen"
          aria-haspopup="true"
          @click.stop="toggleMoreMenu"
          class="more-tabs-btn flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap"
          :class="[
            isMoreMenuOpen || hasActiveHiddenTab
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10',
          ]"
          :title="t('vocabularyTabs.moreTabs')"
        >
          <!-- Stack of dots icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform duration-300"
            :class="isMoreMenuOpen ? 'rotate-180' : ''"
          >
            <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span v-if="isCompactSelection" class="max-w-28 truncate text-xs font-semibold">{{
            isMoreMenuOpen
              ? collapseLabel || t("vocabularyTabs.moreTabs")
              : expandLabel || t("vocabularyTabs.moreTabs")
          }}</span>
          <span class="text-xs font-semibold">+{{ hiddenTabs.length }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform duration-300"
            :class="isMoreMenuOpen ? 'rotate-180' : ''"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Dropdown Panel -->
        <Transition
          :css="!skipDropdownAnimation"
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="isMoreMenuOpen"
            class="more-tabs-dropdown absolute top-full mt-2 z-50 min-w-56 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10"
            :class="
              selectionOnly
                ? 'right-0 left-auto w-64 max-w-[calc(100vw-3rem)] sm:right-auto sm:left-0'
                : 'left-0'
            "
          >
            <!-- Header -->
            <div
              class="dropdown-header px-4 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-primary-500 dark:text-primary-400"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span
                class="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider"
              >
                {{ t("vocabularyTabs.moreTabs") }}
              </span>
              <span
                class="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                {{ hiddenTabs.length }}
              </span>
            </div>

            <!-- Tab list -->
            <div class="dropdown-body p-2 flex flex-col gap-1 max-h-72 overflow-y-auto">
              <div
                v-for="tab in hiddenTabs"
                :key="tab.id"
                class="group/item relative flex min-w-0 items-center gap-1 rounded-xl"
              >
                <button
                  @click.stop="selectHiddenTab(tab.id)"
                  :class="[
                    'min-w-0 flex-1 text-left px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                    activeTabId === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
                  ]"
                >
                  <!-- Active indicator dot -->
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                    :class="
                      activeTabId === tab.id
                        ? 'bg-white'
                        : 'bg-gray-300 dark:bg-white/20 group-hover/item:bg-gray-400 dark:group-hover/item:bg-white/50'
                    "
                  ></span>
                  <TabIcon :icon="tab.icon" :active="activeTabId === tab.id" size="xs" />
                  <span class="min-w-0 flex-1 truncate">{{ tab.name }}</span>
                  <span
                    v-if="activeTabId === tab.id"
                    class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 shrink-0"
                  >
                    ✓
                  </span>
                </button>

                <!-- Edit/Delete Actions -->
                <div
                  v-if="!selectionOnly"
                  class="flex shrink-0 items-center gap-1 pr-1.5"
                >
                  <button
                    type="button"
                    @click.stop="$emit('edit', tab)"
                    class="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    :aria-label="t('vocabularyTabs.editName')"
                    :title="t('vocabularyTabs.editName')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click.stop="$emit('delete', tab)"
                    class="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-white/5 dark:text-white/70 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    :aria-label="t('vocabularyTabs.deleteTab')"
                    :title="t('vocabularyTabs.deleteTab')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer hint -->
            <div
              class="dropdown-footer px-4 py-2.5 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]"
            >
              <p class="text-[11px] text-gray-400 dark:text-white/30 text-center">
                {{ t("vocabularyTabs.clickToSwitch") }}
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Create New Tab Button -->
      <button
        v-if="!selectionOnly"
        @click="$emit('create')"
        class="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all ml-1 shrink-0"
        :title="t('vocabularyTabs.createNewTab')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import TabIcon from "../../../components/common/TabIcon.vue";

const { t } = useI18n();

const MAX_VISIBLE_TABS = 4;
// On phones only two tabs stay visible; the rest move into the "+N" menu.
const MAX_VISIBLE_TABS_COMPACT = 2;
const maxVisibleTabs = ref(MAX_VISIBLE_TABS);
let compactQuery: MediaQueryList | null = null;
const syncMaxVisibleTabs = () => {
  maxVisibleTabs.value = compactQuery?.matches ? MAX_VISIBLE_TABS_COMPACT : MAX_VISIBLE_TABS;
};

interface VocabularyTabOption {
  id: string;
  name: string;
  icon?: string | null;
}

const props = defineProps<{
  tabs: VocabularyTabOption[];
  activeTabId: string | null;
  isAllTabHidden?: boolean;
  selectionOnly?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
}>();

const emit = defineEmits<{
  select: [id: string | null];
  'select-hidden': [id: string];
  create: [];
  edit: [tab: VocabularyTabOption];
  delete: [tab: VocabularyTabOption];
  "update:isAllTabHidden": [value: boolean];
}>();

const tabsContainer = ref<HTMLElement | null>(null);
const moreMenuRef = ref<HTMLElement | null>(null);
const isMoreMenuOpen = ref(false);
const skipDropdownAnimation = ref(false);

// In selection-only mode, five or more tabs collapse to All + the active tab.
// Keep the active tab visible even when it belongs to the overflow list.
const isCompactSelection = computed(() => !!props.selectionOnly && props.tabs.length >= 5);
const visibleTabs = computed(() =>
  isCompactSelection.value
    ? props.tabs.filter((tab) => tab.id === props.activeTabId)
    : props.tabs.slice(0, maxVisibleTabs.value),
);
const hiddenTabs = computed(() =>
  isCompactSelection.value
    ? props.tabs.filter((tab) => tab.id !== props.activeTabId)
    : props.tabs.slice(maxVisibleTabs.value),
);

// Check if the active tab is among the hidden ones
const hasActiveHiddenTab = computed(() =>
  hiddenTabs.value.some((tab) => tab.id === props.activeTabId),
);

const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

const selectHiddenTab = (id: string) => {
  // Close without a leave animation: the clicked item is immediately moved
  // to the visible row, so animating the old overflow list would flicker.
  skipDropdownAnimation.value = true;
  isMoreMenuOpen.value = false;
  if (props.selectionOnly) emit("select", id);
  else emit("select-hidden", id);
  void nextTick(() => {
    skipDropdownAnimation.value = false;
  });
};

const handleTabClick = (id: string | null) => {
  emit("select", id);
  if (props.selectionOnly) isMoreMenuOpen.value = false;
};

// Close dropdown on outside click
const handleOutsideClick = (e: MouseEvent) => {
  if (moreMenuRef.value && !moreMenuRef.value.contains(e.target as Node)) {
    isMoreMenuOpen.value = false;
  }
};

onMounted(() => {
  compactQuery = window.matchMedia("(max-width: 639px)");
  syncMaxVisibleTabs();
  compactQuery.addEventListener("change", syncMaxVisibleTabs);
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  compactQuery?.removeEventListener("change", syncMaxVisibleTabs);
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* More Tabs Dropdown */
.more-tabs-dropdown {
  box-shadow:
    0 10px 38px -10px rgba(0, 0, 0, 0.2),
    0 4px 16px -4px rgba(0, 0, 0, 0.1);
  transform-origin: top left;
}

/* Scrollbar for dropdown tab list */
.dropdown-body::-webkit-scrollbar {
  width: 4px;
}
.dropdown-body::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.dropdown-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* More button glow when active */
.more-tabs-btn:hover {
  box-shadow: 0 4px 15px rgba(var(--color-primary-500), 0.2);
}
</style>
