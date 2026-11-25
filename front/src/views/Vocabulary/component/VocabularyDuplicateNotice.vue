<template>
  <div v-if="checking || unavailable || result?.total" data-vocabulary-duplicate-notice aria-live="polite" class="rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
    :class="result?.duplicate ? 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'border-black/10 bg-black/[0.025] text-black/65 dark:border-white/10 dark:bg-white/5 dark:text-white/70'">
    <div class="flex items-start gap-2">
      <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5m0 4h.01"/></svg>
      <div class="min-w-0 flex-1">
        <p v-if="checking">{{ t('vocabulary.duplicateChecking') }}</p>
        <p v-else-if="unavailable">{{ t('vocabulary.duplicateUnavailable') }}</p>
        <template v-else-if="result">
          <p class="font-semibold">{{ t(result.duplicate ? 'vocabulary.duplicateBlocked' : 'vocabulary.duplicateRelated', { count: result.total }) }}</p>
          <button type="button" class="mt-1 font-semibold underline underline-offset-2" :aria-expanded="expanded" @click="expanded = !expanded">{{ t(expanded ? 'vocabulary.duplicateHide' : 'vocabulary.duplicateShow') }}</button>
          <div v-if="expanded" class="mt-2 max-h-40 space-y-1.5 overflow-y-auto scrollbar-custom">
            <div v-for="match in result.matches" :key="match.id" class="rounded-lg bg-white/70 p-2 dark:bg-black/30">
              <div class="flex flex-wrap items-center gap-1.5"><span class="font-semibold break-all">{{ match.word }}</span><PartOfSpeechLabel :value="match.partOfSpeech" /></div>
              <p class="break-words">{{ match.meaning }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PartOfSpeechLabel from '../../../components/common/PartOfSpeechLabel.vue'
import type { DuplicateResult } from '../composable/manager-state/useVocabularyDuplicate'
const props = defineProps<{ result: DuplicateResult | null; checking: boolean; unavailable: boolean }>()
const { t } = useI18n()
const expanded = ref(false)
watch(() => props.result, () => { expanded.value = false })
</script>
