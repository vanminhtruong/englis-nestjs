<template>
  <div
    class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ t("profile.sections.accountInfo") }}
    </h3>
    <form class="space-y-4" @submit.prevent="emit('submit')">
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          <span class="flex items-center gap-2">
            <component
              :is="FullNameIcon"
              class="w-4 h-4 text-primary-500 dark:text-primary-300"
            />
            <span>{{ t("profile.fields.fullName") }}</span>
          </span>
        </label>
        <input
          v-model="form.fullName"
          type="text"
          class="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          <span class="flex items-center gap-2">
            <component
              :is="EmailIcon"
              class="w-4 h-4 text-primary-500 dark:text-primary-300"
            />
            <span>{{ t("profile.fields.email") }}</span>
          </span>
        </label>
        <input
          v-model="form.email"
          type="email"
          readonly
          disabled
          class="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          <span class="flex items-center gap-2">
            <component
              :is="AvatarIcon"
              class="w-4 h-4 text-primary-500 dark:text-primary-300"
            />
            <span>{{ t("profile.fields.avatar") }}</span>
          </span>
        </label>

        <!-- Avatar actions: copy URL, upload file, paste image -->
        <div class="flex flex-wrap gap-2 mb-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
            @click="handleCopyAvatarUrl"
          >
            Copy URL
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-500/40 text-xs font-medium text-primary-700 dark:text-primary-200 bg-primary-50/70 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all"
            @click="triggerAvatarFileInput"
          >
            Upload image
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
            @click="handlePasteAvatarImage"
          >
            Paste image
          </button>
        </div>

        <input
          v-model="form.avatar"
          type="text"
          class="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://... hoặc data:image/..."
        />

        <input
          ref="avatarFileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarFileChange"
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          <span class="flex items-center gap-2">
            <component
              :is="ThemeIcon"
              class="w-4 h-4 text-secondary-500 dark:text-secondary-300"
            />
            <span>{{ t("profile.fields.theme") }}</span>
          </span>
        </label>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
            :class="
              form.theme === 'light'
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'
                : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-black/40'
            "
            @click="form.theme = 'light'"
          >
            Light
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
            :class="
              form.theme === 'dark'
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'
                : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-black/40'
            "
            @click="form.theme = 'dark'"
          >
            Dark
          </button>
        </div>
      </div>

      <div class="pt-2 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
          @click="emit('cancel')"
        >
          {{ t("profile.actions.cancel") }}
        </button>
        <button
          type="submit"
          class="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          :disabled="saving"
        >
          <span v-if="!saving">{{ t("profile.actions.saveChanges") }}</span>
          <span v-else>{{ t("common.loading") }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useProfileAvatarHandle } from "../composable/manager-handle/useProfileAvatarHandle";
import { getIconComponent } from "../../../utils/iconRenderer";

const props = defineProps<{
  form: any;
  saving: boolean;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "cancel"): void;
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
