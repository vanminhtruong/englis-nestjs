<template>
  <CollapsibleFormSection v-if="items.length" v-model="expanded" data-synonym-review compact
    :title="t('vocabulary.synonyms')" :summary="t('vocabulary.synonymCount',{count:items.length})" icon="book">
    <div ref="reviewList" data-synonym-review-list :style="{ maxHeight: reviewHeight ? `min(${reviewHeight}, 55dvh)` : '55dvh', scrollbarGutter: items.length > 4 ? 'stable' : undefined }" class="min-w-0 space-y-1.5 overflow-y-auto overscroll-contain scrollbar-custom">
      <div v-for="item in items" :key="item.word" class="flex min-w-0 items-center gap-2 rounded-lg bg-black/[0.025] p-2 dark:bg-white/5">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="min-w-0 break-words text-sm font-semibold text-black dark:text-white [overflow-wrap:anywhere]">{{ item.word }}</span>
            <PartOfSpeechLabel :value="item.partOfSpeech ?? source?.partOfSpeech" />
          </div>
          <p v-if="synonymMeaning(item,source)" data-synonym-review-meaning class="mt-1 text-sm break-words text-black/70 dark:text-white/70 [overflow-wrap:anywhere]">{{ synonymMeaning(item,source) }}</p>
          <p v-if="item.pronunciation" class="mt-0.5 break-words text-xs text-black/50 dark:text-white/50">{{ item.pronunciation }}</p>
        </div>
        <button type="button" :aria-label="t('vocabulary.speak')+': '+item.word" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-500/10 focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-300" @click.stop="speakPreferred(item.word)">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 3a6 6 0 0 1 0 8"/></svg>
        </button>
      </div>
    </div>
  </CollapsibleFormSection>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVisibleRows } from '../../composables/useVisibleRows'
import { useI18n } from 'vue-i18n'
import CollapsibleFormSection from './CollapsibleFormSection.vue'
import PartOfSpeechLabel from './PartOfSpeechLabel.vue'
import { speakPreferred } from '../../composables/usePreferredVoice'
import { synonymEntries, synonymMeaning, type SynonymSource } from '../../views/Vocabulary/utils/synonyms'
const props=defineProps<{source?:SynonymSource|null}>()
const {t}=useI18n()
const expanded=ref(false)
const reviewList=ref<HTMLElement|null>(null)
const items=computed(()=>props.source?synonymEntries(props.source):[])
const reviewHeight=useVisibleRows(reviewList,()=>items.value.length,4)
watch(()=>[props.source?.id,props.source?.vocabularyId,props.source?.word],()=>{expanded.value=false})
</script>
