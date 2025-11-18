<template>
  <div class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
    <div
      class="w-24 h-24 rounded-2xl overflow-hidden mb-4 border-2 border-primary-500/80 shadow-lg bg-gradient-to-br from-primary-500/40 to-secondary-500/40 flex items-center justify-center cursor-pointer hover:shadow-xl hover:border-primary-600 transition-all"
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
    </div>

    <AvatarZoomModal
      :visible="isAvatarZoomVisible"
      :src="currentAvatarSrc"
      :user-name="profile?.fullName"
      @close="closeAvatarZoom"
    />
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
      {{ profile?.fullName || '-' }}
    </h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      {{ profile?.email || '-' }}
    </p>

    <div class="w-full grid grid-cols-2 gap-3 mb-4">
      <div class="rounded-xl px-4 py-3 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/30 text-left">
        <div class="flex items-center gap-2 mb-1">
          <component
            :is="TotalScoreIcon"
            class="w-4 h-4 text-primary-600 dark:text-primary-300"
          />
          <p class="text-xs text-primary-600 dark:text-primary-300 font-medium">
            {{ t('profile.stats.totalScore') }}
          </p>
        </div>
        <p class="text-xl font-bold text-primary-700 dark:text-primary-200">
          {{ profile?.totalScore ?? 0 }}
        </p>
      </div>
      <div class="rounded-xl px-4 py-3 bg-secondary-50 dark:bg-secondary-500/10 border border-secondary-100 dark:border-secondary-500/30 text-left">
        <div class="flex items-center gap-2 mb-1">
          <component
            :is="TotalWordsIcon"
            class="w-4 h-4 text-secondary-600 dark:text-secondary-300"
          />
          <p class="text-xs text-secondary-600 dark:text-secondary-300 font-medium">
            {{ t('profile.stats.totalWords') }}
          </p>
        </div>
        <p class="text-xl font-bold text-secondary-700 dark:text-secondary-200">
          {{ profile?.totalWords ?? 0 }} {{ t('header.words') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import type { UserProfile } from '../interface/profile.interface'
import { getIconComponent } from '../../../utils/iconRenderer'

const AvatarZoomModal = defineAsyncComponent(() => import('../../../components/common/AvatarZoomModal.vue') as any)

const props = defineProps({
  profile: {
    type: Object as PropType<UserProfile | null>,
    default: null,
  },
  avatar: {
    type: String,
    default: '',
  },
})

const { profile, avatar } = toRefs(props)
const { t } = useI18n()

const isAvatarZoomVisible = ref(false)

const currentAvatarSrc = computed(() => {
  if (avatar.value) {
    return avatar.value
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.value?.fullName}`
})

const openAvatarZoom = () => {
  isAvatarZoomVisible.value = true
}

const closeAvatarZoom = () => {
  isAvatarZoomVisible.value = false
}

const TotalScoreIcon = getIconComponent('bar-chart')
const TotalWordsIcon = getIconComponent('book')
</script>
