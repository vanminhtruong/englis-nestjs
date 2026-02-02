<template>
  <div
    class="min-h-screen bg-gray-50/50 dark:bg-black/80 p-4 md:p-8 relative overflow-hidden transition-colors duration-300"
  >
    <!-- Background Splashes -->
    <div
      class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"
    >
      <div
        class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
      <ProfileHeader :t="t" @export="handleExport" @import="handleImport" />

      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
        mode="out-in"
      >
        <div v-if="loading" class="flex items-center justify-center py-24">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
            ></div>
            <div
              class="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-600"
            >
              ...
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left Column: Avatar & Stats -->
          <div class="lg:col-span-5 xl:col-span-4 space-y-6">
            <ProfileAvatarSection :profile="profile" :avatar="form.avatar" />
          </div>

          <!-- Right Column: Info & Details -->
          <div class="lg:col-span-7 xl:col-span-8 flex flex-col h-full">
            <ProfileInfo :profile="profile" :t="t" @edit="openEditModal" />
          </div>
        </div>
      </Transition>

      <ProfileEditModal
        :show="showEditModal"
        :form="form"
        :saving="saving"
        :t="t"
        @submit="onSubmit"
        @close="closeEditModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProfileState } from "./composable/manager-state/useProfileState";
import { useProfileHandle } from "./composable/manager-handle/useProfileHandle";
import { useProfileMount } from "./composable/manager-mount/useProfileMount";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";
import zhCNLang from "./language/zh-CN";

const ProfileHeader = defineAsyncComponent(
  () => import("./component/ProfileHeader.vue") as any
);
const ProfileAvatarSection = defineAsyncComponent(
  () => import("./component/ProfileAvatarSection.vue") as any
);
const ProfileInfo = defineAsyncComponent(
  () => import("./component/ProfileInfo.vue") as any
);
const ProfileEditModal = defineAsyncComponent(
  () => import("./component/ProfileEditModal.vue") as any
);

const { t, mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { profile: enLang });
mergeLocaleMessage("vi", { profile: viLang });
mergeLocaleMessage("ko", { profile: koLang });
mergeLocaleMessage("zh-CN", { profile: zhCNLang });

const { profile, loading, saving, form, setProfile, setLoading, setSaving } =
  useProfileState();

const {
  loadProfile,
  handleSave,
  handleProfileUpdatedFromWS,
  handleExport,
  handleImport,
} = useProfileHandle(profile, form, setProfile, setLoading, setSaving);

useProfileMount(loadProfile, handleProfileUpdatedFromWS);

const showEditModal = ref(false);

function openEditModal() {
  // Sync form with current profile when opening
  if (profile.value) {
    form.fullName = profile.value.fullName;
    form.email = profile.value.email;
    form.avatar = profile.value.avatar || "";
    form.theme = profile.value.theme || "light";
  }
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  if (profile.value) {
    setProfile(profile.value);
  }
}

async function onSubmit() {
  const success = await handleSave();
  if (success) {
    closeEditModal();
  }
}
</script>
