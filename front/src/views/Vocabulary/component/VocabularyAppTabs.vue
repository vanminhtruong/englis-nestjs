<template>
  <div class="vocab-tabs-wrapper">
    <div
      ref="tabsContainer"
      class="flex items-center gap-2 pb-2 mb-6 no-scrollbar select-none flex-wrap"
    >
      <!-- All Vocabularies Tab with Toggle -->
      <div class="relative flex items-center group" v-if="!isAllTabHidden">
        <button
          @click="handleTabClick(null)"
          :class="[
            'pl-4 pr-10 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm',
            !activeTabId
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
          ]"
        >
          {{ t("vocabularyTabs.allVocabularies") }}
        </button>
        <!-- Toggle Hide Button -->
        <button
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
      <div
        v-for="tab in visibleTabs"
        :key="tab.id"
        class="group relative flex items-center"
      >
        <button
          @click="handleTabClick(tab.id)"
          :class="[
            'pl-4 pr-16 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-sm',
            activeTabId === tab.id
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10',
          ]"
        >
          {{ tab.name }}
        </button>

        <!-- Tab Actions (Edit/Delete) -->
        <div
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
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
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
      <div v-if="hiddenTabs.length > 0" class="relative" ref="moreMenuRef">
        <button
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
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="isMoreMenuOpen"
            class="more-tabs-dropdown absolute top-full mt-2 left-0 z-50 min-w-56 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10"
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
            <div
              class="dropdown-body p-2 flex flex-col gap-1 max-h-72 overflow-y-auto"
            >
              <div
                v-for="tab in hiddenTabs"
                :key="tab.id"
                class="group/item relative flex items-center gap-2 rounded-xl overflow-hidden"
              >
                <button
                  @click.stop="selectHiddenTab(tab.id)"
                  :class="[
                    'flex-1 text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5',
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
                  <span class="truncate max-w-40">{{ tab.name }}</span>
                  <span
                    v-if="activeTabId === tab.id"
                    class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 shrink-0"
                  >
                    ✓
                  </span>
                </button>

                <!-- Edit/Delete Actions -->
                <div
                  class="flex items-center gap-0.5 pr-2 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                >
                  <button
                    @click.stop="$emit('edit', tab)"
                    class="p-1 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    :title="t('vocabularyTabs.editName')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      ></path>
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="$emit('delete', tab)"
                    class="p-1 rounded-lg text-gray-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    :title="t('vocabularyTabs.deleteTab')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
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
              <p
                class="text-[11px] text-gray-400 dark:text-white/30 text-center"
              >
                {{ t("vocabularyTabs.clickToSwitch") }}
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Create New Tab Button -->
      <button
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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const MAX_VISIBLE_TABS = 4;

const props = defineProps<{
  tabs: any[];
  activeTabId: string | null;
  isAllTabHidden?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string | null];
  create: [];
  edit: [tab: any];
  delete: [tab: any];
  "update:isAllTabHidden": [value: boolean];
}>();

const tabsContainer = ref<HTMLElement | null>(null);
const moreMenuRef = ref<HTMLElement | null>(null);
const isMoreMenuOpen = ref(false);

// Split tabs into visible (first 4) and hidden (rest)
const visibleTabs = computed(() => props.tabs.slice(0, MAX_VISIBLE_TABS));
const hiddenTabs = computed(() => props.tabs.slice(MAX_VISIBLE_TABS));

// Check if the active tab is among the hidden ones
const hasActiveHiddenTab = computed(() =>
  hiddenTabs.value.some((tab) => tab.id === props.activeTabId)
);

const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

const selectHiddenTab = (id: string) => {
  emit("select", id);
  isMoreMenuOpen.value = false;
};

const handleTabClick = (id: string | null) => {
  emit("select", id);
};

// Close dropdown on outside click
const handleOutsideClick = (e: MouseEvent) => {
  if (moreMenuRef.value && !moreMenuRef.value.contains(e.target as Node)) {
    isMoreMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
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
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.2),
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
