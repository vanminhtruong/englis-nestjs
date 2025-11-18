<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="$emit('close')"
      >
        <div class="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
          <!-- Header - Fixed -->
          <div class="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditing ? t('tags.addNew') : t('tags.addNew') }}
            </h2>
            <button
              type="button"
              @click="$emit('close')"
              class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Form Content - Scrollable -->
          <form @submit.prevent="$emit('submit')" class="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('tags.name') }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('tags.description') }}
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                {{ t('tags.color') }}
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model="form.color"
                  type="color"
                  class="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-white/10"
                />
                <div class="flex-1">
                  <p class="text-sm text-gray-600 dark:text-white/70">Selected Color</p>
                  <p class="text-sm font-mono text-gray-900 dark:text-white">{{ form.color }}</p>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer - Fixed -->
          <div class="p-6 border-t border-gray-200 dark:border-white/10 flex gap-3 flex-shrink-0">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            >
              {{ t('tags.cancel') }}
            </button>
            <button
              type="submit"
              @click="$emit('submit')"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {{ t('tags.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalScrollLock } from '../../../composables/useModalScrollLock'
import type { TagForm } from '../interface/tag.interface'

const props = defineProps<{
  show: boolean
  isEditing: boolean
  form: TagForm
}>()

defineEmits<{
  submit: []
  close: []
}>()

const { t } = useI18n()
const { lockScroll, unlockScroll } = useModalScrollLock()

watch(() => props.show, (newValue) => {
  if (newValue) {
    lockScroll()
  } else {
    unlockScroll()
  }
})
</script>
