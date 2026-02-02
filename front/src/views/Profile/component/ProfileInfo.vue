<template>
  <div
    class="relative overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 flex flex-col shadow-2xl shadow-gray-200/50 dark:shadow-none h-full transition-all duration-300 hover:shadow-gray-200/80 dark:hover:shadow-none"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
    ></div>

    <div class="flex justify-between items-center mb-8 relative z-10">
      <h3
        class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
      >
        <span
          class="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400"
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        {{ t("profile.sections.accountInfo") }}
      </h3>
      <button
        @click="emit('edit')"
        class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm active:scale-95"
      >
        <span>{{ t("common.edit") }}</span>
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
          class="group-hover:translate-x-0.5 transition-transform"
        >
          <path
            d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
          ></path>
        </svg>
      </button>
    </div>

    <div class="space-y-6 relative z-10 flex-1">
      <!-- Full Name -->
      <div
        class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
      >
        <label
          class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 ml-1"
        >
          {{ t("profile.fields.fullName") }}
        </label>
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shadow-sm"
          >
            <component :is="FullNameIcon" class="w-5 h-5" />
          </div>
          <div class="text-lg font-bold text-gray-900 dark:text-white">
            {{ profile?.fullName || "Not set" }}
          </div>
        </div>
      </div>

      <!-- Email -->
      <div
        class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
      >
        <label
          class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 ml-1"
        >
          {{ t("profile.fields.email") }}
        </label>
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shadow-sm"
          >
            <component :is="EmailIcon" class="w-5 h-5" />
          </div>
          <div
            class="text-lg font-bold text-gray-900 dark:text-white break-all"
          >
            {{ profile?.email }}
          </div>
        </div>
      </div>

      <!-- Theme -->
      <div
        class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
      >
        <label
          class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 ml-1"
        >
          {{ t("profile.fields.theme") }}
        </label>
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shadow-sm"
          >
            <component :is="ThemeIcon" class="w-5 h-5" />
          </div>
          <div>
            <span
              class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm transition-colors"
              :class="
                profile?.theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              "
            >
              {{ profile?.theme === "dark" ? "Dark Mode" : "Light Mode" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIconComponent } from "../../../utils/iconRenderer";
import type { UserProfile } from "../interface/profile.interface";

defineProps<{
  profile: UserProfile | null;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
}>();

const FullNameIcon = getIconComponent("user" as any);
const EmailIcon = getIconComponent("mail" as any);
const ThemeIcon = getIconComponent("sparkles");
</script>
