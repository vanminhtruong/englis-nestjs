<template>
  <div ref="switcherRoot" data-language-switcher class="relative z-[60]">

    <button
      @click="isOpen = !isOpen"
      class="relative z-50 flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 group"
    >
      <span
        :data-header-flag="seasonalHeader || undefined"
        class="relative inline-flex h-6 w-8 items-center justify-center overflow-hidden rounded-lg shadow-sm border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform duration-200"
      >
        <span
          v-if="currentFlagClass"
          :class="[
            'fi scale-125',
            ...currentFlagClass.split(' ').filter((c) => c !== 'fi'),
          ]"
          class="fi"
        ></span>
      </span>
      <SeasonalHeaderIcon kind="chevron" :size="16" :plain="!seasonalHeader" :expanded="isOpen">
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
          class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors duration-200"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </SeasonalHeaderIcon>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-50 p-1.5"
      >
        <div class="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
          <span
            class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >Language</span
          >
        </div>

        <button
          v-for="lang in availableLocales"
          :key="lang.code"
          :data-language-code="lang.code"
          :aria-pressed="locale === lang.code"
          @click="selectLanguage(lang.code)"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden"
          :class="[
            locale === lang.code
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5',
          ]"
        >
          <div class="flex items-center gap-3 relative z-10">
            <span
              :data-header-flag="seasonalHeader || undefined"
              class="inline-flex h-5 w-7 items-center justify-center overflow-hidden rounded shadow-sm border border-black/10 dark:border-white/10"
            >
              <span
                :class="[
                  'fi scale-150',
                  ...(lang.flagClass?.split(' ') || []).filter(
                    (c) => c !== 'fi'
                  ),
                ]"
                class="fi"
              ></span>
            </span>
            <span>{{ lang.name }}</span>
          </div>

          <div v-if="locale === lang.code" class="relative z-10">
            <span
              :data-header-language-check="seasonalHeader || undefined"
              class="flex items-center justify-center w-5 h-5 bg-primary-500 dark:bg-primary-400 text-white rounded-full shadow-lg shadow-primary-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useLanguage } from "../composables/useLanguage";
import SeasonalHeaderIcon from "./layout/app-header/SeasonalHeaderIcon.vue";

const { locale, availableLocales, setLocale } = useLanguage();
const props = withDefaults(defineProps<{ open?: boolean; seasonalHeader?: boolean }>(), {
  open: undefined,
});
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();
const localOpen = ref(false);
const switcherRoot = ref<HTMLElement | null>(null);
const isOpen = computed({
  get: () => props.open ?? localOpen.value,
  set: (value: boolean) => {
    if (props.open === undefined) localOpen.value = value;
    emit("update:open", value);
  },
});

function handleOutsidePointer(event: PointerEvent) {
  if (isOpen.value && event.target instanceof Node && !switcherRoot.value?.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener("pointerdown", handleOutsidePointer));
onBeforeUnmount(() => document.removeEventListener("pointerdown", handleOutsidePointer));

const currentFlagClass = computed(() => {
  const current = availableLocales.find((l) => l.code === locale.value);
  return current?.flagClass ?? "fi fi-us";
});

function selectLanguage(code: string) {
  setLocale(code);
  isOpen.value = false;
}
</script>
