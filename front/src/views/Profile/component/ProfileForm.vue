<template>
  <div class="h-full bg-transparent">
    <div class="p-6 md:p-8 space-y-8">
      <!-- Section Title -->
      <div
        class="flex items-center gap-3 text-gray-800 dark:text-gray-100 pb-4 border-b border-gray-100 dark:border-white/5"
      >
        <span
          class="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500"
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
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
        </span>
        <h3 class="text-lg font-bold tracking-tight">
          {{ t("profile.sections.accountInfo") }}
        </h3>
      </div>

      <form class="space-y-6" @submit.prevent="emit('submit')">
        <!-- Full Name Group -->
        <div class="group relative transition-all duration-300">
          <label
            class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 ml-1"
          >
            {{ t("profile.fields.fullName") }}
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-gray-400"
            >
              <component :is="FullNameIcon" class="w-5 h-5" />
            </div>
            <input
              v-model="form.fullName"
              type="text"
              class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 outline-none font-medium"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <!-- Email Group -->
        <div class="group relative opacity-75">
          <label
            class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 ml-1"
          >
            {{ t("profile.fields.email") }}
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"
            >
              <component :is="EmailIcon" class="w-5 h-5" />
            </div>
            <input
              v-model="form.email"
              type="email"
              readonly
              disabled
              class="w-full bg-gray-50/50 dark:bg-white/5 border border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
            />
            <div
              class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"
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
                class="text-gray-400"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Avatar Group -->
        <div class="space-y-3">
          <label
            class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1"
          >
            {{ t("profile.fields.avatar") }}
          </label>

          <div
            class="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4"
          >
            <!-- URL Input -->
            <div class="relative group">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors"
              >
                <component :is="AvatarIcon" class="w-4 h-4" />
              </div>
              <input
                v-model="form.avatar"
                type="text"
                class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                placeholder="Paste image URL here..."
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                @click="handleCopyAvatarUrl"
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
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  ></path>
                </svg>
                Copy URL
              </button>
              <button
                type="button"
                class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                @click="triggerAvatarFileInput"
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload
              </button>
              <button
                type="button"
                class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                @click="handlePasteAvatarImage"
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
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  ></path>
                </svg>
                Paste
              </button>
            </div>
          </div>
          <input
            ref="avatarFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarFileChange"
          />
        </div>

        <!-- Theme Selection -->
        <div class="space-y-3">
          <label
            class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1"
          >
            {{ t("profile.fields.theme") }}
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200"
              :class="
                form.theme === 'light'
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-white/20'
              "
              @click="form.theme = 'light'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </div>
                <span class="font-semibold text-gray-900 dark:text-white"
                  >Light</span
                >
              </div>
              <div v-if="form.theme === 'light'" class="text-primary-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </button>

            <button
              type="button"
              class="relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200"
              :class="
                form.theme === 'dark'
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-white/20'
              "
              @click="form.theme = 'dark'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    ></path>
                  </svg>
                </div>
                <span class="font-semibold text-gray-900 dark:text-white"
                  >Dark</span
                >
              </div>
              <div v-if="form.theme === 'dark'" class="text-primary-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProfileAvatarHandle } from "../composable/manager-handle/useProfileAvatarHandle";
import { getIconComponent } from "../../../utils/iconRenderer";

const props = defineProps<{
  form: any;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  // Optional if we want to support enter key submit later, but for now parent handles button
}>();

const {
  avatarFileInput,
  handleCopyAvatarUrl,
  triggerAvatarFileInput,
  handleAvatarFileChange,
  handlePasteAvatarImage,
} = useProfileAvatarHandle(props.form);

const FullNameIcon = getIconComponent("user" as any);
const EmailIcon = getIconComponent("mail" as any);
const AvatarIcon = getIconComponent("camera");
const ThemeIcon = getIconComponent("sparkles");
</script>
