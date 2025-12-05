<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      <ProfileHeader :t="t" @export="handleExport" @import="handleImport" />

      <div v-if="loading" class="flex items-center justify-center py-16">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"
        ></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-[1.1fr,1.2fr] gap-6">
        <ProfileAvatarSection :profile="profile" :avatar="form.avatar" />

        <ProfileForm
          :form="form"
          :saving="saving"
          :t="t"
          @submit="handleSave"
          @cancel="loadProfile"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useProfileState } from "./composable/manager-state/useProfileState";
import { useProfileHandle } from "./composable/manager-handle/useProfileHandle";
import { useProfileMount } from "./composable/manager-mount/useProfileMount";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";

const ProfileHeader = defineAsyncComponent(
  () => import("./component/ProfileHeader.vue") as any
);
const ProfileAvatarSection = defineAsyncComponent(
  () => import("./component/ProfileAvatarSection.vue") as any
);
const ProfileForm = defineAsyncComponent(
  () => import("./component/ProfileForm.vue") as any
);

const { t, mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { profile: enLang });
mergeLocaleMessage("vi", { profile: viLang });
mergeLocaleMessage("ko", { profile: koLang });

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
</script>
