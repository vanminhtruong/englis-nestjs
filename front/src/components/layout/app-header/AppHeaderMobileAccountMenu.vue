<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isOpen"
      class="lg:hidden px-4 py-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10"
    >
      <div class="flex items-center gap-3 mb-4 px-2">
        <img
          :src="userAvatarSrc"
          alt="Avatar"
          class="w-12 h-12 rounded-full border-2 border-primary-500"
        />
        <div class="flex flex-col">
          <span class="font-semibold text-gray-900 dark:text-white text-sm">{{
            authStore.user?.fullName
          }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            authStore.user?.email
          }}</span>
        </div>
      </div>
      <div class="px-2 mb-4">
        <div
          class="px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-3"
        >
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-10 h-10 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path
                  d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                />
              </svg>
            </div>
            <div class="flex flex-col">
              <span
                class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >{{ t("header.language") }}</span
              >
              <span
                class="text-sm font-semibold text-gray-900 dark:text-white"
                >{{ currentLanguageName }}</span
              >
            </div>
          </div>
          <LanguageSwitcher class="shrink-0" />
        </div>
      </div>
      <nav class="flex flex-col gap-1">
        <RouterLink
          @click="$emit('close-menu')"
          to="/profile"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
          </svg>
          <span>{{ t("header.profile") }}</span>
        </RouterLink>
        <RouterLink
          @click="$emit('close-menu')"
          to="/voice-settings"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 3v18" />
            <path d="M19 3v18" />
            <rect x="8" y="5" width="8" height="4" rx="1" />
            <rect x="8" y="11" width="8" height="4" rx="1" />
            <rect x="8" y="17" width="3" height="4" rx="1" />
          </svg>
          <span>{{ t("header.voiceSettings") }}</span>
        </RouterLink>
        <RouterLink
          @click="$emit('close-menu')"
          to="/favorites"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
          <span>{{ t("header.favorites") }}</span>
        </RouterLink>
        <RouterLink
          @click="$emit('close-menu')"
          to="/history"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <span>{{ t("header.history") }}</span>
        </RouterLink>
        <RouterLink
          @click="$emit('close-menu')"
          to="/learning-progress"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>{{ t("header.learningProgress") }}</span>
        </RouterLink>
        <button
          @click="$emit('logout')"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{{ t("header.logout") }}</span>
        </button>
      </nav>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { defineAsyncComponent } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../../stores/auth.store";
import { useLanguage } from "../../../composables/useLanguage";

const LanguageSwitcher = defineAsyncComponent(
  () => import("../../LanguageSwitcher.vue") as any
);

const props = defineProps<{
  isOpen: boolean;
  userAvatarSrc: string;
}>();

const emit = defineEmits<{
  (e: "close-menu"): void;
  (e: "logout"): void;
}>();

const authStore = useAuthStore();
const { t } = useI18n();
const { locale, availableLocales } = useLanguage();

const currentLanguageName = computed(() => {
  const current = availableLocales.find((lang) => lang.code === locale.value);
  return current?.name || "";
});
</script>
