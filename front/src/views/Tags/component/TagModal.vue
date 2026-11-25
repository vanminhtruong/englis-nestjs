<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
        <section data-tag-modal role="dialog" aria-modal="true" :aria-labelledby="headingId" class="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black sm:max-h-[90dvh] sm:rounded-3xl">
          <header class="flex shrink-0 items-center gap-3 border-b border-black/10 p-4 dark:border-white/10 sm:px-6 sm:py-5">
            <TagBadge :color="form.color" size="small" />
            <div class="min-w-0 flex-1">
              <h2 :id="headingId" class="break-words text-lg font-bold leading-tight text-black dark:text-white sm:text-xl">{{ t(isEditing ? 'tags.editTitle' : 'tags.createTitle') }}</h2>
              <p class="mt-1 text-xs leading-4 text-black/50 dark:text-white/50">{{ t('tags.editorHint') }}</p>
            </div>
            <button type="button" :disabled="busy" :aria-label="t('tags.cancel')" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-black/50 transition hover:bg-black/5 disabled:opacity-40 dark:text-white/50 dark:hover:bg-white/10" @click="$emit('close')"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
          </header>
          <form :id="formId" class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-custom sm:px-6 sm:py-5" @submit.prevent="submit">
            <div :style="style" data-tag-preview class="tag-preview overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
              <div class="flex items-center gap-2 px-3 pt-3 text-xs font-semibold text-black/50 dark:text-white/50">
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{{ t('tags.preview') }}
              </div>
              <div class="flex min-w-0 items-center gap-3 p-3">
                <TagBadge :color="form.color" />
                <div class="min-w-0 flex-1">
                  <p class="line-clamp-2 break-words text-lg font-bold text-black dark:text-white">#{{ form.name.trim() || t('tags.name') }}</p>
                  <p class="mt-1 line-clamp-2 break-words text-sm leading-snug text-black/60 dark:text-white/60">{{ form.description.trim() || t('tags.previewHint') }}</p>
                </div>
              </div>
            </div>
            <div>
              <label :for="formId+'-name'" class="mb-1.5 block text-sm font-semibold text-black/70 dark:text-white/70">{{ t('tags.name') }} <span class="text-primary-500">*</span></label>
              <input :id="formId+'-name'" v-model="form.name" required :disabled="busy" type="text" :placeholder="t('tags.namePlaceholder')" class="tag-field min-h-11" />
            </div>
            <div>
              <label :for="formId+'-desc'" class="mb-1.5 block text-sm font-semibold text-black/70 dark:text-white/70">{{ t('tags.description') }} <span class="text-xs font-normal text-black/40 dark:text-white/40">({{ t('tags.optional') }})</span></label>
              <textarea :id="formId+'-desc'" v-model="form.description" :disabled="busy" rows="2" :placeholder="t('tags.descriptionPlaceholder')" class="tag-field resize-y" />
            </div>
            <div class="space-y-3 rounded-2xl border border-black/10 p-3 dark:border-white/10 sm:p-4">
              <div><h3 class="text-sm font-semibold text-black dark:text-white">{{ t('tags.color') }}</h3><p class="mt-1 text-xs leading-relaxed text-black/50 dark:text-white/50">{{ t('tags.colorHint') }}</p></div>
              <div class="grid grid-cols-6 gap-2" role="group" :aria-label="t('tags.color')">
                <button v-for="color in colors" :key="color" data-tag-color type="button" :disabled="busy" :title="color" :aria-label="color" :aria-pressed="form.color.toLowerCase() === color.toLowerCase()" class="flex aspect-square min-w-0 items-center justify-center rounded-xl border border-black/10 p-1 transition focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-white/15" :class="form.color.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-black' : 'hover:scale-105'" @click="form.color=color">
                  <span class="flex h-full w-full items-center justify-center rounded-lg border border-black/10 dark:border-white/10" :style="{ backgroundColor: color }">
                    <svg v-if="form.color.toLowerCase() === color.toLowerCase()" class="h-4 w-4" :style="{color:ink}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>
                  </span>
                </button>
              </div>
              <label :for="formId+'-color'" class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-white/5">
                <input :id="formId+'-color'" v-model="form.color" type="color" :disabled="busy" class="h-9 w-11 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"/>
                <span class="min-w-0 flex-1 break-words text-sm font-medium text-black dark:text-white">{{ t('tags.customColor') }}</span>
                <span class="font-mono text-xs uppercase text-black/50 dark:text-white/50">{{ accent }}</span>
              </label>
            </div>
          </form>
          <footer class="grid shrink-0 grid-cols-2 gap-2.5 border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black sm:px-6 sm:py-4">
            <button type="button" :disabled="busy" class="min-h-11 min-w-0 break-words rounded-xl bg-black/5 px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" @click="$emit('close')">{{ t('tags.cancel') }}</button>
            <button :form="formId" type="submit" :disabled="busy || !form.name.trim()" class="flex min-h-11 min-w-0 items-center justify-center gap-2 break-words rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"><span v-if="busy" class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"/>{{ t(busy ? 'tags.saving' : isEditing ? 'tags.save' : 'tags.createTitle') }}</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalScrollLock } from '../../../composables/useModalScrollLock'
import { useAccentAppearance } from '../../../composables/useAccentAppearance'
import type { TagForm } from '../interface/tag.interface'
import TagBadge from './TagBadge.vue'
const props = defineProps<{ show: boolean; isEditing: boolean; form: TagForm; busy?: boolean }>()
const emit = defineEmits<{ submit: []; close: [] }>()
const { t } = useI18n()
const { lockScroll, unlockScroll } = useModalScrollLock()
const { style, accent, ink } = useAccentAppearance(() => props.form.color, '#A855F7')
const uid = useId()
const headingId = 'tag-heading-' + uid
const formId = 'tag-form-' + uid
// Existing project primary/secondary palette and standard Tailwind status colors.
const colors = ['#667eea','#a855f7','#3b82f6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#6366f1','#64748b','#000000','#ffffff']
function submit() { if (!props.busy && props.form.name.trim()) emit('submit') }
watch(() => props.show, show => { if (show) lockScroll(); else unlockScroll() }, { immediate: true })
</script>
<style scoped lang="postcss">
.tag-preview { background: linear-gradient(125deg, color-mix(in srgb, var(--accent-color) 13%, transparent), transparent 90%); }
.tag-field { @apply w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white; }
</style>
