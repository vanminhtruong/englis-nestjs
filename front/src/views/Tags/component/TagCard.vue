<template>
  <article data-tag-card :style="style" class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg dark:border-white/10 dark:bg-black dark:hover:border-primary-500/50 motion-reduce:transform-none">
    <div class="tag-card-hero flex min-w-0 items-center justify-between gap-2 border-b border-black/5 p-3.5 dark:border-white/10 sm:p-4">
      <TagBadge :color="tag.color" data-tag-icon />
      <div class="flex shrink-0 items-center gap-1 rounded-xl border border-black/5 bg-white/90 p-1 dark:border-white/10 dark:bg-black/80">
        <button data-tag-edit type="button" :title="t('tags.edit')" :aria-label="t('tags.edit') + ': ' + tag.name" class="tag-action hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400" @click="$emit('edit', tag)">
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20H4V4h8m3 3 3 3m-9 7 1-4 9-9a2 2 0 0 1 3 3l-9 9-4 1Z"/></svg>
        </button>
        <button data-tag-delete type="button" :title="t('tags.delete')" :aria-label="t('tags.delete') + ': ' + tag.name" class="tag-action hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" @click="$emit('delete', tag.id)">
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18m-2 0v14H5V6m4 0V3h6v3M10 10v6m4-6v6"/></svg>
        </button>
      </div>
    </div>
    <div class="min-w-0 flex-1 px-4 py-3.5">
      <RouterLink :to="`/tags/${tag.id}`" class="block min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
        <h3 :title="tag.name" class="line-clamp-2 break-words text-lg font-bold leading-snug tracking-tight text-black dark:text-white"><span class="mr-0.5 text-black/40 dark:text-white/40">#</span>{{ tag.name }}</h3>
      </RouterLink>
      <p v-if="tag.description" :title="tag.description" class="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-black/60 dark:text-white/60">{{ tag.description }}</p>
    </div>
    <div class="px-3.5 pb-3.5">
      <RouterLink :to="`/tags/${tag.id}`" :aria-label="t('tags.viewVocabulary') + ': ' + tag.name" class="group/link flex min-w-0 items-center gap-2.5 rounded-xl border border-black/5 bg-black/[0.025] px-3 py-2.5 text-sm font-semibold text-black/70 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-primary-500/40 dark:hover:bg-primary-900/20 dark:hover:text-primary-400">
        <span class="tag-link-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/70 dark:text-white/80"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
        <span class="min-w-0 flex-1 break-words">{{ t('tags.viewVocabulary') }}</span>
        <svg class="h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
      </RouterLink>
    </div>
  </article>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAccentAppearance } from '../../../composables/useAccentAppearance'
import type { Tag } from '../interface/tag.interface'
import TagBadge from './TagBadge.vue'
const props = defineProps<{ tag: Tag }>()
defineEmits<{ edit: [tag: Tag]; delete: [id: string] }>()
const { t } = useI18n()
const { style } = useAccentAppearance(() => props.tag.color, '#A855F7')
</script>
<style scoped lang="postcss">
.tag-card-hero { background: linear-gradient(125deg, color-mix(in srgb, var(--accent-color) 13%, transparent), transparent 85%); }
.tag-link-icon { background: color-mix(in srgb, var(--accent-color) 14%, transparent); }
.tag-action { @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-white/60; }
</style>
