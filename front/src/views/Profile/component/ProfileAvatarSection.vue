<template>
  <div
    class="relative overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-gray-200/50 dark:shadow-none"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"
    ></div>

    <div class="relative group">
      <div
        class="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"
      ></div>
      <div
        class="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer transform transition-transform duration-300 group-hover:scale-105"
        @click="openAvatarZoom"
      >
        <img
          v-if="avatar"
          :src="avatar"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <img
          v-else
          :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName}`"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <!-- Zoom Overlay -->
        <div
          class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-white w-8 h-8"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
      </div>
    </div>

    <AvatarZoomModal
      :visible="isAvatarZoomVisible"
      :src="currentAvatarSrc"
      :user-name="profile?.fullName"
      @close="closeAvatarZoom"
    />

    <div class="mt-6 mb-8">
      <h2
        class="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
      >
        {{ profile?.fullName || "-" }}
      </h2>
      <p class="text-base font-medium text-gray-500 dark:text-gray-400">
        {{ profile?.email || "-" }}
      </p>
    </div>

    <div class="w-full grid grid-cols-2 gap-4">
      <div
        class="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-100 dark:border-blue-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
      >
        <div
          class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <component
            :is="TotalScoreIcon"
            class="w-16 h-16 text-blue-600 dark:text-blue-400"
          />
        </div>
        <div class="flex flex-col items-start relative z-10">
          <div class="p-2 bg-white dark:bg-white/10 rounded-xl mb-3 shadow-sm">
            <component
              :is="TotalScoreIcon"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
          </div>
          <p
            class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 mb-1"
          >
            {{ t("profile.stats.totalScore") }}
          </p>
          <p class="text-2xl font-black text-gray-900 dark:text-white">
            {{ profile?.totalScore ?? 0 }}
          </p>
        </div>
      </div>

      <div
        class="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 border border-purple-100 dark:border-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
      >
        <div
          class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <component
            :is="TotalWordsIcon"
            class="w-16 h-16 text-purple-600 dark:text-purple-400"
          />
        </div>
        <div class="flex flex-col items-start relative z-10">
          <div class="p-2 bg-white dark:bg-white/10 rounded-xl mb-3 shadow-sm">
            <component
              :is="TotalWordsIcon"
              class="w-5 h-5 text-purple-600 dark:text-purple-400"
            />
          </div>
          <p
            class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 mb-1"
          >
            {{ t("profile.stats.totalWords") }}
          </p>
          <p class="text-2xl font-black text-gray-900 dark:text-white">
            {{ profile?.totalWords ?? 0 }}
            <span
              class="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1 opacity-70"
              >{{ t("header.words") }}</span
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import type { UserProfile } from "../interface/profile.interface";
import { getIconComponent } from "../../../utils/iconRenderer";

const AvatarZoomModal = defineAsyncComponent(
  () => import("../../../components/common/AvatarZoomModal.vue") as any
);

const props = defineProps({
  profile: {
    type: Object as PropType<UserProfile | null>,
    default: null,
  },
  avatar: {
    type: String,
    default: "",
  },
});

const { profile, avatar } = toRefs(props);
const { t } = useI18n();

const isAvatarZoomVisible = ref(false);

const currentAvatarSrc = computed(() => {
  if (avatar.value) {
    return avatar.value;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.value?.fullName}`;
});

const openAvatarZoom = () => {
  isAvatarZoomVisible.value = true;
};

const closeAvatarZoom = () => {
  isAvatarZoomVisible.value = false;
};

const TotalScoreIcon = getIconComponent("bar-chart");
const TotalWordsIcon = getIconComponent("book");
</script>
