<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
        <div role="dialog" aria-modal="true" :aria-labelledby="headingId" class="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black sm:max-h-[90dvh] sm:rounded-3xl">
          <header class="flex shrink-0 items-center gap-3 border-b border-black/10 p-4 dark:border-white/10 sm:px-6 sm:py-5">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <component :is="getIconComponent('folder')" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 :id="headingId" class="break-words text-lg font-bold leading-tight text-black dark:text-white sm:text-xl">{{ t(isEditing ? 'categories.editTitle' : 'categories.createTitle') }}</h2>
              <p class="mt-1 text-xs leading-4 text-black/50 dark:text-white/50">{{ t('categories.editorHint') }}</p>
            </div>
            <button type="button" :aria-label="t('categories.cancel')" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-black/50 transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10" @click="$emit('close')">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </header>
          <form :id="formId" class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-custom sm:px-6 sm:py-5" @submit.prevent="submitForm">
            <div class="flex min-w-0 items-center gap-3 rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl" :style="{backgroundColor: form.color + '20'}">
                <component :is="getIconComponent(form.icon)" :color="form.color" class="h-8 w-8" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-black dark:text-white">{{ form.name.trim() || t('categories.name') }}</p>
                <p class="mt-1 truncate text-xs text-black/50 dark:text-white/50">{{ form.description.trim() || t('categories.previewHint') }}</p>
              </div>
              <div class="h-3 w-3 shrink-0 rounded-full" :style="{backgroundColor: form.color}" aria-hidden="true"></div>
            </div>
            <div>
              <label :for="formId + '-name'" class="mb-1.5 block text-sm font-semibold text-black/70 dark:text-white/70">{{ t('categories.name') }} <span class="text-primary-500">*</span></label>
              <input :id="formId + '-name'" v-model="form.name" type="text" required class="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </div>
            <div>
              <label :for="formId + '-desc'" class="mb-1.5 block text-sm font-semibold text-black/70 dark:text-white/70">{{ t('categories.description') }}</label>
              <textarea :id="formId + '-desc'" v-model="form.description" rows="2" class="w-full resize-y rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"></textarea>
            </div>
            <div class="space-y-3 rounded-2xl border border-black/10 p-3 dark:border-white/10 sm:p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-black dark:text-white">{{ t('categories.icon') }}</h3>
                <span class="text-xs text-black/50 dark:text-white/50">{{ t('categories.iconHint') }}</span>
              </div>
              <IconPicker v-model="form.icon" :selected-color="form.color" @busy="iconBusy = $event" />
              <div class="border-t border-black/10 pt-3 dark:border-white/10">
                <label :for="formId + '-color'" class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-white/5">
                  <input :id="formId + '-color'" v-model="form.color" type="color" class="h-9 w-11 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                  <span class="min-w-0 flex-1 text-sm font-medium text-black dark:text-white">{{ t('categories.color') }}</span>
                  <span class="font-mono text-xs uppercase text-black/50 dark:text-white/50">{{ form.color }}</span>
                </label>
              </div>
            </div>
          </form>
          <footer class="grid shrink-0 grid-cols-2 gap-2.5 border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black sm:px-6 sm:py-4">
            <button type="button" class="min-h-11 min-w-0 break-words rounded-xl bg-black/5 px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" @click="$emit('close')">{{ t('categories.cancel') }}</button>
            <button :form="formId" type="submit" :disabled="iconBusy || !form.name.trim()" class="min-h-11 min-w-0 break-words rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{{ t('categories.save') }}</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalScrollLock } from '../../../composables/useModalScrollLock'
import { getIconComponent } from '../../../utils/iconRenderer'
import type { CategoryForm } from '../interface/category.interface'
import IconPicker from './IconPicker.vue'

const props = defineProps<{ show: boolean; isEditing: boolean; form: CategoryForm }>()
const emit = defineEmits<{ submit: []; close: [] }>()
const { t } = useI18n()
const { lockScroll, unlockScroll } = useModalScrollLock()
const uid = useId()
const headingId = 'category-heading-' + uid
const formId = 'category-editor-' + uid
const iconBusy = ref(false)
function submitForm() {
  if (!iconBusy.value && props.form.name.trim()) emit('submit')
}
watch(() => props.show, show => {
  if (show) { iconBusy.value = false; lockScroll() }
  else unlockScroll()
}, { immediate: true })
</script>
